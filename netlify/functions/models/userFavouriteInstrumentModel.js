import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const UserFavouriteInstrument = sequelize.define(
  "UserFavouriteInstrument",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    instrument_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    tableName: "user_favourite_instruments",
    timestamps: false,
  }
);

export default UserFavouriteInstrument;
