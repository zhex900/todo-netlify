import express from "express";
import {
  getAllInstruments,
  getInstrumentById,
  createInstrument,
  updateInstrument,
  deleteInstrument,
} from "../controllers/instrumentController.js";

const router = express.Router();

// Get all instruments
router.get("/", getAllInstruments);

// Get a single instrument by ID
router.get("/:id", getInstrumentById);

// Create a new instrument
router.post("/", createInstrument);

// Update an instrument by ID
router.put("/:id", updateInstrument);

// Delete an instrument by ID
router.delete("/:id", deleteInstrument);

export default router;
