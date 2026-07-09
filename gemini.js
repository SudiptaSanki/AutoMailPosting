require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Generate a response from Gemini based on a prompt.
 */
async function generatePost(prompt) {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating content with Gemini:", error);
        return "Error generating draft.";
    }
}

/**
 * Extract keywords from an article title/description to use in Giphy/Unsplash links.
 */
async function extractKeywords(text) {
    const prompt = `Extract 1 or 2 main keywords from the following text that would be good for searching images or GIFs (like "AI", "Apple", "Programming"). Return ONLY the keywords separated by a space, nothing else.\nText: ${text}`;
    
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim().toLowerCase();
    } catch (error) {
        return "technology"; // Fallback
    }
}

module.exports = {
    generatePost,
    extractKeywords
};
