import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const UserFavouriteAd = sequelize.define(
  "UserFavouriteAd",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    ad_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    tableName: "user_favourite_ads",
    timestamps: false,
  }
);

export default UserFavouriteAd;
