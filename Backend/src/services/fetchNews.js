require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.GOOGLE_NEWS-API-KeyboardEvent;
const BASE_URL = "https://newsapi.org/v2/everything?q=";

async function fetchRealNews(query) {
    try {
        const response = await axios.get(`${BASE_URL}${query}apiKey=${API_KEY}`);
        return response.data.articles.map(article => ({
            title: article.title,
            description: article.description,
            url: article.url
        }));
    } catch (error) {
        console.error("❌ Error fetching news:", error);
        return [];
    }
}

module.exports = { fetchRealNews };