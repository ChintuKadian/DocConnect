import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import { generatePreVisitSummary } from '../config/gemini.js';
import { queueEmail } from '../config/emailService.js';
import { createCalendarEvent, deleteCalendarEvent, getGoogleAuthUrl, getTokensFromCode } from '../config/googleCalendar.js';
import sequelize from '../config/sequelize.js';

// api to register user 
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing details' })
        }
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Enter valid email' })

        }
        if (password.length < 8) {
            return res.json({ success: false, message: 'Enter a strong password' })

        }
        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const user = await userModel.create(userData)
        // _id is provided my database when user is created

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }

}

// api fro user login 
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ where: { email } })
        if (!user) {
            return res.json({ success: false, message: 'User doest not exists' })

        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {

        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//api to get user profile data 
const getProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        const userData = await userModel.findByPk(userId, { attributes: { exclude: ['password'] } })
        res.json({ success: true, userData })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//api to update user profile

const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, dob, gender } = req.body;
        const imageFile = req.file;

        if (!name || !phone || !dob || !gender) {
            res.json({ success: false, message: "Data Missing" })
        }
        await userModel.update({ name, phone, address: JSON.parse(address), dob, gender }, { where: { _id: userId } })

        if (imageFile) {
            // upload image to cloudinary and get url
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url

            await userModel.update({ image: imageURL }, { where: { _id: userId } })
        }

        res.json({ success: true, message: "Profile Updated" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// api to book appointment
const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime, symptoms } = req.body;
        
        // Execute atomic transaction for safe slot booking
        const result = await sequelize.transaction(async (t) => {
            const doctor = await doctorModel.findByPk(docId, { transaction: t, lock: t.LOCK.UPDATE });
            
            if (!doctor || !doctor.available) {
                throw new Error("Doctor not available");
            }

            // Check if doctor is on leave
            if (doctor.leaveDays && doctor.leaveDays.includes(slotDate)) {
                throw new Error("Doctor is on leave on this date");
            }

            let slots_booked = doctor.slots_booked || {};
            let daySlots = slots_booked[slotDate] || [];
            if (daySlots.includes(slotTime)) {
                throw new Error("Slot not available or already booked");
            }

            // Reserve slot
            daySlots.push(slotTime);
            slots_booked[slotDate] = daySlots;
            doctor.slots_booked = slots_booked;
            
            doctor.changed('slots_booked', true);
            await doctor.save({ transaction: t });

            return doctor;
        });

        // Fetch User and Doc details for appointment creation
        const docData = await doctorModel.findByPk(docId, { attributes: { exclude: ['password'] } });
        const userData = await userModel.findByPk(userId, { attributes: { exclude: ['password'] } });

        // Generate AI pre-visit summary
        const preVisitSummary = await generatePreVisitSummary(symptoms || "");

        // Save appointment
        const appointmentData = {
            userId,
            docId,
            userData: userData.get({ plain: true }),
            docData: {
                ...docData.get({ plain: true }),
                slots_booked: undefined // omit slots_booked in nested data
            },
            amount: docData.fees,
            slotTime,
            slotDate,
            symptoms: symptoms || "",
            preVisitSummary,
            date: Date.now()
        };

        const newAppointment = await appointmentModel.create(appointmentData);

        // Enqueue booking confirmation emails to both patient and doctor
        const patientEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #0d9488; text-align: center;">Appointment Booked Successfully</h2>
                <p>Dear ${userData.name},</p>
                <p>Your appointment with <strong>Dr. ${docData.name}</strong> has been successfully booked.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                <p><strong>Date:</strong> ${slotDate.replace(/_/g, "/")}</p>
                <p><strong>Time:</strong> ${slotTime}</p>
                <p><strong>Symptom details shared:</strong> ${symptoms || "None"}</p>
                <p><strong>AI Pre-Visit Urgency Assessment:</strong> ${preVisitSummary.urgency}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                <p style="font-size: 12px; color: #777;">Thank you for using DocConnect.</p>
            </div>
        `;
        await queueEmail(userData.email, `Appointment Confirmed - Dr. ${docData.name}`, patientEmailHtml);

        const doctorEmailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #0d9488; text-align: center;">New Appointment Booked</h2>
                <p>Hello Dr. ${docData.name},</p>
                <p>You have a new appointment booking from patient <strong>${userData.name}</strong>.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                <p><strong>Date:</strong> ${slotDate.replace(/_/g, "/")}</p>
                <p><strong>Time:</strong> ${slotTime}</p>
                <h3>AI Pre-Visit Symptom Summary:</h3>
                <p><strong>Urgency Level:</strong> <span style="font-weight: bold; color: ${preVisitSummary.urgency === 'High' ? '#ef4444' : preVisitSummary.urgency === 'Medium' ? '#f59e0b' : '#10b981'};">${preVisitSummary.urgency}</span></p>
                <p><strong>Chief Complaint:</strong> ${preVisitSummary.chiefComplaint}</p>
                <p><strong>Suggested Questions to Ask:</strong></p>
                <ul>
                    ${preVisitSummary.suggestedQuestions.map(q => `<li>${q}</li>`).join("")}
                </ul>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                <p style="font-size: 12px; color: #777;">DocConnect Portal</p>
            </div>
        `;
        await queueEmail(docData.email, `New Appointment - ${userData.name}`, doctorEmailHtml);

        // Google Calendar OAuth event creation
        if (userData.googleTokens) {
            const calendarEventId = await createCalendarEvent(userData.googleTokens, newAppointment, docData);
            if (calendarEventId) {
                newAppointment.googleCalendarEventId = calendarEventId;
                await newAppointment.save();
            }
        }

        res.json({ success: true, message: "Appointment Booked", appointmentId: newAppointment._id });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//  api to get user appointment for frontend my-appointment page
const listAppointment = async (req, res) => {
    try {
        const { userId } = req.body
        const appointments = await appointmentModel.findAll({ where: { userId } })//get appontment of particular user
        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// api to cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body;
        const appointmentData = await appointmentModel.findByPk(appointmentId);
        if (!appointmentData) {
            return res.json({ success: false, message: "Appointment not found" });
        }
        //verify appointment user
        if (appointmentData.userId != userId) {
            return res.json({ success: false, message: "Unauthorized action" });
        }

        await appointmentModel.update({ cancelled: true }, { where: { _id: appointmentId } });

        //releasing doctor Slot
        const { docId, slotDate, slotTime, googleCalendarEventId } = appointmentData;
        const doctorData = await doctorModel.findByPk(docId);

        if (doctorData) {
            let slots_booked = JSON.parse(JSON.stringify(doctorData.slots_booked || {}));
            if (slots_booked[slotDate]) {
                slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);
                await doctorModel.update({ slots_booked }, { where: { _id: docId } });
            }
        }


        const userData = await userModel.findByPk(userId, { attributes: { exclude: ['password'] } });

        // Cancel Google Calendar Event if exists
        if (userData.googleTokens && googleCalendarEventId) {
            await deleteCalendarEvent(userData.googleTokens, googleCalendarEventId);
        }

        // Send Cancellation Emails
        const cancellationHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #ef4444; text-align: center;">Appointment Cancelled</h2>
                <p>Hello,</p>
                <p>The appointment between patient <strong>${userData.name}</strong> and <strong>Dr. ${doctorData.name}</strong> has been cancelled.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                <p><strong>Appointment Date:</strong> ${slotDate.replace(/_/g, "/")}</p>
                <p><strong>Appointment Time:</strong> ${slotTime}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                <p style="font-size: 11px; color: #aaa; text-align: center;">DocConnect Healthcare System</p>
            </div>
        `;
        await queueEmail(userData.email, `Appointment Cancelled - Dr. ${doctorData.name}`, cancellationHtml);
        await queueEmail(doctorData.email, `Appointment Cancelled - ${userData.name}`, cancellationHtml);

        res.json({ success: true, message: "Appointment Cancelled" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


const googleAuth = async (req, res) => {
    try {
        const { userId } = req.body;
        const authUrl = getGoogleAuthUrl(userId);
        if (!authUrl) {
            return res.json({ success: false, message: "Google OAuth credentials not configured on backend." });
        }
        res.json({ success: true, authUrl });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

const googleCallback = async (req, res) => {
    try {
        const { code, state } = req.query; // state is the userId
        if (!code || !state) {
            return res.send("<h2>Authorization failed: code or state missing.</h2>");
        }
        const tokens = await getTokensFromCode(code);
        await userModel.update({ googleTokens: tokens }, { where: { _id: state } });
        
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        res.send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding-top: 50px;">
                    <h2 style="color: #0d9488;">Google Calendar Connected Successfully!</h2>
                    <p>You can close this window now.</p>
                    <script>
                        setTimeout(() => {
                            window.location.href = "${frontendUrl}/my-appointments?googleAuth=success";
                        }, 2000);
                    </script>
                </body>
            </html>
        `);
    } catch (error) {
        console.error("Error in googleCallback:", error);
        res.send(`<h2>Authorization error: ${error.message}</h2>`);
    }
}

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, googleAuth, googleCallback }