const { generateGroqPost } = require('../groq');

async function generateRedditDraft(article) {
    const prompt = `
You are an active participant in tech subreddits like r/programming or r/webdev.
Write a title and body text for a Reddit post discussing this article:
Title: ${article.title}
Source: ${article.source}
Context: ${article.description || article.contentSnippet || "A top trending tech article."}

Format guidelines:
- The title should be intriguing but not clickbait.
- The body should summarize the core point and then ask the community for their opinions or experiences related to the topic.
- Use Markdown formatting for readability.
- Be conversational and authentic, redditors hate corporate-speak.
    `;
    
    return await generateGroqPost(prompt);
}

module.exports = { generateRedditDraft };
