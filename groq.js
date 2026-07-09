require('dotenv').config();
const Groq = require('groq-sdk');

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

/**
 * Generate a response from Groq based on a prompt.
 * Using LLaMA 3 70B for fast, punchy responses.
 */
async function generateGroqPost(prompt) {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama3-70b-8192',
            temperature: 0.7,
            max_tokens: 500,
        });
        
        return chatCompletion.choices[0]?.message?.content || "Error generating draft.";
    } catch (error) {
        console.error("Error generating content with Groq:", error);
        return "Error generating draft with Groq.";
    }
}

module.exports = {
    generateGroqPost
};
