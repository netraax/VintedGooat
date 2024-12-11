import '../css/style.css';
import { initializeAnalytics } from './behaviors/analytics.js';
import { setupNotifications, showNotification } from './behaviors/notifications.js';
import { initNavigation, displayResults, clearResults } from './behaviors/uiManager.js';
import { compareShops } from './behaviors/compareShops.js';
import { exportToPDF } from './behaviors/pdfExport.js';
import { PatternDetectionSystem } from './behaviors/patternDetection.js';

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

    // Gestion de l'analyse boutique
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', async () => {
            const text = textarea?.value.trim();
            if (!text) {
                showNotification('Veuillez coller le contenu de votre profil Vinted', 'error');
                return;
            }

            try {
                const detector = new PatternDetectionSystem({ text });
                const { data: analysisData, charts } = await detector.analyzeAndFormat();
                displayResults(analysisData, resultsDiv);
                showNotification('Analyse terminée avec succès', 'success');
            } catch (error) {
                console.error('Erreur d\'analyse:', error);
                showNotification('Une erreur est survenue lors de l\'analyse', 'error');
            }
        });
    }

    // Gestion de l'analyse pro
    if (analyzeBtnPro) {
        analyzeBtnPro.addEventListener('click', async () => {
            const text = textareaPro?.value.trim();
            if (!text) {
                showNotification('Veuillez coller votre historique de transactions', 'error');
                return;
            }

            try {
                const detector = new PatternDetectionSystem({ text, isPro: true });
                const { data: analysisData, charts } = await detector.analyzeAndFormat();
                displayResults(analysisData, resultsDivPro);
                showNotification('Analyse terminée avec succès', 'success');
            } catch (error) {
                console.error('Erreur d\'analyse pro:', error);
                showNotification('Une erreur est survenue lors de l\'analyse', 'error');
            }
        });
    }

    // ... reste du code pour reset buttons ...
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
                           <td>${comparison?.followers?.difference || 0} (${comparison?.followers?.percentage || 0}%)</td>
                       </tr>
                       <tr>
                           <td>Note moyenne</td>
                           <td>${shop1.profile.rating?.toFixed(1) || 0}/5</td>
                           <td>${shop2.profile.rating?.toFixed(1) || 0}/5</td>
                           <td>${comparison?.rating?.difference || 0} (${comparison?.rating?.percentage || 0}%)</td>
                       </tr>
                       <tr>
                           <td>Articles vendus</td>
                           <td>${shop1.metrics.itemsSold || 0}</td>
                           <td>${shop2.metrics.itemsSold || 0}</td>
                           <td>${comparison?.sales?.difference || 0} (${comparison?.sales?.percentage || 0}%)</td>
                       </tr>
                       <tr>
                           <td>Prix moyen</td>
                           <td>${(shop1.metrics.averagePrice || 0).toFixed(2)}€</td>
                           <td>${(shop2.metrics.averagePrice || 0).toFixed(2)}€</td>
                           <td>${comparison?.averagePrice?.difference || 0}€ (${comparison?.averagePrice?.percentage || 0}%)</td>
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
        button.addEventListener('click', async () => {
            try {
                const section = button.closest('section');
                if (!section) return;

                const resultsContainer = section.querySelector('.results-container');
                if (!resultsContainer || !resultsContainer.classList.contains('active')) {
                    showNotification('Veuillez d\'abord effectuer une analyse', 'warning');
                    return;
                }

                let exportData;

                if (section.id === 'main') {
                    // Pour l'analyse standard
                    const text = document.getElementById('profile-input').value;
                    if (text) {
                        const detector = new PatternDetectionSystem({ text });
                        const { data } = await detector.analyzeAndFormat();
                        exportData = data;
                    }
                } else if (section.id === 'compare') {
                    // Pour la comparaison
                    // ... reste du code pour la comparaison ...
                }

                if (!exportData) {
                    throw new Error('Données non disponibles');
                }

                // Export en PDF
                exportToPDF(exportData, section.id === 'compare' ? 'comparison' : 'single');
                showNotification('Export PDF généré avec succès', 'success');
            } catch (error) {
                console.error('Erreur lors de l\'export PDF:', error);
                showNotification('Une erreur est survenue lors de l\'export PDF', 'error');
            }
        });
    });
}
