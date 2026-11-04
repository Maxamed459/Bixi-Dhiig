import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/appError.js";
import { getBloodRequestById, recordFulfilledUnit } from "../bloodRequests/bloodRequest.service.js";
import type { CreateDonationInput, UpdateDonationStatusInput } from "./donation.validation.js";
import type { AdminPermission, Role } from "../generated/prisma/enums.js";
import { hasPermission } from "../lib/permissions.js";

interface Actor {
  id: string;
  role: Role;
  isSuperAdmin?: boolean | null;
  permissions?: AdminPermission[] | null;
}

export const pledgeDonation = async (donorId: string, input: CreateDonationInput) => {
  const request = await getBloodRequestById(input.bloodRequestId);

  if (request.status !== "APPROVED") {
    throw new AppError(400, "You can only respond to a live (approved) blood request");
  }

  if (request.requesterId === donorId) {
    throw new AppError(400, "You can't donate in response to your own request");
  }

  try {
    return await prisma.donation.create({
      data: {
        donorId,
        bloodRequestId: input.bloodRequestId,
        unitsOffered: input.unitsOffered,
        notes: input.notes,
        status: "PENDING",
      },
      include: {
        donor: { select: { id: true, display_name: true, phone: true } },
        bloodRequest: true,
      },
    });
  } catch (error: unknown) {
    const code = (error as { code?: string }).code;
    if (code === "P2002") {
      throw new AppError(409, "You've already responded to this blood request");
    }
    throw error;
  }
};

export const getDonationById = async (id: string) => {
  const donation = await prisma.donation.findUnique({
    where: { id },
    include: {
      donor: { select: { id: true, display_name: true, phone: true } },
      bloodRequest: true,
    },
  });

  if (!donation) {
    throw new AppError(404, "Donation not found");
  }

  return donation;
};

export const listMyDonations = async (donorId: string) => {
  return prisma.donation.findMany({
    where: { donorId },
    include: { bloodRequest: true },
    orderBy: { createdAt: "desc" },
  });
};

export const listDonationsForRequest = async (bloodRequestId: string, actor: Actor) => {
  const request = await getBloodRequestById(bloodRequestId);

  const canView =
    actor.role === "ADMIN" || request.requesterId === actor.id;
  if (!canView) {
    throw new AppError(403, "You can only view responses to your own blood request");
  }

  return prisma.donation.findMany({
    where: { bloodRequestId },
    include: { donor: { select: { id: true, display_name: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });
};

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["ACCEPTED", "DECLINED", "CANCELLED"],
  ACCEPTED: ["COMPLETED", "CANCELLED"],
};

export const updateDonationStatus = async (
  id: string,
  actor: Actor,
  input: UpdateDonationStatusInput,
) => {
  const donation = await getDonationById(id);

  const isDonor = donation.donorId === actor.id;
  const isRequester = donation.bloodRequest.requesterId === actor.id;
  const isAdmin = actor.role === "ADMIN";

  if (input.status === "CANCELLED") {
    // Only the donor can withdraw their own pledge.
    if (!isDonor) {
      throw new AppError(403, "Only the donor can cancel their own pledge");
    }
  } else {
    // ACCEPTED / DECLINED / COMPLETED are decisions made by whoever requested the blood
    // (or an admin on their behalf) — not the donor.
    if (!isRequester && !isAdmin) {
      throw new AppError(403, "Only the requester or an admin can update this donation");
    }

    // Admins acting on someone else's request need the donation-management permission.
    if (!isRequester && isAdmin && !hasPermission(actor, "MANAGE_DONATIONS")) {
      throw new AppError(403, "You don't have permission to manage donations");
    }
  }

  const allowedNext = ALLOWED_TRANSITIONS[donation.status] ?? [];
  if (!allowedNext.includes(input.status)) {
    throw new AppError(
      400,
      `Can't move a donation from ${donation.status} to ${input.status}`,
    );
  }

  const updated = await prisma.donation.update({
    where: { id },
    data: {
      status: input.status,
      scheduledAt: input.scheduledAt,
      notes: input.notes ?? donation.notes,
      completedAt: input.status === "COMPLETED" ? new Date() : donation.completedAt,
      confirmedById:
        input.status === "ACCEPTED" || input.status === "COMPLETED" ? actor.id : donation.confirmedById,
    },
    include: {
      donor: { select: { id: true, display_name: true, phone: true } },
      bloodRequest: { include: { requester: { select: { id: true, display_name: true, phone: true } } } },
    },
  });

  if (input.status === "COMPLETED") {
    await recordFulfilledUnit(updated.bloodRequestId, updated.unitsOffered);
  }

  return updated;
};
