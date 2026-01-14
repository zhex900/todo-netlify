import Ad from "../models/adModel.js";
import Availability from "../models/availabilityModel.js";
import Tutor from "../models/tutorModel.js";
import Location from "../models/locationModel.js";
import Instrument from "../models/instrumentModel.js";

// Get all ads (with joined tutor/location/instrument)
export const getAllAds = async (req, res) => {
  try {
    const ads = await Ad.findAll({
      order: [["ad_id", "DESC"]],
      include: [
        {
          model: Tutor,
          attributes: ["tutor_id", "name", "avatar_url"],
        },
        {
          model: Location,
          attributes: ["location_id", "location_name"],
        },
        {
          model: Instrument,
          attributes: ["instrument_id", "instrument_name"],
        },
      ],
    });

    res.json(ads);
  } catch (error) {
    console.error("Error fetching ads:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single ad by ID
export const getAdById = async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await Ad.findByPk(id, {
      include: [
        { model: Tutor, attributes: ["tutor_id", "name", "avatar_url"] },
        { model: Location, attributes: ["location_id", "location_name"] },
        { model: Instrument, attributes: ["instrument_id", "instrument_name"] },
      ],
    });

    if (!ad) return res.status(404).json({ error: "Ad not found" });

    res.json(ad);
  } catch (error) {
    console.error("Error fetching ad:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new ad
export const createAd = async (req, res) => {
  try {
    const tutorId = req.tutorId;
    if (!tutorId) return res.status(401).json({ error: "Not logged in" });

    const {
      location_id,
      instrument_id,
      ad_description,
      years_experience,
      hourly_rate,
      img_url,
      destroy_at,
    } = req.body;

    const ad = await Ad.create({
      tutor_id: tutorId,
      location_id,
      instrument_id,
      ad_description,
      years_experience,
      hourly_rate,
      img_url,
      destroy_at: destroy_at ?? null,
    });

    return res.status(201).json(ad);
  } catch (err) {
    console.error("Error creating ad:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Update an existing ad
export const updateAd = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      location_id,
      instrument_id,
      ad_description,
      years_experience,
      hourly_rate,
      img_url,
      destroy_at,
    } = req.body;

    const ad = await Ad.findByPk(id);
    if (!ad) return res.status(404).json({ error: "Ad not found" });

    if (location_id !== undefined) ad.location_id = location_id;
    if (instrument_id !== undefined) ad.instrument_id = instrument_id;
    if (ad_description !== undefined) ad.ad_description = ad_description;
    if (years_experience !== undefined) ad.years_experience = years_experience;
    if (hourly_rate !== undefined) ad.hourly_rate = hourly_rate;
    if (img_url !== undefined) ad.img_url = img_url;
    if (destroy_at !== undefined) ad.destroy_at = destroy_at ?? null;

    await ad.save();
    return res.json(ad);
  } catch (error) {
    console.error("Error updating ad:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Delete an ad
export const deleteAd = async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await Ad.findByPk(id);

    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }

    await ad.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting ad:", error);
    res.status(500).json({ error: error.message });
  }
};

// get availability for an ad
export const getAvailabilityForAd = async (req, res) => {
  try {
    const adId = Number(req.params.id);
    if (!Number.isFinite(adId)) {
      return res.status(400).json({ error: "Invalid ad id" });
    }

    const slots = await Availability.findAll({
      where: { ad_id: adId },
      order: [["start_time", "ASC"]],
    });

    return res.json(slots);
  } catch (error) {
    console.error("Error fetching availability for ad:", error);
    return res.status(500).json({ error: error.message });
  }
};

// get all ads for a given tutor
export const getMyAds = async (req, res) => {
  try {
    const tutorId = req.tutorId;
    const ads = await Ad.findAll({
      where: { tutor_id: tutorId },
      order: [["ad_id", "DESC"]],
      include: [
        { model: Tutor, attributes: ["tutor_id", "name", "avatar_url"] },
        { model: Location, attributes: ["location_id", "location_name"] },
        { model: Instrument, attributes: ["instrument_id", "instrument_name"] },
      ],
    });

    return res.json(ads);
  } catch (err) {
    console.error("getMyAds error:", err);
    return res.status(500).json({ error: err.message });
  }
};
