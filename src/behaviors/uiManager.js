import Chart from 'chart.js/auto';
import { createSalesEvolutionChart } from './charts/salesChart.js';

let charts = {};

export function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPage = button.getAttribute('data-page');
            
            // Mise à jour des boutons
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Mise à jour des pages
            pages.forEach(page => {
                if (page.id === targetPage) {
                    page.classList.add('active');
                    page.classList.remove('hidden');
                } else {
                    page.classList.remove('active');
                    page.classList.add('hidden');
                }
            });
        });
    });

    // Page principale visible par défaut
    const mainPage = document.getElementById('main');
    if (mainPage) {
        mainPage.classList.remove('hidden');
    }
}

export function displayResults(data, container) {
    if (!container) return;

    // Nettoyer les graphiques existants
    destroyCharts();

    // Construction du HTML selon le type de profil
    const isProAccount = data.profile.isPro;
    
    container.innerHTML = 
        `<div class="results-grid">
            <!-- Informations du Profil -->
            <div class="result-card" data-section="profile-info">
                <h3>📊 Informations du Profil</h3>
                <p>Boutique: <strong>${data.profile.shopName}</strong></p>
                <p>Note: <strong>${data.profile.rating.toFixed(1)}/5</strong></p>
                <p>Abonnés: <strong>${data.profile.followers}</strong></p>
                <p>Total des ventes: <strong>${data.profile.totalRatings}</strong></p>
                ${isProAccount ? 
                    `<div class="pro-info">
                        <h4>Informations Pro</h4>
                        <p>SIRET: ${data.profile.businessInfo?.siret || 'Non renseigné'}</p>
                        <p>RCS: ${data.profile.businessInfo?.rcs || 'Non renseigné'}</p>
                    </div>`
                 : ''}
            </div>
            
            <!-- Statistiques Articles -->
            <div class="result-card" data-section="stats-info">
                <h3>📈 Statistiques Articles</h3>
                <p>Articles en vente: <strong>${data.metrics.totalItems}</strong></p>
                <p>Prix moyen: <strong>${data.metrics.averagePrice.toFixed(2)}€</strong></p>
                <p>Articles vendus: <strong>${data.metrics.itemsSold}</strong></p>
                <p>Taux de conversion: <strong>${data.metrics.conversionRate.toFixed(1)}%</strong></p>
            </div>

            <!-- Performance Marketing (Pro) -->
            ${isProAccount ? 
                `<div class="result-card" data-section="performance-info">
                    <h3>🎯 Performance Marketing</h3>
                    <p>Vues totales: <strong>${data.metrics.totalViews}</strong></p>
                    <p>Favoris: <strong>${data.metrics.totalFavorites}</strong></p>
                    <p>Taux d'engagement: <strong>${(data.metrics.totalFavorites / data.metrics.totalViews * 100).toFixed(1)}%</strong></p>
                    <p>Dépenses marketing: <strong>${data.financials.boostExpenses.toFixed(2)}€</strong></p>
                </div>`
             : ''}

            <!-- Graphique des Ventes par Pays -->
            <div class="result-card">
                <h3>🌍 Répartition des Ventes</h3>
                <div class="chart-container">
                    <canvas id="countryChart"></canvas>
                </div>
            </div>

            <!-- Évolution des Ventes -->
            <div class="result-card">
                <h3>📈 Évolution des Ventes</h3>
                <div class="chart-container">
                    <canvas id="salesEvolutionChart"></canvas>
                </div>
            </div>

            ${isProAccount ? 
                `<!-- Résumé Financier (Pro) -->
                <div class="result-card">
                    <h3>💰 Résumé Financier</h3>
                    <p>Chiffre d'affaires: <strong>${data.financials.totalRevenue.toFixed(2)}€</strong></p>
                    <p>Dépenses totales: <strong>${data.financials.totalExpenses.toFixed(2)}€</strong></p>
                    <p>Solde actuel: <strong>${data.financials.currentBalance.toFixed(2)}€</strong></p>
                    <p>Revenu moyen/article: <strong>${data.metrics.revenuePerItem.toFixed(2)}€</strong></p>
                </div>

                <!-- Top Marques -->
                <div class="result-card">
                    <h3>🏷️ Top Marques</h3>
                    <div class="chart-container">
                        <canvas id="brandsChart"></canvas>
                    </div>
                </div>`
             : ''}

            <!-- Nouvelle section pour les métriques avancées -->
            <div class="result-card">
                <h3>📊 Métriques Avancées</h3>
                <div class="metrics-tabs">
                    <button class="tab-btn active" data-tab="basic">Basiques</button>
                    <button class="tab-btn" data-tab="sales">Ventes</button>
                    <button class="tab-btn" data-tab="engagement">Engagement</button>
                </div>

                <!-- Onglet Métriques Basiques -->
                <div class="tab-content active" id="basic-metrics">
                    <div class="metric-group">
                        <h4>Revenus Estimés</h4>
                        <p>Total: <strong>${data.advancedMetrics.basic.estimatedRevenue.total.toFixed(2)}€</strong></p>
                        <p>Dernier mois: <strong>${data.advancedMetrics.basic.estimatedRevenue.lastMonth.toFixed(2)}€</strong></p>
                    </div>
                    
                    <div class="metric-group">
                        <h4>Fréquence des Ventes</h4>
                        <p>Par jour: <strong>${data.advancedMetrics.basic.salesFrequency.daily.toFixed(1)}</strong></p>
                        <p>Par semaine: <strong>${data.advancedMetrics.basic.salesFrequency.weekly.toFixed(1)}</strong></p>
                    </div>
                </div>
                
                <!-- Onglet Ventes -->
                <div class="tab-content" id="sales-metrics">
                    <div class="metric-group">
                        <h4>Croissance des Ventes</h4>
                        <p>30 jours: <strong>${data.advancedMetrics.sales.salesGrowth['30days'].growth.toFixed(1)}%</strong></p>
                        <p>90 jours: <strong>${data.advancedMetrics.sales.salesGrowth['90days'].growth.toFixed(1)}%</strong></p>
                    </div>
                    
                    <div class="metric-group">
                        <h4>Meilleures Ventes</h4>
                        <p>Article le plus vendu: <strong>${data.advancedMetrics.sales.bestSelling.items.byQuantity[0]?.name || 'N/A'}</strong></p>
                    </div>
                </div>
                
                <!-- Onglet Engagement -->
                <div class="tab-content" id="engagement-metrics">
                    <div class="metric-group">
                        <h4>Engagement des Followers</h4>
                        <p>Taux de conversion: <strong>${data.advancedMetrics.engagement.followerMetrics.conversionRate.percentage.toFixed(1)}%</strong></p>
                        <p>Revenu par follower: <strong>${data.advancedMetrics.engagement.followerMetrics.revenuePerFollower.amount.toFixed(2)}€</strong></p>
                    </div>
                </div>
            </div>
        </div>`;

    container.classList.add('active');

    // Ajout de la gestion des onglets
    const tabButtons = container.querySelectorAll('.tab-btn');
    const tabContents = container.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Retirer la classe active de tous les boutons et contenus
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Ajouter la classe active au bouton cliqué et au contenu correspondant
            button.classList.add('active');
            const tabId = `${button.dataset.tab}-metrics`;
            container.querySelector(`#${tabId}`).classList.add('active');
        });
    });

    // Création des graphiques
    setTimeout(() => createCharts(data, isProAccount), 0);
}

