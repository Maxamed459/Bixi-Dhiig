import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone/WhatsApp number, e.g. +252612345678");

const bloodTypeSchema = z.enum([
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
]);

const roleSchema = z.enum(["USER", "HOSPITAL", "ADMIN"]);

const adminPermissionSchema = z.enum([
  "MANAGE_USERS",
  "REVIEW_REQUESTS",
  "MANAGE_DONATIONS",
  "VIEW_NOTIFICATIONS",
]);

export const listAdminUsersQuerySchema = z.object({
  search: z.string().trim().optional(),
  role: roleSchema.optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DELETED"]).optional(),
  bloodType: bloodTypeSchema.optional(),
  city: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
export type ListAdminUsersQuery = z.infer<typeof listAdminUsersQuerySchema>;

export const createAdminUserSchema = z.object({
  display_name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: phoneSchema.optional(),
  role: roleSchema.default("USER"),
  bloodType: bloodTypeSchema.optional(),
  city: z.string().trim().min(2).optional(),
  is_email_verified: z.boolean().default(true),
  receiveAlerts: z.boolean().default(true),
  // Admin-only fields. Only superadmins may set these; non-superadmins get a 403.
  permissions: z.array(adminPermissionSchema).optional(),
  isSuperAdmin: z.boolean().optional(),
  canDonate: z.boolean().default(true),
  canRequest: z.boolean().default(true),
  // Hospital-only profile details (also accepted for ADMIN/USER but ignored).
  hospitalName: z.string().trim().min(2).optional(),
  licenseNumber: z.string().trim().optional(),
  address: z.string().trim().optional(),
});
export type CreateAdminUserInput = z.infer<typeof createAdminUserSchema>;

export const updateAdminUserSchema = z.object({
  display_name: z.string().trim().min(2).optional(),
  email: z.string().trim().email("Enter a valid email address").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  phone: phoneSchema.nullable().optional(),
  role: roleSchema.optional(),
  bloodType: bloodTypeSchema.nullable().optional(),
  city: z.string().trim().min(2).nullable().optional(),
  is_email_verified: z.boolean().optional(),
  receiveAlerts: z.boolean().optional(),
  active: z.boolean().optional(),
  permissions: z.array(adminPermissionSchema).optional(),
  isSuperAdmin: z.boolean().optional(),
  canDonate: z.boolean().optional(),
  canRequest: z.boolean().optional(),
  hospitalName: z.string().trim().min(2).optional(),
  licenseNumber: z.string().trim().nullable().optional(),
  address: z.string().trim().nullable().optional(),
});
export type UpdateAdminUserInput = z.infer<typeof updateAdminUserSchema>;

export const listAdminDonationsQuerySchema = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "COMPLETED", "DECLINED", "CANCELLED"]).optional(),
  bloodType: bloodTypeSchema.optional(),
  city: z.string().trim().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
export type ListAdminDonationsQuery = z.infer<typeof listAdminDonationsQuerySchema>;

export const listNotificationLogsQuerySchema = z.object({
  channel: z.enum(["WHATSAPP", "EMAIL"]).optional(),
  status: z.enum(["SENT", "FAILED"]).optional(),
  event: z.string().trim().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListNotificationLogsQuery = z.infer<typeof listNotificationLogsQuerySchema>;
