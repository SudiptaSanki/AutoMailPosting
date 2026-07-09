const { generatePost } = require('../gemini');

async function generateInstagramDraft(article, currentContext) {
    const prompt = `
You are a highly visual tech influencer on Instagram.
Design 5 distinct concepts for an Instagram Carousel (3-5 slides) and write a caption based on this article:
Title: ${article.title}
Source: ${article.source}
Context: ${article.description || article.contentSnippet || "A top trending tech article."}
Time Context: ${currentContext}

Format guidelines for EACH of the 5 options:
- Option 1: "Top 3 Tools/Tips" style carousel.
- Option 2: "Myth vs Reality" style carousel.
- Option 3: Step-by-step tutorial carousel.
- Option 4: Breaking news / Tech update carousel.
- Option 5: "Day in the life" / Relatable developer carousel.
- Include Slide 1 (Hook), Slide 2-4 (Key takeaways), Slide 5 (Call to action).
- Caption: Engaging text with emojis, asking a question, and 5-10 relevant hashtags.
    `;
    
    return await generatePost(prompt);
}

module.exports = { generateInstagramDraft };
