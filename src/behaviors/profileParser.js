// Fonction principale d'analyse
export function analyzeProfile(text) {
    const data = {
        profile: extractProfileInfo(text),
        sales: extractSalesInfo(text),
        items: extractItems(text),
        totalArticles: extractTotalArticles(text),
    };

    data.metrics = calculateMetrics(data);
    return data;
}

// Extraction des informations du profil
function extractProfileInfo(text) {
    const info = {
        shopName: '',
        followers: 0,
        following: 0,
        totalRatings: 0,
        memberRatings: 0,
        autoRatings: 0,
        rating: 0,
    };

    // Nom de la boutique
    const shopNameMatch = text.match(/^([^\n]+)(?=\s*À propos|$)/m);
    if (shopNameMatch) {
        info.shopName = shopNameMatch[1].trim();
    }

    // Abonnés et abonnements
    const followersMatch = text.match(/(\d+)\s*Abonnés?/);
    const followingMatch = text.match(/(\d+)\s*Abonnements?/);
    if (followersMatch) info.followers = parseInt(followersMatch[1]);
    if (followingMatch) info.following = parseInt(followingMatch[1]);

    // Évaluations des membres et automatiques
    const ratingsMatch = text.match(/Évaluations des membres \((\d+)\)/);
    const autoRatingsMatch = text.match(/Évaluations automatiques \((\d+)\)/);
    if (ratingsMatch) info.memberRatings = parseInt(ratingsMatch[1]);
    if (autoRatingsMatch) info.autoRatings = parseInt(autoRatingsMatch[1]);
    info.totalRatings = info.memberRatings + info.autoRatings;

    // Note globale
    const ratingMatch = text.match(/(\d+[.,]\d+)\s*\(/);
    if (ratingMatch) info.rating = parseFloat(ratingMatch[1].replace(',', '.'));

    return info;
}

// Extraction des informations sur les ventes
function extractSalesInfo(text) {
    const sales = {
        byDate: {},
        byCountry: {},
        recentSales: [],
    };

    // Extraction des dates de vente
    const datePattern = /il y a (\d+) (heure|heures|jour|jours|semaine|semaines|mois|an|ans)/g;
    let match;
    while ((match = datePattern.exec(text)) !== null) {
        const amount = parseInt(match[1]);
        const unit = match[2];
        const date = calculateDate(amount, unit);
        const dateStr = date.toISOString().split('T')[0];

        sales.byDate[dateStr] = (sales.byDate[dateStr] || 0) + 1;
        sales.recentSales.push({ date, amount, unit });
    }

    // Comptage des ventes par pays
    const languagePatterns = {
        'merci|parfait|nickel': 'France',
        'thank you|perfect': 'Royaume-Uni',
        'grazie|perfetto': 'Italie',
        'gracias|perfecto': 'Espagne',
        'danke|perfekt': 'Allemagne',
    };

    Object.entries(languagePatterns).forEach(([pattern, country]) => {
        const regex = new RegExp(pattern, 'gi');
        const matches = text.match(regex);
        if (matches) {
            sales.byCountry[country] = matches.length;
        }
    });

    return sales;
}

// Extraction des articles
function extractItems(text) {
    const items = [];
    const itemPattern = /([^,]+),\s*prix\s*:\s*(\d+[.,]\d+)\s*€,\s*marque\s*:\s*([^,]+),\s*taille\s*:\s*([^\n]+)/g;
    let match;

    while ((match = itemPattern.exec(text)) !== null) {
        items.push({
            name: match[1].trim(),
            price: parseFloat(match[2].replace(',', '.')),
            brand: match[3].trim(),
            size: match[4].trim(),
        });
    }

    return items;
}

// Extraction du total des articles
function extractTotalArticles(text) {
    const articlesMatch = text.match(/(\d+)\s*articles?|(\d+)\s*article/);
    return articlesMatch ? parseInt(articlesMatch[1] || articlesMatch[2]) : 0;
}

// Calcul des métriques
function calculateMetrics(data) {
    const totalRevenue = data.items.reduce((sum, item) => sum + item.price, 0);
    const averagePrice = data.items.length > 0 ? totalRevenue / data.items.length : 0;
    const salesVelocity = data.sales.recentSales.length > 0
        ? (data.sales.recentSales.length / 30).toFixed(2)
        : 0;

    return {
        averagePrice,
        totalRevenue,
        salesVelocity,
        topBrands: calculateTopBrands(data.items),
        conversionRate: ((data.profile.totalRatings / Math.max(data.totalArticles, 1)) * 100).toFixed(1),
    };
}

// Calcul des marques les plus populaires
function calculateTopBrands(items) {
    const topBrands = {};
    items.forEach(item => {
        topBrands[item.brand] = (topBrands[item.brand] || 0) + 1;
    });
    return topBrands;
}

// Fonction utilitaire pour calculer une date à partir d'une période
function calculateDate(amount, unit) {
    const date = new Date();
    switch (unit) {
        case 'heure':
        case 'heures':
            date.setHours(date.getHours() - amount);
            break;
        case 'jour':
        case 'jours':
            date.setDate(date.getDate() - amount);
            break;
        case 'semaine':
        case 'semaines':
            date.setDate(date.getDate() - (amount * 7));
            break;
        case 'mois':
            date.setMonth(date.getMonth() - amount);
            break;
        case 'an':
        case 'ans':
            date.setFullYear(date.getFullYear() - amount);
            break;
    }
    return date;
}
