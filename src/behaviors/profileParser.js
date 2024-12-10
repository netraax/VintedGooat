import { calculateBasicMetrics } from './metrics/basicMetrics.js';
export function analyzeProfile(text) {
    return {
        profile: extractProfileInfo(text),
        sales: extractSalesInfo(text),
        items: extractItems(text),
        financials: extractFinancials(text),
        metrics: calculateMetrics(text)
    };
}

function extractProfileInfo(text) {
    const info = {
        shopName: '',
        followers: 0,
        following: 0,
        totalRatings: 0,
        memberRatings: 0,
        autoRatings: 0,
        rating: 0,
        isPro: false,
        businessInfo: null
    };

    // Nom de la boutique
    const shopNameMatch = text.match(/^([^\n]+)(?=\nÀ propos|$)/m);
    if (shopNameMatch) {
        info.shopName = shopNameMatch[1].trim();
    }

    // Détection compte pro
    info.isPro = text.includes('Pro\n@') || text.includes('Numéro d\'entreprise');

    // Infos business si compte pro
    if (info.isPro) {
        const businessMatch = text.match(/Numéro d'entreprise\s+([^\n]+)\s*([^\n]+)\s*R\.C\.S/);
        if (businessMatch) {
            info.businessInfo = {
                siret: businessMatch[1],
                rcs: businessMatch[2]
            };
        }
    }

    // Abonnés et abonnements
    const followersMatch = text.match(/(\d+)\s*Abonnés/);
    const followingMatch = text.match(/(\d+)\s*Abonnement/);
    if (followersMatch) info.followers = parseInt(followersMatch[1]);
    if (followingMatch) info.following = parseInt(followingMatch[1]);

    // Évaluations
    const ratingsMatch = text.match(/Évaluations des membres \((\d+)\)/);
    const autoEvalMatch = text.match(/Évaluations automatiques \((\d+)\)/);
    if (ratingsMatch) info.memberRatings = parseInt(ratingsMatch[1]);
    if (autoEvalMatch) info.autoRatings = parseInt(autoEvalMatch[1]);
    info.totalRatings = info.memberRatings + info.autoRatings;

    // Note globale
    const ratingMatch = text.match(/(\d+[.,]\d+)\s*\(/);
    if (ratingMatch) info.rating = parseFloat(ratingMatch[1].replace(',', '.'));

    return info;
}

function extractItems(text) {
    const items = [];
    // Pattern amélioré pour inclure les stats
    const itemPattern = /([^,]+), prix : (\d+,\d+) €, marque : ([^,]+), taille : ([^\n]+)(?:\n(\d+) vues\s*\n\s*(\d+) favoris)?(?:\nVendu)?/g;
    let match;

    while ((match = itemPattern.exec(text)) !== null) {
        const item = {
            name: match[1].trim(),
            price: parseFloat(match[2].replace(',', '.')),
            brand: match[3].trim(),
            size: match[4].trim(),
            views: match[5] ? parseInt(match[5]) : 0,
            favorites: match[6] ? parseInt(match[6]) : 0,
            isSold: text.substring(match.index, match.index + 200).includes('Vendu')
        };
        items.push(item);
    }

    return items;
}

function extractSalesInfo(text) {
    const sales = {
        byDate: {},
        byCountry: {},
        recent: [],
        totalAmount: 0,
        conversionRate: 0
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
        sales.recent.push({ timeAgo: amount, unit });
    }

    // Détection des pays par langue
    const languages = {
        'merci|parfait|nickel': 'France',
        'grazie|perfetto': 'Italie',
        'gracias|perfecto': 'Espagne',
        'thank you|perfect': 'Royaume-Uni',
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

function extractFinancials(text) {
    const financials = {
        currentBalance: 0,
        initialBalance: 0,
        transactions: [],
        totalRevenue: 0,
        totalExpenses: 0,
        boostExpenses: 0,
        transfers: []
    };

    // Extraction des soldes
    const balancePattern = /Solde (initial|final)\s*(\d+,\d+) €/g;
    let match;
    while ((match = balancePattern.exec(text)) !== null) {
        const amount = parseFloat(match[2].replace(',', '.'));
        if (match[1] === 'initial') {
            financials.initialBalance = amount;
        } else {
            financials.currentBalance = amount;
        }
    }

    // Extraction des transactions
    const transactionPattern = /(Vente|Commande d'un Boost|Commande Dressing en vitrine|Transfert vers le compte bancaire)\s*([^\n]+)\s*([+-]?\d+,\d+) €\s*(\d+ \w+ \d{4})?/g;
    while ((match = transactionPattern.exec(text)) !== null) {
        const type = match[1];
        const description = match[2].trim();
        const amount = parseFloat(match[3].replace(',', '.'));
        const date = match[4] ? new Date(match[4]) : null;

        const transaction = { type, description, amount, date };

        if (type === 'Vente') {
            financials.totalRevenue += amount;
        } else if (type.includes('Boost') || type.includes('vitrine')) {
            financials.boostExpenses += Math.abs(amount);
            financials.totalExpenses += Math.abs(amount);
        } else if (type.includes('Transfert')) {
            financials.transfers.push(transaction);
        }

        financials.transactions.push(transaction);
    }

    return financials;
}

function calculateMetrics(text) {
    const items = extractItems(text);
    const sales = extractSalesInfo(text);
    const financials = extractFinancials(text);

    const metrics = {
        totalItems: items.length,
        itemsSold: items.filter(item => item.isSold).length,
        averagePrice: 0,
        totalViews: 0,
        totalFavorites: 0,
        conversionRate: 0,
        revenuePerItem: 0,
        topBrands: {},
        salesVelocity: 0
    };

    // Calculs des métriques
    if (items.length > 0) {
        metrics.averagePrice = items.reduce((sum, item) => sum + item.price, 0) / items.length;
        metrics.totalViews = items.reduce((sum, item) => sum + item.views, 0);
        metrics.totalFavorites = items.reduce((sum, item) => sum + item.favorites, 0);
        metrics.conversionRate = (metrics.itemsSold / metrics.totalViews) * 100;
        metrics.revenuePerItem = financials.totalRevenue / metrics.itemsSold;
        
        // Top marques
        items.forEach(item => {
            metrics.topBrands[item.brand] = (metrics.topBrands[item.brand] || 0) + 1;
        });
    }

    // Calcul de la vélocité des ventes
    const salesDates = Object.keys(sales.byDate).map(date => new Date(date));
    if (salesDates.length > 1) {
        const oldestSale = Math.min(...salesDates.map(d => d.getTime()));
        const newestSale = Math.max(...salesDates.map(d => d.getTime()));
        const weeksDiff = (newestSale - oldestSale) / (1000 * 60 * 60 * 24 * 7);
        metrics.salesVelocity = salesDates.length / weeksDiff;
    }

    return metrics;
}

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
