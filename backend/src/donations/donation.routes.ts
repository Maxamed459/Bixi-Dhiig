import express from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorize.js";
import { validateBody } from "../middlewares/validate.js";
import { createDonationSchema, updateDonationStatusSchema } from "./donation.validation.js";
import {
  getDonationHandler,
  listDonationsForRequestHandler,
  listMyDonationsHandler,
  pledgeDonationHandler,
  updateDonationStatusHandler,
} from "./donation.controller.js";

const donationRouter = express.Router();

donationRouter.use(authenticate);

// Donors (USER role — the Flutter app) pledge to a live blood request.
donationRouter.post(
  "/",
  authorizeRoles("USER"),
  validateBody(createDonationSchema),
  pledgeDonationHandler,
);

donationRouter.get("/mine", listMyDonationsHandler);
donationRouter.get("/request/:requestId", listDonationsForRequestHandler);
donationRouter.get("/:id", getDonationHandler);

// Donor cancels own pledge; requester/admin accept, decline, or complete (checked in service).
donationRouter.patch(
  "/:id/status",
  validateBody(updateDonationStatusSchema),
  updateDonationStatusHandler,
);

export default donationRouter;
