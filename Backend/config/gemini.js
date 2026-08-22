import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const getGroqClient = () => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.startsWith("your_")) {
        return null;
    }
    return new Groq({ apiKey });
};

const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.startsWith("your_") || apiKey.startsWith("AQ.Ab8RN6Jd")) {
        // Ignore invalid/placeholder keys
        return null;
    }
    try {
        return new GoogleGenerativeAI(apiKey);
    } catch (e) {
        return null;
    }
};

/**
 * Generate a pre-visit symptom summary
 * Expected return structure: { urgency: "Low|Medium|High", chiefComplaint: "...", suggestedQuestions: ["...", "...", "..."] }
 */
export const generatePreVisitSummary = async (symptoms) => {
    const fallback = {
        urgency: "Medium",
        chiefComplaint: symptoms ? (symptoms.slice(0, 100) + (symptoms.length > 100 ? "..." : "")) : "Not specified",
        suggestedQuestions: [
            "How long have you been experiencing these symptoms?",
            "Have you noticed any triggers or patterns?",
            "Are you currently taking any over-the-counter medications for this?"
        ]
    };

    // 1. Try Groq (Llama 3)
    const groq = getGroqClient();
    if (groq) {
        try {
            const prompt = `Analyse these symptoms and return a JSON object with keys: "urgency" (Low, Medium, or High), "chiefComplaint" (a short summary string), and "suggestedQuestions" (an array of exactly 3 suggested questions for the doctor). Return ONLY valid raw JSON without markdown code fences.
Symptoms: ${symptoms}`;

            const chatCompletion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "openai/gpt-oss-20b",
                response_format: { type: "json_object" }
            });

            const responseText = chatCompletion.choices[0].message.content.trim();
            const parsed = JSON.parse(responseText);
            if (parsed.urgency && parsed.chiefComplaint && Array.isArray(parsed.suggestedQuestions)) {
                return {
                    urgency: parsed.urgency,
                    chiefComplaint: parsed.chiefComplaint,
                    suggestedQuestions: parsed.suggestedQuestions.slice(0, 3)
                };
            }
        } catch (error) {
            console.error("Error in Groq generatePreVisitSummary:", error.message);
        }
    }

    // 2. Try Gemini
    const genAI = getGeminiClient();
    if (genAI) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Analyse these symptoms and return a JSON object with keys: "urgency" (Low, Medium, or High), "chiefComplaint" (a short summary string), and "suggestedQuestions" (an array of exactly 3 suggested questions for the doctor). Return ONLY valid raw JSON without markdown code fences.
Symptoms: ${symptoms}`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text().trim();
            const cleanedText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanedText);
            if (parsed.urgency && parsed.chiefComplaint && Array.isArray(parsed.suggestedQuestions)) {
                return {
                    urgency: parsed.urgency,
                    chiefComplaint: parsed.chiefComplaint,
                    suggestedQuestions: parsed.suggestedQuestions.slice(0, 3)
                };
            }
        } catch (error) {
            console.error("Error in Gemini generatePreVisitSummary:", error.message);
        }
    }

    return fallback;
};

/**
 * Generate a patient-friendly post-visit summary
 */
export const generatePostVisitSummary = async (notes, prescription) => {
    const prescriptionStr = Array.isArray(prescription) 
        ? prescription.map(p => `${p.name || p.medicationName} (${p.frequency || p.dosage}) for ${p.duration}`).join(", ")
        : String(prescription || "None");

    const fallback = `Summary: The doctor has completed your visit. 
Clinical Notes: ${notes}
Medications: ${prescriptionStr}
Please follow up as advised if symptoms persist.`;

    // 1. Try Groq (Llama 3)
    const groq = getGroqClient();
    if (groq) {
        try {
            const prompt = `Convert these clinical notes and prescription into a patient-friendly summary with medication schedule and follow-up steps. Keep it warm, clear, and easy to read. 
Notes: ${notes}
Prescription details: ${prescriptionStr}`;

            const chatCompletion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "openai/gpt-oss-20b",
            });
            return chatCompletion.choices[0].message.content.trim();
        } catch (error) {
            console.error("Error in Groq generatePostVisitSummary:", error.message);
        }
    }

    // 2. Try Gemini
    const genAI = getGeminiClient();
    if (genAI) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Convert these clinical notes and prescription into a patient-friendly summary with medication schedule and follow-up steps. Keep it warm, clear, and easy to read. 
Notes: ${notes}
Prescription details: ${prescriptionStr}`;

            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        } catch (error) {
            console.error("Error in Gemini generatePostVisitSummary:", error.message);
        }
    }

    return fallback;
};
