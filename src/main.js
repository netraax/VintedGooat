import '../css/style.css';
import { initializeAnalytics } from './behaviors/analytics.js';
import { setupNotifications, showNotification } from './behaviors/notifications.js';
import { analyzeProfile } from './behaviors/profileParser.js';
import { initNavigation, displayResults, clearResults } from './behaviors/uiManager.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialisation des modules
    initializeAnalytics();
    setupNotifications();
    initNavigation();
    initAnalysis();
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
