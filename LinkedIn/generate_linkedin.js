const { generatePost } = require('../gemini');

async function generateLinkedInDraft(article, currentContext) {
    const prompt = `
You are an expert LinkedIn ghostwriter for a tech audience. 
Create 5 distinct, engaging LinkedIn post options based on this article:
Title: ${article.title}
Source: ${article.source}
Context: ${article.description || article.contentSnippet || "A top trending tech article."}
Time Context: ${currentContext}

Format guidelines for EACH of the 5 options:
- Option 1: Story-driven (focus on a personal anecdote or lesson)
- Option 2: Actionable Advice (focus on what the reader can do today)
- Option 3: Contrarian/Thought-Provoking (challenge the status quo)
- Option 4: Summary/Listicle (bullet points of key takeaways)
- Option 5: Future-focused (how this impacts the next 5 years)
- Include 3-4 relevant hashtags at the bottom of each.
- Maintain a professional yet conversational tone.
- CRITICAL: Do NOT use any Markdown formatting (no asterisks '**' for bolding, no '#' for headers, etc.) as the target platforms do not parse them.
- CRITICAL: Do NOT use LaTeX mathematical notation (like \\( ... \\) or $$). Use standard plain text representation.
- Use emojis and standard line breaks to format and structure the text beautifully.
    `;
    
    return await generatePost(prompt);
}

module.exports = { generateLinkedInDraft };
