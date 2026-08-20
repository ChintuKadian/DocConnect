import appointmentModel from "../models/appointmentModel.js";
import { processEmailQueue, queueEmail } from "./emailService.js";

/**
 * Parses duration string (e.g., "7 days", "1 week") to milliseconds.
 */
const parseDurationToMs = (durationStr) => {
    if (!durationStr) return 7 * 24 * 60 * 60 * 1000; // default 7 days
    const num = parseInt(durationStr.replace(/\D/g, ""), 10) || 7;
    if (durationStr.toLowerCase().includes("week")) {
        return num * 7 * 24 * 60 * 60 * 1000;
    }
    if (durationStr.toLowerCase().includes("month")) {
        return num * 30 * 24 * 60 * 60 * 1000;
    }
    return num * 24 * 60 * 60 * 1000; // default daily multiplier
};

/**
 * Scans all active prescriptions and sends email reminders.
 */
export const checkPrescriptionReminders = async () => {
    try {
        // Find completed appointments with prescriptions
        const allAppointments = await appointmentModel.findAll({
            where: {
                isCompleted: true,
                cancelled: false
            }
        });

        const appointments = allAppointments.filter(app => {
            return app.prescription && Array.isArray(app.prescription) && app.prescription.length > 0;
        });

        const now = new Date();

        for (const appointment of appointments) {
            const { prescription, lastReminderSent, userData, docData } = appointment;

            // Check if prescription period is still active
            const visitDate = new Date(appointment.date);
            // We find the max duration among all prescribed drugs to decide if reminder period is active
            let maxDurationMs = 7 * 24 * 60 * 60 * 1000; // default 7 days
            prescription.forEach(item => {
                const ms = parseDurationToMs(item.duration);
                if (ms > maxDurationMs) maxDurationMs = ms;
            });

            const prescriptionExpiry = new Date(visitDate.getTime() + maxDurationMs);

            if (now > prescriptionExpiry) {
                // Prescription course finished, skip
                continue;
            }

            // Determine if a reminder is due based on frequency
            // Let's take daily reminder limit as 24 hours.
            let reminderIntervalMs = 24 * 60 * 60 * 1000; // default 24h
            prescription.forEach(item => {
                const freq = (item.frequency || "").toLowerCase();
                if (freq.includes("twice") || freq.includes("2x")) {
                    reminderIntervalMs = 12 * 60 * 60 * 1000; // 12h
                } else if (freq.includes("thrice") || freq.includes("3x")) {
                    reminderIntervalMs = 8 * 60 * 60 * 1000; // 8h
                }
            });

            const lastSent = lastReminderSent ? new Date(lastReminderSent) : null;

            if (!lastSent || (now.getTime() - lastSent.getTime() >= reminderIntervalMs)) {
                // Send reminder email!
                const medicationListHtml = prescription.map(item => `
                    <li>
                        <strong>Medication Name:</strong> ${item.medicationName || item.name}<br/>
                        <strong>Dosage & Frequency:</strong> ${item.dosage || item.frequency}<br/>
                        <strong>Duration:</strong> ${item.duration}<br/>
                    </li>
                `).join("");

                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #0d9488; text-align: center;">Medication Intake Reminder</h2>
                        <p>Dear ${userData.name},</p>
                        <p>This is a friendly reminder to take your prescribed medications from your recent visit with <strong>Dr. ${docData.name}</strong>.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                        <h3>Your Prescribed Medications:</h3>
                        <ul>
                            ${medicationListHtml}
                        </ul>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                        <p style="font-size: 12px; color: #777;">Please ensure you follow your schedule and dosage correctly. Contact Dr. ${docData.name} if you experience any adverse side effects.</p>
                        <p style="font-size: 11px; color: #aaa; text-align: center;">DocConnect Healthcare Systems</p>
                    </div>
                `;

                await queueEmail(
                    userData.email,
                    `Medication Schedule Reminder - DocConnect`,
                    emailHtml
                );

                appointment.lastReminderSent = now;
                await appointment.save();
            }
        }
    } catch (error) {
        console.error("Error in checkPrescriptionReminders:", error.message);
    }
};

/**
 * Start background jobs
 */
export const startBackgroundJobs = () => {
    console.log("[Background Worker] Scheduler started successfully.");
    
    // Process email queue every 30 seconds
    setInterval(async () => {
        try {
            await processEmailQueue();
        } catch (e) {
            console.error("Failed to run email queue processing job:", e);
        }
    }, 30000);

    // Check medication reminders every 5 minutes
    setInterval(async () => {
        try {
            await checkPrescriptionReminders();
        } catch (e) {
            console.error("Failed to run medication reminders job:", e);
        }
    }, 300000);
};
