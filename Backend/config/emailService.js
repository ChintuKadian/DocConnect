import nodemailer from "nodemailer";
import emailQueueModel from "../models/emailQueueModel.js";
import { Op } from "sequelize";

// Helper to create a nodemailer transporter
const getTransporter = () => {
    // If SMTP variables are defined, use them.
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
        return nodemailer.createTransport({
            host,
            port,
            secure: port == 465,
            auth: { user, pass }
        });
    }

    // fallback to console logger
    return null;
};

/**
 * Add an email to the queue database
 */
export const queueEmail = async (to, subject, html) => {
    try {
        const emailItem = await emailQueueModel.create({
            to,
            subject,
            html,
            status: 'pending',
            attempts: 0
        });
        console.log(`[Email Queue] Queued mail to: ${to} | Subject: "${subject}"`);
        
        // Asynchronously attempt to trigger processing immediately for fast delivery
        processEmailQueue().catch(err => console.error("Error processing queue immediately:", err));
        
        return emailItem;
    } catch (error) {
        console.error("Failed to queue email:", error.message);
    }
};

/**
 * Process pending/failed emails in the queue
 */
export const processEmailQueue = async () => {
    try {
        const pendingEmails = await emailQueueModel.findAll({
            where: {
                status: { [Op.in]: ['pending', 'failed'] },
                attempts: { [Op.lt]: 5 }
            }
        });

        if (pendingEmails.length === 0) return;

        const transporter = getTransporter();

        for (const emailItem of pendingEmails) {
            emailItem.attempts += 1;
            try {
                if (transporter) {
                    await transporter.sendMail({
                        from: process.env.SMTP_FROM || '"DocConnect" <no-reply@docconnect.co>',
                        to: emailItem.to,
                        subject: emailItem.subject,
                        html: emailItem.html
                    });
                    emailItem.status = 'sent';
                    emailItem.lastError = "";
                } else {
                    // Mock send
                    console.log(`\n--- MOCK EMAIL SENT ---`);
                    console.log(`To: ${emailItem.to}`);
                    console.log(`Subject: ${emailItem.subject}`);
                    console.log(`HTML Body Preview: ${emailItem.html.slice(0, 300)}...`);
                    console.log(`-------------------------\n`);
                    emailItem.status = 'sent';
                    emailItem.lastError = "";
                }
            } catch (err) {
                console.error(`Error sending email to ${emailItem.to}:`, err.message);
                emailItem.status = 'failed';
                emailItem.lastError = err.message;
            }
            await emailItem.save();
        }
    } catch (error) {
        console.error("Error in processEmailQueue:", error.message);
    }
};
