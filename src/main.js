import '../css/style.css';

// Garder une référence aux graphiques pour pouvoir les nettoyer
let charts = {};

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initAnalytics();
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
        analyzeBtn.addEventListener('click', () => {
            const text = textarea?.value.trim();
            if (!text) {
                showNotification('Veuillez coller le contenu de votre profil Vinted', 'error');
                return;
            }

            try {
                const data = analyzeVintedProfile(text);
                displayResults(data, resultsDiv);
                createCharts(data); // Ajout des graphiques
                trackAnalysis(data); // Appel de la fonction analytics
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
            if (resultsDiv) {
                resultsDiv.innerHTML = '';
                destroyCharts(); // Nettoyage des graphiques
            }
            clearResults(); // Appel pour réinitialiser les données analysées
            showNotification('Analyse réinitialisée');
        });
    }
}

function analyzeVintedProfile(text) {
    const articlesMatch = text.match(/(\d+)\s*articles/);
    const totalArticles = articlesMatch ? parseInt(articlesMatch[1]) : 0;

    const data = {
        profile: extractProfileInfo(text),
        sales: extractSalesInfo(text),
        items: extractItems(text),
        totalArticles: totalArticles
    };

    data.metrics = calculateMetrics(data); // Calcul des métriques
    return data;
}

function calculateMetrics(data) {
    return {
        averagePrice: data.items.reduce((sum, item) => sum + item.price, 0) / data.items.length || 0,
        conversionRate: ((data.profile.totalRatings / data.totalArticles) * 100).toFixed(1),
        topBrands: data.items.reduce((brands, item) => {
            brands[item.brand] = (brands[item.brand] || 0) + 1;
            return brands;
        }, {})
    };
}

function createCharts(data) {
    destroyCharts();

    const countryCtx = document.getElementById('countryChart')?.getContext('2d');
    if (countryCtx) {
        charts.country = new Chart(countryCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(data.sales.byCountry),
                datasets: [{
                    data: Object.values(data.sales.byCountry),
                    backgroundColor: ['#09B1BA', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
                }]
            },
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'Répartition des ventes par pays',
                        font: { size: 16 }
                    }
                }
            }
        });
    }

    const salesCtx = document.getElementById('salesChart')?.getContext('2d');
    if (salesCtx) {
        const salesData = prepareSalesData(data.sales.recent);
        charts.sales = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: salesData.labels,
                datasets: [{
                    label: 'Ventes',
                    data: salesData.data,
                    borderColor: '#09B1BA',
                    backgroundColor: 'rgba(9, 177, 186, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Nombre de ventes' }
                    }
                }
            }
        });
    }
}

function destroyCharts() {
    Object.values(charts).forEach(chart => chart?.destroy());
    charts = {};
}

function displayResults(data, container) {
    if (!container) return;

    container.innerHTML = `
        <div class="results-grid">
            <div class="result-card">
                <h3>Informations du Profil</h3>
                <p>Boutique: ${data.profile.shopName}</p>
                <p>Note: ${data.profile.rating.toFixed(1)}/5</p>
                <p>Abonnés: ${data.profile.followers}</p>
                <p>Total des ventes: ${data.profile.totalRatings}</p>
            </div>
            <div class="result-card">
                <h3>Statistiques Articles</h3>
                <p>Articles en vente: ${data.totalArticles}</p>
                <p>Prix moyen: ${data.metrics.averagePrice.toFixed(2)}€</p>
                <p>Taux de conversion: ${data.metrics.conversionRate}%</p>
            </div>
        </div>
    `;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}
