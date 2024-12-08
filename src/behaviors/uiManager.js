let charts = {};

export function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPage = button.getAttribute('data-page');
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            pages.forEach(page => {
                page.classList.toggle('hidden', page.id !== targetPage);
            });
        });
    });
}

export function displayResults(data, container) {
    if (!container) return;

    // Nettoyer les graphiques existants avant de créer de nouveaux
    destroyCharts();

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
                <p>Articles en vente: ${data.totalArticles || data.items.length}</p>
                <p>Prix moyen: ${(data.metrics?.averagePrice || 0).toFixed(2)}€</p>
            </div>

            <div class="result-card">
                <h3>Graphique des Ventes par Pays</h3>
                <div style="position: relative; height: 300px;">
                    <canvas id="countryChart"></canvas>
                </div>
            </div>

            <div class="result-card">
                <h3>Évolution des Ventes</h3>
                <div style="position: relative; height: 300px;">
                    <canvas id="salesChart"></canvas>
                </div>
            </div>
        </div>
    `;

    container.classList.add('active');

    // Attendre que le DOM soit mis à jour avant de créer les graphiques
    setTimeout(() => createCharts(data), 0);
}

function createCharts(data) {
    // Graphique des ventes par pays
    const countryCtx = document.getElementById('countryChart');
    if (countryCtx && data.sales.byCountry && Object.keys(data.sales.byCountry).length > 0) {
        const countryData = {
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
        };

        charts.country = new Chart(countryCtx, {
            type: 'doughnut',
            data: countryData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    // Graphique de l'évolution des ventes
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx && data.sales.recent && data.sales.recent.length > 0) {
        const salesData = prepareSalesData(data.sales.recent);

        charts.sales = new Chart(salesCtx, {
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
