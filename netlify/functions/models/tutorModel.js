import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Tutor = sequelize.define(
  "Tutor",
  {
    tutor_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    location_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    account_status: DataTypes.STRING,
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
    tableName: "tutors",
    underscored: true,
    timestamps: false,
    paranoid: false,
  }
);

export default Tutor;
