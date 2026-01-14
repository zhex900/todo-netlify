import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Ad = sequelize.define(
  "Ad",
  {
    ad_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tutor_id: DataTypes.INTEGER,
    location_id: DataTypes.INTEGER,
    instrument_id: DataTypes.INTEGER,
    ad_description: DataTypes.STRING,
    years_experience: DataTypes.INTEGER,
    hourly_rate: DataTypes.FLOAT,
    img_url: DataTypes.STRING,
    created_at: DataTypes.DATE,
    destroy_at: DataTypes.DATE,
  },
  {
    tableName: "ads",
    timestamps: false,
  }
);

export default Ad;
