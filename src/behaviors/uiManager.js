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
            const section = button.closest('section');
            const resultsContainer = section.querySelector('.results-container');

            if (!resultsContainer || !resultsContainer.classList.contains('active')) {
                showNotification('Veuillez d\'abord effectuer une analyse', 'warning');
                return;
            }

            try {
                // Déterminer le type d'export en fonction de la section
                const pageId = section.id;
                switch (pageId) {
                    case 'main':
                        const profileData = getAnalysisDataFromUI(resultsContainer);
                        exportToPDF(profileData, 'single');
                        break;
                    case 'compare':
                        const comparisonData = getComparisonDataFromUI(resultsContainer);
                        exportToPDF(comparisonData, 'comparison');
                        break;
                    case 'analyse-pro':
                        const proData = getProAnalysisDataFromUI(resultsContainer);
                        exportToPDF(proData, 'pro');
                        break;
                }
                showNotification('Export PDF généré avec succès', 'success');
            } catch (error) {
                console.error('Erreur lors de l\'export PDF:', error);
                showNotification('Une erreur est survenue lors de l\'export PDF', 'error');
            }
        });
    });
}

// Fonctions utilitaires pour récupérer les données d'analyse depuis l'UI
function getAnalysisDataFromUI(container) {
    // Implémentation de la récupération des données d'analyse standard
    // Cette fonction doit être adaptée à votre structure HTML
    return {};
}

function getComparisonDataFromUI(container) {
    // Implémentation de la récupération des données de comparaison
    // Cette fonction doit être adaptée à votre structure HTML
    return {};
}

function getProAnalysisDataFromUI(container) {
    // Implémentation de la récupération des données d'analyse pro
    // Cette fonction doit être adaptée à votre structure HTML
    return {};
}
