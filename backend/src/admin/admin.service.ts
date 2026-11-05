import bcrypt from "bcrypt";
import { AppError } from "../lib/appError.js";
import { prisma } from "../lib/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import type { AdminPermission, Role } from "../generated/prisma/enums.js";
import { hasPermission } from "../lib/permissions.js";
import type {
  CreateAdminUserInput,
  ListAdminDonationsQuery,
  ListAdminUsersQuery,
  ListNotificationLogsQuery,
  UpdateAdminUserInput,
} from "./admin.validation.js";

interface AdminActor {
  id: string;
  role: Role;
  isSuperAdmin?: boolean | null;
  permissions?: AdminPermission[] | null;
}

const adminUserSelect = {
  id: true,
  display_name: true,
  email: true,
  phone: true,
  avater: true,
  role: true,
  isSuperAdmin: true,
  permissions: true,
  canDonate: true,
  canRequest: true,
  bloodType: true,
  city: true,
  receiveAlerts: true,
  last_login_at: true,
  is_email_verified: true,
  active: true,
  is_deleted: true,
  createdAt: true,
  updatedAt: true,
  hospital: {
    select: {
      id: true,
      name: true,
      licenseNumber: true,
      phone: true,
      address: true,
      city: true,
      active: true,
    },
  },
  _count: {
    select: {
      bloodRequests: true,
      donations: true,
    },
  },
} as const;

const startOfWeek = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

const paginate = (total: number, page: number, limit: number) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit) || 1,
});

