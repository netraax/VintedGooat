let charts = {};
import { createSalesEvolutionChart } from './charts/salesChart.js';

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
    
    container.innerHTML = `
        <div class="results-grid">
            <!-- Informations du Profil -->
            <div class="result-card" data-section="profile-info">
                <h3>📊 Informations du Profil</h3>
                <p>Boutique: <strong>${data.profile.shopName}</strong></p>
                <p>Note: <strong>${data.profile.rating.toFixed(1)}/5</strong></p>
                <p>Abonnés: <strong>${data.profile.followers}</strong></p>
                <p>Total des ventes: <strong>${data.profile.totalRatings}</strong></p>
                ${isProAccount ? `
                    <div class="pro-info">
                        <h4>Informations Pro</h4>
                        <p>SIRET: ${data.profile.businessInfo?.siret || 'Non renseigné'}</p>
                        <p>RCS: ${data.profile.businessInfo?.rcs || 'Non renseigné'}</p>
                    </div>
                ` : ''}
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
            ${isProAccount ? `
                <div class="result-card" data-section="performance-info">
                    <h3>🎯 Performance Marketing</h3>
                    <p>Vues totales: <strong>${data.metrics.totalViews}</strong></p>
                    <p>Favoris: <strong>${data.metrics.totalFavorites}</strong></p>
                    <p>Taux d'engagement: <strong>${(data.metrics.totalFavorites / data.metrics.totalViews * 100).toFixed(1)}%</strong></p>
                    <p>Dépenses marketing: <strong>${data.financials.boostExpenses.toFixed(2)}€</strong></p>
                </div>
            ` : ''}

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
                <div class="salesEvolutionChart">
                    <canvas id="salesChart"></canvas>
                </div>
            </div>

            ${isProAccount ? `
                <!-- Résumé Financier (Pro) -->
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
                </div>
            ` : ''}
        </div>
    `;

    container.classList.add('active');

    // Création des graphiques
    function createCharts(data, isProAccount) {
    // Graphique des ventes par pays
    createCountryChart(data);
    
    // Nouveau graphique d'évolution des ventes
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

function createSalesChart(data) {
    const ctx = document.getElementById('salesChart');
    if (ctx && data.sales.recent && data.sales.recent.length > 0) {
        const salesData = prepareSalesData(data.sales.recent);
        
        charts.sales = new Chart(ctx, {
            type: 'line',
            data: {
                labels: salesData.labels,
                datasets: [{
                    label: 'Nombre de ventes',
                    data: salesData.data,
                    borderColor: '#09B1BA',
                    backgroundColor: 'rgba(9, 177, 186, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
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

function prepareSalesData(recentSales) {
    const sortedSales = recentSales.slice().reverse();
    return {
        labels: sortedSales.map(sale => `Il y a ${sale.timeAgo} ${sale.unit}`),
        data: sortedSales.map((_, index) => index + 1)
    };
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
