import express from 'express'
import { addDoctor,allDoctors,loginAdmin,appointmentAdmin,appointmentCancel,adminDashboard,updateDoctor } from '../controllers/adminController.js'
import upload from '../middleware/multer.js'
import authAdmin from '../middleware/authAdmin.js';
import { changeAvailability } from '../controllers/doctorController.js';

const adminRouter=express.Router();
// only admin will be able to add doctor, so this middleware first check if the user is admin by using authAdmin middleware if yes then it procced to adding doctor

adminRouter.post('/add-doctor',authAdmin,upload.single('image'),addDoctor)
adminRouter.post('/login',loginAdmin)
adminRouter.post('/all-doctors',authAdmin,allDoctors)
adminRouter.post('/change-availability',authAdmin,changeAvailability)
adminRouter.get('/appointments',authAdmin,appointmentAdmin)
adminRouter.post('/cancel-appointment',authAdmin,appointmentCancel)
adminRouter.get('/dashboard',authAdmin,adminDashboard)
adminRouter.post('/update-doctor',authAdmin,updateDoctor)
export default adminRouter