import express from "express";
import {
  changePassword,
  createNewAccessToken,
  deleteAccount,
  googleOauth,
  googleOauthCalback,
  login,
  logout,
  registerUser,
  registerHospital,
  resendOtpCode,
  verifyEmail,
} from "./auth.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const authRouter = express.Router();

authRouter.post("/register-user", registerUser);
authRouter.post("/register-hospital", registerHospital);
authRouter.post("/login", login);
authRouter.post("/google", googleOauth);
authRouter.post("/google/callback", googleOauthCalback);
authRouter.post("/resend-code", authenticate, resendOtpCode);
authRouter.post("/verify", authenticate, verifyEmail);
authRouter.post("/refresh-token", createNewAccessToken);
authRouter.post("/change-password", authenticate, changePassword);
authRouter.post("/delete-account", authenticate, deleteAccount);
authRouter.post("/logout", authenticate, logout);

export default authRouter;
