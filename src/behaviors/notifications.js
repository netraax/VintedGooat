// Notifications module
let notificationTimeout;

export function setupNotifications() {
    // Create notifications container if it doesn't exist
    if (!document.querySelector('.notifications-container')) {
        const container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }
}

export function showNotification(message, type = 'info', duration = 3000) {
    const container = document.querySelector('.notifications-container');
    if (!container) return;

    // Clear existing notification if any
    clearTimeout(notificationTimeout);
    container.innerHTML = '';

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">×</button>
        </div>
    `;

    // Add close button functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        hideNotification(notification);
    });

    // Add to container
    container.appendChild(notification);

    // Add visible class after a small delay (for animation)
    setTimeout(() => {
        notification.classList.add('visible');
    }, 10);

    // Auto-hide after duration
    notificationTimeout = setTimeout(() => {
        hideNotification(notification);
    }, duration);
}

function hideNotification(notification) {
    notification.classList.remove('visible');
    setTimeout(() => {
        notification.remove();
    }, 300); // Match the CSS transition duration
}

// Types de notifications spécifiques
export const notify = {
    success: (message) => showNotification(message, 'success'),
    error: (message) => showNotification(message, 'error', 5000), // Plus long pour les erreurs
    warning: (message) => showNotification(message, 'warning'),
    info: (message) => showNotification(message, 'info')
};
