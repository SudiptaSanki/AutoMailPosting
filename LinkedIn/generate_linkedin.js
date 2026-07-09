const { generatePost } = require('../gemini');

async function generateLinkedInDraft(article) {
    const prompt = `
You are an expert LinkedIn ghostwriter for a tech audience. 
Create an engaging LinkedIn post based on this article:
Title: ${article.title}
Source: ${article.source}
Context: ${article.description || article.contentSnippet || "A top trending tech article."}

Format guidelines:
- Start with a strong hook.
- Use 2-3 bullet points for readability.
- Keep a professional yet conversational tone.
- End with a question to encourage comments.
- Include 3-4 relevant hashtags at the bottom.
    `;
    
    return await generatePost(prompt);
}

module.exports = { generateLinkedInDraft };
