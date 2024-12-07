import './css/style.css';  // Changé de '../css/style.css'
import { analyzeProfile } from './src/behaviors/profileParser.js';  // Changé de '../behaviors/profileParser.js'
import Chart from 'chart.js/auto';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initAnalysis();
    initProAnalysis();
});

function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPage = button.getAttribute('data-page');

            // Mise à jour des boutons actifs
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Affichage de la bonne page
            pages.forEach(page => {
                if (page.id === targetPage) {
                    page.classList.remove('hidden');
                } else {
                    page.classList.add('hidden');
                }
            });
        });
    });

    // Activer la page d'accueil par défaut
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
                alert('Veuillez coller le contenu de votre profil Vinted');
                return;
            }

            try {
                const analysisResults = analyzeProfile(text);
                displayResults(analysisResults, resultsDiv);
                createCharts(analysisResults);
            } catch (error) {
                console.error('Erreur d\'analyse:', error);
                alert('Une erreur est survenue lors de l\'analyse');
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (textarea) textarea.value = '';
            if (resultsDiv) resultsDiv.innerHTML = '';
            // Nettoyer les graphiques si présents
            const chartContainers = document.querySelectorAll('.chart-container');
            chartContainers.forEach(container => container.remove());
        });
    }
}

function initProAnalysis() {
    const proInput = document.getElementById('pro-input');
    const proResults = document.getElementById('pro-results');
    
    if (proInput && proResults) {
        // Logique pour l'analyse pro à implémenter
    }
}

function displayResults(data, container) {
    if (!container) return;

    const html = `
        <div class="results-grid">
            <div class="result-card">
                <h3>Informations du Profil</h3>
                <p>Boutique: ${data.profile.shopName}</p>
                <p>Note: ${data.profile.rating.toFixed(1)}/5</p>
                <p>Abonnés: ${data.profile.followers}</p>
                <p>Total des évaluations: ${data.profile.totalRatings}</p>
                <p>Évaluations membres: ${data.profile.memberRatings}</p>
                <p>Évaluations auto: ${data.profile.autoRatings}</p>
            </div>
            
            <div class="result-card">
                <h3>Statistiques Articles</h3>
                <p>Prix moyen: ${data.metrics.averagePrice.toFixed(2)}€</p>
                <p>Revenu total estimé: ${data.metrics.totalRevenue.toFixed(2)}€</p>
                <p>Vitesse de vente: ${data.metrics.salesVelocity.toFixed(1)} ventes/semaine</p>
            </div>

            <div class="result-card">
                <h3>Ventes par Pays</h3>
                <div id="countryChartContainer" class="chart-container"></div>
                <ul>
                    ${Object.entries(data.sales.byCountry)
                        .map(([country, count]) => 
                            `<li>${country}: ${count} vente${count > 1 ? 's' : ''}</li>`
                        ).join('')}
                </ul>
            </div>

            <div class="result-card">
                <h3>Ventes Récentes</h3>
                <div id="salesChartContainer" class="chart-container"></div>
                <ul>
                    ${data.sales.recentSales.slice(0, 5)
                        .map(sale => 
                            `<li>Il y a ${sale.amount} ${sale.unit}</li>`
                        ).join('')}
                </ul>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function createCharts(data) {
    // Graphique des ventes par pays
    const countryData = Object.entries(data.sales.byCountry);
    new Chart(
        document.getElementById('countryChartContainer'),
        {
            type: 'doughnut',
            data: {
                labels: countryData.map(([country]) => country),
                datasets: [{
                    data: countryData.map(([_, count]) => count),
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        }
    );

    // Graphique des ventes récentes
    const salesDates = Object.entries(data.sales.byDate).slice(-10);
    new Chart(
        document.getElementById('salesChartContainer'),
        {
            type: 'line',
            data: {
                labels: salesDates.map(([date]) => date),
                datasets: [{
                    label: 'Ventes par jour',
                    data: salesDates.map(([_, count]) => count),
                    borderColor: '#36A2EB',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        }
    );
}

export {
    initNavigation,
    initAnalysis,
    initProAnalysis
};
