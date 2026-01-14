import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const UserFavouriteTutor = sequelize.define(
  "UserFavouriteTutor",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    tutor_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
  },
  {
    tableName: "user_favourite_tutors",
    timestamps: false,
  }
);

export default UserFavouriteTutor;
