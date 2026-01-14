import express from "express";
import {
  getAllAds,
  getAdById,
  createAd,
  updateAd,
  deleteAd,
  getAvailabilityForAd,
  getMyAds,
} from "../controllers/adController.js";

import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdOwner } from "../middleware/requireAdOwner.js";

const router = express.Router();

// Get all ads
router.get("/", getAllAds);

// Get ads of a given tutor
router.get("/mine", requireAuth, getMyAds);

// Get availability by ad
router.get("/:id/availability", getAvailabilityForAd);

// Get a single ad by ID
router.get("/:id", getAdById);

// Create a new ad
router.post("/", requireAuth, createAd);

// Update an ad by ID
router.put("/:id", requireAuth, requireAdOwner, updateAd);

// Delete an ad by ID
router.delete("/:id", requireAuth, requireAdOwner, deleteAd);

export default router;
