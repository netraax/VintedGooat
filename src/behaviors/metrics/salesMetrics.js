// src/behaviors/metrics/salesMetrics.js
import { extractSalesInfo, extractFinancials } from '../transactionParser.js';

export function calculateSalesMetrics(data) {
    const {
        transactions,
        profile,
        items
    } = data;

    return {
        salesGrowth: calculateSalesGrowth(transactions),
        bestSelling: {
            items: findBestSellingItems(transactions),
            brands: findBestSellingBrands(transactions)
        },
        distribution: getSalesDistribution(transactions),
        performance: calculateSalesPerformance(transactions, items)
    };
}

// 6. Croissance des ventes
function calculateSalesGrowth(transactions) {
    const periods = [30, 60, 90]; // Jours pour analyse
    const growthRates = {};

    periods.forEach(period => {
        const now = new Date();
        const currentPeriodSales = transactions.filter(t => 
            t.type === 'Vente' && 
            (now - new Date(t.date)) <= period * 24 * 60 * 60 * 1000
        ).length;

        const previousPeriodSales = transactions.filter(t => 
            t.type === 'Vente' && 
            (now - new Date(t.date)) <= 2 * period * 24 * 60 * 60 * 1000 &&
            (now - new Date(t.date)) > period * 24 * 60 * 60 * 1000
        ).length;

        growthRates[`${period}days`] = {
            current: currentPeriodSales,
            previous: previousPeriodSales,
            growth: previousPeriodSales > 0 ? 
                ((currentPeriodSales - previousPeriodSales) / previousPeriodSales) * 100 : 0
        };
    });

    return growthRates;
}

// 7. Articles les plus vendus
function findBestSellingItems(transactions) {
    const itemCounts = {};
    const itemAmounts = {};

    transactions
        .filter(t => t.type === 'Vente')
        .forEach(transaction => {
            const itemName = transaction.description;
            const amount = parseFloat(transaction.amount.replace(',', '.'));
            
            itemCounts[itemName] = (itemCounts[itemName] || 0) + 1;
            itemAmounts[itemName] = (itemAmounts[itemName] || 0) + amount;
        });

    // Trier par nombre de ventes et par montant
    const byQuantity = Object.entries(itemCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({
            name,
            count,
            totalRevenue: itemAmounts[name]
        }));

    const byRevenue = Object.entries(itemAmounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, revenue]) => ({
            name,
            count: itemCounts[name],
            totalRevenue: revenue
        }));

    return {
        byQuantity,
        byRevenue
    };
}

// 8. Marques les plus vendues
function findBestSellingBrands(transactions) {
    const brandStats = {};

    transactions
        .filter(t => t.type === 'Vente')
        .forEach(transaction => {
            const brand = extractBrandFromDescription(transaction.description);
            if (brand) {
                if (!brandStats[brand]) {
                    brandStats[brand] = {
                        count: 0,
                        totalRevenue: 0,
                        averagePrice: 0
                    };
                }
                const amount = parseFloat(transaction.amount.replace(',', '.'));
                brandStats[brand].count++;
                brandStats[brand].totalRevenue += amount;
            }
        });

    // Calculer les moyennes et trier
    Object.values(brandStats).forEach(stats => {
        stats.averagePrice = stats.totalRevenue / stats.count;
    });

    return Object.entries(brandStats)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 10)
        .reduce((acc, [brand, stats]) => {
            acc[brand] = stats;
            return acc;
        }, {});
}

// 9. Distribution des ventes
function getSalesDistribution(transactions) {
    const distributions = {
        daily: {},
        monthly: {},
        yearly: {}
    };

    transactions
        .filter(t => t.type === 'Vente')
        .forEach(transaction => {
            const date = new Date(transaction.date);
            const amount = parseFloat(transaction.amount.replace(',', '.'));

            // Format des clés pour chaque période
            const dailyKey = date.toISOString().split('T')[0];
            const monthlyKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const yearlyKey = date.getFullYear().toString();

            // Initialisation des objets si nécessaire
            ['daily', 'monthly', 'yearly'].forEach(period => {
                const key = period === 'daily' ? dailyKey : 
                           period === 'monthly' ? monthlyKey : yearlyKey;
                
                if (!distributions[period][key]) {
                    distributions[period][key] = {
                        count: 0,
                        revenue: 0,
                        averageValue: 0
                    };
                }
            });

            // Mise à jour des statistiques
            [
                [distributions.daily, dailyKey],
                [distributions.monthly, monthlyKey],
                [distributions.yearly, yearlyKey]
            ].forEach(([dist, key]) => {
                dist[key].count++;
                dist[key].revenue += amount;
                dist[key].averageValue = dist[key].revenue / dist[key].count;
            });
        });

    return distributions;
}

// Fonction utilitaire pour extraire la marque
function extractBrandFromDescription(description) {
    const brandMatch = description.match(/marque\s*:\s*([^,\n]+)/i);
    return brandMatch ? brandMatch[1].trim() : null;
}

// Fonction pour calculer les performances de vente
function calculateSalesPerformance(transactions, items) {
    const totalItems = items.length;
    const soldItems = transactions.filter(t => t.type === 'Vente').length;
    
    return {
        conversionRate: (soldItems / totalItems) * 100,
        averageDaysToSell: calculateAverageDaysToSell(transactions),
        performanceScore: calculatePerformanceScore(transactions, items)
    };
}

function calculateAverageDaysToSell(transactions) {
    const salesDates = transactions
        .filter(t => t.type === 'Vente')
        .map(t => new Date(t.date))
        .sort((a, b) => a - b);

    if (salesDates.length < 2) return 0;

    const totalDays = (salesDates[salesDates.length - 1] - salesDates[0]) / (1000 * 60 * 60 * 24);
    return totalDays / salesDates.length;
}

function calculatePerformanceScore(transactions, items) {
    const soldItems = transactions.filter(t => t.type === 'Vente').length;
    const conversionRate = (soldItems / items.length) * 100;
    const averageDaysToSell = calculateAverageDaysToSell(transactions);
    
    // Score basé sur la conversion et la vitesse de vente
    const conversionScore = Math.min(conversionRate, 100);
    const speedScore = Math.max(0, 100 - (averageDaysToSell * 2));
    
    return (conversionScore * 0.6) + (speedScore * 0.4);
}
