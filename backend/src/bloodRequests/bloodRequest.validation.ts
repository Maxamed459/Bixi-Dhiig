import { z } from "zod";

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

const urgencySchema = z.enum(["NORMAL", "URGENT", "CRITICAL"]);

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid contact phone number, e.g. +252612345678");

export const createBloodRequestSchema = z.object({
  patientName: z.string().trim().min(2, "Patient name is required"),
  bloodType: bloodTypeSchema,
  unitsNeeded: z.coerce.number().int().min(1).max(20).default(1),
  urgency: urgencySchema.default("NORMAL"),
  hospitalName: z.string().trim().min(2, "Hospital name is required"),
  city: z.string().trim().min(2, "City is required"),
  address: z.string().trim().optional(),
  contactPhone: phoneSchema,
  notes: z.string().trim().max(1000).optional(),
});
export type CreateBloodRequestInput = z.infer<typeof createBloodRequestSchema>;

export const rejectBloodRequestSchema = z.object({
  reason: z.string().trim().min(2).max(500).optional(),
});

export const listBloodRequestsQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "FULFILLED", "CANCELLED"]).optional(),
  bloodType: bloodTypeSchema.optional(),
  city: z.string().trim().optional(),
  urgency: urgencySchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
export type ListBloodRequestsQuery = z.infer<typeof listBloodRequestsQuerySchema>;
