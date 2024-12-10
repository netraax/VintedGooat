// src/behaviors/metrics/basicMetrics.js
import { extractProfileInfo } from '../profileParser.js';
import { extractSalesInfo, extractFinancials } from '../transactionParser.js';

export function calculateBasicMetrics(data) {
    const {
        profile,
        sales,
        transactions,
        items
    } = data;

    return {
        estimatedRevenue: calculateEstimatedRevenue(transactions),
        salesFrequency: calculateSalesFrequency(transactions, profile.totalRatings),
        categoryDistribution: calculateSalesByCategory(transactions),
        averageOrderValue: calculateAverageOrderValue(transactions, profile.totalRatings),
        satisfactionRate: calculateSatisfactionRate(profile)
    };
}

function calculateEstimatedRevenue(transactions) {
    const salesTransactions = transactions.filter(t => t.type === 'Vente');
    return {
        total: salesTransactions.reduce((sum, transaction) => {
            return sum + parseFloat(transaction.amount.replace(',', '.'));
        }, 0),
        lastMonth: calculateRevenueForPeriod(salesTransactions, 30),
        lastWeek: calculateRevenueForPeriod(salesTransactions, 7)
    };
}

function calculateSalesFrequency(transactions, totalSales) {
    const salesDates = transactions
        .filter(t => t.type === 'Vente')
        .map(t => new Date(t.date));

    if (salesDates.length > 0) {
        const oldestDate = new Date(Math.min(...salesDates));
        const newestDate = new Date(Math.max(...salesDates));
        const daysDifference = (newestDate - oldestDate) / (1000 * 60 * 60 * 24);

        return {
            daily: totalSales / daysDifference,
            weekly: (totalSales / daysDifference) * 7,
            monthly: (totalSales / daysDifference) * 30
        };
    }

    return {
        daily: 0,
        weekly: 0,
        monthly: 0
    };
}

function calculateSalesByCategory(transactions) {
    const categories = {};
    transactions
        .filter(t => t.type === 'Vente')
        .forEach(transaction => {
            const category = detectCategory(transaction.description);
            categories[category] = (categories[category] || 0) + 1;
        });

    const total = Object.values(categories).reduce((a, b) => a + b, 0);
    
    return Object.entries(categories).reduce((acc, [category, count]) => {
        acc[category] = {
            count,
            percentage: (count / total) * 100
        };
        return acc;
    }, {});
}

function calculateAverageOrderValue(transactions, totalSales) {
    const totalRevenue = transactions
        .filter(t => t.type === 'Vente')
        .reduce((sum, t) => sum + parseFloat(t.amount.replace(',', '.')), 0);

    return totalRevenue / totalSales;
}

function calculateSatisfactionRate(profile) {
    return {
        rating: profile.rating,
        percentage: (profile.rating / 5) * 100,
        totalRatings: profile.totalRatings,
        memberRatings: profile.memberRatings,
        autoRatings: profile.autoRatings
    };
}

function calculateRevenueForPeriod(transactions, days) {
    const now = new Date();
    const periodStart = new Date(now - days * 24 * 60 * 60 * 1000);
    
    return transactions
        .filter(t => new Date(t.date) >= periodStart)
        .reduce((sum, t) => sum + parseFloat(t.amount.replace(',', '.')), 0);
}

function detectCategory(description) {
    const categories = {
        'Stickers': /sticker|autocollant/i,
        'Vêtements': /veste|pull|débardeur|robe/i,
        'Accessoires': /accessoire|décoration|porte-clés/i,
        'Auto-Moto': /porsche|bmw|yamaha|honda|kawasaki/i
    };

    for (const [category, pattern] of Object.entries(categories)) {
        if (pattern.test(description)) return category;
    }
    return 'Autres';
}