import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorize.js";
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
  authorizeRoles("USER", "HOSPITAL"),
  validateBody(createBloodRequestSchema),
  createBloodRequestHandler,
);

bloodRequestRouter.get("/", validateQuery(listBloodRequestsQuerySchema), listBloodRequestsHandler);
bloodRequestRouter.get("/mine", listMyBloodRequestsHandler);
bloodRequestRouter.get("/:id", getBloodRequestHandler);

bloodRequestRouter.patch(
  "/:id/approve",
  authorizeRoles("ADMIN"),
  approveBloodRequestHandler,
);
bloodRequestRouter.patch(
  "/:id/reject",
  authorizeRoles("ADMIN"),
  validateBody(rejectBloodRequestSchema),
  rejectBloodRequestHandler,
);
bloodRequestRouter.patch("/:id/cancel", cancelBloodRequestHandler);

export default bloodRequestRouter;
