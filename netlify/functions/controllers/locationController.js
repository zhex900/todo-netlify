import Location from "../models/locationModel.js";

// Get all locations
export const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.findAll({
      order: [["location_id", "ASC"]],
    });
    res.json(locations);
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single location by ID
export const getLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findByPk(id);

    if (!location) return res.status(404).json({ error: "Location not found" });

    res.json(location);
  } catch (error) {
    console.error("Error fetching location:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new location
export const createLocation = async (req, res) => {
  try {
    const { location_name } = req.body;

    if (!location_name) {
      return res.status(400).json({ error: "location_name is required" });
    }

    const location = await Location.create({ location_name });
    res.status(201).json(location);
  } catch (error) {
    console.error("Error creating location:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update a location
export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { location_name } = req.body;

    const location = await Location.findByPk(id);
    if (!location) return res.status(404).json({ error: "Location not found" });

    if (location_name !== undefined) location.location_name = location_name;

    await location.save();
    res.json(location);
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a location
export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Location.findByPk(id);

    if (!location) return res.status(404).json({ error: "Location not found" });

    await location.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json({ error: error.message });
  }
};
