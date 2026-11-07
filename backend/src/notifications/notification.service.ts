import { prisma } from "../lib/prisma.js";
import { sendPushNotifications } from "../push/push.service.js";

export interface UserNotificationInput {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export const createUserNotification = async (input: UserNotificationInput) => {
  const notification = await prisma.userNotification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      data: input.data,
    },
  });
  await sendPushNotificationsSafely(input);
  return notification;
};

export const createUserNotifications = async (inputs: UserNotificationInput[]) => {
  if (inputs.length === 0) return;
  await prisma.userNotification.createMany({ data: inputs });
  await Promise.all(inputs.map(sendPushNotificationsSafely));
};

const sendPushNotificationsSafely = async (input: UserNotificationInput) => {
  try {
    await sendPushNotifications({
      userIds: [input.userId],
      title: input.title,
      body: input.body,
      data: input.data,
    });
  } catch {
    // Push delivery is best effort; the database notification remains available.
  }
};

export const listUserNotifications = async (userId: string, limit = 50) =>
  prisma.userNotification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(limit, 1), 100),
  });

export const markUserNotificationRead = async (userId: string, id: string) =>
  prisma.userNotification.updateMany({
    where: { id, userId, readAt: null },
    data: { readAt: new Date() },
  });

export const markAllUserNotificationsRead = async (userId: string) =>
  prisma.userNotification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