function createCharts(data, isProAccount) {
    // Graphique des ventes par pays
    createCountryChart(data);
    
    // Évolution des ventes
    const salesData = data.sales.recent.map((sale, index) => ({
        date: `Il y a ${sale.timeAgo} ${sale.unit}`,
        count: index + 1
    })).reverse();
    createSalesEvolutionChart(salesData);
    
    // Graphiques Pro supplémentaires
    if (isProAccount) {
        createBrandsChart(data);
    }
}

function createCountryChart(data) {
    const ctx = document.getElementById('countryChart');
    if (ctx && data.sales.byCountry && Object.keys(data.sales.byCountry).length > 0) {
        charts.country = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(data.sales.byCountry),
                datasets: [{
                    data: Object.values(data.sales.byCountry),
                    backgroundColor: [
                        '#09B1BA',
                        '#FF6B6B',
                        '#4ECDC4',
                        '#45B7D1',
                        '#96CEB4'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}

function createBrandsChart(data) {
    const ctx = document.getElementById('brandsChart');
    if (ctx && data.metrics.topBrands) {
        const sortedBrands = Object.entries(data.metrics.topBrands)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        charts.brands = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedBrands.map(([brand]) => brand),
                datasets: [{
                    label: 'Nombre d\'articles',
                    data: sortedBrands.map(([, count]) => count),
                    backgroundColor: '#09B1BA',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
}

function destroyCharts() {
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });
    charts = {};
}

export function clearResults() {
    destroyCharts();
}
