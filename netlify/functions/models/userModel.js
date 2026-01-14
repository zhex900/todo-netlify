import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: DataTypes.STRING,
    avatar_url: DataTypes.STRING,
    phone: DataTypes.STRING(20),
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: DataTypes.STRING,
  },
  {
    tableName: "users",
    underscored: true,
    timestamps: false,
    paranoid: true,
  }
);

export default User;
