// src/behaviors/analytics.js
import { CONFIG } from './config.js';
import { PatternDetectionSystem } from './patternDetection.js';

// Initialisation du tracking
export function initializeAnalytics() {
    trackPageViews();
    trackUserInteractions();
}

// Mise à jour des analytics avec les résultats d'analyse
export function updateAnalytics(type, data) {
    try {
        const metrics = calculateMetrics(type, data);
        trackEvent('analysis_complete', {
            type,
            ...metrics
        });
    } catch (error) {
        console.error('Erreur dans updateAnalytics:', error);
    }
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
                button_text: button.textContent.trim(),
                page: getCurrentPage()
            });
        }
    });

    // Track analysis actions
    trackAnalysisActions();
}

// Track specific analysis actions
function trackAnalysisActions() {
    const analyzeButtons = [
        document.querySelector(CONFIG.SELECTORS.BUTTONS.ANALYZE),
        document.querySelector(CONFIG.SELECTORS.BUTTONS.ANALYZE_PRO)
    ];

    analyzeButtons.forEach(button => {
        if (button) {
            button.addEventListener('click', () => {
                trackEvent('analysis_started', {
                    type: button.id.includes('pro') ? 'pro' : 'standard'
                });
            });
        }
    });
}

// Calcul des métriques pour l'analytique
async function calculateMetrics(type, data) {
    const metrics = {
        timestamp: new Date().toISOString(),
        type
    };

    try {
        const detector = new PatternDetectionSystem(data);
        const analysis = await detector.analyze();

        if (type === 'profile_analysis') {
            metrics.total_sales = analysis.patterns.sales.totalSales || 0;
            metrics.followers = analysis.patterns.profile.metrics.followers || 0;
            metrics.items_count = analysis.items?.length || 0;
            metrics.engagement_rate = analysis.patterns.engagement.rates.overall || 0;
            metrics.conversion_rate = analysis.patterns.sales.performance.conversionRate || 0;
        } else if (type === 'transaction_analysis') {
            metrics.total_revenue = analysis.transactionAnalytics.metrics.totalRevenue || 0;
            metrics.transaction_count = analysis.transactionAnalytics.metrics.transactionCount || 0;
            metrics.average_order_value = analysis.transactionAnalytics.metrics.averageOrderValue || 0;
            metrics.growth_rate = analysis.patterns.sales.growth['30days']?.percentage || 0;
        }

        return metrics;
    } catch (error) {
        console.error('Erreur dans calculateMetrics:', error);
        return metrics;
    }
}

// Fonction générique pour tracker les événements
function trackEvent(eventName, eventData = {}) {
    // Ajout d'informations supplémentaires
    const enrichedData = {
        ...eventData,
        timestamp: new Date().toISOString(),
        page: getCurrentPage(),
        sessionId: getSessionId()
    };

    // Log l'événement
    console.log('Analytics Event:', eventName, enrichedData);

    // Stockage des analyses complètes
    if (eventName === 'analysis_complete') {
        saveAnalysisHistory(enrichedData);
    }
}

// Stockage de l'historique des analyses
function saveAnalysisHistory(data) {
    try {
        const history = JSON.parse(localStorage.getItem('analysis_history') || '[]');
        history.unshift({
            ...data,
            id: generateAnalysisId(),
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

// Utilitaires
function getCurrentPage() {
    const activePage = document.querySelector('section.active');
    return activePage ? activePage.id : 'unknown';
}

function getSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
        sessionId = generateAnalysisId();
        sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
}

function generateAnalysisId() {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
