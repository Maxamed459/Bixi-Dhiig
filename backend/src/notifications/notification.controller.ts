import { Request, Response } from "express";
import {
  listUserNotifications,
  markAllUserNotificationsRead,
  markUserNotificationRead,
} from "./notification.service.js";

export const listNotificationsHandler = async (req: Request, res: Response) => {
  const limit = Number(req.query.limit ?? 50);
  const notifications = await listUserNotifications(req.user!.id, limit);
  return res.json({ success: true, data: notifications });
};

export const markNotificationReadHandler = async (req: Request, res: Response) => {
  await markUserNotificationRead(req.user!.id, req.params.id as string);
  return res.json({ success: true, message: "Notification marked as read." });
};

export const markAllNotificationsReadHandler = async (req: Request, res: Response) => {
  await markAllUserNotificationsRead(req.user!.id);
  return res.json({ success: true, message: "Notifications marked as read." });
};
