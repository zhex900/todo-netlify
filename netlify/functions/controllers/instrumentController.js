import Instrument from "../models/instrumentModel.js";

// Get all instruments
export const getAllInstruments = async (req, res) => {
  try {
    const instruments = await Instrument.findAll({
      order: [["instrument_id", "ASC"]],
    });
    res.json(instruments);
  } catch (error) {
    console.error("Error fetching instruments:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single instrument by ID
export const getInstrumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const instrument = await Instrument.findByPk(id);

    if (!instrument)
      return res.status(404).json({ error: "Instrument not found" });

    res.json(instrument);
  } catch (error) {
    console.error("Error fetching instrument:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new instrument
export const createInstrument = async (req, res) => {
  try {
    const { instrument_name } = req.body;

    if (!instrument_name) {
      return res.status(400).json({ error: "instrument_name is required" });
    }

    const instrument = await Instrument.create({ instrument_name });
    res.status(201).json(instrument);
  } catch (error) {
    console.error("Error creating instrument:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update an instrument
export const updateInstrument = async (req, res) => {
  try {
    const { id } = req.params;
    const { instrument_name } = req.body;

    const instrument = await Instrument.findByPk(id);
    if (!instrument)
      return res.status(404).json({ error: "Instrument not found" });

    if (instrument_name !== undefined)
      instrument.instrument_name = instrument_name;

    await instrument.save();
    res.json(instrument);
  } catch (error) {
    console.error("Error updating instrument:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete an instrument
export const deleteInstrument = async (req, res) => {
  try {
    const { id } = req.params;
    const instrument = await Instrument.findByPk(id);

    if (!instrument)
      return res.status(404).json({ error: "Instrument not found" });

    await instrument.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting instrument:", error);
    res.status(500).json({ error: error.message });
  }
};