export const listAdminUsers = async (query: ListAdminUsersQuery, actor: AdminActor) => {
  const { search, role, status, bloodType, city, page, limit } = query;

  const and: Prisma.UserWhereInput[] = [];

  if (status === "DELETED") {
    and.push({ is_deleted: true });
  } else {
    and.push({ is_deleted: false });
    if (status === "ACTIVE") and.push({ active: true });
    if (status === "INACTIVE") and.push({ active: false });
  }

  // Non-superadmins can only see regular users and hospitals — never admin accounts.
  if (!actor.isSuperAdmin) and.push({ role: { not: "ADMIN" } });
  if (role) and.push({ role });
  if (bloodType) and.push({ bloodType });
  if (city) and.push({ city: { equals: city, mode: "insensitive" } });

  if (search) {
    and.push({
      OR: [
        { display_name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  const where: Prisma.UserWhereInput = and.length > 0 ? { AND: and } : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: adminUserSelect,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { items, ...paginate(total, page, limit) };
};

export const getAdminUserById = async (id: string, actor: AdminActor) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      ...adminUserSelect,
      oauthAccounts: { select: { provider: true, providerUserId: true, createdAt: true } },
      bloodRequests: {
        select: {
          id: true,
          patientName: true,
          bloodType: true,
          urgency: true,
          status: true,
          unitsNeeded: true,
          unitsFulfilled: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      donations: {
        select: {
          id: true,
          unitsOffered: true,
          status: true,
          createdAt: true,
          bloodRequest: {
            select: { id: true, patientName: true, bloodType: true, status: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.role === "ADMIN" && !actor.isSuperAdmin) {
    throw new AppError(403, "Only a superadmin can view admin accounts.");
  }

  return user;
};

export const createAdminUser = async (input: CreateAdminUserInput, actor: AdminActor) => {
  const wantsAdminAccount =
    input.role === "ADMIN" ||
    input.isSuperAdmin !== undefined ||
    input.permissions !== undefined;

  if (wantsAdminAccount && !actor.isSuperAdmin) {
    throw new AppError(403, "Only a superadmin can create or configure admin accounts.");
  }

  const emailTaken = await prisma.user.findUnique({ where: { email: input.email } });
  if (emailTaken) {
    throw new AppError(400, "this email already exists please login.");
  }

  if (input.phone) {
    const phoneTaken = await prisma.user.findFirst({ where: { phone: input.phone } });
    if (phoneTaken) {
      throw new AppError(400, "this phone/WhatsApp number is already registered.");
    }
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        display_name: input.display_name,
        email: input.email,
        phone: input.phone,
        role: input.role,
        isSuperAdmin: input.role === "ADMIN" ? Boolean(input.isSuperAdmin) : false,
        permissions: input.role === "ADMIN" ? input.permissions ?? [] : [],
        canDonate: input.canDonate,
        canRequest: input.canRequest,
        bloodType: input.bloodType,
        city: input.city,
        is_email_verified: input.is_email_verified,
        receiveAlerts: input.receiveAlerts,
        active: true,
      },
    });

    await tx.oauthAccount.create({
      data: {
        userId: created.id,
        provider: "PASSWORD",
        passwordHash,
      },
    });

    if (created.role === "HOSPITAL") {
      await tx.hospital.create({
        data: {
          userId: created.id,
          name: input.hospitalName ?? created.display_name,
          licenseNumber: input.licenseNumber,
          phone: input.phone,
          address: input.address,
          city: input.city,
        },
      });
    }

    return tx.user.findUniqueOrThrow({
      where: { id: created.id },
      select: adminUserSelect,
    });
  });

  return user;
};

export const updateAdminUser = async (
  id: string,
  input: UpdateAdminUserInput,
  actor: AdminActor,
) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError(404, "User not found");
  }

  const targetIsAdmin = user.role === "ADMIN";
  const touchesAdminFields =
    input.permissions !== undefined ||
    input.isSuperAdmin !== undefined ||
    input.role === "ADMIN";

  // Only superadmins may manage admins, promote someone to admin, or change permissions.
  if ((targetIsAdmin || touchesAdminFields) && !actor.isSuperAdmin) {
    throw new AppError(403, "Only a superadmin can manage admin accounts.");
  }

  if (id === actor.id && input.active === false) {
    throw new AppError(400, "You can't deactivate your own account.");
  }

  if (id === actor.id && input.role && input.role !== "ADMIN") {
    throw new AppError(400, "You can't change your own admin role.");
  }

  if (id === actor.id && input.isSuperAdmin === false) {
    throw new AppError(400, "You can't remove your own superadmin access.");
  }

  const demotesSuperAdmin =
    user.isSuperAdmin &&
    (input.isSuperAdmin === false || (input.role !== undefined && input.role !== "ADMIN"));

  if (demotesSuperAdmin) {
    const otherSuperAdmins = await prisma.user.count({
      where: { isSuperAdmin: true, is_deleted: false, NOT: { id } },
    });
    if (otherSuperAdmins === 0) {
      throw new AppError(400, "At least one superadmin must remain.");
    }
  }

  if (input.email && input.email !== user.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email: input.email } });
    if (emailTaken) {
      throw new AppError(400, "this email already exists please login.");
    }
  }

  if (input.phone !== undefined && input.phone !== null && input.phone !== user.phone) {
    const phoneTaken = await prisma.user.findFirst({
      where: { phone: input.phone, NOT: { id } },
    });
    if (phoneTaken) {
      throw new AppError(400, "this phone/WhatsApp number is already registered.");
    }
  }

  const passwordHash = input.password ? await bcrypt.hash(input.password, 10) : null;

  const nextPermissions =
    input.role !== undefined && input.role !== "ADMIN" ? [] : input.permissions;
  const nextIsSuperAdmin =
    input.role !== undefined && input.role !== "ADMIN" ? false : input.isSuperAdmin;

  const updated = await prisma.$transaction(async (tx) => {
    const next = await tx.user.update({
      where: { id },
      data: {
        display_name: input.display_name,
        email: input.email,
        phone: input.phone,
        role: input.role,
        ...(nextPermissions !== undefined ? { permissions: nextPermissions } : {}),
        ...(nextIsSuperAdmin !== undefined ? { isSuperAdmin: nextIsSuperAdmin } : {}),
        ...(input.canDonate !== undefined ? { canDonate: input.canDonate } : {}),
        ...(input.canRequest !== undefined ? { canRequest: input.canRequest } : {}),
        bloodType: input.bloodType,
        city: input.city,
        is_email_verified: input.is_email_verified,
        receiveAlerts: input.receiveAlerts,
        active: input.active,
      },
    });

    if (passwordHash) {
      await tx.oauthAccount.upsert({
        where: { userId: id },
        create: { userId: id, provider: "PASSWORD", passwordHash },
        update: { passwordHash },
      });
    }

    if (
      next.role === "HOSPITAL" &&
      (input.hospitalName !== undefined || input.licenseNumber !== undefined || input.address !== undefined)
    ) {
      await tx.hospital.upsert({
        where: { userId: id },
        create: {
          userId: id,
          name: input.hospitalName ?? next.display_name,
          licenseNumber: input.licenseNumber,
          address: input.address,
          phone: next.phone,
          city: next.city,
        },
        update: {
          name: input.hospitalName,
          licenseNumber: input.licenseNumber,
          address: input.address,
          phone: next.phone,
          city: next.city,
        },
      });
    }

    return tx.user.findUniqueOrThrow({
      where: { id },
      select: adminUserSelect,
    });
  });

  return updated;
};

