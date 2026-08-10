import express from "express";
import {
  createNewAccessToken,
  login,
  register,
  resendOtpCode,
  verifyEmail,
} from "./auth.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/resend-code", authenticate, resendOtpCode);
authRouter.post("/verify", authenticate, verifyEmail);
authRouter.post("/refresh-token", createNewAccessToken);

export default authRouter;
