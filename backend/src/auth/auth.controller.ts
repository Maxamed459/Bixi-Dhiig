import { Request, Response } from "express";
import { logger } from "../config/logger.js";
import {
  createNewUser,
  findUserByEmail,
  findUserById,
  findUserByIdWithHashPassword,
  update_is_email_verified,
  updateLastLogin,
  updatePassowrd,
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
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../lib/jwt.js";
import { JWT_REFRESH_SECRET, NODE_ENV } from "../config/dotenv.js";
import { AppError } from "../lib/appError.js";
import {
  checkRedisHashRefreshToken,
  hashRefreshToken,
  rotateRefreshToken,
} from "../services/refreshTokenRotation.js";
import { getRedisClient } from "../lib/redis.js";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

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

    const accessToken = await createAccessToken(newUser.id);
    const refreshToken = await createRefreshToken(newUser.id);

    const client = getRedisClient();

    const rediskey = `refresh:${newUser.id}`;

    await client.del(rediskey);

    await rotateRefreshToken(newUser.id);

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
export const resendOtpCode = async (req: Request, res: Response) => {
  const { email } = req.user.email;
  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "email doesn't exist please register.",
      });
    }

    if (user.is_email_verified) {
      return res.status(409).json({
        success: false,
        message: "This email is already verified.",
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

  try {
    if (user.is_email_verified) {
      return res.status(409).json({
        success: false,
        message: "This email is alraedy verified",
      });
    }
    const verified = await verifyOtp(user.id, submittedCode);

    if (!verified.valid) {
      return res.status(400).json({
        success: false,
        message: verified.reason,
      });
    }

    const update_isVerified_email = await update_is_email_verified(user.id);

    await sendWelcomeEmail(
      update_isVerified_email.email,
      update_isVerified_email.display_name,
    );

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

// login handler
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const hashedPassword = await findUserByIdWithHashPassword(user.id);

    const isPasswordCorrect = await bcrypt.compare(password, hashedPassword!);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const updatedUser = await updateLastLogin(user.email);

    const accessToken = await createAccessToken(user.id);
    const refreshToken = await createRefreshToken(user.id);

    const client = getRedisClient();

    const rediskey = `refresh:${user.id}`;
    await client.del(rediskey);

    await rotateRefreshToken(user.id);

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
        user: updatedUser,
        accessToken,
      },
      message: "user created successfully",
    });
  } catch (error) {
    logger.info(error);
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

// refreshToken handler
export const createNewAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token not provided",
    });
  }
  try {
    if (!JWT_REFRESH_SECRET) {
      throw new AppError(500, "JWT refresh configuration is missing");
    }

    const decoded = await verifyRefreshToken(refreshToken);

    if (decoded.type !== "refresh") {
      return res.status(401).json({
        success: false,
        message: "Invalid token type",
      });
    }

    const userId = decoded.sub;

    const client = getRedisClient();

    const rediskey = `refresh:${userId}`;

    const storedRefreshToken = await checkRedisHashRefreshToken(rediskey);
    if (!storedRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await findUserById(decoded.sub!);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "user not found",
      });
    }

    await client.del(rediskey);

    const newRefreshToken = await createRefreshToken(user.id);

    await rotateRefreshToken(user.id);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: SEVEN_DAYS_MS,
    });

    const newAccessToken = await createAccessToken(user.id);

    return res.status(201).json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
      message: "accessToken created successfully!",
    });
  } catch (error) {
    logger.info(error);
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

// reset password
export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const email = req.user.email;

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    const hashedPassword = await findUserByIdWithHashPassword(user.id);
    console.log(hashedPassword);

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      hashedPassword!,
    );

    console.log("password correct", isPasswordCorrect);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const hashNewPassword = await bcrypt.hash(newPassword, 10);

    await updatePassowrd(user.id, hashNewPassword);

    return res.status(200).json({
      success: true,
      message: "password updated successfully.",
    });
  } catch (error) {
    logger.info(error);
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

// logout handler
export const logout = async (req: Request, res: Response) => {
  const user = req.user;
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      message: "refreshtoken not provided",
    });
  }
  try {
    const client = getRedisClient();
    const rediskey = `refresh:${user.id}`;

    await client.del(rediskey);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "none",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "logout successfully.",
    });
  } catch (error) {
    logger.info(error);
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};
