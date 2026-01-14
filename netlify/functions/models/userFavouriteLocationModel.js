import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const UserFavouriteLocation = sequelize.define(
  "UserFavouriteLocation",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    location_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    tableName: "user_favourite_locations",
    timestamps: false,
  }
);

export default UserFavouriteLocation;
