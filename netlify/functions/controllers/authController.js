import bcrypt from "bcryptjs";
import Tutor from "../models/tutorModel.js";
import { serialize } from "cookie";

// Very simple cookie session
function setAuthCookie(res, tutor) {
  const cookie = serialize("tutor_id", String(tutor.tutor_id), {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  res.setHeader("Set-Cookie", cookie);
}

// Create a safe username base from name/email
function slugifyUsername(input = "") {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "") // remove spaces/symbols
    .slice(0, 20);
}

// Generate a unique username
async function generateUniqueUsername({ name, email }) {
  const base =
    slugifyUsername(name) ||
    slugifyUsername(String(email || "").split("@")[0]) ||
    "tutor";

  let candidate = base;
  let n = 0;

  while (true) {
    const existing = await Tutor.findOne({ where: { username: candidate } });
    if (!existing) return candidate;

    n += 1;
    candidate = `${base}${n}`;
  }
}

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "name, email, password are required" });
    }

    // Check uniqueness (email only)
    const existingEmail = await Tutor.findOne({ where: { email } });
    if (existingEmail)
      return res.status(409).json({ error: "Email already in use" });

    // generate unique username
    const username = await generateUniqueUsername({ name, email });

    const hashed = await bcrypt.hash(password, 10);

    const tutor = await Tutor.create({
      name,
      email,
      username,
      password: hashed,
      account_status: "active",
      avatar_url: null,
      phone: null,
    });

    // Auto-login after register
    setAuthCookie(res, tutor);

    return res.status(201).json({
      tutor_id: tutor.tutor_id,
      name: tutor.name,
      email: tutor.email,
      username: tutor.username,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res
        .status(400)
        .json({ error: "emailOrUsername and password are required" });
    }

    const tutor = await Tutor.findOne({
      where: {
        ...(emailOrUsername.includes("@")
          ? { email: emailOrUsername }
          : { username: emailOrUsername }),
      },
    });

    if (!tutor) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, tutor.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    setAuthCookie(res, tutor);

    return res.json({
      tutor_id: tutor.tutor_id,
      name: tutor.name,
      email: tutor.email,
      username: tutor.username,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const me = async (req, res) => {
  try {
    const tutorId = req.cookies?.tutor_id;
    if (!tutorId) return res.status(401).json({ error: "Not logged in" });

    const tutor = await Tutor.findByPk(tutorId, {
      attributes: ["tutor_id", "name", "email", "username"],
    });
    if (!tutor) return res.status(401).json({ error: "Not logged in" });

    return res.json(tutor);
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  const expired = serialize("tutor_id", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    expires: new Date(0),
  });

  res.setHeader("Set-Cookie", expired);
  return res.json({ ok: true });
};
