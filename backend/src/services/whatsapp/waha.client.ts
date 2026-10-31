import { WAHA_API_KEY, WAHA_BASE_URL, WAHA_SESSION } from "../../config/dotenv.js";
import { AppError } from "../../lib/appError.js";
import { logger } from "../../config/logger.js";

/**
 * Thin client for WAHA (WhatsApp HTTP API — https://waha.devlike.pro), a self-hosted
 * WhatsApp gateway. We only need the one endpoint it exposes for plain text messages:
 *
 *   POST {WAHA_BASE_URL}/api/sendText
 *   { "session": "default", "chatId": "<digits-only-phone>@c.us", "text": "..." }
 *
 * WAHA's own auth (if you've enabled WHATSAPP_API_KEY / global API key on the WAHA
 * instance itself) is passed through the X-Api-Key header.
 */

export interface WahaSendTextResult {
  ok: boolean;
  status: number;
  body: unknown;
}

const normalizePhoneForWaha = (phone: string): string => {
  // WAHA expects a bare digit string (country code + number, no "+", no spaces/dashes).
  const digitsOnly = phone.replace(/\D/g, "");
  if (!digitsOnly) {
    throw new AppError(400, "Invalid phone number for WhatsApp");
  }
  return digitsOnly;
};

export const toWahaChatId = (phone: string): string =>
  `${normalizePhoneForWaha(phone)}@c.us`;

export const sendWahaText = async (
  phone: string,
  text: string,
): Promise<WahaSendTextResult> => {
  if (!WAHA_BASE_URL) {
    throw new AppError(
      500,
      "WAHA_BASE_URL is not configured — cannot send WhatsApp messages",
    );
  }

  const chatId = toWahaChatId(phone);
  const url = `${WAHA_BASE_URL.replace(/\/$/, "")}/api/sendText`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (WAHA_API_KEY) {
    headers["X-Api-Key"] = WAHA_API_KEY;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      session: WAHA_SESSION,
      chatId,
      text,
    }),
  });

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // WAHA sometimes returns an empty body on success — that's fine.
  }

  if (!response.ok) {
    logger.info("WAHA sendText failed", {
      chatId,
      status: response.status,
      body,
    });
  }

  return { ok: response.ok, status: response.status, body };
};
