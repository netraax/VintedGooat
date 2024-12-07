import '../css/style.css'
import { initializeAnalytics } from './behaviors/analytics.js'
import { setupNotifications } from './behaviors/notifications.js'
import { initProfileParser } from './behaviors/profileParser.js'
import { initTransactionParser } from './behaviors/transactionParser.js'
import { initializeUI } from './behaviors/uiManager.js'

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    console.log('Application starting...')
    initializeUI()
    initializeAnalytics()
    setupNotifications()
    initProfileParser()
    initTransactionParser()
})
