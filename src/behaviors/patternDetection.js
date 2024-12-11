// src/behaviors/patternDetection.js

const PATTERN_CONFIG = {
    THEME: {
        PRIMARY_COLOR: '#09B1BA',
        CHART_COLORS: [
            '#09B1BA',
            '#FF6B6B',
            '#4ECDC4',
            '#45B7D1',
            '#96CEB4'
        ]
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
            shopName: /^([^\n]+)(?=\nÀ propos|$)/m,
            isPro: /(Pro\n@|Numéro d'entreprise)/,
            business: /Numéro d'entreprise\s+([^\n]+)\s*([^\n]+)\s*R\.C\.S/,
            followers: /(\d+)\s*Abonnés/,
            following: /(\d+)\s*Abonnement/,
            memberRatings: /Évaluations des membres \((\d+)\)/,
            autoRatings: /Évaluations automatiques \((\d+)\)/,
            rating: /(\d+[.,]\d+)\s*\(/
        },
        ITEMS: {
            full: /([^,]+), prix : (\d+,\d+) €, marque : ([^,]+), taille : ([^\n]+)(?:\n(\d+) vues\s*\n\s*(\d+) favoris)?(?:\nVendu)?/g,
            price: /prix\s*:\s*(\d+,\d{2})\s*€/,
            brand: /marque\s*:\s*([^,\n]+)/,
            size: /taille\s*:\s*([^,\n]+)/,
            views: /(\d+)\s*vues/,
            favorites: /(\d+)\s*favoris/,
            status: /Vendu/
        },
        SALES: {
            date: /il y a (\d+) (heure|heures|jour|jours|semaine|semaines|mois|an|ans)/g,
            languages: {
                'France': /merci|parfait|nickel/i,
                'Italie': /grazie|perfetto/i,
                'Espagne': /gracias|perfecto/i,
                'Royaume-Uni': /thank you|perfect/i,
                'Allemagne': /danke/i
            }
        },
        FINANCIALS: {
            balance: /Solde (initial|final)\s*(\d+,\d+) €/g,
            transaction: /(Vente|Commande d'un Boost|Commande Dressing en vitrine|Transfert vers le compte bancaire)\s*([^\n]+)\s*([+-]?\d+,\d+) €\s*(\d+ \w+ \d{4})?/g
        }
    }
};

/**
 * Système de détection de patterns modernisé
 */
export class PatternDetectionSystem {
    constructor(data = {}) {
        this.data = data;
        this.patterns = {
            sales: {},
            engagement: {},
            profile: {},
            location: {},
            items: {},
            financials: {}
        };
        this.thresholds = PATTERN_CONFIG.THRESHOLDS;
        this.chartColors = PATTERN_CONFIG.THEME.CHART_COLORS;
    }

    /**
     * Analyse complète du profil et des données
     */
    async analyze() {
        try {
            const baseData = await this.extractBaseData();
            const transactionData = await this.analyzeTransactions(baseData.financials.transactions);
            const metrics = await this.calculateAllMetrics(baseData);
            
            return {
                ...baseData,
                transactionAnalytics: transactionData,
                advancedMetrics: metrics,
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
            sales: this.extractSalesInfo(text),
            financials: this.extractFinancials(text)
        };
    }

    extractProfileInfo(text) {
        const info = {
            shopName: '',
            followers: 0,
            following: 0,
            totalRatings: 0,
            memberRatings: 0,
            autoRatings: 0,
            rating: 0,
            isPro: false,
            businessInfo: null
        };

        // Nom de la boutique
        const shopNameMatch = text.match(PATTERN_CONFIG.PATTERNS.PROFILE.shopName);
        if (shopNameMatch) {
            info.shopName = shopNameMatch[1].trim();
        }

        // Détection compte pro
        info.isPro = PATTERN_CONFIG.PATTERNS.PROFILE.isPro.test(text);

        // Infos business si compte pro
        if (info.isPro) {
            const businessMatch = text.match(PATTERN_CONFIG.PATTERNS.PROFILE.business);
            if (businessMatch) {
                info.businessInfo = {
                    siret: businessMatch[1],
                    rcs: businessMatch[2]
                };
            }
        }

        // Extraction des métriques de base
        const patterns = PATTERN_CONFIG.PATTERNS.PROFILE;
        const followersMatch = text.match(patterns.followers);
        const followingMatch = text.match(patterns.following);
        const ratingsMatch = text.match(patterns.memberRatings);
        const autoEvalMatch = text.match(patterns.autoRatings);
        const ratingMatch = text.match(patterns.rating);

        if (followersMatch) info.followers = parseInt(followersMatch[1]);
        if (followingMatch) info.following = parseInt(followingMatch[1]);
        if (ratingsMatch) info.memberRatings = parseInt(ratingsMatch[1]);
        if (autoEvalMatch) info.autoRatings = parseInt(autoEvalMatch[1]);
        if (ratingMatch) info.rating = parseFloat(ratingMatch[1].replace(',', '.'));

        info.totalRatings = info.memberRatings + info.autoRatings;

        return info;
    }

    extractItems(text) {
        const items = [];
        const itemPattern = PATTERN_CONFIG.PATTERNS.ITEMS.full;
        let match;

        while ((match = itemPattern.exec(text)) !== null) {
            const item = {
                name: match[1].trim(),
                price: parseFloat(match[2].replace(',', '.')),
                brand: match[3].trim(),
                size: match[4].trim(),
                views: match[5] ? parseInt(match[5]) : 0,
                favorites: match[6] ? parseInt(match[6]) : 0,
                isSold: text.substring(match.index, match.index + 200).includes('Vendu')
            };
            items.push(item);
        }

        return items;
    }

    extractSalesInfo(text) {
        const sales = {
            byDate: {},
            byCountry: {},
            recent: [],
            totalAmount: 0,
            conversionRate: 0
        };

        // Extraction des dates de vente
        const datePattern = PATTERN_CONFIG.PATTERNS.SALES.date;
        let match;
        while ((match = datePattern.exec(text)) !== null) {
            const amount = parseInt(match[1]);
            const unit = match[2];
            const date = this.calculateDate(amount, unit);
            const dateStr = date.toISOString().split('T')[0];
            
            sales.byDate[dateStr] = (sales.byDate[dateStr] || 0) + 1;
            sales.recent.push({ timeAgo: amount, unit });
        }

        // Détection des pays par langue
        Object.entries(PATTERN_CONFIG.PATTERNS.SALES.languages).forEach(([country, pattern]) => {
            const matches = text.match(pattern);
            if (matches) {
                sales.byCountry[country] = matches.length;
            }
        });

        return sales;
    }

    extractFinancials(text) {
        const financials = {
            currentBalance: 0,
            initialBalance: 0,
            transactions: [],
            totalRevenue: 0,
            totalExpenses: 0,
            boostExpenses: 0,
            transfers: []
        };

        // Extraction des soldes
        const balancePattern = PATTERN_CONFIG.PATTERNS.FINANCIALS.balance;
        let match;
        while ((match = balancePattern.exec(text)) !== null) {
            const amount = parseFloat(match[2].replace(',', '.'));
            if (match[1] === 'initial') {
                financials.initialBalance = amount;
            } else {
                financials.currentBalance = amount;
            }
        }

        // Extraction des transactions
        const transactionPattern = PATTERN_CONFIG.PATTERNS.FINANCIALS.transaction;
        while ((match = transactionPattern.exec(text)) !== null) {
            const type = match[1];
            const description = match[2].trim();
            const amount = parseFloat(match[3].replace(',', '.'));
            const date = match[4] ? new Date(match[4]) : null;

            const transaction = { type, description, amount, date };

            if (type === 'Vente') {
                financials.totalRevenue += amount;
            } else if (type.includes('Boost') || type.includes('vitrine')) {
                financials.boostExpenses += Math.abs(amount);
                financials.totalExpenses += Math.abs(amount);
            } else if (type.includes('Transfert')) {
                financials.transfers.push(transaction);
            }

            financials.transactions.push(transaction);
        }

        return financials;
    }

    async analyzeTransactions(transactions) {
        try {
            const summary = this.extractTransactionSummary(this.data.text || '');
            const metrics = this.calculateTransactionMetrics(transactions);

            return {
                summary,
                metrics,
                patterns: this.detectTransactionPatterns(transactions)
            };
        } catch (error) {
            console.error('Erreur dans l\'analyse des transactions:', error);
            return {};
        }
    }

    async calculateAllMetrics(baseData) {
        try {
            return {
                basic: await this.calculateBasicMetrics(baseData),
                sales: await this.calculateSalesMetrics(baseData),
                engagement: await this.calculateEngagementMetrics(baseData)
            };
        } catch (error) {
            console.error('Erreur dans le calcul des métriques:', error);
            return {};
        }
    }

    extractTransactionSummary(text) {
        const summary = {
            initialBalance: 0,
            finalBalance: 0,
            period: {
                start: null,
                end: null
            }
        };

        const finalBalanceMatch = text.match(/Solde final\s*(\d+[.,]\d+)\s*€/);
        const initialBalanceMatch = text.match(/Solde initial\s*(\d+[.,]\d+)\s*€/);

        if (finalBalanceMatch) {
            summary.finalBalance = parseFloat(finalBalanceMatch[1].replace(',', '.'));
        }
        if (initialBalanceMatch) {
            summary.initialBalance = parseFloat(initialBalanceMatch[1].replace(',', '.'));
        }

        const datePattern = /(\d{1,2}\s+\w+\s+\d{4})/g;
        const dates = [...text.matchAll(datePattern)].map(match => new Date(match[1]));
        
        if (dates.length > 0) {
            summary.period.start = new Date(Math.min(...dates));
            summary.period.end = new Date(Math.max(...dates));
        }

        return summary;
    }

    calculateDate(amount, unit) {
        const date = new Date();
        switch(unit) {
            case 'heure':
            case 'heures':
                date.setHours(date.getHours() - amount);
                break;
            case 'jour':
            case 'jours':
                date.setDate(date.getDate() - amount);
                break;
            case 'semaine':
            case 'semaines':
                date.setDate(date.getDate() - (amount * 7));
                break;
            case 'mois':
                date.setMonth(date.getMonth() - amount);
                break;
            case 'an':
            case 'ans':
                date.setFullYear(date.getFullYear() - amount);
                break;
        }
        return date;
    }

    async analyzeAndFormat() {
        try {
            const analysis = await this.analyze();
            return {
                data: await this.formatForUI(analysis),
                charts: this.prepareChartData(analysis)
            };
        } catch (error) {
            console.error('Erreur dans analyzeAndFormat:', error);
            throw error;
        }
    }

    prepareChartData(analysis) {
        return {
            countryChart: {
                type: 'doughnut',
                data: {
                    labels: Object.keys(analysis.sales.byCountry || {}),
                    datasets: [{
                        data: Object.values(analysis.sales.byCountry || {}),
                        backgroundColor: this.chartColors
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right' }
                    }
                }
            },
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
            },
            brandsChart: analysis.profile.isPro ? {
                type: 'bar',
                data: this.prepareBrandsData(analysis),
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    }
                }
            } : null
        };
    }

    prepareSalesEvolutionData(analysis) {
        return {
            labels: analysis.sales.recent.map(sale => `Il y a ${sale.timeAgo} ${sale.unit}`),
            datasets: [{
                label: 'Ventes',
                data: analysis.sales.recent.map((_, index) => index + 1),
                borderColor: PATTERN_CONFIG.THEME.PRIMARY_COLOR,tension: 0.4
            }]
        };
    }

    prepareBrandsData(analysis) {
        const brandCounts = {};
        analysis.items.forEach(item => {
            if (item.brand) {
                brandCounts[item.brand] = (brandCounts[item.brand] || 0) + 1;
            }
        });

        const sortedBrands = Object.entries(brandCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        return {
            labels: sortedBrands.map(([brand]) => brand),
            datasets: [{
                label: 'Articles',
                data: sortedBrands.map(([, count]) => count),
                backgroundColor: PATTERN_CONFIG.THEME.PRIMARY_COLOR
            }]
        };
    }

    async formatForUI(analysis) {
        const formattedData = {
            profile: this.formatProfileData(analysis),
            metrics: this.formatMetricsData(analysis),
            sales: this.formatSalesData(analysis),
            financials: this.formatFinancialsData(analysis),
            advancedMetrics: {
                basic: this.formatBasicMetrics(analysis),
                sales: this.formatSalesMetrics(analysis),
                engagement: this.formatEngagementMetrics(analysis)
            }
        };

        return this.addDisplayClasses(formattedData);
    }

    formatProfileData(analysis) {
        return {
            shopName: analysis.profile.shopName || 'Boutique',
            rating: analysis.profile.rating || 0,
            followers: analysis.profile.followers || 0,
            totalRatings: analysis.profile.totalRatings || 0,
            isPro: analysis.profile.isPro || false,
            businessInfo: analysis.profile.businessInfo || null,
            memberRatings: analysis.profile.memberRatings || 0,
            autoRatings: analysis.profile.autoRatings || 0
        };
    }

    formatMetricsData(analysis) {
        return {
            totalItems: analysis.items.length || 0,
            averagePrice: this.calculateAveragePrice(analysis.items),
            itemsSold: (analysis.items || []).filter(item => item.isSold).length,
            conversionRate: this.calculateConversionRate(analysis),
            totalViews: this.sumMetric(analysis.items, 'views'),
            totalFavorites: this.sumMetric(analysis.items, 'favorites'),
            revenuePerItem: this.calculateRevenuePerItem(analysis),
            topBrands: this.calculateTopBrands(analysis.items)
        };
    }

    formatSalesData(analysis) {
        return {
            recent: analysis.sales.recent || [],
            byCountry: analysis.sales.byCountry || {},
            byPeriod: this.formatSalesByPeriod(analysis),
            performance: {
                conversionRate: this.calculateConversionRate(analysis),
                averageDaysToSell: this.calculateAverageDaysToSell(analysis.items),
                bestPerformingCategories: this.findBestPerformingCategories(analysis)
            }
        };
    }

    formatFinancialsData(analysis) {
        return {
            totalRevenue: analysis.financials.totalRevenue || 0,
            totalExpenses: analysis.financials.totalExpenses || 0,
            currentBalance: analysis.financials.currentBalance || 0,
            boostExpenses: analysis.financials.boostExpenses || 0,
            transfers: analysis.financials.transfers || [],
            summary: {
                initialBalance: analysis.financials.initialBalance || 0,
                finalBalance: analysis.financials.currentBalance || 0,
                period: this.extractFinancialPeriod(analysis)
            }
        };
    }

    formatBasicMetrics(analysis) {
        return {
            estimatedRevenue: {
                total: analysis.financials.totalRevenue || 0,
                lastMonth: this.calculateRevenueForPeriod(analysis, 30),
                lastWeek: this.calculateRevenueForPeriod(analysis, 7)
            },
            salesFrequency: this.calculateSalesFrequency(analysis),
            categoryDistribution: this.calculateCategoryDistribution(analysis.items),
            averageOrderValue: this.calculateAverageOrderValue(analysis),
            satisfactionRate: {
                rating: analysis.profile.rating || 0,
                totalRatings: analysis.profile.totalRatings || 0
            }
        };
    }

    formatSalesMetrics(analysis) {
        return {
            salesGrowth: this.calculateSalesGrowth(analysis),
            bestSelling: {
                items: this.findBestSellingItems(analysis),
                brands: this.findBestSellingBrands(analysis)
            },
            performance: {
                conversionRate: this.calculateConversionRate(analysis),
                averageDaysToSell: this.calculateAverageDaysToSell(analysis.items)
            }
        };
    }

    formatEngagementMetrics(analysis) {
        return {
            followerMetrics: {
                conversionRate: {
                    percentage: this.calculateFollowerConversionRate(analysis),
                    totalBuyers: analysis.profile.totalRatings || 0,
                    totalFollowers: analysis.profile.followers || 0
                },
                revenuePerFollower: {
                    amount: this.calculateRevenuePerFollower(analysis),
                    total: analysis.financials.totalRevenue || 0
                }
            },
            productMetrics: this.calculateProductMetrics(analysis),
            locationMetrics: this.calculateLocationMetrics(analysis)
        };
    }

    // Méthodes utilitaires
    calculateAveragePrice(items) {
        if (!items.length) return 0;
        return items.reduce((sum, item) => sum + item.price, 0) / items.length;
    }

    calculateConversionRate(analysis) {
        const totalViews = this.sumMetric(analysis.items, 'views');
        if (!totalViews) return 0;
        const soldItems = analysis.items.filter(item => item.isSold).length;
        return (soldItems / totalViews) * 100;
    }

    sumMetric(items, metric) {
        return items.reduce((sum, item) => sum + (item[metric] || 0), 0);
    }

    calculateRevenuePerItem(analysis) {
        const soldItems = analysis.items.filter(item => item.isSold).length;
        if (!soldItems) return 0;
        return analysis.financials.totalRevenue / soldItems;
    }

    addDisplayClasses(data) {
        data.displayClasses = {
            container: 'results-container',
            grid: 'results-grid',
            card: 'result-card',
            cardTitle: 'card-title',
            cardContent: 'card-content',
            tabs: 'metrics-tabs',
            tabButton: 'tab-btn',
            tabContent: 'tab-content',
            chart: 'chart-container'
        };
        return data;
    }
}

export const PATTERNS = PATTERN_CONFIG.PATTERNS;
export const THEME = PATTERN_CONFIG.THEME;
