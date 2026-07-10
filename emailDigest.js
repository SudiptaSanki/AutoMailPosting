require('dotenv').config();
const nodemailer = require('nodemailer');
const { fetchAllTopStories } = require('./fetchers');
const { extractKeywords } = require('./gemini');
const { generateLinkedInDraft } = require('./LinkedIn/generate_linkedin');
const { generateXDraft } = require('./X/generate_x');
const { generateRedditDraft } = require('./Reddit/generate_reddit');
const { generateInstagramDraft } = require('./Instagram/generate_instagram');
const { hasBeenPosted, addToHistory } = require('./history');
const shortcuts = require('./shortcuts.json');

function cleanLatex(text) {
    if (!text) return "";
    return text
        .replace(/\\\\\((.*?)\\\\\)/g, '$1') // Double escaped inline \\( ... \\)
        .replace(/\\\((.*?)\\\)/g, '$1')     // Single escaped inline \( ... \)
        .replace(/\\\\\[(.*?)\\\\\]/g, '$1') // Double escaped block \\[ ... \\]
        .replace(/\\\[(.*?)\\\]/g, '$1')     // Single escaped block \[ ... \]
        .replace(/\$\$(.*?)\$\$/g, '$1')     // Block $$ ... $$
        .replace(/\*\*/g, '');               // Safeguard: strip any leftover markdown bold stars
}

async function sendDigest() {
    console.log("Starting daily digest generation...");

    const stories = await fetchAllTopStories();
    
    if (stories.length === 0) {
        console.error("No stories fetched, aborting.");
        return;
    }

    // Get today's shortcut (cycle through based on date)
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const shortcut = shortcuts[dayOfYear % shortcuts.length];

    let emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #121212; color: #e0e0e0; padding: 20px; max-width: 600px; margin: 0 auto; line-height: 1.6;">
            <h1 style="color: #ffffff; border-bottom: 2px solid #333; padding-bottom: 10px; font-size: 22px; margin-top: 0;">📰 Tech Content Digest</h1>
    `;

    const today = new Date();
    const currentContext = `Current Date: ${today.toDateString()}. Ensure the posts feel timely and relevant to this week's tech trends.`;

    for (const story of stories) {
        if (hasBeenPosted(story.url)) {
            console.log(`Skipping duplicate/recently posted story: ${story.title} from ${story.source}`);
            continue;
        }
        
        console.log(`Processing story: ${story.title} from ${story.source}`);
        
        // Generate drafts
        let [linkedIn, x, reddit, instagram, keywords] = await Promise.all([
            generateLinkedInDraft(story, currentContext),
            generateXDraft(story, currentContext),
            generateRedditDraft(story, currentContext),
            generateInstagramDraft(story, currentContext),
            extractKeywords(story.title + " " + (story.description || story.contentSnippet || ""))
        ]);

        // Clean LaTeX and leftover Markdown bold stars from AI drafts
        linkedIn = cleanLatex(linkedIn);
        x = cleanLatex(x);
        reddit = cleanLatex(reddit);
        instagram = cleanLatex(instagram);

        addToHistory(story);

        const giphyLink = `https://giphy.com/search/${encodeURIComponent(keywords)}`;
        const unsplashLink = `https://unsplash.com/s/photos/${encodeURIComponent(keywords)}`;

        emailHtml += `
            <div style="background-color: #1c1c1c; padding: 20px; margin-top: 25px; border-radius: 8px; border: 1px solid #2d2d2d;">
                <h2 style="color: #ffffff; font-size: 18px; margin-top: 0; line-height: 1.4;">${story.title}</h2>
                <p style="margin-top: 5px; font-size: 13px; color: #888;">Source: ${story.source} | <a href="${story.url}" style="color: #03A9F4; text-decoration: none;">Read Article 🔗</a></p>
                
                <hr style="border: 0; border-top: 1px solid #2d2d2d; margin: 15px 0;" />

                <h3 style="color: #ffffff; font-size: 14px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">👔 LinkedIn Drafts</h3>
                <div style="white-space: pre-wrap; background: #121212; padding: 12px; border-radius: 6px; font-size: 14px; color: #cccccc; margin-bottom: 20px; border: 1px solid #2d2d2d;">${linkedIn}</div>
                
                <h3 style="color: #ffffff; font-size: 14px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">🐦 X (Twitter) Drafts</h3>
                <div style="white-space: pre-wrap; background: #121212; padding: 12px; border-radius: 6px; font-size: 14px; color: #cccccc; margin-bottom: 20px; border: 1px solid #2d2d2d;">${x}</div>
                
                <h3 style="color: #ffffff; font-size: 14px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">👽 Reddit Drafts</h3>
                <div style="white-space: pre-wrap; background: #121212; padding: 12px; border-radius: 6px; font-size: 14px; color: #cccccc; margin-bottom: 20px; border: 1px solid #2d2d2d;">${reddit}</div>
                
                <h3 style="color: #ffffff; font-size: 14px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">📸 Instagram Concepts</h3>
                <div style="white-space: pre-wrap; background: #121212; padding: 12px; border-radius: 6px; font-size: 14px; color: #cccccc; margin-bottom: 20px; border: 1px solid #2d2d2d;">${instagram}</div>
                
                <div style="background-color: #121212; padding: 12px; border-radius: 6px; border: 1px solid #2d2d2d; font-size: 13px; text-align: center;">
                    🎨 <strong>Media Ideas:</strong> 
                    <a href="${unsplashLink}" style="color: #03A9F4; text-decoration: none; margin: 0 10px;">Unsplash 📸</a> | 
                    <a href="${giphyLink}" style="color: #03A9F4; text-decoration: none; margin: 0 10px;">Giphy 🎬</a>
                </div>
            </div>
        `;
    }

    // Add Shortcut
    emailHtml += `
        <div style="background-color: #1c1c1c; padding: 20px; margin-top: 30px; border-radius: 8px; border: 1px solid #2d2d2d; text-align: center;">
            <h2 style="color: #ffffff; font-size: 16px; margin-top: 0; text-transform: uppercase; letter-spacing: 0.5px;">⌨️ Shortcut of the Day</h2>
            <p style="font-size: 15px; font-weight: bold; margin: 10px 0; color: #ffffff;">${shortcut.shortcut} (${shortcut.tool})</p>
            <p style="font-size: 13px; color: #888; margin: 0;">${shortcut.description}</p>
        </div>
        </div>
    `;

    // Send Email
    const mailTo = process.env.GMAIL_TO || process.env.GMAIL_USER;
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        let mailOptions = {
            from: process.env.GMAIL_USER,
            to: mailTo,
            subject: '🚀 Your Daily Tech Content Drafts',
            html: emailHtml
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Digest email sent successfully!');
        } catch (error) {
            console.error('Error sending email:', error);
        }
    } else {
        console.log("No email credentials found. Logging HTML output to console instead:");
        console.log("=========================================");
        // console.log(emailHtml);
        console.log("=========================================");
    }
}

sendDigest();
