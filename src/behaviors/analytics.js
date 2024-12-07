// Analytics module

// Initialisation du tracking
export function initializeAnalytics() {
    // Setup event listeners for user interactions
    trackPageViews();
    trackUserInteractions();
}

// Mise à jour des analytics avec les résultats d'analyse
export function updateAnalytics(type, data) {
    const metrics = calculateMetrics(type, data);
    trackEvent('analysis_complete', {
        type,
        ...metrics
    });
}

// Tracking des vues de pages
function trackPageViews() {
    const sections = document.querySelectorAll('section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                trackEvent('page_view', {
                    section: entry.target.id
                });
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(section => observer.observe(section));
}

// Tracking des interactions utilisateur
function trackUserInteractions() {
    // Track button clicks
    document.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (button) {
            trackEvent('button_click', {
                button_id: button.id,
                button_text: button.textContent.trim()
            });
        }
    });

    // Track form submissions
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            trackEvent('form_submit', {
                form_id: form.id
            });
        });
    });
}

// Calcul des métriques pour l'analytique
function calculateMetrics(type, data) {
    const metrics = {
        timestamp: new Date().toISOString()
    };

    if (type === 'profile_analysis') {
        metrics.total_sales = data.sales?.total || 0;
        metrics.followers = data.stats?.followers || 0;
        metrics.items_count = data.items?.length || 0;
    } else if (type === 'transaction_analysis') {
        metrics.total_revenue = data.metrics?.totalRevenue || 0;
        metrics.transaction_count = data.transactions?.length || 0;
        metrics.average_order_value = data.metrics?.averageOrderValue || 0;
    }

    return metrics;
}

// Fonction générique pour tracker les événements
function trackEvent(eventName, eventData = {}) {
    // Log l'événement localement
    console.log('Analytics Event:', eventName, eventData);

    // Stockage local pour l'historique des analyses
    if (eventName === 'analysis_complete') {
        saveAnalysisHistory(eventData);
    }
}

// Stockage de l'historique des analyses
function saveAnalysisHistory(data) {
    try {
        const history = JSON.parse(localStorage.getItem('analysis_history') || '[]');
        history.unshift({
            ...data,
            timestamp: new Date().toISOString()
        });
        
        // Garder seulement les 10 dernières analyses
        while (history.length > 10) history.pop();
        
        localStorage.setItem('analysis_history', JSON.stringify(history));
    } catch (error) {
        console.error('Error saving analysis history:', error);
    }
}

// Récupération de l'historique des analyses
export function getAnalysisHistory() {
    try {
        return JSON.parse(localStorage.getItem('analysis_history') || '[]');
    } catch {
        return [];
    }
}
