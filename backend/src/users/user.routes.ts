import express, { Request, Response } from "express";
import { z } from "zod";
import { authenticate } from "../middlewares/authenticate.js";
import { validateBody } from "../middlewares/validate.js";
import { prisma } from "../lib/prisma.js";
import { logger } from "../config/logger.js";

const updateMeSchema = z.object({
  display_name: z.string().trim().min(2).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone/WhatsApp number, e.g. +252612345678")
    .optional(),
  bloodType: z
    .enum(["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"])
    .optional(),
  city: z.string().trim().min(2).optional(),
  receiveAlerts: z.boolean().optional(),
});

const userRouter = express.Router();
userRouter.use(authenticate);

userRouter.get("/me", (req: Request, res: Response) =>
  res.status(200).json({ success: true, data: req.user }),
);

userRouter.patch("/me", validateBody(updateMeSchema), async (req: Request, res: Response) => {
  try {
    const { phone } = req.body as { phone?: string };
    if (phone) {
      const taken = await prisma.user.findFirst({ where: { phone, NOT: { id: req.user.id } } });
      if (taken) {
        return res
          .status(400)
          .json({ success: false, message: "this phone/WhatsApp number is already registered." });
      }
    }

    const user = await prisma.user.update({ where: { id: req.user.id }, data: req.body });
    return res.status(200).json({ success: true, data: user, message: "Profile updated." });
  } catch (error) {
    logger.info(error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
});

export default userRouter;
