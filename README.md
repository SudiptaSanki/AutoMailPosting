# 🚀 AutoMail Posting (Social Media Automation System)

![Node.js](https://img.shields.io/badge/Node.js-20-green)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Automated-blue)
![AI Models](https://img.shields.io/badge/AI-Gemini%20%26%20Llama%203-purple)

A fully autonomous, multi-model tech content curation system that gathers top daily news, uses AI to write tailored drafts for different social media platforms, and delivers them directly to your email inbox.

## ✨ Features
*   **Deep Research:** Automatically scrapes the hottest topics from HackerNews, Reddit (`r/technology`), Dev.to, and GitHub Trending.
*   **Multi-Model AI Engine:** 
    *   Uses **Groq (Llama 3.3 70B)** for short, snappy content (X/Twitter and Reddit).
    *   Uses **Google Gemini** for structured, long-form content (LinkedIn posts and Instagram Carousel concepts).
*   **API Key Fallback:** Configure multiple API keys. If one runs out of quota, the script automatically fails-over to the next one to guarantee zero downtime.
*   **5 Options Per Story:** Generates 5 distinct angles (Hot Takes, Memes, Tutorials, etc.) for each piece of news.
*   **Duplicate Prevention:** A local `history.json` tracks what has been posted in the last 30 days to keep your feed fresh.
*   **Media Suggestions:** Automatically suggests relevant, copyright-free Giphy & Unsplash search queries.

---

## 🛠️ Tech Stack
*   **Core:** Node.js, Axios, RSS-Parser
*   **AI Integration:** `@google/generative-ai`, `groq-sdk`
*   **Delivery:** `nodemailer`
*   **Orchestration:** GitHub Actions (Cron Scheduler)

---

## ⚙️ Setup Guide (Run It Yourself)

To deploy this automation to run on autopilot, follow these steps:

### 1. Fork this Repository
Click the **Fork** button at the top right of this page to create a copy of this repository on your own GitHub account. Make sure it is set to **Private** to protect your email content.

### 2. Generate API Keys (Free)
You will need to gather free API keys from the following services:
*   **Groq API (Llama 3):** Get keys from [Groq Console](https://console.groq.com/keys). (You can create up to 2 for fallback).
*   **Google Gemini API:** Get keys from [Google AI Studio](https://aistudio.google.com/). (You can create up to 2 for fallback).
*   **Gmail App Password:** You cannot use your normal Gmail password. Go to your Google Account -> Security -> 2-Step Verification -> App Passwords. Generate a 16-letter App Password for "Mail".

### 3. Add GitHub Secrets
GitHub Actions uses Secrets to securely inject your passwords without exposing them in the code.
Go to your repository **Settings** > **Secrets and variables** > **Actions** > **New repository secret**. Add the following:

| Secret Name | Value Example |
| :--- | :--- |
| `GEMINI_API_KEYS` | `AIzaSyD...,AIzaSyB...` (Comma separated list) |
| `GROQ_API_KEYS` | `gsk_abc123...,gsk_xyz789...` (Comma separated list) |
| `GMAIL_USER` | `your_sender_email@gmail.com` |
| `GMAIL_PASS` | `abcd efgh ijkl mnop` (16-letter app password) |
| `GMAIL_TO` | `your_receiver_email@gmail.com` |

### 4. Enable GitHub Actions
Go to the **Actions** tab in your repository and click **"I understand my workflows, go ahead and enable them."**

🎉 **That's it!** The automation will now run silently in the background and deliver 5 drafts per story directly to your inbox every Wednesday and Saturday at 5:30 PM IST.

---

## 💻 Local Testing
If you want to run the script on your local machine:
1. Clone your repo.
2. Run `npm install`.
3. Create a `.env` file in the root directory and paste your variables like this:
```env
GEMINI_API_KEYS=key1,key2
GROQ_API_KEYS=key1,key2
GMAIL_USER=your_email
GMAIL_PASS=your_app_password
GMAIL_TO=receiver_email
```
4. Run `node emailDigest.js`.