export const deleteAdminUser = async (id: string, actor: AdminActor) => {
  if (id === actor.id) {
    throw new AppError(400, "You can't delete your own account.");
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.role === "ADMIN" && !actor.isSuperAdmin) {
    throw new AppError(403, "Only a superadmin can delete admin accounts.");
  }

  if (user.isSuperAdmin) {
    const otherSuperAdmins = await prisma.user.count({
      where: { isSuperAdmin: true, is_deleted: false, NOT: { id } },
    });
    if (otherSuperAdmins === 0) {
      throw new AppError(400, "At least one superadmin must remain.");
    }
  }

  return prisma.user.update({
    where: { id },
    data: { active: false, is_deleted: true },
    select: adminUserSelect,
  });
};

export const getAdminStats = async (actor: AdminActor) => {
  const weekAgo = startOfWeek();

  const [
    totalUsers,
    activeUsers,
    verifiedUsers,
    deletedUsers,
    newUsersThisWeek,
    usersByRole,
    donorsByBloodType,
    totalRequests,
    requestsByStatus,
    newRequestsThisWeek,
    totalDonations,
    donationsByStatus,
    completedDonationUnits,
    notificationsByStatus,
    recentUsers,
    recentRequests,
    recentDonations,
    requestsThisWeek,
  ] = await Promise.all([
    prisma.user.count({ where: { is_deleted: false } }),
    prisma.user.count({ where: { is_deleted: false, active: true } }),
    prisma.user.count({ where: { is_deleted: false, is_email_verified: true } }),
    prisma.user.count({ where: { is_deleted: true } }),
    prisma.user.count({ where: { is_deleted: false, createdAt: { gte: weekAgo } } }),
    prisma.user.groupBy({
      by: ["role"],
      where: { is_deleted: false },
      _count: { _all: true },
    }),
    prisma.user.groupBy({
      by: ["bloodType"],
      where: { is_deleted: false, role: { in: ["USER", "ADMIN"] }, canDonate: true, bloodType: { not: null } },
      _count: { _all: true },
    }),
    prisma.bloodRequest.count(),
    prisma.bloodRequest.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.bloodRequest.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.donation.count(),
    prisma.donation.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.donation.aggregate({
      where: { status: "COMPLETED" },
      _sum: { unitsOffered: true },
    }),
    prisma.notificationLog.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.user.findMany({
      where: { is_deleted: false },
      select: {
        id: true,
        display_name: true,
        email: true,
        role: true,
        bloodType: true,
        city: true,
        active: true,
        is_email_verified: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.bloodRequest.findMany({
      select: {
        id: true,
        patientName: true,
        bloodType: true,
        urgency: true,
        status: true,
        unitsNeeded: true,
        unitsFulfilled: true,
        hospitalName: true,
        city: true,
        createdAt: true,
        requester: { select: { id: true, display_name: true, role: true } },
        _count: { select: { donations: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.donation.findMany({
      select: {
        id: true,
        unitsOffered: true,
        status: true,
        createdAt: true,
        donor: { select: { id: true, display_name: true, email: true } },
        bloodRequest: {
          select: { id: true, patientName: true, bloodType: true, city: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.bloodRequest.findMany({
      where: { createdAt: { gte: weekAgo } },
      select: { createdAt: true },
    }),
  ]);

  const byRole = usersByRole.reduce<Record<string, number>>((acc, row) => {
    acc[row.role] = row._count._all;
    return acc;
  }, {});

  const byRequestStatus = requestsByStatus.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = row._count._all;
    return acc;
  }, {});

  const byDonationStatus = donationsByStatus.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = row._count._all;
    return acc;
  }, {});

  const byNotificationStatus = notificationsByStatus.reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = row._count._all;
    return acc;
  }, {});

  const byBloodType = donorsByBloodType.reduce<Record<string, number>>((acc, row) => {
    if (row.bloodType) acc[row.bloodType] = row._count._all;
    return acc;
  }, {});

  // Last 7 days (oldest first), bucketed by UTC day.
  const dayBuckets = new Map<string, number>();
  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dayBuckets.set(date.toISOString().slice(0, 10), 0);
  }
  for (const request of requestsThisWeek) {
    const key = request.createdAt.toISOString().slice(0, 10);
    if (dayBuckets.has(key)) dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + 1);
  }

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      verified: verifiedUsers,
      deleted: deletedUsers,
      newThisWeek: newUsersThisWeek,
      byRole,
      donorsByBloodType: byBloodType,
    },
    requests: {
      total: totalRequests,
      pending: byRequestStatus.PENDING ?? 0,
      live: byRequestStatus.APPROVED ?? 0,
      fulfilled: byRequestStatus.FULFILLED ?? 0,
      rejected: byRequestStatus.REJECTED ?? 0,
      cancelled: byRequestStatus.CANCELLED ?? 0,
      newThisWeek: newRequestsThisWeek,
      byStatus: byRequestStatus,
      byDay: Array.from(dayBuckets, ([date, count]) => ({ date, count })),
    },
    donations: {
      total: totalDonations,
      pending: byDonationStatus.PENDING ?? 0,
      accepted: byDonationStatus.ACCEPTED ?? 0,
      completed: byDonationStatus.COMPLETED ?? 0,
      declined: byDonationStatus.DECLINED ?? 0,
      cancelled: byDonationStatus.CANCELLED ?? 0,
      completedUnits: completedDonationUnits._sum.unitsOffered ?? 0,
      byStatus: byDonationStatus,
    },
    notifications: {
      sent: byNotificationStatus.SENT ?? 0,
      failed: byNotificationStatus.FAILED ?? 0,
    },
    recent: {
      ...(hasPermission(actor, "MANAGE_USERS") ? { users: recentUsers } : {}),
      requests: recentRequests,
      ...(hasPermission(actor, "MANAGE_DONATIONS") ? { donations: recentDonations } : {}),
    },
  };
};

export const listAdminDonations = async (query: ListAdminDonationsQuery) => {
  const { status, bloodType, city, search, page, limit } = query;
  const and: Prisma.DonationWhereInput[] = [];

  if (status) and.push({ status });
  if (bloodType) and.push({ bloodRequest: { bloodType } });
  if (city) and.push({ bloodRequest: { city: { equals: city, mode: "insensitive" } } });
  if (search) {
    and.push({
      OR: [
        { donor: { display_name: { contains: search, mode: "insensitive" } } },
        { donor: { email: { contains: search, mode: "insensitive" } } },
        { bloodRequest: { patientName: { contains: search, mode: "insensitive" } } },
      ],
    });
  }

  const where: Prisma.DonationWhereInput = and.length > 0 ? { AND: and } : {};

  const [items, total] = await Promise.all([
    prisma.donation.findMany({
      where,
      include: {
        donor: { select: { id: true, display_name: true, email: true, phone: true } },
        bloodRequest: {
          select: {
            id: true,
            patientName: true,
            bloodType: true,
            urgency: true,
            status: true,
            city: true,
            hospitalName: true,
            requester: { select: { id: true, display_name: true } },
          },
        },
        confirmedBy: { select: { id: true, display_name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.donation.count({ where }),
  ]);

  return { items, ...paginate(total, page, limit) };
};

export const listNotificationLogs = async (query: ListNotificationLogsQuery) => {
  const { channel, status, event, search, page, limit } = query;
  const where: Prisma.NotificationLogWhereInput = {
    ...(channel ? { channel } : {}),
    ...(status ? { status } : {}),
    ...(event ? { event: { contains: event, mode: "insensitive" } } : {}),
    ...(search
      ? {
          OR: [
            { target: { contains: search, mode: "insensitive" } },
            { event: { contains: search, mode: "insensitive" } },
            { error: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.notificationLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notificationLog.count({ where }),
  ]);

  return { items, ...paginate(total, page, limit) };
};
