import { Request, Response } from "express";
import { logger } from "../config/logger.js";
import {
  createNewUser,
  findUserByEmail,
  update_is_email_verified,
} from "./auth.service.js";
import bcrypt from "bcrypt";
import {
  createOtp,
  getOtpTtl,
  resendOtp,
  sendOtpEmail,
  verifyOtp,
} from "../services/mail/otp.service.js";
import { prisma } from "../lib/prisma.js";
import { success } from "zod";
import { sendWelcomeEmail } from "../services/mail/welcome.service.js";
import { createJwtToken } from "../lib/jwt.js";

export const register = async (req: Request, res: Response) => {
  const { display_name, email, password } = req.body;
  try {
    const isUserExists = await findUserByEmail(email);

    if (isUserExists) {
      return res.status(400).json({
        success: false,
        message: "this email already exists please login.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createNewUser(display_name, email, hashedPassword);
    const otpCode = await createOtp(newUser.id);

    await sendOtpEmail(newUser.email, otpCode);

    const accessToken = await createJwtToken(newUser.id, "access");
    const refreshToken = await createJwtToken(newUser.id, "refresh");

    console.log(`accessToken ${accessToken} refreshToken ${refreshToken}`);

    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: SEVEN_DAYS_MS,
    });

    return res.status(201).json({
      success: true,
      data: {
        user: newUser,
        accessToken,
      },
      message: "user created successfully",
    });
  } catch (error) {
    logger.info("Here", error);
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

// resend code handler
export const resendCode = async (req: Request, res: Response) => {
  const { email } = req.user.email;
  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "email doesn't exist please register",
      });
    }

    const otp = await resendOtp(user.id);

    await sendOtpEmail(user.email, otp);

    return res.status(201).json({
      success: true,
      message: "verification code sent successfully",
    });
  } catch (error) {
    logger.info(error);
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

// verify code handler
export const verifyEmail = async (req: Request, res: Response) => {
  const { submittedCode } = req.body;
  const user = req.user;
  const userId = req.user.id;

  try {
    if (user.is_email_verified) {
      return res.status(400).json({
        success: false,
        message: "This email is alraedy verified",
      });
    }
    const verified = await verifyOtp(userId, submittedCode);

    if (!verified.valid) {
      return res.status(400).json({
        success: false,
        message: verified.reason,
      });
    }

    const update_isVerified_email = await update_is_email_verified(userId);

    const welcome = await sendWelcomeEmail(
      update_isVerified_email.email,
      update_isVerified_email.display_name,
    );

    console.log("welcome email", welcome);

    return res.status(200).json({
      success: true,
      message: "email verified successful.",
    });
  } catch (error) {
    logger.info(error);
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};
