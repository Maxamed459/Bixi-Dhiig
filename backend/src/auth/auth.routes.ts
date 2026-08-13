import express from "express";
import {
  changePassword,
  createNewAccessToken,
  googleOauth,
  googleOauthCalback,
  login,
  logout,
  register,
  resendOtpCode,
  verifyEmail,
} from "./auth.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/google", googleOauth);
authRouter.post("/google/callback", googleOauthCalback);
authRouter.post("/resend-code", authenticate, resendOtpCode);
authRouter.post("/verify", authenticate, verifyEmail);
authRouter.post("/refresh-token", createNewAccessToken);
authRouter.post("/change-password", authenticate, changePassword);
authRouter.post("/logout", authenticate, logout);

export default authRouter;
