import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  display_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.literal("hospital"),
});
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const verifySchema = z.object({
  submittedCode: z.string().min(4, "Enter the code sent to your email"),
});
export type VerifyFormValues = z.infer<typeof verifySchema>;
