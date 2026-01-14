import Tutor from "../models/tutorModel.js";

export async function requireAuth(req, res, next) {
  try {
    // cookie-parser populates req.cookies
    const tutorIdRaw = req.cookies?.tutor_id;

    if (!tutorIdRaw) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const tutorId = Number(tutorIdRaw);
    if (!Number.isInteger(tutorId)) {
      return res.status(401).json({ error: "Not logged in" });
    }

    const tutor = await Tutor.findByPk(tutorId, {
      attributes: ["tutor_id", "name", "email", "username"],
    });

    if (!tutor) {
      return res.status(401).json({ error: "Not logged in" });
    }

    req.tutor = tutor;
    req.tutorId = tutor.tutor_id;

    return next();
  } catch (err) {
    console.error("requireAuth error:", err);
    return res.status(500).json({ error: "Auth check failed" });
  }
}
