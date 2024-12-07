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
                const data = analyzeVintedProfile(text);
                displayResults(data, resultsDiv);
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
    const data = {
        profile: extractProfileInfo(text),
        sales: extractSalesInfo(text),
        items: extractItems(text)
    };
    return data;
}

function extractProfileInfo(text) {
    const info = {
        shopName: '',
        followers: 0,
        following: 0,
        rating: 0,
        totalRatings: 0
    };

    // Extraction du nom de la boutique
    const shopNameMatch = text.match(/^([^\n]+)(?=\nÀ propos)/m);
    if (shopNameMatch) {
        info.shopName = shopNameMatch[1].trim();
    }

    // Extraction des abonnés/abonnements
    const followersMatch = text.match(/(\d+)\s*Abonnés?/);
    const followingMatch = text.match(/(\d+)\s*Abonnements?/);
    if (followersMatch) info.followers = parseInt(followersMatch[1]);
    if (followingMatch) info.following = parseInt(followingMatch[1]);

    // Extraction des évaluations
    const ratingsMatch = text.match(/Évaluations des membres \((\d+)\)/);
    const autoEvalMatch = text.match(/Évaluations automatiques \((\d+)\)/);
    if (ratingsMatch) info.totalRatings += parseInt(ratingsMatch[1]);
    if (autoEvalMatch) info.totalRatings += parseInt(autoEvalMatch[1]);

    // Note globale
    const ratingMatch = text.match(/(\d+\.\d+)\s*\(/);
    if (ratingMatch) info.rating = parseFloat(ratingMatch[1]);

    return info;
}

function extractSalesInfo(text) {
    const sales = {
        byDate: {},
        byCountry: {},
        recent: []
    };

    // Extraction des dates de vente
    const datePattern = /il y a (\d+) (jour|jours|semaine|semaines|mois|an|ans)/g;
    let match;
    while ((match = datePattern.exec(text)) !== null) {
        const amount = parseInt(match[1]);
        const unit = match[2];
        
        sales.recent.push({ timeAgo: amount, unit });
    }

    // Détection des pays par langue
    const languages = {
        'merci|parfait': 'France',
        'grazie|perfetto': 'Italie',
        'gracias|perfecto': 'Espagne',
        'thank you': 'Royaume-Uni',
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

    const html = `
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
                <p>Articles en vente: ${data.items.length}</p>
                <p>Prix moyen: ${(data.items.reduce((sum, item) => sum + item.price, 0) / data.items.length).toFixed(2)}€</p>
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
