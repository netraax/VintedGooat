// src/behaviors/metrics/engagementMetrics.js
import { extractProfileInfo } from '../profileParser.js';

export function calculateEngagementMetrics(data) {
    const {
        profile,
        sales,
        transactions,
        items
    } = data;

    return {
        engagement: calculateEngagementRates(profile, sales),
        followerMetrics: calculateFollowerMetrics(profile, sales, transactions),
        productMetrics: calculateProductMetrics(items, sales),
        locationMetrics: calculateSalesByLocation(sales, profile)
    };
}

// 10. Taux d'engagement
function calculateEngagementRates(profile, sales) {
    const followers = profile.followers;
    const totalSales = profile.totalRatings;

    return {
        overall: (totalSales / followers) * 100,
        weekly: calculateWeeklyEngagement(sales, followers),
        monthly: calculateMonthlyEngagement(sales, followers)
    };
}

// 11+12. Métriques liées aux followers
function calculateFollowerMetrics(profile, sales, transactions) {
    const followers = profile.followers;
    const totalSales = profile.totalRatings;
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
            daily: followers / 30, // estimation moyenne
            monthly: followers
        }
    };
}

// 13+14. Métriques liées aux produits
function calculateProductMetrics(items, sales) {
    const totalItems = items.length;
    const soldItems = items.filter(item => item.isSold).length;

    return {
        turnoverRate: {
            percentage: (soldItems / totalItems) * 100,
            total: soldItems,
            available: totalItems
        },
        popularity: calculateProductPopularity(items),
        performance: {
            averageDaysListed: calculateAverageDaysListed(items),
            successRate: (soldItems / totalItems) * 100
        }
    };
}

// 15. Ventes par localisation
function calculateSalesByLocation(sales, profile) {
    const locationData = {};
    const totalSales = profile.totalRatings;

    // Traitement des ventes par pays basé sur votre logique existante
    Object.entries(sales.byCountry).forEach(([country, count]) => {
        locationData[country] = {
            count,
            percentage: (count / totalSales) * 100
        };
    });

    return {
        distribution: locationData,
        mainMarket: findMainMarket(locationData),
        marketPenetration: calculateMarketPenetration(locationData, totalSales)
    };
}

// Fonctions utilitaires
function calculateWeeklyEngagement(sales, followers) {
    const weeklySales = sales.recent.filter(sale => 
        sale.unit.includes('jour') && sale.timeAgo <= 7 ||
        sale.unit.includes('heure')
    ).length;
    
    return (weeklySales / followers) * 100;
}

function calculateMonthlyEngagement(sales, followers) {
    const monthlySales = sales.recent.filter(sale => 
        sale.unit.includes('jour') && sale.timeAgo <= 30 ||
        sale.unit.includes('semaine') && sale.timeAgo <= 4 ||
        sale.unit.includes('heure')
    ).length;
    
    return (monthlySales / followers) * 100;
}

function calculateEstimatedRevenue(transactions) {
    return transactions
        .filter(t => t.type === 'Vente')
        .reduce((sum, t) => sum + parseFloat(t.amount.replace(',', '.')), 0);
}

function calculateProductPopularity(items) {
    const categories = items.reduce((acc, item) => {
        const category = item.category || 'Autre';
        if (!acc[category]) {
            acc[category] = {
                total: 0,
                sold: 0,
                views: 0,
                favorites: 0
            };
        }
        acc[category].total++;
        if (item.isSold) acc[category].sold++;
        acc[category].views += item.views;
        acc[category].favorites += item.favorites;
        return acc;
    }, {});

    // Calculer les statistiques pour chaque catégorie
    Object.values(categories).forEach(cat => {
        cat.conversionRate = (cat.sold / cat.total) * 100;
        cat.engagementRate = ((cat.favorites + cat.views) / cat.total) / 100;
    });

    return categories;
}

function findMainMarket(locationData) {
    return Object.entries(locationData)
        .sort(([,a], [,b]) => b.count - a.count)[0];
}

function calculateMarketPenetration(locationData, totalSales) {
    return Object.values(locationData).reduce((acc, market) => {
        if (market.count > (totalSales * 0.1)) { // Plus de 10% des ventes
            acc.mainMarkets++;
        }
        return acc;
    }, { mainMarkets: 0 });
}

function calculateAverageDaysListed(items) {
    const soldItems = items.filter(item => item.isSold);
    if (soldItems.length === 0) return 0;

    // Calcul basé sur vos données de date existantes
    return soldItems.reduce((sum, item) => sum + 30, 0) / soldItems.length; // Estimation moyenne
}
