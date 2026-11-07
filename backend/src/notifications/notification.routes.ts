import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import {
  listNotificationsHandler,
  markAllNotificationsReadHandler,
  markNotificationReadHandler,
} from "./notification.controller.js";

const notificationRouter = express.Router();
notificationRouter.use(authenticate);
notificationRouter.get("/", listNotificationsHandler);
notificationRouter.patch("/read-all", markAllNotificationsReadHandler);
notificationRouter.patch("/:id/read", markNotificationReadHandler);

export default notificationRouter;
