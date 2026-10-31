import { z } from "zod";

// E.164-ish: optional leading +, 8-15 digits total. This is also the WhatsApp number
// WAHA will message, so it's required at registration (not just "nice to have").
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

export const registerUserSchema = z.object({
  display_name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: phoneSchema,
  bloodType: bloodTypeSchema.optional(),
  city: z.string().trim().min(2).optional(),
});
export type RegisterUserInput = z.infer<typeof registerUserSchema>;

// Hospitals are provisioned by an admin in practice, but this schema also backs the
// (admin-only) hospital-creation endpoint, so phone/city are required up front — a
// hospital without a WhatsApp/contact number can't be notified of requests.
export const registerHospitalSchema = z.object({
  display_name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: phoneSchema,
  city: z.string().trim().min(2, "City is required"),
});
export type RegisterHospitalInput = z.infer<typeof registerHospitalSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const mobileGoogleSchema = z.object({
  idToken: z.string().min(10, "idToken is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const verifyEmailSchema = z.object({
  submittedCode: z.string().min(4, "Enter the code sent to your email"),
});
