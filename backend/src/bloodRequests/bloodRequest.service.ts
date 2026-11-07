import { prisma } from "../lib/prisma.js";
import { AppError } from "../lib/appError.js";
import type { CreateBloodRequestInput, ListBloodRequestsQuery } from "./bloodRequest.validation.js";
import type { BloodType, Role } from "../generated/prisma/enums.js";
import type { Prisma } from "../generated/prisma/client.js";

interface RequestingUser {
  id: string;
  role: Role;
}

export const createBloodRequest = async (
  input: CreateBloodRequestInput,
  requester: RequestingUser,
) => {
  const activeRequest = await prisma.bloodRequest.findFirst({
    where: {
      requesterId: requester.id,
      status: { in: ["PENDING", "APPROVED"] },
    },
    select: { id: true },
  });

  if (activeRequest) {
    throw new AppError(409, "You already have an active blood request.");
  }

  // Business rule: a HOSPITAL is already vetted by an admin at account-creation time,
  // so its requests go live immediately. A USER's request needs admin approval first.
  const isHospital = requester.role === "HOSPITAL";

  return prisma.bloodRequest.create({
    data: {
      ...input,
      requesterId: requester.id,
      status: isHospital ? "APPROVED" : "PENDING",
      approvedAt: isHospital ? new Date() : null,
    },
    include: { requester: { select: { id: true, display_name: true, role: true } } },
  });
};

export const getBloodRequestById = async (id: string) => {
  const request = await prisma.bloodRequest.findUnique({
    where: { id },
    include: {
      requester: { select: { id: true, display_name: true, role: true, phone: true } },
    },
  });

  if (!request) {
    throw new AppError(404, "Blood request not found");
  }

  return request;
};

/**
 * Role-aware listing: ADMIN sees everything; HOSPITAL/USER see every APPROVED/FULFILLED
 * request (so donors and other hospitals can discover and respond to it) plus their own
 * requests regardless of status (so they can track a pending/rejected request of theirs).
 */
export const listBloodRequests = async (
  query: ListBloodRequestsQuery,
  requestingUser: RequestingUser,
) => {
  const { status, bloodType, city, urgency, page, limit } = query;

  const visibility: Prisma.BloodRequestWhereInput =
    requestingUser.role === "ADMIN"
      ? {}
      : {
          OR: [
            { status: { in: ["APPROVED", "FULFILLED"] } },
            { requesterId: requestingUser.id },
          ],
        };

  const where: Prisma.BloodRequestWhereInput = {
    AND: [
      visibility,
      status ? { status } : {},
      bloodType ? { bloodType } : {},
      city ? { city: { equals: city, mode: "insensitive" } } : {},
      urgency ? { urgency } : {},
    ],
  };

  const [items, total] = await Promise.all([
    prisma.bloodRequest.findMany({
      where,
      include: {
        requester: { select: { id: true, display_name: true, role: true } },
        _count: { select: { donations: true } },
      },
      orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.bloodRequest.count({ where }),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
};

export const listMyBloodRequests = async (requesterId: string) => {
  return prisma.bloodRequest.findMany({
    where: { requesterId },
    include: { _count: { select: { donations: true } } },
    orderBy: { createdAt: "desc" },
  });
};

export const approveBloodRequest = async (id: string, adminId: string) => {
  const request = await getBloodRequestById(id);

  if (request.status !== "PENDING") {
    throw new AppError(400, `Request is already ${request.status.toLowerCase()}`);
  }

  return prisma.bloodRequest.update({
    where: { id },
    data: { status: "APPROVED", approvedById: adminId, approvedAt: new Date() },
    include: { requester: true },
  });
};

export const rejectBloodRequest = async (
  id: string,
  adminId: string,
  reason?: string,
) => {
  const request = await getBloodRequestById(id);

  if (request.status !== "PENDING") {
    throw new AppError(400, `Request is already ${request.status.toLowerCase()}`);
  }

  return prisma.bloodRequest.update({
    where: { id },
    data: {
      status: "REJECTED",
      approvedById: adminId,
      rejectionReason: reason ?? null,
    },
    include: { requester: true },
  });
};

/** Admin action: close out a live request as fulfilled once enough donations have been
 * collected outside the app (e.g. a walk-in donor at the hospital). */
export const fulfillBloodRequest = async (id: string, adminId: string) => {
  const request = await getBloodRequestById(id);

  if (request.status === "FULFILLED") {
    throw new AppError(400, "Request is already fulfilled");
  }

  if (request.status !== "APPROVED") {
    throw new AppError(400, "Only live requests can be marked as fulfilled");
  }

  return prisma.bloodRequest.update({
    where: { id },
    data: {
      status: "FULFILLED",
      unitsFulfilled: Math.max(request.unitsFulfilled, request.unitsNeeded),
      approvedById: request.approvedById ?? adminId,
      approvedAt: request.approvedAt ?? new Date(),
    },
    include: { requester: true },
  });
};

export const cancelBloodRequest = async (id: string, actor: RequestingUser) => {
  const request = await getBloodRequestById(id);

  const isOwner = request.requesterId === actor.id;
  if (!isOwner && actor.role !== "ADMIN") {
    throw new AppError(403, "You can only cancel your own blood request");
  }

  if (request.status === "FULFILLED" || request.status === "CANCELLED") {
    throw new AppError(400, `Request is already ${request.status.toLowerCase()}`);
  }

  return prisma.bloodRequest.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
};

/** Donors to WhatsApp-alert when a request goes live: USER accounts with a matching
 * blood type in the same city who have a phone on file and haven't opted out. */
export const findMatchingDonors = async (bloodType: BloodType, city: string) => {
  return prisma.user.findMany({
    where: {
      role: { in: ["USER", "ADMIN"] },
      canDonate: true,
      bloodType,
      city: { equals: city, mode: "insensitive" },
      active: true,
      is_deleted: false,
      receiveAlerts: true,
      phone: { not: null },
    },
    select: { id: true, phone: true },
  });
};

export const findAdminsWithPhone = async () => {
  return prisma.user.findMany({
    where: { role: "ADMIN", active: true, phone: { not: null } },
    select: { id: true, phone: true },
  });
};

/** Recomputes status to FULFILLED once enough COMPLETED donations have come in. Called
 * from the donation service after a donation is marked COMPLETED. */
export const recordFulfilledUnit = async (bloodRequestId: string, units: number) => {
  const request = await prisma.bloodRequest.update({
    where: { id: bloodRequestId },
    data: { unitsFulfilled: { increment: units } },
  });

  if (request.unitsFulfilled >= request.unitsNeeded && request.status !== "FULFILLED") {
    return prisma.bloodRequest.update({
      where: { id: bloodRequestId },
      data: { status: "FULFILLED" },
    });
  }

  return request;
};
