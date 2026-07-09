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

        const giphyLink = \`https://giphy.com/search/\${encodeURIComponent(keywords)}\`;
        const unsplashLink = \`https://unsplash.com/s/photos/\${encodeURIComponent(keywords)}\`;

        emailHtml += \`
            <div style="background-color: #1e1e1e; padding: 15px; margin-top: 20px; border-radius: 8px;">
                <h2 style="color: #03A9F4;">\${story.title} (\${story.source})</h2>
                <p><a href="\${story.url}" style="color: #FF9800;">Read Original Article</a></p>
                
                <h3 style="color: #E91E63;">LinkedIn Drafts (5 Options):</h3>
                <pre style="white-space: pre-wrap; background: #000; padding: 10px; border-radius: 4px; font-family: monospace;">\${linkedIn}</pre>
                
                <h3 style="color: #E91E63;">X (Twitter) Drafts (5 Options):</h3>
                <pre style="white-space: pre-wrap; background: #000; padding: 10px; border-radius: 4px; font-family: monospace;">\${x}</pre>
                
                <h3 style="color: #E91E63;">Reddit Drafts (5 Options):</h3>
                <pre style="white-space: pre-wrap; background: #000; padding: 10px; border-radius: 4px; font-family: monospace;">\${reddit}</pre>
                
                <h3 style="color: #E91E63;">Instagram Concepts (5 Options):</h3>
                <pre style="white-space: pre-wrap; background: #000; padding: 10px; border-radius: 4px; font-family: monospace;">\${instagram}</pre>
                
                <p>🎨 <strong>Media Suggestions:</strong> 
                   <a href="\${giphyLink}" style="color: #9C27B0;">Giphy</a> | 
                   <a href="\${unsplashLink}" style="color: #9C27B0;">Unsplash</a>
                </p>
            </div>
        \`;
    }

    // Add Shortcut
    emailHtml += \`
        <div style="background-color: #2e2e2e; padding: 15px; margin-top: 30px; border-radius: 8px;">
            <h2 style="color: #FFEB3B;">⌨️ Productivity Shortcut of the Day</h2>
            <p><strong>\${shortcut.shortcut}</strong> (\${shortcut.tool})</p>
            <p>\${shortcut.description}</p>
        </div>
        </div>
    \`;

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
