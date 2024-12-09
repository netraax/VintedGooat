// src/behaviors/compareShops.js
import { analyzeProfile } from './profileParser.js';
import { showNotification } from './notifications.js';
import { updateAnalytics } from './analytics.js';

export function compareShops(shop1Text, shop2Text) {
    try {
        const analysis1 = analyzeProfile(shop1Text);
        const analysis2 = analyzeProfile(shop2Text);

        const comparisonData = {
            shop1: analysis1,
            shop2: analysis2,
            comparison: generateComparisonMetrics(analysis1, analysis2)
        };

        updateAnalytics('shops_comparison', comparisonData);
        return comparisonData;
    } catch (error) {
        console.error('Erreur lors de la comparaison:', error);
        showNotification('Erreur lors de la comparaison des boutiques', 'error');
        throw error;
    }
}

function generateComparisonMetrics(shop1, shop2) {
    return {
        // Métriques de base
        followers: compareMetric(shop1.profile.followers, shop2.profile.followers),
        rating: compareMetric(shop1.profile.rating, shop2.profile.rating),
        totalRatings: compareMetric(shop1.profile.totalRatings, shop2.profile.totalRatings),

        // Métriques des articles
        averagePrice: compareMetric(shop1.metrics.averagePrice, shop2.metrics.averagePrice),
        totalItems: compareMetric(shop1.metrics.totalItems, shop2.metrics.totalItems),
        itemsSold: compareMetric(shop1.metrics.itemsSold, shop2.metrics.itemsSold),
        
        // Métriques de performance
        conversionRate: compareMetric(shop1.metrics.conversionRate, shop2.metrics.conversionRate),
        totalViews: compareMetric(shop1.metrics.totalViews, shop2.metrics.totalViews),
        totalFavorites: compareMetric(shop1.metrics.totalFavorites, shop2.metrics.totalFavorites),
        salesVelocity: compareMetric(shop1.metrics.salesVelocity, shop2.metrics.salesVelocity),
        
        // Métriques financières
        revenuePerItem: compareMetric(
            shop1.metrics.revenuePerItem || 0,
            shop2.metrics.revenuePerItem || 0
        ),

        // Analyse des marques
        brandOverlap: analyzeBrandOverlap(shop1.metrics.topBrands, shop2.metrics.topBrands)
    };
}

function compareMetric(val1, val2) {
    return {
        difference: Number((val1 - val2).toFixed(2)),
        percentage: calculatePercentageDiff(val1, val2),
        shop1Value: val1,
        shop2Value: val2
    };
}

function calculatePercentageDiff(val1, val2) {
    if (val2 === 0) return 0;
    return Number(((val1 - val2) / val2 * 100).toFixed(2));
}

function analyzeBrandOverlap(brands1 = {}, brands2 = {}) {
    const commonBrands = new Set();
    const uniqueBrands1 = new Set();
    const uniqueBrands2 = new Set();

    Object.keys(brands1).forEach(brand => {
        if (brand in brands2) {
            commonBrands.add(brand);
        } else {
            uniqueBrands1.add(brand);
        }
    });

    Object.keys(brands2).forEach(brand => {
        if (!(brand in brands1)) {
            uniqueBrands2.add(brand);
        }
    });

    return {
        commonBrands: Array.from(commonBrands),
        uniqueBrands1: Array.from(uniqueBrands1),
        uniqueBrands2: Array.from(uniqueBrands2),
        totalCommon: commonBrands.size,
        totalUnique1: uniqueBrands1.size,
        totalUnique2: uniqueBrands2.size
    };
}
