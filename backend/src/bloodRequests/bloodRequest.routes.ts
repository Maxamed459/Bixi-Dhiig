import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorize.js";
import { authorizePermission } from "../middlewares/permissions.js";
import { AppError } from "../lib/appError.js";
import { validateBody, validateQuery } from "../middlewares/validate.js";
import {
  createBloodRequestSchema,
  listBloodRequestsQuerySchema,
  rejectBloodRequestSchema,
} from "./bloodRequest.validation.js";
import {
  approveBloodRequestHandler,
  cancelBloodRequestHandler,
  createBloodRequestHandler,
  fulfillBloodRequestHandler,
  getBloodRequestHandler,
  listBloodRequestsHandler,
  listMyBloodRequestsHandler,
  rejectBloodRequestHandler,
} from "./bloodRequest.controller.js";

const bloodRequestRouter = express.Router();

bloodRequestRouter.use(authenticate);

// USER (donor/requester) and HOSPITAL can both create requests; HOSPITAL ones auto-approve.
bloodRequestRouter.post(
  "/",
  authorizeRoles("USER", "HOSPITAL", "ADMIN"),
  (req, _res, next) => req.user?.canRequest === false ? next(new AppError(403, "This account cannot create blood requests.")) : next(),
  validateBody(createBloodRequestSchema),
  createBloodRequestHandler,
);

bloodRequestRouter.get("/", validateQuery(listBloodRequestsQuerySchema), listBloodRequestsHandler);
bloodRequestRouter.get("/mine", listMyBloodRequestsHandler);
bloodRequestRouter.get("/:id", getBloodRequestHandler);

bloodRequestRouter.patch(
  "/:id/approve",
  authorizeRoles("ADMIN"),
  authorizePermission("REVIEW_REQUESTS"),
  approveBloodRequestHandler,
);
bloodRequestRouter.patch(
  "/:id/reject",
  authorizeRoles("ADMIN"),
  authorizePermission("REVIEW_REQUESTS"),
  validateBody(rejectBloodRequestSchema),
  rejectBloodRequestHandler,
);
bloodRequestRouter.patch(
  "/:id/fulfill",
  authorizeRoles("ADMIN"),
  authorizePermission("REVIEW_REQUESTS"),
  fulfillBloodRequestHandler,
);
bloodRequestRouter.patch("/:id/cancel", cancelBloodRequestHandler);

export default bloodRequestRouter;
