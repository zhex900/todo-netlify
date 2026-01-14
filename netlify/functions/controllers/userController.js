import User from "../models/userModel.js";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      order: [["user_id", "DESC"]], // newest first
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new user
export const createUser = async (req, res) => {
  try {
    const { name, avatar_url, phone, email, username, password } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({
        error: "name, email, username, and password are required",
      });
    }

    const user = await User.create({
      name: name.trim(),
      avatar_url: avatar_url || null,
      phone: phone || null,
      email: email.toLowerCase(),
      username: username.trim(),
      password, // hash later for security
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update a user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, avatar_url, phone, email, username, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name !== undefined) user.name = name.trim();
    if (avatar_url !== undefined) user.avatar_url = avatar_url;
    if (phone !== undefined) user.phone = phone;
    if (email !== undefined) user.email = email.toLowerCase();
    if (username !== undefined) user.username = username.trim();
    if (password !== undefined) user.password = password;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) return res.status(404).json({ error: "User not found" });

    await user.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: error.message });
  }
};
