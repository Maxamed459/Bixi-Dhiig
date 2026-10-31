import { Resend } from "resend";
import { RESEND_API_KEY } from "../config/dotenv.js";

if (!RESEND_API_KEY) {
  // Don't throw at import time — lets the rest of the app boot (and health checks pass)
  // even before RESEND_API_KEY is configured; sendMail() below fails loudly instead.
  console.warn(
    "[resend] RESEND_API_KEY is not set — outgoing email will fail until it is configured in .env",
  );
}

export const resend = new Resend(RESEND_API_KEY);
