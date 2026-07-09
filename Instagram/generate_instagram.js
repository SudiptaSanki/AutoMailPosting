const { generatePost } = require('../gemini');

async function generateInstagramDraft(article) {
    const prompt = `
You are a highly visual tech influencer on Instagram.
Design the concept for an Instagram Carousel (3-5 slides) and write a caption based on this article:
Title: ${article.title}
Source: ${article.source}
Context: ${article.description || article.contentSnippet || "A top trending tech article."}

Format guidelines:
- Slide 1: Hook / Title concept.
- Slide 2-4: Key takeaways (short text for the image).
- Slide 5: Call to action (Save for later, follow, etc.).
- Caption: Engaging text with emojis, asking a question, and 5-10 relevant hashtags.
    `;
    
    return await generatePost(prompt);
}

module.exports = { generateInstagramDraft };
