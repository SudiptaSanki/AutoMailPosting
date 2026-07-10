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
        <div style="font-family: Arial, sans-serif; background-color: #121212; color: #ffffff; padding: 20px;">
            <h1 style="color: #4CAF50;">🔥 Today's Tech Content Digest</h1>
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
        const [linkedIn, x, reddit, instagram, keywords] = await Promise.all([
            generateLinkedInDraft(story, currentContext),
            generateXDraft(story, currentContext),
            generateRedditDraft(story, currentContext),
            generateInstagramDraft(story, currentContext),
            extractKeywords(story.title + " " + (story.description || story.contentSnippet || ""))
        ]);

        addToHistory(story);

        const giphyLink = `https://giphy.com/search/${encodeURIComponent(keywords)}`;
        const unsplashLink = `https://unsplash.com/s/photos/${encodeURIComponent(keywords)}`;

        emailHtml += `
            <div style="background-color: #1e1e1e; padding: 20px; margin-top: 25px; border-radius: 8px; border: 1px solid #333;">
                <h2 style="color: #03A9F4; margin-top: 0;">📰 ${story.title} (${story.source})</h2>
                <p style="margin-bottom: 20px;">
                    🔗 <a href="${story.url}" style="color: #FF9800; text-decoration: none; font-weight: bold;">Read Original Article</a>
                </p>
                
                <h3 style="color: #4CAF50; border-bottom: 1px solid #333; padding-bottom: 5px; font-size: 16px;">👔 LinkedIn Drafts (5 Options)</h3>
                <div style="white-space: pre-wrap; background: #262626; padding: 15px; border-radius: 6px; font-family: system-ui, sans-serif; font-size: 14px; line-height: 1.6; color: #e0e0e0; margin-bottom: 20px;">${linkedIn}</div>
                
                <h3 style="color: #00BCD4; border-bottom: 1px solid #333; padding-bottom: 5px; font-size: 16px;">🐦 X (Twitter) Drafts (5 Options)</h3>
                <div style="white-space: pre-wrap; background: #262626; padding: 15px; border-radius: 6px; font-family: system-ui, sans-serif; font-size: 14px; line-height: 1.6; color: #e0e0e0; margin-bottom: 20px;">${x}</div>
                
                <h3 style="color: #FF5722; border-bottom: 1px solid #333; padding-bottom: 5px; font-size: 16px;">👽 Reddit Drafts (5 Options)</h3>
                <div style="white-space: pre-wrap; background: #262626; padding: 15px; border-radius: 6px; font-family: system-ui, sans-serif; font-size: 14px; line-height: 1.6; color: #e0e0e0; margin-bottom: 20px;">${reddit}</div>
                
                <h3 style="color: #E91E63; border-bottom: 1px solid #333; padding-bottom: 5px; font-size: 16px;">📸 Instagram Concepts (5 Options)</h3>
                <div style="white-space: pre-wrap; background: #262626; padding: 15px; border-radius: 6px; font-family: system-ui, sans-serif; font-size: 14px; line-height: 1.6; color: #e0e0e0; margin-bottom: 20px;">${instagram}</div>
                
                <div style="background-color: #262626; padding: 12px; border-radius: 6px; border-left: 4px solid #9C27B0; margin-top: 15px;">
                    🎨 <strong>Media Ideas:</strong> 
                    <a href="${unsplashLink}" style="color: #9C27B0; text-decoration: none; font-weight: bold; margin-left: 10px;">📸 Search Unsplash</a> | 
                    <a href="${giphyLink}" style="color: #9C27B0; text-decoration: none; font-weight: bold; margin-left: 5px;">🎬 Search Giphy</a>
                </div>
            </div>
        `;
    }

    // Add Shortcut
    emailHtml += `
        <div style="background-color: #2e2e2e; padding: 15px; margin-top: 30px; border-radius: 8px;">
            <h2 style="color: #FFEB3B;">⌨️ Productivity Shortcut of the Day</h2>
            <p><strong>${shortcut.shortcut}</strong> (${shortcut.tool})</p>
            <p>${shortcut.description}</p>
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
