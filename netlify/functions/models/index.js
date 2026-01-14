import sequelize from "../config/database.js";

import Ad from "./adModel.js";
import Availability from "./availabilityModel.js";
import Location from "./locationModel.js";
import Instrument from "./instrumentModel.js";
import User from "./userModel.js";
import Tutor from "./tutorModel.js";
import UserFavouriteAd from "./userFavouriteAdModel.js";
import UserFavouriteInstrument from "./userFavouriteInstrumentModel.js";
import UserFavouriteLocation from "./userFavouriteLocationModel.js";
import UserFavouriteTutor from "./userFavouriteTutorModel.js";

let dbInitialized = false;

async function initializeDatabase() {
  if (dbInitialized) return;

  try {
    await sequelize.authenticate();

    // USERS ↔ LOCATIONS
    User.belongsTo(Location, { foreignKey: "location_id" });
    Location.hasMany(User, { foreignKey: "location_id" });

    // TUTORS ↔ LOCATIONS
    Tutor.belongsTo(Location, { foreignKey: "location_id" });
    Location.hasMany(Tutor, { foreignKey: "location_id" });

    // TUTORS ↔ ADS
    Tutor.hasMany(Ad, { foreignKey: "tutor_id" });
    Ad.belongsTo(Tutor, { foreignKey: "tutor_id" });

    // ADS ↔ LOCATIONS
    Ad.belongsTo(Location, { foreignKey: "location_id" });
    Location.hasMany(Ad, { foreignKey: "location_id" });

    // ADS ↔ INSTRUMENTS
    Ad.belongsTo(Instrument, { foreignKey: "instrument_id" });
    Instrument.hasMany(Ad, { foreignKey: "instrument_id" });

    // ADS ↔ AVAILABILITY
    Ad.hasMany(Availability, { foreignKey: "ad_id" });
    Availability.belongsTo(Ad, { foreignKey: "ad_id" });

    // USERS ↔ AVAILABILITY
    User.hasMany(Availability, { foreignKey: "user_id" });
    Availability.belongsTo(User, { foreignKey: "user_id" });

    // FAVOURITES
    User.belongsToMany(Tutor, {
      through: UserFavouriteTutor,
      foreignKey: "user_id",
      otherKey: "tutor_id",
    });

    User.belongsToMany(Location, {
      through: UserFavouriteLocation,
      foreignKey: "user_id",
      otherKey: "location_id",
    });

    User.belongsToMany(Instrument, {
      through: UserFavouriteInstrument,
      foreignKey: "user_id",
      otherKey: "instrument_id",
    });

    User.belongsToMany(Ad, {
      through: UserFavouriteAd,
      foreignKey: "user_id",
      otherKey: "ad_id",
    });

    dbInitialized = true;
    console.log("✅ Database associations initialized");
  } catch (error) {
    console.error("❌ Database init failed:", error);
    throw error;
  }
}

export { sequelize, initializeDatabase };
