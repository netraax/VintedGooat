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
}
