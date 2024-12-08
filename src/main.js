import '../css/style.css'

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    console.log('Application VintedGooat chargée')
    initializeApp()
})

// Fonction principale d'initialisation
function initializeApp() {
    setupNavigation()
    setupAnalysisFeatures()
}

// Configuration de la navigation
function setupNavigation() {
    const sections = {
        accueil: document.getElementById('accueil'),
        'analyse-boutique': document.getElementById('analyse-boutique'),
        'analyse-pro': document.getElementById('analyse-pro')
    }

    // Gestion des clics sur les liens de navigation
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault()
            const target = link.getAttribute('href').substring(1)
            
            // Cacher toutes les sections
            Object.values(sections).forEach(section => {
                if (section) section.style.display = 'none'
            })
            
            // Afficher la section cible
            if (sections[target]) {
                sections[target].style.display = 'block'
            }
            
            // Mise à jour de la classe active
            document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'))
            link.classList.add('active')
        })
    })
}

// Configuration des fonctionnalités d'analyse
function setupAnalysisFeatures() {
    const analyzeShopBtn = document.getElementById('analyze-shop')
    const resetShopBtn = document.getElementById('reset-shop')
    const shopInput = document.getElementById('shop-input')
    const shopResults = document.getElementById('shop-results')

    if (analyzeShopBtn) {
        analyzeShopBtn.addEventListener('click', () => {
            const text = shopInput ? shopInput.value.trim() : ''
            if (!text) {
                showNotification('Veuillez coller le contenu du profil Vinted', 'error')
                return
            }
            analyzeShopProfile(text)
        })
    }

    if (resetShopBtn) {
        resetShopBtn.addEventListener('click', () => {
            if (shopInput) shopInput.value = ''
            if (shopResults) {
                shopResults.innerHTML = ''
                shopResults.classList.remove('active')
            }
            showNotification('Analyse réinitialisée', 'info')
        })
    }
}

// Fonction d'analyse du profil boutique
function analyzeShopProfile(text) {
    try {
        // Extraction des informations
        const data = extractProfileData(text)
        
        // Affichage des résultats
        displayResults(data)
        
        showNotification('Analyse terminée avec succès', 'success')
    } catch (error) {
        console.error('Erreur lors de l\'analyse:', error)
        showNotification('Erreur lors de l\'analyse', 'error')
    }
}

// Extraction des données du profil
function extractProfileData(text) {
    const data = {
        evaluations: [],
        sales: 0,
        dates: [],
        countries: {}
    }

    // Extraction des évaluations et dates
    const evalPattern = /il y a (\d+) (jour|mois|an)/g
    let match
    while ((match = evalPattern.exec(text)) !== null) {
        const timeAgo = parseInt(match[1])
        const unit = match[2]
        data.evaluations.push({ timeAgo, unit })
        data.sales++
    }

    // Détection des pays par la langue
    const langPatterns = {
        'merci': 'France',
        'thank you': 'Angleterre',
        'grazie': 'Italie',
        'gracias': 'Espagne',
        'danke': 'Allemagne'
    }

    Object.entries(langPatterns).forEach(([phrase, country]) => {
        const regex = new RegExp(phrase, 'gi')
        const count = (text.match(regex) || []).length
        if (count > 0) {
            data.countries[country] = count
        }
    })

    return data
}

// Affichage des résultats
function displayResults(data) {
    const resultsContainer = document.getElementById('shop-results')
    if (!resultsContainer) return

    const html = `
        <div class="results-grid">
            <div class="result-card">
                <h3>Ventes Totales</h3>
                <div class="value">${data.sales}</div>
            </div>
            
            <div class="result-card">
                <h3>Répartition par Pays</h3>
                <div class="country-list">
                    ${Object.entries(data.countries)
                        .map(([country, count]) => `
                            <div class="country-item">
                                <span>${country}</span>
                                <span>${count} vente${count > 1 ? 's' : ''}</span>
                            </div>
                        `).join('')}
                </div>
            </div>

            <div class="result-card">
                <h3>Activité Récente</h3>
                <div class="activity-list">
                    ${data.evaluations.slice(0, 5)
                        .map(eval => `
                            <div class="activity-item">
                                <span>Il y a ${eval.timeAgo} ${eval.unit}${eval.timeAgo > 1 ? 's' : ''}</span>
                            </div>
                        `).join('')}
                </div>
            </div>
        </div>
    `

    resultsContainer.innerHTML = html
    resultsContainer.classList.add('active')
}

// Système de notifications
function showNotification(message, type = 'info') {
    const notif = document.createElement('div')
    notif.className = `notification ${type}`
    notif.textContent = message

    document.body.appendChild(notif)

    // Animation d'entrée
    setTimeout(() => notif.classList.add('visible'), 100)

    // Suppression automatique
    setTimeout(() => {
        notif.classList.remove('visible')
        setTimeout(() => notif.remove(), 300)
    }, 3000)
}
