import Tutor from "../models/tutorModel.js";

// Get all tutors
export const getAllTutors = async (req, res) => {
  try {
    const tutors = await Tutor.findAll({
      order: [["tutor_id", "DESC"]],
    });
    res.json(tutors);
  } catch (error) {
    console.error("Error fetching tutors:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single tutor by ID
export const getTutorById = async (req, res) => {
  try {
    const { id } = req.params;
    const tutor = await Tutor.findByPk(id);

    if (!tutor) return res.status(404).json({ error: "Tutor not found" });

    res.json(tutor);
  } catch (error) {
    console.error("Error fetching tutor:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new tutor
export const createTutor = async (req, res) => {
  try {
    const {
      account_status,
      name,
      avatar_url,
      phone,
      email,
      username,
      password,
    } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({
        error: "name, email, username, and password are required",
      });
    }

    const tutor = await Tutor.create({
      account_status: account_status || "active",
      name: name.trim(),
      avatar_url: avatar_url || null,
      phone: phone || null,
      email: email.toLowerCase(),
      username: username.trim(),
      password, // hash later for security
    });

    res.status(201).json(tutor);
  } catch (error) {
    console.error("Error creating tutor:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update a tutor
export const updateTutor = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      account_status,
      name,
      avatar_url,
      phone,
      email,
      username,
      password,
    } = req.body;

    const tutor = await Tutor.findByPk(id);
    if (!tutor) return res.status(404).json({ error: "Tutor not found" });

    if (account_status !== undefined) tutor.account_status = account_status;
    if (name !== undefined) tutor.name = name.trim();
    if (avatar_url !== undefined) tutor.avatar_url = avatar_url;
    if (phone !== undefined) tutor.phone = phone;
    if (email !== undefined) tutor.email = email.toLowerCase();
    if (username !== undefined) tutor.username = username.trim();
    if (password !== undefined) tutor.password = password;

    await tutor.save();
    res.json(tutor);
  } catch (error) {
    console.error("Error updating tutor:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a tutor
export const deleteTutor = async (req, res) => {
  try {
    const { id } = req.params;
    const tutor = await Tutor.findByPk(id);

    if (!tutor) return res.status(404).json({ error: "Tutor not found" });

    await tutor.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting tutor:", error);
    res.status(500).json({ error: error.message });
  }
};
