// src/behaviors/compareShops.js
import { PatternDetectionSystem } from './patternDetection.js';
import { showNotification } from './notifications.js';
import { updateAnalytics } from './analytics.js';

export async function compareShops(shop1Text, shop2Text) {
    try {
        // Analyse des boutiques avec le nouveau système
        console.log('Analyzing shop1:', shop1Text);
        const detector1 = new PatternDetectionSystem({ text: shop1Text });
        const analysis1 = await detector1.analyzeAndFormat();
        console.log('Shop1 analysis result:', analysis1);

        console.log('Analyzing shop2:', shop2Text);
        const detector2 = new PatternDetectionSystem({ text: shop2Text });
        const analysis2 = await detector2.analyzeAndFormat();
        console.log('Shop2 analysis result:', analysis2);

        const comparisonData = {
            shop1: analysis1.data,
            shop2: analysis2.data,
            comparison: generateComparisonMetrics(analysis1.data, analysis2.data)
        };

        updateAnalytics('shops_comparison', comparisonData);
        return comparisonData;
    } catch (error) {
        console.error('Detailed error:', error);
        showNotification('Erreur lors de la comparaison des boutiques', 'error');
        throw error;
    }
}

// Le reste des fonctions reste identique...
function generateComparisonMetrics(shop1, shop2) {
    return {
        followers: compareMetric(shop1.profile.followers, shop2.profile.followers),
        rating: compareMetric(shop1.profile.rating, shop2.profile.rating),
        totalRatings: compareMetric(shop1.profile.totalRatings, shop2.profile.totalRatings),
        averagePrice: compareMetric(shop1.metrics.averagePrice, shop2.metrics.averagePrice),
        totalItems: compareMetric(shop1.metrics.totalItems, shop2.metrics.totalItems),
        itemsSold: compareMetric(shop1.metrics.itemsSold, shop2.metrics.itemsSold),
        conversionRate: compareMetric(shop1.metrics.conversionRate, shop2.metrics.conversionRate),
        totalViews: compareMetric(shop1.metrics.totalViews, shop2.metrics.totalViews),
        totalFavorites: compareMetric(shop1.metrics.totalFavorites, shop2.metrics.totalFavorites),
        salesVelocity: compareMetric(shop1.metrics.salesVelocity, shop2.metrics.salesVelocity),
        revenuePerItem: compareMetric(
            shop1.metrics.revenuePerItem || 0,
            shop2.metrics.revenuePerItem || 0
        ),
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
