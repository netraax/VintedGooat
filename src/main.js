import '../css/style.css';

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    console.log('Application VintedGooat chargée');
    initializeAnalysis();
});

function initializeAnalysis() {
    // Récupérer les éléments du DOM
    const analyzeButton = document.getElementById('analyze-button');
    const resetButton = document.getElementById('reset-button');
    const inputTextarea = document.getElementById('profile-input');
    const resultsContainer = document.getElementById('analysis-results');

    console.log('Initialisation des boutons:', { analyzeButton, resetButton });

    if (analyzeButton) {
        analyzeButton.addEventListener('click', () => {
            console.log('Bouton Analyser cliqué');
            const text = inputTextarea?.value.trim();
            
            if (!text) {
                alert('Veuillez coller le contenu du profil Vinted');
                return;
            }

            try {
                const results = analyzeVintedProfile(text);
                displayResults(results, resultsContainer);
            } catch (error) {
                console.error('Erreur lors de l\'analyse:', error);
                alert('Une erreur est survenue lors de l\'analyse');
            }
        });
    }

    if (resetButton) {
        resetButton.addEventListener('click', () => {
            console.log('Réinitialisation');
            if (inputTextarea) inputTextarea.value = '';
            if (resultsContainer) resultsContainer.innerHTML = '';
        });
    }
}

function analyzeVintedProfile(text) {
    console.log('Analyse du texte en cours');
    
    // Extraction des données
    const data = {
        profile: extractProfileInfo(text),
        sales: extractSalesInfo(text),
        items: extractItems(text)
    };

    console.log('Données extraites:', data);
    return data;
}

function extractProfileInfo(text) {
    // Extraction du nom de la boutique
    const shopNameMatch = text.match(/^([^\n]+)(?=\nÀ propos)/m);
    const shopName = shopNameMatch ? shopNameMatch[1].trim() : '';

    // Extraction des abonnés/abonnements
    const followersMatch = text.match(/(\d+)\s*Abonnés?/);
    const followingMatch = text.match(/(\d+)\s*Abonnements?/);
    
    // Extraction de la note et des évaluations
    const ratingMatch = text.match(/(\d+\.\d+)\s*\(/);
    const evaluationsMatch = text.match(/Évaluations des membres \((\d+)\)/);
    const autoEvalMatch = text.match(/Évaluations automatiques \((\d+)\)/);

    return {
        shopName,
        followers: followersMatch ? parseInt(followersMatch[1]) : 0,
        following: followingMatch ? parseInt(followingMatch[1]) : 0,
        rating: ratingMatch ? parseFloat(ratingMatch[1]) : 0,
        totalEvaluations: (evaluationsMatch ? parseInt(evaluationsMatch[1]) : 0) +
                         (autoEvalMatch ? parseInt(autoEvalMatch[1]) : 0)
    };
}

function extractSalesInfo(text) {
    const sales = {
        total: 0,
        byCountry: {},
        recent: []
    };

    // Extraction des dates de vente
    const datePattern = /il y a (\d+) (jour|jours|semaine|semaines|mois|an|ans)/g;
    let match;
    while ((match = datePattern.exec(text)) !== null) {
        sales.total++;
        sales.recent.push({
            timeAgo: parseInt(match[1]),
            unit: match[2]
        });
    }

    // Détection des pays par langue
    const languages = {
        'merci|parfait': 'France',
        'grazie': 'Italie',
        'thank you': 'Royaume-Uni',
        'gracias|perfecto': 'Espagne',
        'danke': 'Allemagne'
    };

    Object.entries(languages).forEach(([pattern, country]) => {
        const regex = new RegExp(pattern, 'gi');
        const matches = text.match(regex);
        if (matches) {
            sales.byCountry[country] = matches.length;
        }
    });

    return sales;
}

function extractItems(text) {
    const items = [];
    const itemPattern = /([^,]+), prix : (\d+,\d+) €, marque : ([^,]+), taille : ([^\n]+)/g;
    let match;

    while ((match = itemPattern.exec(text)) !== null) {
        items.push({
            name: match[1].trim(),
            price: parseFloat(match[2].replace(',', '.')),
            brand: match[3].trim(),
            size: match[4].trim()
        });
    }

    return items;
}

function displayResults(data, container) {
    if (!container) return;

    console.log('Affichage des résultats:', data);

    const html = `
        <div class="results-grid">
            <div class="result-card">
                <h3>Informations du Profil</h3>
                <p>Boutique: ${data.profile.shopName}</p>
                <p>Abonnés: ${data.profile.followers}</p>
                <p>Note: ${data.profile.rating}/5</p>
                <p>Total des ventes: ${data.profile.totalEvaluations}</p>
            </div>
            
            <div class="result-card">
                <h3>Ventes par Pays</h3>
                <ul>
                    ${Object.entries(data.sales.byCountry)
                        .map(([country, count]) => 
                            `<li>${country}: ${count} vente${count > 1 ? 's' : ''}</li>`
                        ).join('')}
                </ul>
            </div>
            
            <div class="result-card">
                <h3>Ventes Récentes</h3>
                <ul>
                    ${data.sales.recent.slice(0, 5)
                        .map(sale => 
                            `<li>Il y a ${sale.timeAgo} ${sale.unit}</li>`
                        ).join('')}
                </ul>
            </div>
        </div>
    `;

    container.innerHTML = html;
    container.style.display = 'block';
}
