// Profile parser module
import { updateAnalytics } from './analytics.js';
import { showNotification } from './notifications.js';

export function initProfileParser() {
    const analyzeButton = document.getElementById('analyze-shop');
    if (analyzeButton) {
        analyzeButton.addEventListener('click', handleProfileAnalysis);
    }
}

export function parseProfile(text) {
    const data = {
        shopName: extractShopName(text),
        stats: extractStats(text),
        sales: extractSales(text),
        items: extractItems(text),
        ratings: extractRatings(text),
        location: extractLocation(text)
    };

    return calculateMetrics(data);
}

function handleProfileAnalysis() {
    const input = document.getElementById('shop-input');
    const text = input.value.trim();

    if (!text) {
        showNotification('Veuillez coller le contenu du profil', 'error');
        return;
    }

    try {
        const data = parseProfile(text);
        updateAnalytics('profile_analysis', data);
        displayResults(data);
    } catch (error) {
        console.error('Profile parsing error:', error);
        showNotification('Erreur lors de l\'analyse du profil', 'error');
    }
}

function extractShopName(text) {
    const match = text.match(/^([^\n]+)/);
    return match ? match[1].trim() : '';
}

function extractStats(text) {
    const stats = {
        followers: 0,
        following: 0
    };

    const followersMatch = text.match(/(\d+)\s*Abonné/);
    const followingMatch = text.match(/(\d+)\s*Abonnement/);

    if (followersMatch) stats.followers = parseInt(followersMatch[1]);
    if (followingMatch) stats.following = parseInt(followingMatch[1]);

    return stats;
}

function extractSales(text) {
    const sales = {
        total: 0,
        byCountry: {},
        byDate: {}
    };

    // Extract total sales
    const salesMatch = text.match(/Évaluations des membres \((\d+)\)/);
    if (salesMatch) sales.total = parseInt(salesMatch[1]);

    // Extract sales by country and date
    const evaluationPattern = /il y a (\d+) (jour|mois|an)[s]?.*?(merci|thank you|grazie|danke|gracias)/gi;
    let match;

    while ((match = evaluationPattern.exec(text)) !== null) {
        const timeAgo = parseInt(match[1]);
        const unit = match[2];
        const language = match[3].toLowerCase();

        // Add to country stats
        const country = getCountryFromLanguage(language);
        sales.byCountry[country] = (sales.byCountry[country] || 0) + 1;

        // Add to date stats
        const date = calculateDate(timeAgo, unit);
        const dateStr = date.toISOString().split('T')[0];
        sales.byDate[dateStr] = (sales.byDate[dateStr] || 0) + 1;
    }

    return sales;
}

function calculateMetrics(data) {
    // Add calculated metrics
    data.metrics = {
        avgPrice: calculateAveragePrice(data.items),
        salesVelocity: calculateSalesVelocity(data.sales),
        engagementRate: calculateEngagementRate(data.stats, data.sales),
        qualityScore: calculateQualityScore(data)
    };

    return data;
}

function displayResults(data) {
    // Implementation of results display
    // This will be handled by the UI manager
}
