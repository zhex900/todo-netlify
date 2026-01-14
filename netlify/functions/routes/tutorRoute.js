import express from "express";
import {
  getAllTutors,
  getTutorById,
  createTutor,
  updateTutor,
  deleteTutor,
} from "../controllers/tutorController.js";

const router = express.Router();

// Get all tutors
router.get("/", getAllTutors);

// Get a single tutor by ID
router.get("/:id", getTutorById);

// Create a new tutor
router.post("/", createTutor);

// Update a tutor by ID
router.put("/:id", updateTutor);

// Delete a tutor by ID
router.delete("/:id", deleteTutor);

export default router;
