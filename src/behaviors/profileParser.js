// Fonctions d'analyse de profil
export function analyzeProfile(text) {
    const data = {
        evaluations: [],
        totalSales: 0,
        salesByDate: {},
        salesByCountry: {},
        responseTime: 0
    };

    try {
        // Extraction des évaluations
        const evaluationPattern = /il y a (\d+) (jours?|mois|ans?)/g;
        const languagePattern = /(merci|thank you|grazie|gracias|danke)/gi;
        
        let match;
        while ((match = evaluationPattern.exec(text)) !== null) {
            const timeAgo = parseInt(match[1]);
            const unit = match[2];
            
            // Convertir en date
            const date = calculateDate(timeAgo, unit);
            
            // Ajouter à salesByDate
            const dateKey = date.toISOString().split('T')[0];
            data.salesByDate[dateKey] = (data.salesByDate[dateKey] || 0) + 1;
            
            data.totalSales++;
        }

        // Analyse des langues/pays
        let langMatch;
        while ((langMatch = languagePattern.exec(text)) !== null) {
            const language = langMatch[1].toLowerCase();
            const country = getCountryFromLanguage(language);
            data.salesByCountry[country] = (data.salesByCountry[country] || 0) + 1;
        }

    } catch (error) {
        console.error('Erreur lors de l\'analyse:', error);
        throw error;
    }

    return data;
}

function calculateDate(timeAgo, unit) {
    const date = new Date();
    switch (unit) {
        case 'jour':
        case 'jours':
            date.setDate(date.getDate() - timeAgo);
            break;
        case 'mois':
            date.setMonth(date.getMonth() - timeAgo);
            break;
        case 'an':
        case 'ans':
            date.setFullYear(date.getFullYear() - timeAgo);
            break;
    }
    return date;
}

function getCountryFromLanguage(language) {
    const countryMap = {
        'merci': 'France',
        'thank you': 'Angleterre',
        'grazie': 'Italie',
        'gracias': 'Espagne',
        'danke': 'Allemagne'
    };
    return countryMap[language] || 'Autre';
}
