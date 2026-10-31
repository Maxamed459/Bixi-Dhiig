import { prisma } from "../../lib/prisma.js";
import { logger } from "../../config/logger.js";
import { sendWahaText } from "./waha.client.js";

/**
 * Sends one WhatsApp message and records the outcome in NotificationLog, regardless of
 * whether it succeeded. Never throws — a failed WhatsApp send should not fail the
 * request/donation operation that triggered it, so callers can safely fire-and-forget
 * (or await, if they want to report delivery back to the caller).
 */
export const notifyWhatsApp = async (params: {
  userId?: string | null;
  phone: string;
  event: string;
  text: string;
}): Promise<boolean> => {
  const { userId, phone, event, text } = params;

  try {
    const result = await sendWahaText(phone, text);

    await prisma.notificationLog.create({
      data: {
        userId: userId ?? null,
        channel: "WHATSAPP",
        event,
        target: phone,
        status: result.ok ? "SENT" : "FAILED",
        error: result.ok ? null : JSON.stringify(result.body ?? result.status),
      },
    });

    return result.ok;
  } catch (error) {
    logger.info("WhatsApp notification failed", { phone, event, error });

    await prisma.notificationLog
      .create({
        data: {
          userId: userId ?? null,
          channel: "WHATSAPP",
          event,
          target: phone,
          status: "FAILED",
          error: error instanceof Error ? error.message : String(error),
        },
      })
      .catch(() => {
        // best-effort logging only
      });

    return false;
  }
};

/**
 * Sends the same message to many recipients in parallel, without letting one failure
 * block the others. Used for "notify every matching donor" / "notify every admin".
 */
export const notifyManyWhatsApp = async (
  recipients: Array<{ userId: string; phone: string }>,
  event: string,
  text: string,
): Promise<{ sent: number; failed: number }> => {
  const results = await Promise.all(
    recipients.map((r) =>
      notifyWhatsApp({ userId: r.userId, phone: r.phone, event, text }),
    ),
  );

  return {
    sent: results.filter(Boolean).length,
    failed: results.filter((ok) => !ok).length,
  };
};
