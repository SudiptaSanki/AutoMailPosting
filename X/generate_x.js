const { generateGroqPost } = require('../groq');

async function generateXDraft(article) {
    const prompt = `
You are a top tech influencer on X (Twitter).
Write a punchy, highly engaging tweet about this article:
Title: ${article.title}
Source: ${article.source}
Context: ${article.description || article.contentSnippet || "A top trending tech article."}

Format guidelines:
- Must be under 280 characters total.
- Grab attention immediately.
- Use 1-2 emojis maximum.
- Do NOT use hashtags (they look spammy on X now).
- End with a strong statement or brief question.
    `;
    
    return await generateGroqPost(prompt);
}

module.exports = { generateXDraft };
