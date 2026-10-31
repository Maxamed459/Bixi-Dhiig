import { Request, Response } from "express";
import { logger } from "../config/logger.js";
import { AppError } from "../lib/appError.js";
import {
  approveBloodRequest,
  cancelBloodRequest,
  createBloodRequest,
  findAdminsWithPhone,
  findMatchingDonors,
  getBloodRequestById,
  listBloodRequests,
  listMyBloodRequests,
  rejectBloodRequest,
} from "./bloodRequest.service.js";
import type {
  CreateBloodRequestInput,
  ListBloodRequestsQuery,
} from "./bloodRequest.validation.js";
import { notifyManyWhatsApp, notifyWhatsApp } from "../services/whatsapp/notification.service.js";
import {
  adminApprovalNeededMessage,
  donorAlertMessage,
  requestApprovedMessage,
  requestRejectedMessage,
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

export const createBloodRequestHandler = async (req: Request, res: Response) => {
  try {
    const input = req.body as CreateBloodRequestInput;
    const requester = req.user as { id: string; role: "USER" | "HOSPITAL" | "ADMIN" };

    const request = await createBloodRequest(input, requester);

    // Fire WhatsApp notifications without blocking the response on delivery.
    if (request.status === "APPROVED") {
      void findMatchingDonors(request.bloodType, request.city).then((donors) =>
        notifyManyWhatsApp(
          donors.map((d) => ({ userId: d.id, phone: d.phone! })),
          "blood_request_live",
          donorAlertMessage(request),
        ),
      );
    } else {
      void findAdminsWithPhone().then((admins) =>
        notifyManyWhatsApp(
          admins.map((a) => ({ userId: a.id, phone: a.phone! })),
          "blood_request_pending_approval",
          adminApprovalNeededMessage({
            ...request,
            requesterName: request.requester.display_name,
          }),
        ),
      );
    }

    return res.status(201).json({
      success: true,
      data: request,
      message:
        request.status === "APPROVED"
          ? "Blood request created and is now live."
          : "Blood request submitted and is awaiting admin approval.",
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const listBloodRequestsHandler = async (req: Request, res: Response) => {
  try {
    const query = res.locals.query as ListBloodRequestsQuery;
    const result = await listBloodRequests(query, req.user!);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
};

export const listMyBloodRequestsHandler = async (req: Request, res: Response) => {
  try {
    const requests = await listMyBloodRequests(req.user!.id);
    return res.status(200).json({ success: true, data: requests });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getBloodRequestHandler = async (req: Request, res: Response) => {
  try {
    const request = await getBloodRequestById((req.params.id as string));
    return res.status(200).json({ success: true, data: request });
  } catch (error) {
    return handleError(res, error);
  }
};

export const approveBloodRequestHandler = async (req: Request, res: Response) => {
  try {
    const request = await approveBloodRequest((req.params.id as string), req.user!.id);

    if (request.requester.phone) {
      void notifyWhatsApp({
        userId: request.requester.id,
        phone: request.requester.phone,
        event: "blood_request_approved",
        text: requestApprovedMessage(request),
      });
    }

    void findMatchingDonors(request.bloodType, request.city).then((donors) =>
      notifyManyWhatsApp(
        donors.map((d) => ({ userId: d.id, phone: d.phone! })),
        "blood_request_live",
        donorAlertMessage(request),
      ),
    );

    return res.status(200).json({ success: true, data: request, message: "Request approved." });
  } catch (error) {
    return handleError(res, error);
  }
};

export const rejectBloodRequestHandler = async (req: Request, res: Response) => {
  try {
    const { reason } = req.body as { reason?: string };
    const request = await rejectBloodRequest((req.params.id as string), req.user!.id, reason);

    if (request.requester.phone) {
      void notifyWhatsApp({
        userId: request.requester.id,
        phone: request.requester.phone,
        event: "blood_request_rejected",
        text: requestRejectedMessage(request, reason),
      });
    }

    return res.status(200).json({ success: true, data: request, message: "Request rejected." });
  } catch (error) {
    return handleError(res, error);
  }
};

export const cancelBloodRequestHandler = async (req: Request, res: Response) => {
  try {
    const request = await cancelBloodRequest((req.params.id as string), req.user!);
    return res.status(200).json({ success: true, data: request, message: "Request cancelled." });
  } catch (error) {
    return handleError(res, error);
  }
};
