import '../css/style.css';
import { initializeAnalytics } from './behaviors/analytics.js';
import { setupNotifications, showNotification } from './behaviors/notifications.js';
import { analyzeProfile } from './behaviors/profileParser.js';
import { initNavigation, displayResults, clearResults } from './behaviors/uiManager.js';
import { compareShops } from './behaviors/compareShops.js';
import { exportToPDF } from './behaviors/pdfExport.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialisation des modules
    initializeAnalytics();
    setupNotifications();
    initNavigation();
    initAnalysis();
    initCompareFeature();
    initPDFExport();
});

function initAnalysis() {
    // Analyse boutique standard
    const analyzeBtn = document.getElementById('analyze-button');
    const resetBtn = document.getElementById('reset-button');
    const textarea = document.getElementById('profile-input');
    const resultsDiv = document.getElementById('analysis-results');

    // Analyse Pro
    const analyzeBtnPro = document.getElementById('analyze-pro-button');
    const resetBtnPro = document.getElementById('reset-pro-button');
    const textareaPro = document.getElementById('pro-input');
    const resultsDivPro = document.getElementById('pro-results');

    // Gestion de l'analyse boutique
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', () => {
            const text = textarea?.value.trim();
            if (!text) {
                showNotification('Veuillez coller le contenu de votre profil Vinted', 'error');
                return;
            }

            try {
                const data = analyzeProfile(text);
                displayResults(data, resultsDiv);
                showNotification('Analyse terminée avec succès', 'success');
            } catch (error) {
                console.error('Erreur d\'analyse:', error);
                showNotification('Une erreur est survenue lors de l\'analyse', 'error');
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (textarea) textarea.value = '';
            if (resultsDiv) {
                resultsDiv.innerHTML = '';
                resultsDiv.classList.remove('active');
            }
            clearResults();
            showNotification('Analyse réinitialisée');
        });
    }

    // Gestion de l'analyse pro
    if (analyzeBtnPro) {
        analyzeBtnPro.addEventListener('click', () => {
            const text = textareaPro?.value.trim();
            if (!text) {
                showNotification('Veuillez coller votre historique de transactions', 'error');
                return;
            }

            try {
                // TODO: Implémenter l'analyse pro une fois les patterns définis
                showNotification('Analyse pro en développement', 'info');
            } catch (error) {
                console.error('Erreur d\'analyse pro:', error);
                showNotification('Une erreur est survenue lors de l\'analyse', 'error');
            }
        });
    }

    if (resetBtnPro) {
        resetBtnPro.addEventListener('click', () => {
            if (textareaPro) textareaPro.value = '';
            if (resultsDivPro) {
                resultsDivPro.innerHTML = '';
                resultsDivPro.classList.remove('active');
            }
            showNotification('Analyse pro réinitialisée');
        });
    }
}

function initCompareFeature() {
    const compareBtn = document.getElementById('compare-button');
    const resetCompareBtn = document.getElementById('reset-compare-button');
    const shop1Input = document.getElementById('shop1-input');
    const shop2Input = document.getElementById('shop2-input');
    const resultsDiv = document.getElementById('comparison-results');

    if (compareBtn) {
        compareBtn.addEventListener('click', () => {
            const shop1Text = shop1Input?.value.trim();
            const shop2Text = shop2Input?.value.trim();

            if (!shop1Text || !shop2Text) {
                showNotification('Veuillez remplir les informations des deux boutiques', 'error');
                return;
            }

            try {
                const comparisonData = compareShops(shop1Text, shop2Text);
                displayComparisonResults(comparisonData, resultsDiv);
                showNotification('Comparaison terminée avec succès', 'success');
            } catch (error) {
                console.error('Erreur de comparaison:', error);
                showNotification('Une erreur est survenue lors de la comparaison', 'error');
            }
        });
    }

    if (resetCompareBtn) {
        resetCompareBtn.addEventListener('click', () => {
            if (shop1Input) shop1Input.value = '';
            if (shop2Input) shop2Input.value = '';
            if (resultsDiv) {
                resultsDiv.innerHTML = '';
                resultsDiv.classList.remove('active');
            }
            showNotification('Comparaison réinitialisée');
        });
    }
}

