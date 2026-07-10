require('dotenv').config();
const Groq = require('groq-sdk');

// Helper to get array of keys
function getApiKeys() {
    const keysStr = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
    return keysStr.split(',').map(k => k.trim()).filter(k => k.length > 0);
}

/**
 * Generate a response from Groq based on a prompt.
 * Using LLaMA 3.3 70B for fast, punchy responses.
 * Automatically falls back to the next API key if one fails.
 */
async function generateGroqPost(prompt) {
    const keys = getApiKeys();
    
    if (keys.length === 0) {
        console.error("No Groq API keys found in environment.");
        return "Error: No Groq API keys configured.";
    }

    let lastError = null;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        try {
            const groq = new Groq({ apiKey: key });
            const chatCompletion = await groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.7,
                max_tokens: 500,
            });
            
            return chatCompletion.choices[0]?.message?.content || "Error generating draft.";
        } catch (error) {
            console.warn(`[Groq] Key ${i + 1} failed. Moving to next key... (${error.message})`);
            lastError = error;
        }
    }

    console.error("All Groq API keys exhausted. Last error:", lastError);
    return "Error generating draft after exhausting all Groq keys.";
}

module.exports = {
    generateGroqPost
};
