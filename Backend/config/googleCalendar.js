import { google } from "googleapis";

const getOAuth2Client = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:4000/api/user/google-callback";

    if (!clientId || !clientSecret) {
        console.warn("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing. Calendar integration will run in Mock Mode.");
        return null;
    }

    return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

export const getGoogleAuthUrl = (state) => {
    const oauth2Client = getOAuth2Client();
    if (!oauth2Client) return null;

    const scopes = [
        "https://www.googleapis.com/auth/calendar.events"
    ];

    return oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
        prompt: "consent",
        state: state
    });
};

export const getTokensFromCode = async (code) => {
    const oauth2Client = getOAuth2Client();
    if (!oauth2Client) throw new Error("Google Client Credentials missing");

    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
};

// Convert "DD_MM_YYYY" and "HH:MM" slot format to ISO strings
const parseSlotDateTime = (slotDate, slotTime, durationMinutes = 30) => {
    try {
        const [day, month, year] = slotDate.split("_").map(Number);
        
        // Clean slotTime: e.g. "10:30 am" -> parse parts
        const timePart = slotTime.split(" ")[0];
        const isPM = slotTime.toLowerCase().includes("pm");
        const isAM = slotTime.toLowerCase().includes("am");
        
        let [hours, minutes] = timePart.split(":").map(Number);
        if (isPM && hours < 12) hours += 12;
        if (isAM && hours === 12) hours = 0;
        
        // Months are 0-indexed in JS Dates
        const start = new Date(year, month - 1, day, hours, minutes, 0);
        const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
        
        return {
            start: start.toISOString(),
            end: end.toISOString()
        };
    } catch (e) {
        console.error("Error parsing slot date/time:", e);
        const now = new Date();
        return {
            start: now.toISOString(),
            end: new Date(now.getTime() + 30 * 60000).toISOString()
        };
    }
};

export const createCalendarEvent = async (userTokens, appointment, doctor) => {
    try {
        const oauth2Client = getOAuth2Client();
        if (!oauth2Client || !userTokens) {
            console.log(`[Google Calendar Mock] Created event for appointment ${appointment._id}`);
            return `mock_event_${Date.now()}`;
        }

        oauth2Client.setCredentials(userTokens);
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        const { start, end } = parseSlotDateTime(appointment.slotDate, appointment.slotTime, doctor.slotDuration || 30);

        const event = {
            summary: `Appointment with Dr. ${doctor.name} - DocConnect`,
            description: `Symptom report: ${appointment.symptoms || "None shared."}\nChief Complaint: ${appointment.preVisitSummary?.chiefComplaint || "None"}\nUrgency: ${appointment.preVisitSummary?.urgency || "Medium"}\n\nThank you for choosing DocConnect.`,
            start: { dateTime: start, timeZone: "UTC" },
            end: { dateTime: end, timeZone: "UTC" },
            attendees: [
                { email: appointment.userData.email },
                { email: doctor.email }
            ]
        };

        const response = await calendar.events.insert({
            calendarId: "primary",
            resource: event,
            sendUpdates: "all"
        });

        console.log(`[Google Calendar] Successfully created event ${response.data.id}`);
        return response.data.id;
    } catch (error) {
        console.error("Error creating Google Calendar event:", error.message);
        return `mock_event_${Date.now()}`;
    }
};

export const updateCalendarEvent = async (userTokens, eventId, appointment, doctor) => {
    try {
        if (!eventId || eventId.startsWith("mock_event")) return;

        const oauth2Client = getOAuth2Client();
        if (!oauth2Client || !userTokens) return;

        oauth2Client.setCredentials(userTokens);
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        const { start, end } = parseSlotDateTime(appointment.slotDate, appointment.slotTime, doctor.slotDuration || 30);

        const event = {
            summary: `Appointment with Dr. ${doctor.name} - DocConnect [Updated]`,
            description: `Symptom report: ${appointment.symptoms || "None shared."}\nChief Complaint: ${appointment.preVisitSummary?.chiefComplaint || "None"}\nUrgency: ${appointment.preVisitSummary?.urgency || "Medium"}\nStatus: ${appointment.cancelled ? "Cancelled" : "Confirmed"}\nNotes: ${appointment.notes || "No notes posted yet."}`,
            start: { dateTime: start, timeZone: "UTC" },
            end: { dateTime: end, timeZone: "UTC" }
        };

        await calendar.events.patch({
            calendarId: "primary",
            eventId: eventId,
            resource: event,
            sendUpdates: "all"
        });
        console.log(`[Google Calendar] Successfully updated event ${eventId}`);
    } catch (error) {
        console.error("Error updating Google Calendar event:", error.message);
    }
};

export const deleteCalendarEvent = async (userTokens, eventId) => {
    try {
        if (!eventId || eventId.startsWith("mock_event")) return;

        const oauth2Client = getOAuth2Client();
        if (!oauth2Client || !userTokens) return;

        oauth2Client.setCredentials(userTokens);
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        await calendar.events.delete({
            calendarId: "primary",
            eventId: eventId,
            sendUpdates: "all"
        });
        console.log(`[Google Calendar] Successfully deleted event ${eventId}`);
    } catch (error) {
        console.error("Error deleting Google Calendar event:", error.message);
    }
};
