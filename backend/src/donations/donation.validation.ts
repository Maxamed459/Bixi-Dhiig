import { z } from "zod";

export const createDonationSchema = z.object({
  bloodRequestId: z.string().uuid("Invalid blood request id"),
  unitsOffered: z.coerce.number().int().min(1).max(4).default(1),
  notes: z.string().trim().max(500).optional(),
});
export type CreateDonationInput = z.infer<typeof createDonationSchema>;

export const updateDonationStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "COMPLETED", "DECLINED", "CANCELLED"]),
  scheduledAt: z.coerce.date().optional(),
  notes: z.string().trim().max(500).optional(),
});
export type UpdateDonationStatusInput = z.infer<typeof updateDonationStatusSchema>;
