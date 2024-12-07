// Import du CSS
import '../css/style.css'

// Initialisation quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    console.log('VintedGooat démarré')
    initNavigation()
    initAnalysis()
})

// Initialisation de la navigation
function initNavigation() {
    const links = document.querySelectorAll('.nav-links a')
    const sections = document.querySelectorAll('section')

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault()
            const targetId = link.getAttribute('href').replace('#', '')
            
            // Mettre à jour les sections
            sections.forEach(section => {
                section.style.display = section.id === targetId ? 'block' : 'none'
            })

            // Mettre à jour la navigation active
            links.forEach(l => l.classList.remove('active'))
            link.classList.add('active')
        })
    })
}

// Initialisation de l'analyse
function initAnalysis() {
    const analyzeBtn = document.getElementById('analyze-shop')
    const resetBtn = document.getElementById('reset-shop')
    const textarea = document.getElementById('shop-input')
    const resultsDiv = document.getElementById('shop-results')

    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', () => {
            const text = textarea?.value.trim()
            if (!text) {
                alert('Veuillez coller le contenu de votre profil Vinted')
                return
            }
            
            // Analyse du texte
            const results = analyzeText(text)
            displayResults(results, resultsDiv)
        })
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (textarea) textarea.value = ''
            if (resultsDiv) resultsDiv.innerHTML = ''
        })
    }
}

// Analyse du texte
function analyzeText(text) {
    const data = {
        sales: 0,
        countries: {},
        dates: []
    }

    // Compter les ventes par dates
    const dateRegex = /il y a (\d+) (jour|mois|an)/g
    let match
    while ((match = dateRegex.exec(text)) !== null) {
        data.sales++
        data.dates.push({
            time: parseInt(match[1]),
            unit: match[2]
        })
    }

    // Détecter les pays par langue
    const languages = {
        'merci': 'France',
        'thank': 'Angleterre',
        'grazie': 'Italie',
        'gracias': 'Espagne',
        'danke': 'Allemagne'
    }

    Object.entries(languages).forEach(([word, country]) => {
        const regex = new RegExp(word, 'gi')
        const count = (text.match(regex) || []).length
        if (count > 0) {
            data.countries[country] = count
        }
    })

    return data
}

// Affichage des résultats
function displayResults(data, container) {
    if (!container) return

    const html = `
        <div class="results-grid">
            <div class="result-card">
                <h3>Ventes Totales</h3>
                <p class="result-value">${data.sales}</p>
            </div>
            
            <div class="result-card">
                <h3>Ventes par Pays</h3>
                <ul>
                    ${Object.entries(data.countries)
                        .map(([country, count]) => 
                            `<li>${country}: ${count} vente${count > 1 ? 's' : ''}</li>`
                        ).join('')}
                </ul>
            </div>
            
            <div class="result-card">
                <h3>Dernières Ventes</h3>
                <ul>
                    ${data.dates.slice(0, 5)
                        .map(({time, unit}) => 
                            `<li>Il y a ${time} ${unit}${time > 1 ? 's' : ''}</li>`
                        ).join('')}
                </ul>
            </div>
        </div>
    `

    container.innerHTML = html
    container.style.display = 'block'
}
