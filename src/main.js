import '../css/style.css'

// S'assurer que le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    console.log('Application VintedGooat chargée')
    initializeApp()
})

function initializeApp() {
    // Initialiser les événements
    const analyzeShopBtn = document.getElementById('analyze-shop')
    const resetShopBtn = document.getElementById('reset-shop')
    const shopInput = document.getElementById('shop-input')

    if (analyzeShopBtn) {
        analyzeShopBtn.addEventListener('click', () => {
            console.log('Analyse boutique lancée')
            // Ajouter votre logique d'analyse ici
        })
    }

    if (resetShopBtn) {
        resetShopBtn.addEventListener('click', () => {
            if (shopInput) shopInput.value = ''
            console.log('Formulaire réinitialisé')
        })
    }
}
