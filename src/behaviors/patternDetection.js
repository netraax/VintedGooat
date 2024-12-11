import { calculateBasicMetrics } from './metrics/basicMetrics.js';
import { calculateEngagementMetrics } from './metrics/engagementMetrics.js';
import { calculateSalesMetrics } from './metrics/salesMetrics.js';

const PATTERN_CONFIG = {
    THEME: {
        PRIMARY_COLOR: '#09B1BA',
        CHART_COLORS: ['#09B1BA', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
    },
    TIME_PERIODS: {
        DAILY: 1,
        WEEKLY: 7,
        MONTHLY: 30,
        QUARTERLY: 90
    },
    THRESHOLDS: {
        HIGH_ENGAGEMENT: 75,
        MODERATE_ENGAGEMENT: 50,
        LOW_ENGAGEMENT: 25,
        SALES_VELOCITY: 0.5
    },
    PATTERNS: {
        PROFILE: {
            shopName: /^([^
]+)(?=\nÀ propos|$)/m,
            followers: /(\d+)\s*Abonnés/,
            rating: /(\d+[.,]\d+)\s*\(/
        },
        ITEMS: {
            full: /([^,]+), prix : (\d+,\d+) €, marque : ([^,]+), taille : ([^\n]+)/g
        },
        SALES: {
            date: /il y a (\d+) (heure|heures|jour|jours|semaine|semaines|mois|an|ans)/g
        },
        FINANCIALS: {
            balance: /Solde (initial|final)\s*(\d+,\d+) €/g
        }
    }
};

export class PatternDetectionSystem {
    constructor(data = {}) {
        this.data = data;
        this.patterns = {
            sales: {},
            profile: {},
            items: {},
            financials: {}
        };
        this.thresholds = PATTERN_CONFIG.THRESHOLDS;
        this.chartColors = PATTERN_CONFIG.THEME.CHART_COLORS;
    }

    async analyze() {
        try {
            const baseData = await this.extractBaseData();
            const metrics = await this.calculateAllMetrics(baseData);
            return {
                ...baseData,
                metrics,
                patterns: this.patterns
            };
        } catch (error) {
            console.error('Erreur dans l\'analyse:', error);
            return this.patterns;
        }
    }

    async extractBaseData() {
        const text = this.data.text || '';
        return {
            profile: this.extractProfileInfo(text),
            items: this.extractItems(text),
            financials: this.extractFinancials(text)
        };
    }

    extractProfileInfo(text) {
        const info = {
            shopName: '',
            followers: 0,
            rating: 0
        };

        const shopNameMatch = text.match(PATTERN_CONFIG.PATTERNS.PROFILE.shopName);
        if (shopNameMatch) {
            info.shopName = shopNameMatch[1].trim();
        }

        const followersMatch = text.match(PATTERN_CONFIG.PATTERNS.PROFILE.followers);
        if (followersMatch) info.followers = parseInt(followersMatch[1]);

        const ratingMatch = text.match(PATTERN_CONFIG.PATTERNS.PROFILE.rating);
        if (ratingMatch) info.rating = parseFloat(ratingMatch[1].replace(',', '.'));

        return info;
    }

    extractItems(text) {
        const items = [];
        const itemPattern = PATTERN_CONFIG.PATTERNS.ITEMS.full;
        let match;

        while ((match = itemPattern.exec(text)) !== null) {
            items.push({
                name: match[1].trim(),
                price: parseFloat(match[2].replace(',', '.')),
                brand: match[3].trim(),
                size: match[4].trim()
            });
        }

        return items;
    }

    extractFinancials(text) {
        const financials = {
            initialBalance: 0,
            finalBalance: 0
        };

        const balancePattern = PATTERN_CONFIG.PATTERNS.FINANCIALS.balance;
        let match;
        while ((match = balancePattern.exec(text)) !== null) {
            const amount = parseFloat(match[2].replace(',', '.'));
            if (match[1] === 'initial') {
                financials.initialBalance = amount;
            } else {
                financials.finalBalance = amount;
            }
        }

        return financials;
    }

    async calculateAllMetrics(baseData) {
        try {
            return {
                basic: await calculateBasicMetrics(baseData),
                sales: await calculateSalesMetrics(baseData),
                engagement: await calculateEngagementMetrics(baseData)
            };
        } catch (error) {
            console.error('Erreur dans le calcul des métriques:', error);
            return {};
        }
    }

    prepareChartData(analysis) {
        return {
            salesEvolutionChart: {
                type: 'line',
                data: this.prepareSalesEvolutionData(analysis),
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            }
        };
    }

    prepareSalesEvolutionData(analysis) {
        return {
            labels: analysis.sales.recent.map(sale => `Il y a ${sale.timeAgo} ${sale.unit}`),
            datasets: [{
                label: 'Ventes',
                data: analysis.sales.recent.map((_, index) => index + 1),
                borderColor: PATTERN_CONFIG.THEME.PRIMARY_COLOR,
                tension: 0.4
            }]
        };
    }
}
