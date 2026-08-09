import express from "express";
import { register, resendCode, verifyEmail } from "./auth.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/resend-code", authenticate, resendCode);
authRouter.post("/verify", authenticate, verifyEmail);

export default authRouter;
