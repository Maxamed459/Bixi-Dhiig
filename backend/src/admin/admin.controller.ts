import { Request, Response } from "express";
import { logger } from "../config/logger.js";
import { AppError } from "../lib/appError.js";
import {
  createAdminUser,
  deleteAdminUser,
  getAdminStats,
  getAdminUserById,
  listAdminDonations,
  listAdminUsers,
  listNotificationLogs,
  updateAdminUser,
} from "./admin.service.js";
import type {
  CreateAdminUserInput,
  ListAdminDonationsQuery,
  ListAdminUsersQuery,
  ListNotificationLogsQuery,
  UpdateAdminUserInput,
} from "./admin.validation.js";

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

export const getAdminStatsHandler = async (req: Request, res: Response) => {
  try {
    const stats = await getAdminStats(req.user!);
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    return handleError(res, error);
  }
};

export const listAdminUsersHandler = async (req: Request, res: Response) => {
  try {
    const query = res.locals.query as ListAdminUsersQuery;
    const result = await listAdminUsers(query, req.user!);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
};

export const listAdminAccountsHandler = async (req: Request, res: Response) => {
  try {
    const query = res.locals.query as ListAdminUsersQuery;
    const result = await listAdminUsers({ ...query, role: "ADMIN" }, req.user!);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getAdminUserHandler = async (req: Request, res: Response) => {
  try {
    const user = await getAdminUserById(req.params.id as string, req.user!);
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return handleError(res, error);
  }
};

export const createAdminUserHandler = async (req: Request, res: Response) => {
  try {
    const user = await createAdminUser(req.body as CreateAdminUserInput, req.user!);
    return res.status(201).json({ success: true, data: user, message: "User created." });
  } catch (error) {
    return handleError(res, error);
  }
};

export const createAdminAccountHandler = async (req: Request, res: Response) => {
  try {
    const input = { ...(req.body as CreateAdminUserInput), role: "ADMIN" as const };
    const user = await createAdminUser(input, req.user!);
    return res.status(201).json({ success: true, data: user, message: "Admin created." });
  } catch (error) {
    return handleError(res, error);
  }
};

export const updateAdminUserHandler = async (req: Request, res: Response) => {
  try {
    const user = await updateAdminUser(
      req.params.id as string,
      req.body as UpdateAdminUserInput,
      req.user!,
    );
    return res.status(200).json({ success: true, data: user, message: "User updated." });
  } catch (error) {
    return handleError(res, error);
  }
};

export const deleteAdminUserHandler = async (req: Request, res: Response) => {
  try {
    const user = await deleteAdminUser(req.params.id as string, req.user!);
    return res.status(200).json({ success: true, data: user, message: "User deleted." });
  } catch (error) {
    return handleError(res, error);
  }
};

export const listAdminDonationsHandler = async (_req: Request, res: Response) => {
  try {
    const query = res.locals.query as ListAdminDonationsQuery;
    const result = await listAdminDonations(query);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
};

export const listNotificationLogsHandler = async (_req: Request, res: Response) => {
  try {
    const query = res.locals.query as ListNotificationLogsQuery;
    const result = await listNotificationLogs(query);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error);
  }
};
