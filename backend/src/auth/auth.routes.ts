import express from "express";
import {
  changePassword,
  createNewAccessToken,
  deleteAccount,
  googleOauth,
  googleOauthCalback,
  login,
  logout,
  mobileGoogleOauth,
  registerUser,
  registerHospital,
  resendOtpCode,
  verifyEmail,
} from "./auth.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validateBody } from "../middlewares/validate.js";
import {
  changePasswordSchema,
  loginSchema,
  mobileGoogleSchema,
  registerHospitalSchema,
  registerUserSchema,
  verifyEmailSchema,
} from "./auth.validation.js";

const authRouter = express.Router();

authRouter.post(
  "/register-user",
  validateBody(registerUserSchema),
  registerUser,
);
authRouter.post(
  "/register-hospital",
  validateBody(registerHospitalSchema),
  registerHospital,
);
authRouter.post("/login", validateBody(loginSchema), login);
authRouter.get("/google", googleOauth);
authRouter.get("/google/callback", googleOauthCalback);
// Native mobile sign-in (Flutter `google_sign_in` -> idToken -> this). No redirect/cookie.
authRouter.post(
  "/google/mobile",
  validateBody(mobileGoogleSchema),
  mobileGoogleOauth,
);
authRouter.post("/resend-code", authenticate, resendOtpCode);
authRouter.post(
  "/verify",
  authenticate,
  validateBody(verifyEmailSchema),
  verifyEmail,
);
authRouter.post("/refresh-token", createNewAccessToken);
authRouter.post(
  "/change-password",
  authenticate,
  validateBody(changePasswordSchema),
  changePassword,
);
authRouter.post("/delete-account", authenticate, deleteAccount);
authRouter.post("/logout", authenticate, logout);

export default authRouter;
