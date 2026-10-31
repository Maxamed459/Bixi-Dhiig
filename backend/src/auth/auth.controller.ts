import { Request, Response } from "express";
import { logger } from "../config/logger.js";
import {
  createNewUser,
  findOrCreateUser,
  findUserByEmail,
  findUserById,
  findUserByIdWithHashPassword,
  findUserByPhone,
  update_is_email_verified,
  updateIs_deleted,
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
import { sendWelcomeEmail } from "../services/mail/welcome.service.js";
import { generateJwtToken, verifyJwtToken } from "../lib/jwt.js";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_OAUTH_REDIRECT_URI,
  FRONTEND_URL,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  NODE_ENV,
} from "../config/dotenv.js";
import { AppError } from "../lib/appError.js";
import {
  checkRedisHashRefreshToken,
  hashRefreshToken,
  rotateRefreshToken,
} from "../services/refreshTokenRotation.js";
import { getRedisClient } from "../lib/redis.js";
import { google } from "googleapis";
import crypto from "crypto";
import { getClientType } from "../lib/clientType.js";
import { notifyWhatsApp } from "../services/whatsapp/notification.service.js";
import { welcomeWhatsappMessage } from "../services/whatsapp/whatsapp.templates.js";
import type {
  RegisterHospitalInput,
  RegisterUserInput,
} from "./auth.validation.js";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// register handler
export const registerUser = async (req: Request, res: Response) => {
  const { display_name, email, password, phone, bloodType, city } =
    req.body as RegisterUserInput;
  const clientType = getClientType(req);
  try {
    const isUserExists = await findUserByEmail(email);

    if (isUserExists) {
      return res.status(400).json({
        success: false,
        message: "this email already exists please login.",
      });
    }

    const isPhoneTaken = await findUserByPhone(phone);
    if (isPhoneTaken) {
      return res.status(400).json({
        success: false,
        message: "this phone/WhatsApp number is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = "USER";
    const newUser = await createNewUser(
      display_name,
      email,
      role,
      hashedPassword,
      { phone, bloodType, city },
    );
    const otpCode = await createOtp(newUser.id);

    await sendOtpEmail(newUser.email, otpCode);

    if (!JWT_ACCESS_SECRET && !JWT_REFRESH_SECRET) {
      throw new Error("JWT_SECRETS is not available please provide it");
    }
    const accessToken = await generateJwtToken(
      {
        sub: newUser.id,
        role: "USER",
        type: "access",
      },
      JWT_ACCESS_SECRET!,
      "15m",
    );

    const refreshToken = await generateJwtToken(
      {
        sub: newUser.id,
        role: "USER",
        type: "refresh",
      },
      JWT_REFRESH_SECRET!,
      "7d",
    );

    const client = getRedisClient();

    const rediskey = `refresh:${newUser.id}`;

    await client.del(rediskey);

    await rotateRefreshToken(newUser.id);

    if (clientType === "WEB") {
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
    } else {
      return res.status(201).json({
        success: true,
        data: {
          user: newUser,
          accessToken,
          refreshToken,
        },
        message: "user created successfully",
      });
    }
  } catch (error) {
    logger.info("Here", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

// register handler
export const registerHospital = async (req: Request, res: Response) => {
  const { display_name, email, password, phone, city } =
    req.body as RegisterHospitalInput;
  const clientType = getClientType(req);
  try {
    const isUserExists = await findUserByEmail(email);

    if (isUserExists) {
      return res.status(400).json({
        success: false,
        message: "this email already exists please login.",
      });
    }

    const isPhoneTaken = await findUserByPhone(phone);
    if (isPhoneTaken) {
      return res.status(400).json({
        success: false,
        message: "this phone/WhatsApp number is already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = "HOSPITAL";

    const newUser = await createNewUser(
      display_name,
      email,
      role,
      hashedPassword,
      { phone, city },
    );
    const otpCode = await createOtp(newUser.id);

    await sendOtpEmail(newUser.email, otpCode);

    if (!JWT_ACCESS_SECRET && !JWT_REFRESH_SECRET) {
      throw new Error("JWT_SECRETS is not available please provide it");
    }
    const accessToken = await generateJwtToken(
      {
        sub: newUser.id,
        role: "HOSPITAL",
        type: "access",
      },
      JWT_ACCESS_SECRET!,
      "15m",
    );

    const refreshToken = await generateJwtToken(
      {
        sub: newUser.id,
        role: "HOSPITAL",
        type: "refresh",
      },
      JWT_REFRESH_SECRET!,
      "7d",
    );

    const client = getRedisClient();

    const rediskey = `refresh:${newUser.id}`;

    await client.del(rediskey);

    await rotateRefreshToken(newUser.id);

    if (clientType === "WEB") {
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
    } else {
      return res.status(201).json({
        success: true,
        data: {
          user: newUser,
          accessToken,
          refreshToken,
        },
        message: "user created successfully",
      });
    }
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
  const { email } = req.user;
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

    const verifiedUser = await update_is_email_verified(user.id);

    await sendWelcomeEmail(verifiedUser.email, verifiedUser.display_name);

    if (verifiedUser.phone) {
      void notifyWhatsApp({
        userId: verifiedUser.id,
        phone: verifiedUser.phone,
        event: "welcome",
        text: welcomeWhatsappMessage(verifiedUser.display_name),
      });
    }

    return res.status(200).json({
      success: true,
      data: verifiedUser,
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
  const clientType = getClientType(req);
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

    await updateLastLogin(user.email);

    if (!JWT_ACCESS_SECRET && !JWT_REFRESH_SECRET) {
      throw new Error("JWT_SECRETS is not available please provide it");
    }
    const accessToken = await generateJwtToken(
      {
        sub: user.id,
        role: user.role,
        type: "access",
      },
      JWT_ACCESS_SECRET!,
      "15m",
    );

    const refreshToken = await generateJwtToken(
      {
        sub: user.id,
        role: user.role,
        type: "refresh",
      },
      JWT_REFRESH_SECRET!,
      "7d",
    );

    const client = getRedisClient();

    const rediskey = `refresh:${user.id}`;
    await client.del(rediskey);

    await rotateRefreshToken(user.id);

    if (clientType === "WEB") {
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
          user: user,
          accessToken,
        },
        message: "user created successfully",
      });
    } else {
      return res.status(201).json({
        success: true,
        data: {
          user: user,
          accessToken,
          refreshToken,
        },
        message: "user created successfully",
      });
    }
  } catch (error) {
    console.error("FULL CRASH DETAILS:", error);
    logger.info(error);
    return res.status(500).json({
      success: false,
      message: error || "An unexpected internal server error occurred",
    });
  }
};

// refreshToken handler
export const createNewAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken ?? req.body.refreshToken;
  const clientType = getClientType(req);
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

    const decoded = await verifyJwtToken(refreshToken, JWT_REFRESH_SECRET);

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

    if (!JWT_ACCESS_SECRET && !JWT_REFRESH_SECRET) {
      throw new Error("JWT_SECRETS is not available please provide it");
    }

    const newRefreshToken = await generateJwtToken(
      {
        sub: user.id,
        role: user.role,
        type: "refresh",
      },
      JWT_REFRESH_SECRET!,
      "7d",
    );

    await rotateRefreshToken(user.id);

    const accessToken = await generateJwtToken(
      {
        sub: user.id,
        role: user.role,
        type: "access",
      },
      JWT_ACCESS_SECRET!,
      "15m",
    );

    if (clientType === "WEB") {
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: SEVEN_DAYS_MS,
      });

      return res.status(201).json({
        success: true,
        data: { accessToken, user },
        message: "accessToken created successfully!",
      });
    }

    return res.status(201).json({
      success: true,
      data: { accessToken, refreshToken: newRefreshToken, user },
      message: "accessToken created successfully!",
    });
  } catch (error) {
    logger.info(error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
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

// delete account
export const deleteAccount = async (req: Request, res: Response) => {
  const user = req.user;
  try {
    await updateIs_deleted(user.id);

    return res.status(200).json({
      success: true,
      message: "your account deleted successfully.",
    });
  } catch (error) {
    logger.info(error);
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};

// google auth

const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_OAUTH_REDIRECT_URI,
);

const redirectToFrontendLogin = (res: Response, error: string) => {
  const frontendUrl = FRONTEND_URL || "http://localhost:3000";
  return res.redirect(`${frontendUrl}/login?error=${error}`);
};

export const googleOauth = (_req: Request, res: Response) => {
  const state = crypto.randomBytes(32).toString("hex");

  res.cookie("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 5 * 60 * 1000, // 5 minutes — state cookie should be short-lived
  });

  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["openid", "email", "profile"],
    state,
  });

  res.redirect(url);
};
// Mobile Google sign-in: the Flutter app signs the user in natively (e.g. with the
// `google_sign_in` package), gets a Google ID token on-device, and sends just that
// token here. No redirect, no cookie — we verify it with Google ourselves and hand
// back our own access/refresh tokens in the JSON body, exactly like /login does for
// mobile. New accounts created this way are USER (donor) accounts, since that's the
// only role the mobile app signs up.
const mobileOAuth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID);

export const mobileGoogleOauth = async (req: Request, res: Response) => {
  const { idToken } = req.body as { idToken: string };

  try {
    const ticket = await mobileOAuth2Client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return res.status(400).json({
        success: false,
        message: "Google account email not verified",
      });
    }

    const { user, isUserNew } = await findOrCreateUser(
      {
        providerUserId: payload.sub,
        email: payload.email,
        name: payload.name ?? payload.email,
        picture: payload.picture ?? "",
      },
      "USER",
    );

    if (!JWT_ACCESS_SECRET && !JWT_REFRESH_SECRET) {
      throw new Error("JWT_SECRETS is not available please provide it");
    }

    const accessToken = await generateJwtToken(
      { sub: user.id, role: user.role, type: "access" },
      JWT_ACCESS_SECRET!,
      "15m",
    );
    const refreshToken = await generateJwtToken(
      { sub: user.id, role: user.role, type: "refresh" },
      JWT_REFRESH_SECRET!,
      "7d",
    );

    const client = getRedisClient();
    await client.del(`refresh:${user.id}`);
    await rotateRefreshToken(user.id);

    if (isUserNew) {
      await sendWelcomeEmail(user.email, user.display_name);
    }

    return res.status(200).json({
      success: true,
      data: { user, accessToken, refreshToken },
      message: "signed in with Google successfully",
    });
  } catch (error) {
    logger.info(error);
    return res.status(401).json({
      success: false,
      message: "Invalid Google ID token",
    });
  }
};

export const googleOauthCalback = async (req: Request, res: Response) => {
  const { code, state } = req.query;
  const savedState = req.cookies.oauth_state;

  res.clearCookie("oauth_state");

  if (!state || state !== savedState) {
    return redirectToFrontendLogin(res, "google_state_mismatch");
  }

  if (!code || typeof code !== "string") {
    return redirectToFrontendLogin(res, "google_missing_code");
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
    const { data: profile } = await oauth2.userinfo.get();

    if (!profile.email || !profile.verified_email) {
      return redirectToFrontendLogin(res, "google_email_unverified");
    }

    // find or create the user
    const { user, isUserNew } = await findOrCreateUser({
      providerUserId: profile.id!,
      email: profile.email,
      name: profile.name!,
      picture: profile.picture!,
    });

    if (!JWT_ACCESS_SECRET && !JWT_REFRESH_SECRET) {
      throw new Error("JWT_SECRETS is not available please provide it");
    }

    const refreshToken = await generateJwtToken(
      {
        sub: user!.id,
        role: user!.role,
        type: "refresh",
      },
      JWT_REFRESH_SECRET!,
      "7d",
    );

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

    if (isUserNew) {
      await sendWelcomeEmail(user!.email, user!.display_name);
    }

    const frontendUrl = FRONTEND_URL || "http://localhost:3000";
    return res.redirect(`${frontendUrl}/login/callback`);
  } catch (error) {
    logger.info(error);
    return redirectToFrontendLogin(res, "google_auth_failed");
  }
};
