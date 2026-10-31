import type { BloodType, UrgencyLevel } from "../../generated/prisma/enums.js";

export const bloodTypeLabel = (bloodType: BloodType): string =>
  bloodType.replace("_POSITIVE", "+").replace("_NEGATIVE", "-");

const urgencyLabel = (urgency: UrgencyLevel): string => {
  switch (urgency) {
    case "CRITICAL":
      return "CRITICAL — needed immediately";
    case "URGENT":
      return "Urgent";
    default:
      return "Normal";
  }
};

interface RequestSummary {
  patientName: string;
  bloodType: BloodType;
  unitsNeeded: number;
  urgency: UrgencyLevel;
  hospitalName: string;
  city: string;
  contactPhone: string;
}

/** Sent to matching donors (same blood type + city) when a request goes live. */
export const donorAlertMessage = (req: RequestSummary): string =>
  `🩸 *Blood needed: ${bloodTypeLabel(req.bloodType)}*\n` +
  `${urgencyLabel(req.urgency)}\n\n` +
  `Patient: ${req.patientName}\n` +
  `Units needed: ${req.unitsNeeded}\n` +
  `Hospital: ${req.hospitalName}, ${req.city}\n` +
  `Contact: ${req.contactPhone}\n\n` +
  `If you're able to donate, open the Bixi-Dhiig app to respond to this request.`;

/** Sent to admins when a USER submits a request that needs approval. */
export const adminApprovalNeededMessage = (
  req: RequestSummary & { requesterName: string },
): string =>
  `🔔 *New blood request awaiting approval*\n\n` +
  `Requested by: ${req.requesterName}\n` +
  `Patient: ${req.patientName}\n` +
  `Blood type: ${bloodTypeLabel(req.bloodType)} · ${req.unitsNeeded} unit(s)\n` +
  `${urgencyLabel(req.urgency)}\n` +
  `Hospital: ${req.hospitalName}, ${req.city}\n\n` +
  `Review it in the Bixi-Dhiig admin dashboard.`;

/** Sent to the requester once their request is approved. */
export const requestApprovedMessage = (req: RequestSummary): string =>
  `✅ *Your blood request has been approved*\n\n` +
  `Patient: ${req.patientName}\n` +
  `Blood type: ${bloodTypeLabel(req.bloodType)} · ${req.unitsNeeded} unit(s)\n\n` +
  `Donors nearby are being notified now. We'll let you know as they respond.`;

/** Sent to the requester if an admin rejects their request. */
export const requestRejectedMessage = (
  req: RequestSummary,
  reason?: string | null,
): string =>
  `❌ *Your blood request was not approved*\n\n` +
  `Patient: ${req.patientName}\n` +
  (reason ? `Reason: ${reason}\n\n` : "\n") +
  `If you believe this is a mistake, please contact Bixi-Dhiig support.`;

/** Sent to the requester when a donor pledges to help. */
export const donorPledgedMessage = (
  req: RequestSummary,
  donorName: string,
): string =>
  `🙋 *A donor has responded to your request*\n\n` +
  `${donorName} has offered to donate for ${req.patientName} (${bloodTypeLabel(
    req.bloodType,
  )}).\n\n` +
  `Open the Bixi-Dhiig app to confirm and coordinate with them.`;

/** Sent to the donor once their pledge is confirmed by the requester/hospital/admin. */
export const donationAcceptedMessage = (
  req: RequestSummary,
  scheduledAt?: Date | null,
): string =>
  `👍 *Your donation offer was accepted*\n\n` +
  `Patient: ${req.patientName} at ${req.hospitalName}, ${req.city}\n` +
  (scheduledAt
    ? `Scheduled: ${scheduledAt.toLocaleString()}\n\n`
    : "\n") +
  `Thank you for stepping up — every donation saves a life.`;

/** Sent to the donor after their donation is marked completed. */
export const donationCompletedMessage = (req: RequestSummary): string =>
  `🎉 *Thank you for donating blood!*\n\n` +
  `Your donation for ${req.patientName} at ${req.hospitalName} has been recorded. ` +
  `You're making a real difference — Bixi-Dhiig.`;

/** Sent to the requester when their request is fully fulfilled. */
export const requestFulfilledMessage = (req: RequestSummary): string =>
  `🎉 *Your blood request has been fulfilled*\n\n` +
  `All ${req.unitsNeeded} unit(s) of ${bloodTypeLabel(
    req.bloodType,
  )} needed for ${req.patientName} have been secured. Thank you to everyone who responded.`;

/** Welcome message once a user verifies their account (mirrors the email welcome). */
export const welcomeWhatsappMessage = (display_name: string): string =>
  `👋 Welcome to Bixi-Dhiig, ${display_name}!\n\n` +
  `You'll get a WhatsApp message here whenever there's an urgent blood request matching your blood type nearby. ` +
  `You can turn this off anytime from your profile.`;
