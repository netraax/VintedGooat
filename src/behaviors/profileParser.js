// Fonction principale d'analyse
export function analyzeProfile(text) {
    return {
        profile: extractProfileInfo(text),
        sales: extractSalesInfo(text),
        items: extractItems(text),
        metrics: calculateMetrics(text)
    };
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
        rating: 0
    };

    // Nom de la boutique
    const shopNameMatch = text.match(/^([^\n]+)(?=\nÀ propos)/);
    if (shopNameMatch) {
        info.shopName = shopNameMatch[1].trim();
    }

    // Abonnés et abonnements
    const followersMatch = text.match(/(\d+)\s*Abonnés/);
    const followingMatch = text.match(/(\d+)\s*Abonnement/);
    if (followersMatch) info.followers = parseInt(followersMatch[1]);
    if (followingMatch) info.following = parseInt(followingMatch[1]);

    // Évaluations
    const ratingsMatch = text.match(/Évaluations des membres \((\d+)\)\s*Évaluations automatiques \((\d+)\)/);
    if (ratingsMatch) {
        info.memberRatings = parseInt(ratingsMatch[1]);
        info.autoRatings = parseInt(ratingsMatch[2]);
        info.totalRatings = info.memberRatings + info.autoRatings;
    }

    // Note globale
    const ratingMatch = text.match(/(\d+\.\d+)\s*\(/);
    if (ratingMatch) {
        info.rating = parseFloat(ratingMatch[1]);
    }

    return info;
}

// Extraction des informations de vente
function extractSalesInfo(text) {
    const sales = {
        byDate: {},
        byCountry: {},
        recentSales: []
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

    // Détection des pays par langue
    const languagePatterns = {
        'merci|parfait|nickel': 'France',
        'thank you|thanks': 'Royaume-Uni',
        'grazie|perfetto': 'Italie',
        'gracias|perfecto': 'Espagne',
        'danke': 'Allemagne'
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

// Calcul des métriques
function calculateMetrics(text) {
    const metrics = {
        averagePrice: 0,
        totalRevenue: 0,
        topBrands: {},
        salesVelocity: 0,
        engagementRate: 0
    };

    // Calcul des prix moyens et revenus
    const items = extractItems(text);
    if (items.length > 0) {
        const prices = items.map(item => item.price);
        metrics.averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        metrics.totalRevenue = prices.reduce((a, b) => a + b, 0);
    }

    // Marques les plus vendues
    items.forEach(item => {
        metrics.topBrands[item.brand] = (metrics.topBrands[item.brand] || 0) + 1;
    });

    // Vélocité des ventes (ventes par semaine)
    const sales = extractSalesInfo(text);
    const salesDates = Object.keys(sales.byDate).map(date => new Date(date));
    if (salesDates.length > 1) {
        const oldestSale = Math.min(...salesDates.map(d => d.getTime()));
        const newestSale = Math.max(...salesDates.map(d => d.getTime()));
        const weeksDiff = (newestSale - oldestSale) / (1000 * 60 * 60 * 24 * 7);
        metrics.salesVelocity = salesDates.length / weeksDiff;
    }

    return metrics;
}

// Fonction utilitaire pour calculer les dates
function calculateDate(amount, unit) {
    const date = new Date();
    switch(unit) {
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
