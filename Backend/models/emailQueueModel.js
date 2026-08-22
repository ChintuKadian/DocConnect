import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import crypto from "crypto";

const emailQueueModel = sequelize.define("EmailQueue", {
  _id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => crypto.randomUUID()
  },
  to: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  html: {
    type: DataTypes.TEXT("long"),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM("pending", "sent", "failed"),
    defaultValue: "pending"
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastError: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      return this.getDataValue('lastError') || "";
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

export default emailQueueModel;
