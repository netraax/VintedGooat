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
            transaction: /(Vente|Commande d'un Boost|Commande Dressing en vitrine|Transfert vers le compte bancaire)\s*([^\n]+)\s*([+-]?\d+,\d+) €\s*(\d+ \w+ \d{4})?/g,
            summary: {
                finalBalance: /Solde final\s*(\d+[.,]\d+)\s*€/,
                initialBalance: /Solde initial\s*(\d+[.,]\d+)\s*€/,
                date: /(\d{1,2}\s+\w+\s+\d{4})/g
            }
        },
        TRANSACTION_TYPES: {
            sale: /Vente/,
            expense: /Commande/,
            transfer: /Transfert/,
            marketing: /Boost/
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
            financials: {},
            transactions: {}
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

    /**
     * Analyse et formatte pour l'UI
     */
    async analyzeAndFormat() {
        const analysis = await this.analyze();
        const uiData = await this.formatForUI(analysis);
        return {
            data: uiData,
            charts: this.prepareChartData(analysis)
        };
    }

    /**
     * Prépare les données pour les graphiques
     */
    prepareChartData(analysis) {
        return {
            countryChart: {
                type: 'doughnut',
                data: {
                    labels: Object.keys(analysis.patterns.location.salesByCountry || {}),
                    datasets: [{
                        data: Object.values(analysis.patterns.location.salesByCountry || {}),
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
            brandsChart: analysis.profile.identity.isPro ? {
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

    /**
     * Prépare les données d'évolution des ventes
     */
    prepareSalesEvolutionData(analysis) {
        const salesData = this.extractSalesTimeline(analysis);
        return {
            labels: salesData.map(d => d.label),
            datasets: [{
                label: 'Ventes',
                data: salesData.map(d => d.value),
                borderColor: PATTERN_CONFIG.THEME.PRIMARY_COLOR,
                tension: 0.4
            }]
        };
    }

    /**
     * Prépare les données des marques
     */
    prepareBrandsData(analysis) {
        const brandsData = this.extractTopBrands(analysis);
        return {
            labels: brandsData.map(b => b.name),
            datasets: [{
                label: 'Articles',
                data: brandsData.map(b => b.count),
                backgroundColor: PATTERN_CONFIG.THEME.PRIMARY_COLOR
            }]
        };
    }

    /**
     * Formate les données pour l'UI
     */
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

        // Ajoute des classes CSS pour le style
        return this.addDisplayClasses(formattedData);
    }

    /**
     * Ajoute les classes CSS nécessaires
     */
    addDisplayClasses(data) {
        // Ajoute les classes pour les cartes de résultats
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

    // ... autres méthodes de formattage et d'analyse du code précédent ...
}

// Export des constantes de configuration
export const PATTERNS = PATTERN_CONFIG.PATTERNS;
export const THEME = PATTERN_CONFIG.THEME;
