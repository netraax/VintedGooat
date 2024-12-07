function displayResults(data) {
    const resultsContainer = document.getElementById('results');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = `
        <div class="results-grid">
            <div class="result-card">
                <h3>Informations du Profil</h3>
                <ul>
                    <li>Boutique: ${data.profile.shopName}</li>
                    <li>Note: ${data.profile.rating.toFixed(1)}/5</li>
                    <li>Abonnés: ${data.profile.followers}</li>
                    <li>Abonnements: ${data.profile.following}</li>
                </ul>
            </div>

            <div class="result-card">
                <h3>Statistiques de Vente</h3>
                <ul>
                    <li>Total des ventes: ${data.profile.totalRatings}</li>
                    <li>Prix moyen: ${data.metrics.averagePrice.toFixed(2)}€</li>
                    <li>Chiffre d'affaires: ${data.metrics.totalRevenue.toFixed(2)}€</li>
                    <li>Vélocité: ${data.metrics.salesVelocity.toFixed(1)} ventes/semaine</li>
                </ul>
            </div>

            <div class="result-card">
                <h3>Répartition par Pays</h3>
                <ul>
                    ${Object.entries(data.sales.byCountry)
                        .map(([country, count]) => `
                            <li>${country}: ${count} vente${count > 1 ? 's' : ''}</li>
                        `).join('')}
                </ul>
            </div>

            <div class="result-card">
                <h3>Marques Principales</h3>
                <ul>
                    ${Object.entries(data.metrics.topBrands)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([brand, count]) => `
                            <li>${brand}: ${count} article${count > 1 ? 's' : ''}</li>
                        `).join('')}
                </ul>
            </div>

            <div class="result-card">
                <h3>Ventes Récentes</h3>
                <ul>
                    ${data.sales.recentSales.slice(0, 5)
                        .map(({amount, unit}) => `
                            <li>Il y a ${amount} ${unit}</li>
                        `).join('')}
                </ul>
            </div>
        </div>
    `;

    resultsContainer.classList.add('active');
}
