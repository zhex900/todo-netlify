import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Instrument = sequelize.define(
  "Instrument",
  {
    instrument_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    instrument_name: {
      type: DataTypes.STRING,
      unique: true,
    },
  },
  {
    tableName: "instruments",
    timestamps: false,
  }
);

export default Instrument;
