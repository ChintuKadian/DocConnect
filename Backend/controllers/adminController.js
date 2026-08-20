//api for adding doctor 
import validator from 'validator'
import bycrpt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import { json } from 'express';
import doctorModel from '../models/doctorModel.js';
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js';
import userModel from '../models/userModel.js';
import { queueEmail } from '../config/emailService.js';
import { deleteCalendarEvent } from '../config/googleCalendar.js';
import { Op } from 'sequelize';

const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address, workingHours, slotDuration, leaveDays } = req.body;
        const imageFile = req.file;

        // checking for data to add doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: " Missing details " })
        }

        //validating email
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: " Please enter valid email" })
        }
        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: " Please enter strong password" })
        }

        //hashing doctor passwort
        const salt = await bycrpt.genSalt(10)
        const hashedPassword = await bycrpt.hash(password, salt);

        //upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
        const imageUrl = imageUpload.secure_url;

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now(),
            workingHours: workingHours ? JSON.parse(workingHours) : { start: "09:00", end: "17:00" },
            slotDuration: slotDuration ? Number(slotDuration) : 30,
            leaveDays: leaveDays ? JSON.parse(leaveDays) : []
        }

        const newDoctor = await doctorModel.create(doctorData);
        res.json({ success: true, message: "Doctor Added" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API for admin login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET);//generate token in case of right credentials
            res.json({ success: true, token })
        }

        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }
}

//API to get all doc list for admin panel
const allDoctors = async (req, res) => {
    try {
        //get doctor info except password
        const doctors = await doctorModel.findAll({ attributes: { exclude: ['password'] } })
        res.json({ success: true, doctors })
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }

}

// api to get all appointment list
const appointmentAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel.findAll({})
        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


//api to cancle appointment
const appointmentCancel = async (req, res) => {
    try {
        //get userId from auth user middleware and appointmentId is provided while cancelling
        const { appointmentId } = req.body;
        const appointmentData = await appointmentModel.findByPk(appointmentId)

        await appointmentModel.update({ cancelled: true }, { where: { _id: appointmentId } })

        //releasing doctor Slot
        const { docId, slotDate, slotTime } = appointmentData
        const doctorData = await doctorModel.findByPk(docId)

        let slots_booked = doctorData.slots_booked
        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        // Mark the json field modified
        doctorData.slots_booked = slots_booked;
        doctorData.changed('slots_booked', true);
        await doctorData.save();

        res.json({ success: true, message: "Appointment Cancelled" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


//api to get dashboard data for admin panel

const adminDashboard = async (req, res) => {
    try {
        const doctors = await doctorModel.findAll({})
        const users = await userModel.findAll({})
        const appointments = await appointmentModel.findAll({})
        //we will get number of doc, user,appointment
        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse().slice(0,5)
        }
        res.json({success:true,dashData})
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const updateDoctor = async (req, res) => {
    try {
        const { docId, name, email, speciality, degree, experience, about, fees, address, available, workingHours, slotDuration, leaveDays } = req.body;
        
        const oldDocData = await doctorModel.findByPk(docId);
        if (!oldDocData) {
            return res.json({ success: false, message: "Doctor not found" });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (speciality) updateData.speciality = speciality;
        if (degree) updateData.degree = degree;
        if (experience) updateData.experience = experience;
        if (about) updateData.about = about;
        if (fees) updateData.fees = Number(fees);
        if (address) updateData.address = typeof address === 'string' ? JSON.parse(address) : address;
        if (available !== undefined) updateData.available = available === 'true' || available === true;
        if (workingHours) updateData.workingHours = typeof workingHours === 'string' ? JSON.parse(workingHours) : workingHours;
        if (slotDuration) updateData.slotDuration = Number(slotDuration);
        
        if (leaveDays) {
            const parsedLeaveDays = typeof leaveDays === 'string' ? JSON.parse(leaveDays) : leaveDays;
            updateData.leaveDays = parsedLeaveDays;

            const oldLeaveDays = oldDocData.leaveDays || [];
            const newLeaveDays = parsedLeaveDays.filter(d => !oldLeaveDays.includes(d));

            if (newLeaveDays.length > 0) {
                const affectedAppointments = await appointmentModel.findAll({
                    where: {
                        docId: docId,
                        slotDate: { [Op.in]: newLeaveDays },
                        cancelled: false,
                        isCompleted: false
                    }
                });

                for (const app of affectedAppointments) {
                    app.cancelled = true;
                    await app.save();

                    const appUser = await userModel.findByPk(app.userId, { attributes: { exclude: ['password'] } });
                    
                    const cancellationHtml = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #ef4444; text-align: center;">Appointment Cancelled Due to Doctor Leave</h2>
                            <p>Dear ${app.userData.name},</p>
                            <p>We regret to inform you that your appointment with <strong>Dr. ${oldDocData.name}</strong> on <strong>${app.slotDate.replace(/_/g, "/")}</strong> at <strong>${app.slotTime}</strong> has been cancelled because the doctor is on leave on this date.</p>
                            <p>Please log in to DocConnect to book a slot for another date.</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                            <p style="font-size: 11px; color: #aaa; text-align: center;">DocConnect Operations Team</p>
                        </div>
                    `;
                    await queueEmail(app.userData.email, `Appointment Cancelled: Dr. ${oldDocData.name} on Leave`, cancellationHtml);

                    if (appUser && appUser.googleTokens && app.googleCalendarEventId) {
                        await deleteCalendarEvent(appUser.googleTokens, app.googleCalendarEventId).catch(e => console.error("Error deleting calendar event:", e));
                    }
                }

                let slots_booked = oldDocData.slots_booked || {};
                newLeaveDays.forEach(date => {
                    if (slots_booked[date]) {
                        delete slots_booked[date];
                    }
                });
                updateData.slots_booked = slots_booked;
            }
        }

        await doctorModel.update(updateData, { where: { _id: docId } });
        const updatedDoctor = await doctorModel.findByPk(docId);
        res.json({ success: true, message: "Doctor Profile Updated", doctor: updatedDoctor });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { addDoctor, loginAdmin, allDoctors, appointmentAdmin, appointmentCancel, adminDashboard, updateDoctor }