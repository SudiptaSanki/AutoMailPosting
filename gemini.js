require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Helper to get array of keys
function getApiKeys() {
    const keysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
    return keysStr.split(',').map(k => k.trim()).filter(k => k.length > 0);
}

/**
 * Generate a response from Gemini based on a prompt.
 * Automatically falls back to the next API key if one fails.
 */
async function generatePost(prompt) {
    const keys = getApiKeys();
    
    if (keys.length === 0) {
        console.error("No Gemini API keys found in environment.");
        return "Error: No Gemini API keys configured.";
    }

    let lastError = null;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        try {
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.warn(`[Gemini] Key ${i + 1} failed. Moving to next key... (${error.message})`);
            lastError = error;
        }
    }

    console.error("All Gemini API keys exhausted. Last error:", lastError);
    return "Error generating draft after exhausting all Gemini keys.";
}

/**
 * Extract keywords from an article title/description to use in Giphy/Unsplash links.
 */
async function extractKeywords(text) {
    const prompt = `Extract 1 or 2 main keywords from the following text that would be good for searching images or GIFs (like "AI", "Apple", "Programming"). Return ONLY the keywords separated by a space, nothing else.\nText: ${text}`;
    
    const keys = getApiKeys();
    if (keys.length === 0) return "technology";

    for (let i = 0; i < keys.length; i++) {
        try {
            const genAI = new GoogleGenerativeAI(keys[i]);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim().toLowerCase();
        } catch (error) {
            // Keep trying next key
        }
    }
    
    return "technology"; // Fallback
}

module.exports = {
    generatePost,
    extractKeywords
};
