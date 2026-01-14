import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Availability = sequelize.define(
  "Availability",
  {
    availability_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ad_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    is_booked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    user_capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "availabilities",
    timestamps: false,
    underscored: true,
  }
);

export default Availability;
