import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import sequelize from './config/sequelize.js'
import './models/userModel.js'
import './models/doctorModel.js'
import './models/appointmentModel.js'
import './models/emailQueueModel.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'
import { startBackgroundJobs } from './config/reminderWorker.js'

// app config
const app = express()
const port = process.env.PORT || 4000

// Sync Database
sequelize.sync()
    .then(() => console.log("Database Connected & Synced"))
    .catch((err) => console.error("Database connection failed:", err));

connectCloudinary()

//middlewares
app.use(express.json())
app.use(cors()) // allow connecting frontend and backend

// api end point
app.use("/api/admin",adminRouter)//localhost/4000/api/admin/add-doctor
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)


app.get('/', (req, res) => {
    res.send("API WORKING")
})

app.listen(port, () => {
    console.log("Server Started", port);
    startBackgroundJobs();
})