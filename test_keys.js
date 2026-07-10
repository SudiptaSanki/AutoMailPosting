require('dotenv').config();
const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

async function testGroq(key) {
    if (!key) return;
    try {
        const groq = new Groq({ apiKey: key });
        await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'test' }],
            model: 'llama-3.3-70b-versatile'
        });
        console.log(`✅ Groq Key (${key.substring(0, 10)}...) is VALID and working with llama-3.3-70b-versatile!`);
    } catch (e) {
        console.log(`❌ Groq Key (${key.substring(0, 10)}...) is INVALID: ${e.message}`);
    }
}

async function testGemini(key) {
    if (!key) return;
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const response = await axios.get(url);
        const models = response.data.models;
        console.log(`✅ Gemini Key (${key.substring(0, 10)}...) is VALID! Found ${models.length} supported models.`);
        
        // Check if 2.5 is supported
        const has25 = models.some(m => m.name.includes('gemini-2.5'));
        if (has25) {
            console.log(`   🚀 Excellent! This key supports the brand new Gemini 2.5 models.`);
        } else {
            console.log(`   ℹ️ This key supports standard Gemini models (1.5). Make sure to update gemini.js to match your model version.`);
        }

    } catch (e) {
        console.log(`❌ Gemini Key (${key.substring(0, 10)}...) is INVALID: ${e.message}`);
    }
}

async function run() {
    console.log("=========================================");
    console.log("   API Key Diagnostic Tester  ");
    console.log("=========================================\n");

    const groqKeysStr = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
    const groqKeys = groqKeysStr.split(',').map(k => k.trim()).filter(k => k.length > 0);

    const geminiKeysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
    const geminiKeys = geminiKeysStr.split(',').map(k => k.trim()).filter(k => k.length > 0);

    if (groqKeys.length === 0 && geminiKeys.length === 0) {
        console.log("⚠️ No keys found! Please add GROQ_API_KEYS and GEMINI_API_KEYS to your .env file.");
        return;
    }

    console.log("--- Testing Groq Keys ---");
    if (groqKeys.length === 0) console.log("No Groq keys found in .env");
    for (const key of groqKeys) {
        await testGroq(key);
    }

    console.log("\n--- Testing Gemini Keys ---");
    if (geminiKeys.length === 0) console.log("No Gemini keys found in .env");
    for (const key of geminiKeys) {
        await testGemini(key);
    }
    
    console.log("\nDone!");
}

run();
