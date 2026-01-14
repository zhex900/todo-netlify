import express from "express";
import {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../controllers/locationController.js";

const router = express.Router();

// Get all locations
router.get("/", getAllLocations);

// Get a single location by ID
router.get("/:id", getLocationById);

// Create a new location
router.post("/", createLocation);

// Update a location by ID
router.put("/:id", updateLocation);

// Delete a location by ID
router.delete("/:id", deleteLocation);

export default router;
