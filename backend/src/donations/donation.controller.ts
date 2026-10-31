import { Request, Response } from "express";
import { logger } from "../config/logger.js";
import { AppError } from "../lib/appError.js";
import {
  getDonationById,
  listDonationsForRequest,
  listMyDonations,
  pledgeDonation,
  updateDonationStatus,
} from "./donation.service.js";
import { getBloodRequestById } from "../bloodRequests/bloodRequest.service.js";
import type { CreateDonationInput, UpdateDonationStatusInput } from "./donation.validation.js";
import { notifyWhatsApp } from "../services/whatsapp/notification.service.js";
import {
  donationAcceptedMessage,
  donationCompletedMessage,
  donorPledgedMessage,
  requestFulfilledMessage,
} from "../services/whatsapp/whatsapp.templates.js";

const handleError = (res: Response, error: unknown) => {
  logger.info(error);
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ success: false, message: error.message });
  }
  return res.status(500).json({
    success: false,
    message: error instanceof Error ? error.message : "Something went wrong",
  });
};

export const pledgeDonationHandler = async (req: Request, res: Response) => {
  try {
    const input = req.body as CreateDonationInput;
    const donation = await pledgeDonation(req.user!.id, input);

    if (donation.bloodRequest.contactPhone) {
      void notifyWhatsApp({
        userId: donation.bloodRequest.requesterId,
        phone: donation.bloodRequest.contactPhone,
        event: "donor_pledged",
        text: donorPledgedMessage(donation.bloodRequest, donation.donor.display_name),
      });
    }

    return res.status(201).json({
      success: true,
      data: donation,
      message: "Thank you — your donation offer has been sent to the requester.",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getDonationHandler = async (req: Request, res: Response) => {
  try {
    const donation = await getDonationById((req.params.id as string));
    return res.status(200).json({ success: true, data: donation });
  } catch (error) {
    return handleError(res, error);
  }
};

export const listMyDonationsHandler = async (req: Request, res: Response) => {
  try {
    const donations = await listMyDonations(req.user!.id);
    return res.status(200).json({ success: true, data: donations });
  } catch (error) {
    return handleError(res, error);
  }
};

export const listDonationsForRequestHandler = async (req: Request, res: Response) => {
  try {
    const donations = await listDonationsForRequest((req.params.requestId as string), req.user!);
    return res.status(200).json({ success: true, data: donations });
  } catch (error) {
    return handleError(res, error);
  }
};

export const updateDonationStatusHandler = async (req: Request, res: Response) => {
  try {
    const input = req.body as UpdateDonationStatusInput;
    const donation = await updateDonationStatus((req.params.id as string), req.user!, input);

    if (input.status === "ACCEPTED" && donation.donor.phone) {
      void notifyWhatsApp({
        userId: donation.donorId,
        phone: donation.donor.phone,
        event: "donation_accepted",
        text: donationAcceptedMessage(donation.bloodRequest, donation.scheduledAt),
      });
    }

    if (input.status === "COMPLETED") {
      if (donation.donor.phone) {
        void notifyWhatsApp({
          userId: donation.donorId,
          phone: donation.donor.phone,
          event: "donation_completed",
          text: donationCompletedMessage(donation.bloodRequest),
        });
      }

      // The request may have just flipped to FULFILLED — check and let the requester know.
      const refreshedRequest = await getBloodRequestById(donation.bloodRequestId);
      if (refreshedRequest.status === "FULFILLED" && refreshedRequest.requester.phone) {
        void notifyWhatsApp({
          userId: refreshedRequest.requesterId,
          phone: refreshedRequest.requester.phone,
          event: "blood_request_fulfilled",
          text: requestFulfilledMessage(refreshedRequest),
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: donation,
      message: `Donation marked as ${input.status.toLowerCase()}.`,
    });
  } catch (error) {
    return handleError(res, error);
  }
};
