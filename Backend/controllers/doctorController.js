import doctorModel from "../models/doctorModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"
import { generatePostVisitSummary } from "../config/gemini.js"
import { queueEmail } from "../config/emailService.js"
import { updateCalendarEvent } from "../config/googleCalendar.js"
import userModel from "../models/userModel.js"

const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.body

        const docData = await doctorModel.findByPk(docId);
        await doctorModel.update({ available: !docData.available }, { where: { _id: docId } })
        res.json({ success: true, message: 'Availability changed' })

    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.findAll({ attributes: { exclude: ['password', 'email'] } });
        res.json({ success: true, doctors })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }
}

//api for doctor login
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;
        const doctor = await doctorModel.findOne({ where: { email } })

        if (!doctor) {
            return res.json({ success: false, message: "Invalid Credentials" })

        }

        const isMatch = await bcrypt.compare(password, doctor.password)
        if (isMatch) {
            const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            return res.json({ success: false, message: "Invalid Credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }
}

// api to get doctor appointments for doctor pannel
const appointmentsDoctor = async (req, res) => {
    try {
        const { docId } = req.body
        const appointments = await appointmentModel.findAll({ where: { docId } })
        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//api to mark appointment completed for doctor pannel
const appointmentComplete = async (req, res) => {
    try {
        const { docId, appointmentId, notes, prescription } = req.body;
        const appointmentData = await appointmentModel.findByPk(appointmentId);

        if (appointmentData && appointmentData.docId === docId) {
            const parsedPrescription = typeof prescription === 'string' ? JSON.parse(prescription) : prescription || [];

            // Generate AI post-visit summary
            const postVisitSummary = await generatePostVisitSummary(notes || "", parsedPrescription);

            await appointmentModel.update({
                isCompleted: true,
                notes: notes || "",
                prescription: parsedPrescription,
                postVisitSummary: postVisitSummary
            }, { where: { _id: appointmentId } });

            const updatedAppointment = await appointmentModel.findByPk(appointmentId);

            const doctorData = await doctorModel.findByPk(docId, { attributes: { exclude: ['password'] } });
            const userData = await userModel.findByPk(appointmentData.userId, { attributes: { exclude: ['password'] } });

            // Update Google Calendar event if OAuth token is present
            if (userData && userData.googleTokens && appointmentData.googleCalendarEventId) {
                await updateCalendarEvent(userData.googleTokens, appointmentData.googleCalendarEventId, updatedAppointment, doctorData);
            }

            // Enqueue post-visit summary email
            const prescriptionListHtml = parsedPrescription.map(item => `
                <li>
                    <strong>Medication:</strong> ${item.medicationName || item.name}<br/>
                    <strong>Frequency:</strong> ${item.frequency || item.dosage}<br/>
                    <strong>Duration:</strong> ${item.duration}<br/>
                </li>
            `).join("");

            const postVisitHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #0d9488; text-align: center;">Your Visit Summary - DocConnect</h2>
                    <p>Dear ${userData.name},</p>
                    <p>Thank you for visiting <strong>Dr. ${doctorData.name}</strong> today. Here is the summary of your consultation.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                    
                    <h3>AI Doctor's Post-Visit Summary:</h3>
                    <p style="background-color: #f0fdfa; padding: 15px; border-left: 4px solid #0d9488; border-radius: 4px;">
                        ${postVisitSummary}
                    </p>
                    
                    <h3>Clinical Notes:</h3>
                    <p>${notes || "No extra notes provided."}</p>
                    
                    ${parsedPrescription.length > 0 ? `
                        <h3>Your Prescribed Medications:</h3>
                        <ul>
                            ${prescriptionListHtml}
                        </ul>
                    ` : ""}
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                    <p style="font-size: 12px; color: #777;">Please contact our support team or book a follow-up session if symptoms persist.</p>
                    <p style="font-size: 11px; color: #aaa; text-align: center;">DocConnect Healthcare Systems</p>
                </div>
            `;
            await queueEmail(userData.email, `Prescription & Visit Summary - Dr. ${doctorData.name}`, postVisitHtml);

            return res.json({ success: true, message: "Appointment Completed and Summary Generated" });
        } else {
            return res.json({ success: false, message: "Mark Failed" });
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//api to cancel appointment completed for doctor pannel
const appointmentCancel = async (req, res) => {

    try {
        const { docId, appointmentId } = req.body //appointmentId will be passed
        const appointmentData = await appointmentModel.findByPk(appointmentId)
        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.update({ cancelled: true }, { where: { _id: appointmentId } })
            return res.json({ success: true, message: "Appointment Cancelled" })
        } else {
            return res.json({ success: false, message: "Cancellation Failed" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// api to get dashboard data for doctor pannel
const doctorDashboard= async(req,res)=>{

    try {
        const {docId}=req.body;
        const appointments= await appointmentModel.findAll({ where: { docId } })
        let earning=0
        appointments.map((item)=>{
            if(item.isCompleted || item.payment){
                earning+=item.amount

            }
        })

        let patients=[]
        //add unique patients to array
        appointments.map((item)=>{
            if(!patients.includes(item.userId)){
                patients.push(item.userId)
            }
        })


        const dashData={
            earning,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0,5)
        }
        res.json({success:true, dashData})
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


//api to get doctor profile for doctor pannel

const doctorProfile = async(req,res)=>{
    try {
        const {docId}= req.body;
        const profileData= await doctorModel.findByPk(docId, { attributes: { exclude: ['password'] } })
        res.json({success:true, profileData})


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//api to update doctor profile data from doctor pannel

const updateDoctorProfile= async(req,res)=>{
    try {
        const {docId,fees,address,available}=req.body

        await doctorModel.update({fees,address,available},{where:{_id:docId}})
        res.json({success:true, message:"Profile Updated"})
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
export { changeAvailability, doctorList, loginDoctor, appointmentsDoctor, appointmentCancel, appointmentComplete,doctorDashboard,doctorProfile,updateDoctorProfile }