function displayComparisonResults(data, container) {
    if (!container || !data) return;

    const { shop1, shop2, comparison } = data;

    container.innerHTML = `
        <div class="results-grid">
            <div class="result-card">
                <h3>📊 Comparaison Générale</h3>
                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th>Métrique</th>
                            <th>${shop1.profile.shopName}</th>
                            <th>${shop2.profile.shopName}</th>
                            <th>Différence</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Abonnés</td>
                            <td>${shop1.profile.followers}</td>
                            <td>${shop2.profile.followers}</td>
                            <td>${comparison.followers.difference} (${comparison.followers.percentage}%)</td>
                        </tr>
                        <tr>
                            <td>Note moyenne</td>
                            <td>${shop1.profile.rating.toFixed(1)}/5</td>
                            <td>${shop2.profile.rating.toFixed(1)}/5</td>
                            <td>${comparison.rating.difference} (${comparison.rating.percentage}%)</td>
                        </tr>
                        <tr>
                            <td>Articles vendus</td>
                            <td>${shop1.metrics.itemsSold}</td>
                            <td>${shop2.metrics.itemsSold}</td>
                            <td>${comparison.sales.difference} (${comparison.sales.percentage}%)</td>
                        </tr>
                        <tr>
                            <td>Prix moyen</td>
                            <td>${shop1.metrics.averagePrice.toFixed(2)}€</td>
                            <td>${shop2.metrics.averagePrice.toFixed(2)}€</td>
                            <td>${comparison.averagePrice.difference}€ (${comparison.averagePrice.percentage}%)</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    container.classList.add('active');
}

function initPDFExport() {
    document.querySelectorAll('.export-pdf').forEach(button => {
        button.addEventListener('click', () => {
            try {
                const section = button.closest('section');
                if (!section) {
                    throw new Error('Section non trouvée');
                }

                const resultsContainer = section.querySelector('.results-container');
                if (!resultsContainer || !resultsContainer.classList.contains('active')) {
                    showNotification('Veuillez d\'abord effectuer une analyse', 'warning');
                    return;
                }

                let exportData;
                const pageId = section.id;

                // Récupération des données en fonction du type de page
                if (pageId === 'main') {
                    // Extraire les données depuis les éléments HTML
                    const profileCard = resultsContainer.querySelector('[data-section="profile-info"]');
                    const statsCard = resultsContainer.querySelector('[data-section="stats-info"]');
                    
                    if (!profileCard || !statsCard) {
                        throw new Error('Données d\'analyse introuvables');
                    }

                    exportData = {
                        profile: {
                            shopName: extractValue(profileCard, 'Boutique'),
                            rating: parseFloat(extractValue(profileCard, 'Note')),
                            followers: parseInt(extractValue(profileCard, 'Abonnés')),
                            totalRatings: parseInt(extractValue(profileCard, 'Total des ventes'))
                        },
                        metrics: {
                            totalItems: parseInt(extractValue(statsCard, 'Articles en vente')),
                            itemsSold: parseInt(extractValue(statsCard, 'Articles vendus')),
                            averagePrice: parseFloat(extractValue(statsCard, 'Prix moyen')),
                            conversionRate: parseFloat(extractValue(statsCard, 'Taux de conversion'))
                        }
                    };
                } else if (pageId === 'compare') {
                    // Pour la comparaison, on utilise directement les données affichées dans le tableau
                    exportData = extractComparisonData(resultsContainer);
                }

                // Export du PDF avec les données extraites
                exportToPDF(exportData, pageId === 'compare' ? 'comparison' : 'single');
                showNotification('Export PDF généré avec succès', 'success');
            } catch (error) {
                console.error('Erreur lors de l\'export PDF:', error);
                showNotification('Une erreur est survenue lors de l\'export PDF', 'error');
            }
        });
    });
}

// Fonction utilitaire pour extraire les valeurs
function extractValue(element, label) {
    const strongElement = element.querySelector(`p:contains("${label}:") strong`);
    if (!strongElement) return '';
    const value = strongElement.textContent.trim();
    return value.replace(/[€%]/g, ''); // Enlève les symboles € et %
}

// Fonction pour extraire les données de comparaison
function extractComparisonData(container) {
    const table = container.querySelector('.comparison-table');
    if (!table) throw new Error('Tableau de comparaison introuvable');

    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const [shop1Name, shop2Name] = Array.from(table.querySelectorAll('thead th')).slice(1, 3).map(th => th.textContent);

    const shop1 = { profile: { shopName: shop1Name }, metrics: {} };
    const shop2 = { profile: { shopName: shop2Name }, metrics: {} };
    const comparison = {};

    // Extraction des données ligne par ligne
    rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        const metric = cells[0].textContent.toLowerCase().replace(/ /g, '_');
        shop1.metrics[metric] = parseFloat(cells[1].textContent);
        shop2.metrics[metric] = parseFloat(cells[2].textContent);
        comparison[metric] = {
            difference: parseFloat(cells[3].textContent.split('(')[0]),
            percentage: parseFloat(cells[3].textContent.match(/\((.*?)%\)/)[1])
        };
    });

    return { shop1, shop2, comparison };
}
