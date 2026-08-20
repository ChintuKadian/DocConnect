import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import crypto from "crypto";

const appointmentModel = sequelize.define("Appointment", {
  _id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => crypto.randomUUID()
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  docId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slotDate: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slotTime: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userData: {
    type: DataTypes.JSON,
    allowNull: false
  },
  docData: {
    type: DataTypes.JSON,
    allowNull: false
  },
  amount: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  date: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  cancelled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  payment: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  symptoms: {
    type: DataTypes.TEXT,
    defaultValue: ""
  },
  preVisitSummary: {
    type: DataTypes.JSON,
    defaultValue: null
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: ""
  },
  prescription: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  postVisitSummary: {
    type: DataTypes.TEXT,
    defaultValue: ""
  },
  googleCalendarEventId: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  lastReminderSent: {
    type: DataTypes.DATE,
    defaultValue: null
  }
});

export default appointmentModel;