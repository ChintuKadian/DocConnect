import sequelize from './config/sequelize.js';
import userModel from './models/userModel.js';
import doctorModel from './models/doctorModel.js';
import appointmentModel from './models/appointmentModel.js';
import emailQueueModel from './models/emailQueueModel.js';

console.log("Checking DB connection...");
sequelize.authenticate()
  .then(() => {
     console.log("Database Connected successfully!");
     process.exit(0);
  })
  .catch(err => {
     console.error("Database connection failed:", err.message);
     console.log("--------------------------------------------------------------------------------");
     console.log("NOTE: This is expected if your MySQL server is not running or MYSQL_URI is not");
     console.log("set yet in d:/Project/Healthcare/DocConnect/Backend/.env.");
     console.log("Please update Backend/.env with your MySQL credentials, start your MySQL server,");
     console.log("and then you can run the server or sync tables!");
     console.log("--------------------------------------------------------------------------------");
     process.exit(0);
  });
