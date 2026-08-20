import { GoogleGenerativeAI } from "@google/generative-ai";

const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("GEMINI_API_KEY is not defined. Using mock fallback mode for LLM generation.");
        return null;
    }
    return new GoogleGenerativeAI(apiKey);
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

    try {
        const genAI = getGeminiClient();
        if (!genAI) return fallback;

        // Using gemini-1.5-flash as it is fast and efficient for text tasks
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Analyse these symptoms and return a JSON object with keys: "urgency" (Low, Medium, or High), "chiefComplaint" (a short summary string), and "suggestedQuestions" (an array of exactly 3 suggested questions for the doctor). Return ONLY valid raw JSON without markdown code fences.
Symptoms: ${symptoms}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        
        // Clean markdown code blocks if the model outputs them
        const cleanedText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
        
        try {
            const parsed = JSON.parse(cleanedText);
            if (parsed.urgency && parsed.chiefComplaint && Array.isArray(parsed.suggestedQuestions)) {
                return {
                    urgency: parsed.urgency,
                    chiefComplaint: parsed.chiefComplaint,
                    suggestedQuestions: parsed.suggestedQuestions.slice(0, 3)
                };
            }
        } catch (parseError) {
            console.error("Failed to parse Gemini response as JSON. Raw response was:", responseText);
        }
        
        // RegEx fallback parsing if JSON parsing fails but text is there
        const urgencyMatch = responseText.match(/urgency level\s*:\s*(Low|Medium|High)/i);
        const urgency = urgencyMatch ? urgencyMatch[1] : "Medium";
        return {
            urgency,
            chiefComplaint: symptoms.slice(0, 100),
            suggestedQuestions: fallback.suggestedQuestions
        };

    } catch (error) {
        console.error("Error in generatePreVisitSummary:", error.message);
        return fallback;
    }
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

    try {
        const genAI = getGeminiClient();
        if (!genAI) return fallback;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Convert these clinical notes and prescription into a patient-friendly summary with medication schedule and follow-up steps. Keep it warm, clear, and easy to read. 
Notes: ${notes}
Prescription details: ${prescriptionStr}`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error("Error in generatePostVisitSummary:", error.message);
        return fallback;
    }
};
