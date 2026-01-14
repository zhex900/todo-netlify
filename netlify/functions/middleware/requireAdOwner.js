import Ad from "../models/adModel.js";

export async function requireAdOwner(req, res, next) {
  try {
    const tutorId = req.tutorId;
    if (!tutorId) return res.status(401).json({ error: "Not logged in" });

    const adId = Number(req.params.id);
    const ad = await Ad.findByPk(adId);

    if (!ad) return res.status(404).json({ error: "Ad not found" });

    if (Number(ad.tutor_id) !== Number(tutorId)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    req.ad = ad;
    return next();
  } catch (err) {
    console.error("requireAdOwner error:", err);
    return res.status(500).json({ error: "Owner check failed" });
  }
}
