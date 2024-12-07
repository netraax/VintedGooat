import '../css/style.css'

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation()
    initializeEventListeners()
})

// Gestion de la navigation
function initializeNavigation() {
    // Gérer les clics sur les liens de navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault()
            const page = link.getAttribute('data-page')
            navigateToPage(page)
            updateActiveLink(link)
        })
    })

    // Gérer la navigation initiale basée sur l'URL
    const path = window.location.pathname
    const page = path === '/' ? 'accueil' : path.substring(1)
    navigateToPage(page)
    updateActiveLink(document.querySelector(`[data-page="${page}"]`))

    // Gérer le bouton retour du navigateur
    window.addEventListener('popstate', (e) => {
        const page = e.state?.page || 'accueil'
        navigateToPage(page, false)
        updateActiveLink(document.querySelector(`[data-page="${page}"]`))
    })
}

function navigateToPage(page, addToHistory = true) {
    // Cacher toutes les sections
    document.querySelectorAll('.section-content').forEach(section => {
        section.style.display = 'none'
    })

    // Afficher la section demandée
    const targetSection = document.getElementById(page)
    if (targetSection) {
        targetSection.style.display = 'block'
    }

    // Mettre à jour l'historique de navigation
    if (addToHistory) {
        const path = page === 'accueil' ? '/' : `/${page}`
        window.history.pushState({ page }, '', path)
    }
}

function updateActiveLink(activeLink) {
    // Retirer la classe active de tous les liens
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active')
    })

    // Ajouter la classe active au lien actif
    if (activeLink) {
        activeLink.classList.add('active')
    }
}

// Initialisation des autres événements
function initializeEventListeners() {
    const analyzeShopBtn = document.getElementById('analyze-shop')
    const resetShopBtn = document.getElementById('reset-shop')
    const analyzeProBtn = document.getElementById('analyze-pro')
    
    if (analyzeShopBtn) {
        analyzeShopBtn.addEventListener('click', () => {
            console.log('Analyse boutique lancée')
            // Ajouter la logique d'analyse ici
        })
    }

    if (resetShopBtn) {
        resetShopBtn.addEventListener('click', () => {
            const input = document.getElementById('shop-input')
            if (input) input.value = ''
            console.log('Formulaire réinitialisé')
        })
    }

    if (analyzeProBtn) {
        analyzeProBtn.addEventListener('click', () => {
            console.log('Analyse pro lancée')
            // Ajouter la logique d'analyse pro ici
        })
    }
}
