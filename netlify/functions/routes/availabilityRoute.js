import express from "express";
import {
  createAvailability,
  updateAvailability,
  deleteAvailability,
  bookAvailability,
  getAvailabilityForMyAd,
  getAvailabilityForAdPublic,
} from "../controllers/availabilityController.js";

import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

//tutor

router.get("/ad/:adId", requireAuth, getAvailabilityForMyAd);
router.post("/", requireAuth, createAvailability);
router.put("/:id", requireAuth, updateAvailability);
router.delete("/:id", requireAuth, deleteAvailability);

//user

router.post("/:id/book", bookAvailability);
router.get("/ad/:adId/public", getAvailabilityForAdPublic);

export default router;
