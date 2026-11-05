import { z } from "zod";

// Messages here are translation KEYS (see lib/i18n/en.ts -> validation.*). The form field
// components pass them through t() at render time so errors follow the active language.

export const PHONE_REGEX = /^\+?[1-9]\d{7,14}$/;

export const loginSchema = z.object({
  email: z.string().min(1, "validation.emailRequired").email("validation.emailInvalid"),
  password: z.string().min(1, "validation.passwordRequired"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  display_name: z.string().min(2, "validation.nameMin"),
  email: z.string().min(1, "validation.emailRequired").email("validation.emailInvalid"),
  phone: z.string().trim().regex(PHONE_REGEX, "validation.phoneInvalid"),
  city: z.string().trim().min(2, "validation.cityRequired"),
  password: z.string().min(8, "validation.passwordMin"),
  role: z.literal("hospital"),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const verifySchema = z.object({
  submittedCode: z.string().min(4, "validation.codeMin"),
});
export type VerifyFormValues = z.infer<typeof verifySchema>;

export const BLOOD_TYPES = [
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
] as const;
export const URGENCY_LEVELS = ["NORMAL", "URGENT", "CRITICAL"] as const;
export const USER_ROLES = ["USER", "HOSPITAL", "ADMIN"] as const;

export const createRequestSchema = z.object({
  patientName: z.string().trim().min(2, "validation.patientRequired"),
  bloodType: z.enum(BLOOD_TYPES, { message: "validation.bloodTypeRequired" }),
  unitsNeeded: z.number({ message: "validation.unitsRange" }).int("validation.unitsRange").min(1, "validation.unitsRange").max(20, "validation.unitsRange"),
  urgency: z.enum(URGENCY_LEVELS),
  hospitalName: z.string().trim().min(2, "validation.hospitalRequired"),
  city: z.string().trim().min(2, "validation.cityRequired"),
  address: z.string().trim().optional(),
  contactPhone: z.string().trim().regex(PHONE_REGEX, "validation.phoneInvalid"),
  notes: z.string().trim().max(1000, "validation.notesMax").optional(),
});
export type CreateRequestFormValues = z.infer<typeof createRequestSchema>;

const optionalPhone = z.string().trim().regex(PHONE_REGEX, "validation.phoneInvalid").or(z.literal(""));

export const adminUserFormSchema = z.object({
  display_name: z.string().trim().min(2, "validation.nameMin"),
  email: z.string().trim().min(1, "validation.emailRequired").email("validation.emailInvalid"),
  password: z.string().min(8, "validation.passwordMin").or(z.literal("")),
  phone: optionalPhone,
  role: z.enum(USER_ROLES),
  bloodType: z.enum(BLOOD_TYPES).or(z.literal("")),
  city: z.string().trim(),
  is_email_verified: z.boolean(),
  receiveAlerts: z.boolean(),
  active: z.boolean(),
  hospitalName: z.string().trim(),
  licenseNumber: z.string().trim(),
  address: z.string().trim(),
  permissions: z.array(z.enum(["MANAGE_USERS", "REVIEW_REQUESTS", "MANAGE_DONATIONS", "VIEW_NOTIFICATIONS"])),
  isSuperAdmin: z.boolean(),
  canDonate: z.boolean(),
  canRequest: z.boolean(),
});
export type AdminUserFormValues = z.infer<typeof adminUserFormSchema>;

export const profileFormSchema = z.object({
  display_name: z.string().trim().min(2, "validation.nameMin"),
  phone: optionalPhone,
  city: z.string().trim(),
  bloodType: z.enum(BLOOD_TYPES).or(z.literal("")),
  receiveAlerts: z.boolean(),
});
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "validation.passwordRequired"),
    newPassword: z.string().min(8, "validation.passwordMin"),
    confirmPassword: z.string().min(1, "validation.passwordRequired"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "validation.passwordMismatch",
    path: ["confirmPassword"],
  });
export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;
