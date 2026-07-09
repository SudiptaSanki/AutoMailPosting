const axios = require('axios');
const Parser = require('rss-parser');
const parser = new Parser();

// Fetch Top Story from HackerNews
async function fetchHackerNews() {
    try {
        const topStoriesRes = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
        const topStoryId = topStoriesRes.data[0];
        const storyRes = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${topStoryId}.json`);
        
        return {
            source: 'HackerNews',
            title: storyRes.data.title,
            url: storyRes.data.url,
            score: storyRes.data.score
        };
    } catch (error) {
        console.error("Error fetching HackerNews:", error);
        return null;
    }
}

// Fetch Top Trending Article from Dev.to
async function fetchDevTo() {
    try {
        const res = await axios.get('https://dev.to/api/articles?state=rising&per_page=1');
        const article = res.data[0];
        
        return {
            source: 'Dev.to',
            title: article.title,
            url: article.url,
            description: article.description,
            tags: article.tag_list
        };
    } catch (error) {
        console.error("Error fetching Dev.to:", error);
        return null;
    }
}

// Fetch Top Post from Reddit r/technology via RSS
async function fetchReddit() {
    try {
        const feed = await parser.parseURL('https://www.reddit.com/r/technology/top/.rss?t=day');
        const post = feed.items[0];
        
        return {
            source: 'Reddit',
            title: post.title,
            url: post.link,
            contentSnippet: post.contentSnippet
        };
    } catch (error) {
        console.error("Error fetching Reddit:", error);
        return null;
    }
}

async function fetchGitHubTrending() {
    try {
        // Fetch top starred repo created in the last 7 days
        const date = new Date();
        date.setDate(date.getDate() - 7);
        const dateString = date.toISOString().split('T')[0];
        
        const res = await axios.get(`https://api.github.com/search/repositories?q=created:>${dateString}&sort=stars&order=desc`);
        const repo = res.data.items[0];
        
        return {
            source: 'GitHub Trending',
            title: repo.full_name,
            url: repo.html_url,
            description: repo.description,
        };
    } catch (error) {
        console.error("Error fetching GitHub Trending:", error);
        return null;
    }
}

async function fetchAllTopStories() {
    console.log("Fetching stories...");
    const [hn, devto, reddit, github] = await Promise.all([
        fetchHackerNews(),
        fetchDevTo(),
        fetchReddit(),
        fetchGitHubTrending()
    ]);
    
    return [hn, devto, reddit, github].filter(item => item !== null);
}

module.exports = {
    fetchHackerNews,
    fetchDevTo,
    fetchReddit,
    fetchGitHubTrending,
    fetchAllTopStories
};
