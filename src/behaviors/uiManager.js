// UI Manager module
let charts = {};

export function initializeUI() {
    setupNavigation();
    setupResetButtons();
    setupInputValidation();
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            
            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.style.display = section.id === targetId ? 'block' : 'none';
            });
        });
    });
}

function setupResetButtons() {
    const resetButtons = document.querySelectorAll('.btn-reset');
    resetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetForm = button.closest('.analysis-form');
            if (targetForm) {
                targetForm.reset();
                const resultsContainer = targetForm.nextElementSibling;
                if (resultsContainer && resultsContainer.classList.contains('results-container')) {
                    resultsContainer.innerHTML = '';
                    resultsContainer.classList.remove('active');
                }
            }
        });
    });
}

function setupInputValidation() {
    const textAreas = document.querySelectorAll('textarea');
    textAreas.forEach(textarea => {
        textarea.addEventListener('paste', (e) => {
            setTimeout(() => {
                validateInput(textarea);
            }, 0);
        });
    });
}

function validateInput(textarea) {
    const text = textarea.value.trim();
    const submitBtn = textarea.closest('.analysis-form').querySelector('.btn-primary');
    
    if (text.length < 50) { // Minimum length validation
        submitBtn.disabled = true;
        showValidationError(textarea, 'Le contenu collé semble trop court');
    } else {
        submitBtn.disabled = false;
        clearValidationError(textarea);
    }
}

export function displayResults(type, data) {
    const container = document.getElementById(`${type}-results`);
    if (!container) return;

    // Clear previous results
    container.innerHTML = '';
    destroyCharts();

    switch (type) {
        case 'shop':
            displayShopResults(container, data);
            break;
        case 'pro':
            displayProResults(container, data);
            break;
    }

    container.classList.add('active');
}

function displayShopResults(container, data) {
    // Métriques principales
    const metricsHtml = `
        <div class="metrics-grid">
            <div class="metric-card">
                <h3>Score Global</h3>
                <div class="score">${Math.round(data.metrics.qualityScore)}/100</div>
            </div>
            <div class="metric-card">
                <h3>Ventes</h3>
                <div class="value">${data.sales.total}</div>
                <div class="label">transactions</div>
            </div>
            <div class="metric-card">
                <h3>Prix Moyen</h3>
                <div class="value">${data.metrics.avgPrice.toFixed(2)}€</div>
            </div>
        </div>
    `;

    // Graphiques
    const chartsHtml = `
        <div class="charts-container">
            <div class="chart-wrapper">
                <h3>Évolution des Ventes</h3>
                <canvas id="salesChart"></canvas>
            </div>
            <div class="chart-wrapper">
                <h3>Répartition par Pays</h3>
                <canvas id="countryChart"></canvas>
            </div>
        </div>
    `;

    container.innerHTML = metricsHtml + chartsHtml;

    // Création des graphiques
    createCharts(data);
}

function displayProResults(container, data) {
    const { metrics, summary } = data;

    const summaryHtml = `
        <div class="metrics-grid">
            <div class="metric-card">
                <h3>Chiffre d'Affaires</h3>
                <div class="value">${metrics.totalRevenue.toFixed(2)}€</div>
            </div>
            <div class="metric-card">
                <h3>Bénéfice Net</h3>
                <div class="value">${metrics.netProfit.toFixed(2)}€</div>
            </div>
            <div class="metric-card">
                <h3>Panier Moyen</h3>
                <div class="value">${metrics.averageOrderValue.toFixed(2)}€</div>
            </div>
        </div>
        <div class="charts-container">
            <div class="chart-wrapper">
                <h3>Évolution des Ventes</h3>
                <canvas id="revenueChart"></canvas>
            </div>
            <div class="chart-wrapper">
                <h3>Répartition des Dépenses</h3>
                <canvas id="expensesChart"></canvas>
            </div>
        </div>
    `;

    container.innerHTML = summaryHtml;
    createProCharts(data);
}

function destroyCharts() {
    Object.values(charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    charts = {};
}

function showValidationError(element, message) {
    let errorDiv = element.nextElementSibling;
    if (!errorDiv || !errorDiv.classList.contains('error-message')) {
        errorDiv = document.createElement('div');
        errorDiv.classList.add('error-message');
        element.parentNode.insertBefore(errorDiv, element.nextSibling);
    }
    errorDiv.textContent = message;
}

function clearValidationError(element) {
    const errorDiv = element.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('error-message')) {
        errorDiv.remove();
    }
}

export function showLoading(type) {
    const container = document.getElementById(`${type}-results`);
    if (container) {
        container.innerHTML = '<div class="loading">Analyse en cours...</div>';
        container.classList.add('active');
    }
}

export function hideLoading(type) {
    const container = document.getElementById(`${type}-results`);
    if (container) {
        const loading = container.querySelector('.loading');
        if (loading) {
            loading.remove();
        }
    }
}
