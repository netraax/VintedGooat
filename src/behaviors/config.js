// src/behaviors/config.js

export const CONFIG = {
    SELECTORS: {
        // Pages
        PAGES: {
            MAIN: '#main',
            PRO: '#analyse-pro',
            COMPARE: '#compare'
        },
        // Inputs
        INPUTS: {
            PROFILE: '#profile-input',
            PRO: '#pro-input',
            SHOP1: '#shop1-input',
            SHOP2: '#shop2-input'
        },
        // Buttons
        BUTTONS: {
            ANALYZE: '#analyze-button',
            ANALYZE_PRO: '#analyze-pro-button',
            RESET: '#reset-button',
            RESET_PRO: '#reset-pro-button',
            COMPARE: '#compare-button',
            RESET_COMPARE: '#reset-compare-button'
        },
        // Results containers
        RESULTS: {
            MAIN: '#analysis-results',
            PRO: '#pro-results',
            COMPARE: '#comparison-results'
        },
        // Navigation
        NAV: {
            BUTTONS: '.nav-btn',
            CONTAINER: '.nav-container'
        }
    },
    CLASSES: {
        ACTIVE: 'active',
        HIDDEN: 'hidden',
        RESULT_CARD: 'result-card',
        CHART_CONTAINER: 'chart-container',
        METRICS_TABS: 'metrics-tabs',
        TAB_BUTTON: 'tab-btn',
        TAB_CONTENT: 'tab-content'
    }
};

export const CHART_CONFIG = {
    DEFAULT_HEIGHT: 300,
    COLORS: {
        PRIMARY: '#09B1BA',
        SECONDARY: '#FF6B6B',
        TERTIARY: '#4ECDC4',
        QUATERNARY: '#45B7D1',
        QUINARY: '#96CEB4'
    },
    OPTIONS: {
        responsive: true,
        maintainAspectRatio: false
    }
};
