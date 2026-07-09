const fs = require('fs');
const path = require('path');

const historyPath = path.join(__dirname, 'history.json');

function getHistory() {
    try {
        if (!fs.existsSync(historyPath)) {
            fs.writeFileSync(historyPath, JSON.stringify([]));
        }
        const data = fs.readFileSync(historyPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading history:", error);
        return [];
    }
}

function hasBeenPosted(url) {
    if (!url) return false;
    const history = getHistory();
    // Check if the URL was posted in the last 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    return history.some(entry => entry.url === url && entry.timestamp > thirtyDaysAgo);
}

function addToHistory(story) {
    if (!story || !story.url) return;
    const history = getHistory();
    history.push({
        url: story.url,
        title: story.title,
        source: story.source,
        timestamp: Date.now()
    });
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
}

module.exports = {
    hasBeenPosted,
    addToHistory
};
