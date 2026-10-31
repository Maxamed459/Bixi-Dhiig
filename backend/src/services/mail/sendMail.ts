import { resend } from "../../lib/resend.js";
import { EMAIL_FROM, SENDER_EMAIL } from "../../config/dotenv.js";
import { AppError } from "../../lib/appError.js";
import { logger } from "../../config/logger.js";

interface sendMailOptions {
  to: string;
  subject: string;
  html: string;
}

// Resend's sandbox/test default — works out of the box before a custom domain is verified.
const DEFAULT_FROM = "Bixi-Dhiig <onboarding@resend.dev>";

export const sendMail = async ({ to, subject, html }: sendMailOptions) => {
  const from = EMAIL_FROM || SENDER_EMAIL || DEFAULT_FROM;

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });

  if (error) {
    logger.info("Resend email failed", { to, subject, error });
    throw new AppError(502, "Failed to send email", error);
  }

  return data;
};
