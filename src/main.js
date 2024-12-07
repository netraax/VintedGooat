import '../css/style.css';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initAnalysis();
});

function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const pages = document.querySelectorAll('.page');

    // Gérer la navigation
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetPage = button.getAttribute('data-page');

            // Mettre à jour les boutons actifs
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Afficher la bonne page
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
    const analyzeBtn = document.getElementById('analyze-btn');
    const resetBtn = document.getElementById('reset-btn');
    const textarea = document.getElementById('shop-input');
    const resultsDiv = document.getElementById('results');

    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', () => {
            const text = textarea?.value.trim();
            if (!text) {
                alert('Veuillez coller le contenu de votre profil Vinted');
                return;
            }

            try {
                const data = analyzeVintedProfile(text);
                displayResults(data);
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
        });
    }
}

function analyzeVintedProfile(text) {
    // Fonction d'analyse existante
    // Retourne les données analysées
}

function displayResults(data) {
    // Fonction d'affichage existante
    // Affiche les résultats dans l'interface
}
