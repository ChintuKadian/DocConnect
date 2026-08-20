import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import crypto from "crypto";

const doctorModel = sequelize.define("Doctor", {
  _id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => crypto.randomUUID()
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  image: {
    type: DataTypes.TEXT("long"),
    allowNull: false
  },
  speciality: {
    type: DataTypes.STRING,
    allowNull: false
  },
  degree: {
    type: DataTypes.STRING,
    allowNull: false
  },
  experience: {
    type: DataTypes.STRING,
    allowNull: false
  },
  about: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  fees: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  address: {
    type: DataTypes.JSON,
    allowNull: false
  },
  date: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  slots_booked: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  workingHours: {
    type: DataTypes.JSON,
    defaultValue: { start: "09:00", end: "17:00" }
  },
  slotDuration: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  leaveDays: {
    type: DataTypes.JSON,
    defaultValue: []
  }
});

export default doctorModel;