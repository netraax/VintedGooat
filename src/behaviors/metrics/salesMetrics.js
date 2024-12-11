// src/behaviors/metrics/salesMetrics.js
import { extractSalesInfo, extractFinancials } from '../transactionParser.js';

export function calculateSalesMetrics(data) {
    try {
        if (!data) return {};

        const {
            transactions = [],
            profile = {},
            items = []
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
    } catch (error) {
        console.error('Erreur dans calculateSalesMetrics:', error);
        return {};
    }
}

// 6. Croissance des ventes
function calculateSalesGrowth(transactions = []) {
    try {
        const periods = [30, 60, 90];
        const growthRates = {};

        periods.forEach(period => {
            const now = new Date();
            const currentPeriodSales = transactions.filter(t => 
                t?.type === 'Vente' && 
                (now - new Date(t?.date)) <= period * 24 * 60 * 60 * 1000
            ).length;

            const previousPeriodSales = transactions.filter(t => 
                t?.type === 'Vente' && 
                (now - new Date(t?.date)) <= 2 * period * 24 * 60 * 60 * 1000 &&
                (now - new Date(t?.date)) > period * 24 * 60 * 60 * 1000
            ).length;

            growthRates[`${period}days`] = {
                current: currentPeriodSales,
                previous: previousPeriodSales,
                growth: previousPeriodSales > 0 ? 
                    ((currentPeriodSales - previousPeriodSales) / previousPeriodSales) * 100 : 0
            };
        });

        return growthRates;
    } catch (error) {
        console.error('Erreur dans calculateSalesGrowth:', error);
        return {};
    }
}

// 7. Articles les plus vendus
function findBestSellingItems(transactions = []) {
    try {
        const itemCounts = {};
        const itemAmounts = {};

        transactions
            .filter(t => t?.type === 'Vente')
            .forEach(transaction => {
                try {
                    const itemName = transaction?.description || 'Inconnu';
                    const amount = parseFloat(transaction?.amount?.replace(',', '.') || 0);
                    
                    itemCounts[itemName] = (itemCounts[itemName] || 0) + 1;
                    itemAmounts[itemName] = (itemAmounts[itemName] || 0) + amount;
                } catch (e) {
                    console.error('Erreur lors du traitement d\'une transaction:', e);
                }
            });

        return {
            byQuantity: Object.entries(itemCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([name, count]) => ({
                    name,
                    count,
                    totalRevenue: itemAmounts[name] || 0
                })),
            byRevenue: Object.entries(itemAmounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([name, revenue]) => ({
                    name,
                    count: itemCounts[name] || 0,
                    totalRevenue: revenue
                }))
        };
    } catch (error) {
        console.error('Erreur dans findBestSellingItems:', error);
        return { byQuantity: [], byRevenue: [] };
    }
}

// 8. Marques les plus vendues
function findBestSellingBrands(transactions = []) {
    try {
        const brandStats = {};

        transactions
            .filter(t => t?.type === 'Vente')
            .forEach(transaction => {
                const brand = extractBrandFromDescription(transaction?.description);
                if (brand) {
                    if (!brandStats[brand]) {
                        brandStats[brand] = {
                            count: 0,
                            totalRevenue: 0,
                            averagePrice: 0
                        };
                    }
                    const amount = parseFloat(transaction?.amount?.replace(',', '.') || 0);
                    brandStats[brand].count++;
                    brandStats[brand].totalRevenue += amount;
                }
            });

        Object.values(brandStats).forEach(stats => {
            stats.averagePrice = stats.count > 0 ? stats.totalRevenue / stats.count : 0;
        });

        return Object.entries(brandStats)
            .sort(([,a], [,b]) => b.count - a.count)
            .slice(0, 10)
            .reduce((acc, [brand, stats]) => {
                acc[brand] = stats;
                return acc;
            }, {});
    } catch (error) {
        console.error('Erreur dans findBestSellingBrands:', error);
        return {};
    }
}

// 9. Distribution des ventes
function getSalesDistribution(transactions = []) {
    try {
        const distributions = {
            daily: {},
            monthly: {},
            yearly: {}
        };

        transactions
            .filter(t => t?.type === 'Vente')
            .forEach(transaction => {
                try {
                    const date = new Date(transaction?.date);
                    if (isNaN(date.getTime())) return;

                    const amount = parseFloat(transaction?.amount?.replace(',', '.') || 0);
                    const dailyKey = date.toISOString().split('T')[0];
                    const monthlyKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    const yearlyKey = date.getFullYear().toString();

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

                    [
                        [distributions.daily, dailyKey],
                        [distributions.monthly, monthlyKey],
                        [distributions.yearly, yearlyKey]
                    ].forEach(([dist, key]) => {
                        dist[key].count++;
                        dist[key].revenue += amount;
                        dist[key].averageValue = dist[key].revenue / dist[key].count;
                    });
                } catch (e) {
                    console.error('Erreur lors du traitement d\'une transaction:', e);
                }
            });

        return distributions;
    } catch (error) {
        console.error('Erreur dans getSalesDistribution:', error);
        return { daily: {}, monthly: {}, yearly: {} };
    }
}

// Fonction utilitaire pour extraire la marque
function extractBrandFromDescription(description = '') {
    try {
        const brandMatch = description.match(/marque\s*:\s*([^,\n]+)/i);
        return brandMatch ? brandMatch[1].trim() : null;
    } catch (error) {
        return null;
    }
}

// Fonction pour calculer les performances de vente
function calculateSalesPerformance(transactions = [], items = []) {
    try {
        const totalItems = items.length || 1;
        const soldItems = transactions.filter(t => t?.type === 'Vente').length;
        
        return {
            conversionRate: (soldItems / totalItems) * 100,
            averageDaysToSell: calculateAverageDaysToSell(transactions),
            performanceScore: calculatePerformanceScore(transactions, items)
        };
    } catch (error) {
        console.error('Erreur dans calculateSalesPerformance:', error);
        return {
            conversionRate: 0,
            averageDaysToSell: 0,
            performanceScore: 0
        };
    }
}

function calculateAverageDaysToSell(transactions = []) {
    try {
        const salesDates = transactions
            .filter(t => t?.type === 'Vente')
            .map(t => new Date(t?.date))
            .filter(date => !isNaN(date.getTime()))
            .sort((a, b) => a - b);

        if (salesDates.length < 2) return 0;

        const totalDays = (salesDates[salesDates.length - 1] - salesDates[0]) / (1000 * 60 * 60 * 24);
        return totalDays / salesDates.length;
    } catch (error) {
        return 0;
    }
}

function calculatePerformanceScore(transactions = [], items = []) {
    try {
        const soldItems = transactions.filter(t => t?.type === 'Vente').length;
        const conversionRate = items.length ? (soldItems / items.length) * 100 : 0;
        const averageDaysToSell = calculateAverageDaysToSell(transactions);
        
        const conversionScore = Math.min(conversionRate, 100);
        const speedScore = Math.max(0, 100 - (averageDaysToSell * 2));
        
        return (conversionScore * 0.6) + (speedScore * 0.4);
    } catch (error) {
        return 0;
    }
}
