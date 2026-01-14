import Availability from "../models/availabilityModel.js";
import Ad from "../models/adModel.js";

//Helpers
async function assertTutorOwnsAd({ tutorId, adId }) {
  const ad = await Ad.findByPk(adId);
  if (!ad) {
    const err = new Error("Ad not found");
    err.status = 404;
    throw err;
  }

  if (Number(ad.tutor_id) !== Number(tutorId)) {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }

  return ad;
}

//Get availability for a given ad (used by marketplace / contact modal)

export const getAvailabilityForAdPublic = async (req, res) => {
  try {
    const adId = Number(req.params.adId);
    if (!Number.isFinite(adId)) {
      return res.status(400).json({ error: "Invalid ad id" });
    }

    const slots = await Availability.findAll({
      where: { ad_id: adId },
      order: [["start_time", "ASC"]],
    });

    return res.json(slots);
  } catch (error) {
    console.error("Error fetching availability (public):", error);
    return res.status(500).json({ error: error.message });
  }
};

//TUTOR: Get availability for one of MY ads

export const getAvailabilityForMyAd = async (req, res) => {
  try {
    const tutorId = req.tutorId;
    const adId = Number(req.params.adId);
    if (!Number.isFinite(adId)) {
      return res.status(400).json({ error: "Invalid ad id" });
    }

    await assertTutorOwnsAd({ tutorId, adId });

    const slots = await Availability.findAll({
      where: { ad_id: adId },
      order: [["start_time", "ASC"]],
    });

    return res.json(slots);
  } catch (error) {
    console.error("Error fetching availability (my ad):", error);
    return res
      .status(error.status || 500)
      .json({ error: error.message || "Failed to fetch availability" });
  }
};

//TUTOR: Create a new slot for one of MY ads

export const createAvailability = async (req, res) => {
  try {
    const tutorId = req.tutorId;

    const { ad_id, start_time, end_time, user_capacity } = req.body;

    const adId = Number(ad_id);
    if (!Number.isFinite(adId)) {
      return res.status(400).json({ error: "Invalid ad_id" });
    }

    if (!start_time || !end_time) {
      return res
        .status(400)
        .json({ error: "ad_id, start_time, end_time are required" });
    }

    await assertTutorOwnsAd({ tutorId, adId });

    // prevent duplicate exact slot
    // const existing = await Availability.findOne({
    //   where: { ad_id: adId, start_time, end_time },
    // });
    // if (existing) {
    //   return res.status(409).json({ error: "Slot already exists" });
    // }

    const availability = await Availability.create({
      ad_id: adId,
      user_id: 1,
      start_time,
      end_time,
      is_booked: false,
      user_capacity: user_capacity ?? 1,
    });

    return res.status(201).json(availability);
  } catch (error) {
    console.error("Error creating availability:", error);
    return res.status(error.status || 500).json({ error: error.message });
  }
};

//TUTOR: Update a slot (only if it belongs to one of MY ads)

export const updateAvailability = async (req, res) => {
  try {
    const tutorId = req.tutorId;
    const slotId = Number(req.params.id);

    if (!Number.isFinite(slotId)) {
      return res.status(400).json({ error: "Invalid availability id" });
    }

    const availability = await Availability.findByPk(slotId);
    if (!availability) {
      return res.status(404).json({ error: "Availability not found" });
    }

    // ownership check via Ad
    await assertTutorOwnsAd({ tutorId, adId: availability.ad_id });

    // don't allow editing booked slots (keeps logic simple for demo)
    if (availability.is_booked) {
      return res.status(400).json({ error: "Cannot edit a booked slot" });
    }

    const { start_time, end_time, user_capacity } = req.body;

    if (start_time !== undefined) availability.start_time = start_time;
    if (end_time !== undefined) availability.end_time = end_time;
    if (user_capacity !== undefined) availability.user_capacity = user_capacity;

    await availability.save();
    return res.json(availability);
  } catch (error) {
    console.error("Error updating availability:", error);
    return res.status(error.status || 500).json({ error: error.message });
  }
};

//TUTOR: Delete a slot (only if it belongs to one of MY ads)

export const deleteAvailability = async (req, res) => {
  try {
    const tutorId = req.tutorId;
    const slotId = Number(req.params.id);

    if (!Number.isFinite(slotId)) {
      return res.status(400).json({ error: "Invalid availability id" });
    }

    const availability = await Availability.findByPk(slotId);
    if (!availability) {
      return res.status(404).json({ error: "Availability not found" });
    }

    await assertTutorOwnsAd({ tutorId, adId: availability.ad_id });

    if (availability.is_booked) {
      return res.status(400).json({ error: "Cannot delete a booked slot" });
    }

    await availability.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting availability:", error);
    return res.status(error.status || 500).json({ error: error.message });
  }
};

// user: Book an availability slot (demo)

export const bookAvailability = async (req, res) => {
  try {
    const slotId = Number(req.params.id);
    if (!Number.isFinite(slotId)) {
      return res.status(400).json({ error: "Invalid availability id" });
    }

    const { user_id } = req.body || {};
    const bookingUserId = user_id ?? 1;

    const slot = await Availability.findByPk(slotId);
    if (!slot) return res.status(404).json({ error: "Slot not found" });

    if (slot.is_booked) {
      return res.status(400).json({ error: "Slot already booked" });
    }

    slot.is_booked = true;
    slot.user_id = bookingUserId;

    await slot.save();
    return res.json(slot);
  } catch (error) {
    console.error("Error booking slot:", error);
    return res.status(500).json({ error: error.message });
  }
};
