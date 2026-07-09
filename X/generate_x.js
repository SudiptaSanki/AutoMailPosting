const { generateGroqPost } = require('../groq');

async function generateXDraft(article, currentContext) {
    const prompt = `
You are a top tech influencer on X (Twitter).
Write 5 distinct, punchy, highly engaging tweet options about this article:
Title: ${article.title}
Source: ${article.source}
Context: ${article.description || article.contentSnippet || "A top trending tech article."}
Time Context: ${currentContext}

Format guidelines for EACH of the 5 options:
- Option 1: Controversial/Hot Take
- Option 2: Educational / Insightful
- Option 3: Humorous / Meme style
- Option 4: Question to the Audience
- Option 5: Stat-heavy or analytical
- Must be under 280 characters total per tweet.
- Grab attention immediately.
- Use 1-2 emojis maximum per tweet.
- Do NOT use hashtags (they look spammy on X now).
    `;
    
    return await generateGroqPost(prompt);
}

module.exports = { generateXDraft };
