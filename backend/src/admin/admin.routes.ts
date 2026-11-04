import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorize.js";
import { authorizePermission, authorizeSuperAdmin } from "../middlewares/permissions.js";
import { validateBody, validateQuery } from "../middlewares/validate.js";
import {
  createAdminAccountHandler,
  createAdminUserHandler,
  deleteAdminUserHandler,
  getAdminStatsHandler,
  getAdminUserHandler,
  listAdminAccountsHandler,
  listAdminDonationsHandler,
  listAdminUsersHandler,
  listNotificationLogsHandler,
  updateAdminUserHandler,
} from "./admin.controller.js";
import {
  createAdminUserSchema,
  listAdminDonationsQuerySchema,
  listAdminUsersQuerySchema,
  listNotificationLogsQuerySchema,
  updateAdminUserSchema,
} from "./admin.validation.js";

const adminRouter = express.Router();

adminRouter.use(authenticate, authorizeRoles("ADMIN"));

// Any admin can see aggregate stats; sensitive recent lists are gated in the service.
adminRouter.get("/stats", getAdminStatsHandler);

// Regular account management (donors + hospitals). Superadmins can also manage admins here.
adminRouter.get(
  "/users",
  authorizePermission("MANAGE_USERS"),
  validateQuery(listAdminUsersQuerySchema),
  listAdminUsersHandler,
);
adminRouter.post(
  "/users",
  authorizePermission("MANAGE_USERS"),
  validateBody(createAdminUserSchema),
  createAdminUserHandler,
);
adminRouter.get("/users/:id", authorizePermission("MANAGE_USERS"), getAdminUserHandler);
adminRouter.patch(
  "/users/:id",
  authorizePermission("MANAGE_USERS"),
  validateBody(updateAdminUserSchema),
  updateAdminUserHandler,
);
adminRouter.delete("/users/:id", authorizePermission("MANAGE_USERS"), deleteAdminUserHandler);

// Superadmin-only admin account management.
adminRouter.get(
  "/admins",
  authorizeSuperAdmin,
  validateQuery(listAdminUsersQuerySchema),
  listAdminAccountsHandler,
);
adminRouter.post(
  "/admins",
  authorizeSuperAdmin,
  validateBody(createAdminUserSchema),
  createAdminAccountHandler,
);
adminRouter.get("/admins/:id", authorizeSuperAdmin, getAdminUserHandler);
adminRouter.patch(
  "/admins/:id",
  authorizeSuperAdmin,
  validateBody(updateAdminUserSchema),
  updateAdminUserHandler,
);
adminRouter.delete("/admins/:id", authorizeSuperAdmin, deleteAdminUserHandler);

adminRouter.get(
  "/donations",
  authorizePermission("MANAGE_DONATIONS"),
  validateQuery(listAdminDonationsQuerySchema),
  listAdminDonationsHandler,
);
adminRouter.get(
  "/notifications",
  authorizePermission("VIEW_NOTIFICATIONS"),
  validateQuery(listNotificationLogsQuerySchema),
  listNotificationLogsHandler,
);

export default adminRouter;
