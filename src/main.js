// Import des styles
import '../css/style.css'

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation()
    initializeAnalysis()
    console.log('Application VintedGooat chargée')
})

// Gestion de la navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link')
    const sections = document.querySelectorAll('.section')

    // Gérer les clics sur les liens
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault()
            const sectionId = link.getAttribute('data-section')
            
            // Mettre à jour les classes actives
            navLinks.forEach(l => l.classList.remove('active'))
            link.classList.add('active')
            
            // Afficher la bonne section
            sections.forEach(section => {
                section.classList.remove('active')
                if (section.id === sectionId) {
                    section.classList.add('active')
                }
            })
        })
    })
}

// Initialisation de l'analyse
function initializeAnalysis() {
    const analyzeBtn = document.getElementById('analyze-btn')
    const resetBtn = document.getElementById('reset-btn')
    const input = document.getElementById('shop-input')
    const results = document.getElementById('results')

    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', () => {
            const text = input?.value.trim()
            if (!text) {
                showMessage('Veuillez coller le contenu de votre profil Vinted')
                return
            }
            
            try {
                const data = analyzeProfile(text)
                displayResults(data)
            } catch (error) {
                showMessage('Erreur lors de l\'analyse', 'error')
                console.error(error)
            }
        })
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (input) input.value = ''
            if (results) {
                results.innerHTML = ''
                results.classList.remove('active')
            }
            showMessage('Analyse réinitialisée')
        })
    }
}

// Analyse du profil
function analyzeProfile(text) {
    const data = {
        totalSales: 0,
        countries: {},
        recentSales: []
    }

    // Extraire les ventes
    const salesPattern = /il y a (\d+) (jour|mois|an)/g
    let match
    while ((match = salesPattern.exec(text)) !== null) {
        const amount = parseInt(match[1])
        const unit = match[2]
        data.totalSales++
        data.recentSales.push({ amount, unit })
    }

    // Analyser les pays via les langues
    const languages = {
        'merci': 'France',
        'thank you': 'Royaume-Uni',
        'grazie': 'Italie',
        'gracias': 'Espagne',
        'danke': 'Allemagne'
    }

    Object.entries(languages).forEach(([phrase, country]) => {
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
    const results = document.getElementById('results')
    if (!results) return

    results.innerHTML = `
        <div class="result-card">
            <h3>Total des Ventes</h3>
            <div class="result-value">${data.totalSales}</div>
        </div>

        <div class="result-card">
            <h3>Ventes par Pays</h3>
            <ul>
                ${Object.entries(data.countries)
                    .map(([country, count]) => `
                        <li>${country}: ${count} vente${count > 1 ? 's' : ''}</li>
                    `).join('')}
            </ul>
        </div>

        <div class="result-card">
            <h3>Ventes Récentes</h3>
            <ul>
                ${data.recentSales.slice(0, 5)
                    .map(({amount, unit}) => `
                        <li>Il y a ${amount} ${unit}${amount > 1 ? 's' : ''}</li>
                    `).join('')}
            </ul>
        </div>
    `

    results.classList.add('active')
}

// Affichage des messages
function showMessage(message, type = 'info') {
    const messageBox = document.createElement('div')
    messageBox.className = `message ${type}`
    messageBox.textContent = message
    
    document.body.appendChild(messageBox)
    
    // Auto-remove message after 3 seconds
    setTimeout(() => {
        messageBox.classList.add('fade-out')
        setTimeout(() => messageBox.remove(), 300)
    }, 3000)
}

// Formatage des dates
function formatDate(date) {
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date)
}

// Calcul des statistiques
function calculateStats(sales) {
    return {
        total: sales.length,
        average: sales.length > 0 
            ? (sales.reduce((sum, sale) => sum + sale.amount, 0) / sales.length).toFixed(2)
            : 0,
        best: sales.reduce((max, sale) => Math.max(max, sale.amount), 0),
        recent: sales.slice(0, 5)
    }
}

// Ajout d'un graphique si besoin
function addChart(data) {
    // Si on veut ajouter des visualisations plus tard
    const chartData = Object.entries(data.salesByDate).map(([date, count]) => ({
        date: new Date(date),
        count
    })).sort((a, b) => a.date - b.date)

    // Pour l'instant on retourne juste les données formatées
    return chartData.map(item => ({
        date: formatDate(item.date),
        ventes: item.count
    }))
}

// Export des fonctions pour les tests
export {
    analyzeProfile,
    calculateStats,
    formatDate,
    addChart
}
    
