import '../css/style.css';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initAnalysis();
});

function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPage = button.getAttribute('data-page');
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            pages.forEach(page => {
                if (page.id === targetPage) {
                    page.classList.remove('hidden');
                } else {
                    page.classList.add('hidden');
                }
            });
        });
    });

    document.querySelector('[data-page="accueil"]').classList.add('active');
}

function initAnalysis() {
    const analyzeBtn = document.getElementById('analyze-button');
    const resetBtn = document.getElementById('reset-button');
    const textarea = document.getElementById('profile-input');
    const resultsDiv = document.getElementById('analysis-results');

    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', async () => {
            const text = textarea?.value.trim();
            if (!text) {
                showNotification('Veuillez coller le contenu du profil Vinted', 'error');
                return;
            }

            try {
                const data = analyzeVintedProfile(text);
                await displayResults(data, resultsDiv);
                showNotification('Analyse terminée avec succès', 'success');
            } catch (error) {
                console.error('Erreur d\'analyse:', error);
                showNotification('Erreur lors de l\'analyse', 'error');
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (textarea) textarea.value = '';
            if (resultsDiv) resultsDiv.innerHTML = '';
        });
    }
}

function analyzeVintedProfile(text) {
    // Nouveau pattern pour détecter le nombre total d'articles
    const articlesMatch = text.match(/(\d+)\s*articles?/);
    const totalArticles = articlesMatch ? parseInt(articlesMatch[1]) : 0;

    const data = {
        profile: extractProfileInfo(text),
        sales: extractSalesInfo(text),
        items: extractItems(text),
        totalArticles: totalArticles
    };

    // Calcul des métriques avancées
    data.metrics = calculateMetrics(data);

    return data;
}

function displayResults(data, container) {
    if (!container) return;

    const html = `
        <div class="dashboard">
            <!-- KPI Cards -->
            <div class="kpi-section">
                <div class="kpi-card primary">
                    <h3>Articles en Vente</h3>
                    <div class="kpi-value">${data.totalArticles}</div>
                    <div class="kpi-change">Prix moyen : ${data.metrics.averagePrice.toFixed(2)}€</div>
                </div>
                <div class="kpi-card success">
                    <h3>Ventes Totales</h3>
                    <div class="kpi-value">${data.profile.totalRatings}</div>
                    <div class="kpi-change">Taux de conversion : ${data.metrics.conversionRate}%</div>
                </div>
                <div class="kpi-card info">
                    <h3>Note Globale</h3>
                    <div class="kpi-value">${data.profile.rating.toFixed(1)}/5</div>
                    <div class="kpi-change">${data.profile.followers} abonnés</div>
                </div>
            </div>

            <!-- Charts -->
            <div class="charts-section">
                <div class="chart-container">
                    <h3>Répartition des Ventes par Pays</h3>
                    <div id="salesByCountry" class="chart"></div>
                </div>
                <div class="chart-container">
                    <h3>Historique des Ventes</h3>
                    <div id="salesHistory" class="chart"></div>
                </div>
            </div>

            <!-- Detailed Stats -->
            <div class="stats-section">
                <div class="stat-card">
                    <h3>Top Marques</h3>
                    <ul class="stat-list">
                        ${Object.entries(data.metrics.topBrands)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 5)
                            .map(([brand, count]) => `
                                <li>
                                    <span>${brand}</span>
                                    <span class="stat-value">${count}</span>
                                </li>
                            `).join('')}
                    </ul>
                </div>
                <div class="stat-card">
                    <h3>Dernières Ventes</h3>
                    <ul class="stat-list">
                        ${data.sales.recent.slice(0, 5)
                            .map(sale => `
                                <li>
                                    <span>Il y a ${sale.timeAgo} ${sale.unit}</span>
                                </li>
                            `).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = html;
    
    // Création des graphiques
    createCharts(data);
}

function calculateMetrics(data) {
    return {
        averagePrice: data.items.reduce((sum, item) => sum + item.price, 0) / data.items.length || 0,
        conversionRate: ((data.profile.totalRatings / data.totalArticles) * 100).toFixed(1),
        topBrands: data.items.reduce((brands, item) => {
            brands[item.brand] = (brands[item.brand] || 0) + 1;
            return brands;
        }, {}),
        salesVelocity: data.sales.recent.length / 7 // ventes par semaine
    };
}

function createCharts(data) {
    // Création des graphiques avec Chart.js
    // ... Implémentation des graphiques ...
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}
