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
