// src/behaviors/metrics/engagementMetrics.js
import { extractProfileInfo } from '../profileParser.js';

export function calculateEngagementMetrics(data) {
    try {
        if (!data) return {};

        const {
            profile = {},
            sales = { recent: [], byCountry: {} },
            transactions = [],
            items = []
        } = data;

        return {
            engagement: calculateEngagementRates(profile, sales),
            followerMetrics: calculateFollowerMetrics(profile, sales, transactions),
            productMetrics: calculateProductMetrics(items, sales),
            locationMetrics: calculateSalesByLocation(sales, profile)
        };
    } catch (error) {
        console.error('Erreur dans calculateEngagementMetrics:', error);
        return {};
    }
}

// 10. Taux d'engagement
function calculateEngagementRates(profile = {}, sales = { recent: [] }) {
    try {
        const followers = profile.followers || 1;
        const totalSales = profile.totalRatings || 0;

        return {
            overall: (totalSales / followers) * 100,
            weekly: calculateWeeklyEngagement(sales, followers),
            monthly: calculateMonthlyEngagement(sales, followers)
        };
    } catch (error) {
        console.error('Erreur dans calculateEngagementRates:', error);
        return { overall: 0, weekly: 0, monthly: 0 };
    }
}

// 11+12. Métriques liées aux followers
function calculateFollowerMetrics(profile = {}, sales = { recent: [] }, transactions = []) {
    try {
        const followers = profile.followers || 1;
        const totalSales = profile.totalRatings || 0;
        const estimatedRevenue = calculateEstimatedRevenue(transactions);

        return {
            conversionRate: {
                percentage: (totalSales / followers) * 100,
                totalBuyers: totalSales,
                totalFollowers: followers
            },
            revenuePerFollower: {
                amount: estimatedRevenue / followers,
                total: estimatedRevenue
            },
            engagement: {
                daily: followers / 30,
                monthly: followers
            }
        };
    } catch (error) {
        console.error('Erreur dans calculateFollowerMetrics:', error);
        return {
            conversionRate: { percentage: 0, totalBuyers: 0, totalFollowers: 0 },
            revenuePerFollower: { amount: 0, total: 0 },
            engagement: { daily: 0, monthly: 0 }
        };
    }
}

// 13+14. Métriques liées aux produits
function calculateProductMetrics(items = [], sales = { recent: [] }) {
    try {
        const totalItems = items.length;
        const soldItems = items.filter(item => item?.isSold).length;

        return {
            turnoverRate: {
                percentage: (soldItems / totalItems) * 100 || 0,
                total: soldItems,
                available: totalItems
            },
            popularity: calculateProductPopularity(items),
            performance: {
                averageDaysListed: calculateAverageDaysListed(items),
                successRate: (soldItems / totalItems) * 100 || 0
            }
        };
    } catch (error) {
        console.error('Erreur dans calculateProductMetrics:', error);
        return {
            turnoverRate: { percentage: 0, total: 0, available: 0 },
            popularity: {},
            performance: { averageDaysListed: 0, successRate: 0 }
        };
    }
}

// 15. Ventes par localisation
function calculateSalesByLocation(sales = { byCountry: {} }, profile = {}) {
    try {
        const locationData = {};
        const totalSales = profile.totalRatings || 1;

        Object.entries(sales.byCountry || {}).forEach(([country, count]) => {
            locationData[country] = {
                count: count || 0,
                percentage: ((count || 0) / totalSales) * 100
            };
        });

        return {
            distribution: locationData,
            mainMarket: findMainMarket(locationData),
            marketPenetration: calculateMarketPenetration(locationData, totalSales)
        };
    } catch (error) {
        console.error('Erreur dans calculateSalesByLocation:', error);
        return {
            distribution: {},
            mainMarket: null,
            marketPenetration: { mainMarkets: 0 }
        };
    }
}

// Fonctions utilitaires
function calculateWeeklyEngagement(sales = { recent: [] }, followers = 1) {
    try {
        const weeklySales = (sales.recent || []).filter(sale => 
            (sale?.unit?.includes('jour') && sale?.timeAgo <= 7) ||
            sale?.unit?.includes('heure')
        ).length;
        
        return (weeklySales / followers) * 100;
    } catch (error) {
        return 0;
    }
}

function calculateMonthlyEngagement(sales = { recent: [] }, followers = 1) {
    try {
        const monthlySales = (sales.recent || []).filter(sale => 
            (sale?.unit?.includes('jour') && sale?.timeAgo <= 30) ||
            (sale?.unit?.includes('semaine') && sale?.timeAgo <= 4) ||
            sale?.unit?.includes('heure')
        ).length;
        
        return (monthlySales / followers) * 100;
    } catch (error) {
        return 0;
    }
}

function calculateEstimatedRevenue(transactions = []) {
    try {
        return transactions
            .filter(t => t?.type === 'Vente')
            .reduce((sum, t) => sum + parseFloat(t?.amount?.replace(',', '.') || 0), 0);
    } catch (error) {
        return 0;
    }
}

function calculateProductPopularity(items = []) {
    try {
        const categories = items.reduce((acc, item) => {
            const category = item?.category || 'Autre';
            if (!acc[category]) {
                acc[category] = {
                    total: 0,
                    sold: 0,
                    views: 0,
                    favorites: 0
                };
            }
            acc[category].total++;
            if (item?.isSold) acc[category].sold++;
            acc[category].views += item?.views || 0;
            acc[category].favorites += item?.favorites || 0;
            return acc;
        }, {});

        Object.values(categories).forEach(cat => {
            cat.conversionRate = (cat.sold / cat.total) * 100 || 0;
            cat.engagementRate = ((cat.favorites + cat.views) / cat.total) / 100 || 0;
        });

        return categories;
    } catch (error) {
        return {};
    }
}

function findMainMarket(locationData = {}) {
    try {
        const entries = Object.entries(locationData);
        return entries.length ? entries.sort(([,a], [,b]) => b.count - a.count)[0] : null;
    } catch (error) {
        return null;
    }
}

function calculateMarketPenetration(locationData = {}, totalSales = 1) {
    try {
        return Object.values(locationData).reduce((acc, market) => {
            if (market?.count > (totalSales * 0.1)) {
                acc.mainMarkets++;
            }
            return acc;
        }, { mainMarkets: 0 });
    } catch (error) {
        return { mainMarkets: 0 };
    }
}

function calculateAverageDaysListed(items = []) {
    try {
        const soldItems = items.filter(item => item?.isSold);
        if (!soldItems.length) return 0;
        return soldItems.reduce((sum, item) => sum + 30, 0) / soldItems.length;
    } catch (error) {
        return 0;
    }
}
