const { generateGroqPost } = require('../groq');

async function generateRedditDraft(article, currentContext) {
    const prompt = `
You are an active participant in tech subreddits like r/programming or r/webdev.
Write 5 distinct title and body text options for a Reddit post discussing this article:
Title: ${article.title}
Source: ${article.source}
Context: ${article.description || article.contentSnippet || "A top trending tech article."}
Time Context: ${currentContext}

Format guidelines for EACH of the 5 options:
- Option 1: Asking for opinions / "What do you guys think?"
- Option 2: Deep dive analysis / "Here's why this matters"
- Option 3: Beginner friendly / "Can someone explain this?"
- Option 4: Developer rant / "Am I the only one frustrated by this?"
- Option 5: Career focused / "How does this affect our jobs?"
- Use Markdown formatting.
- Be conversational and authentic, redditors hate corporate-speak.
    `;
    
    return await generateGroqPost(prompt);
}

module.exports = { generateRedditDraft };
