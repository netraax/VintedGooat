// src/behaviors/charts/salesChart.js
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { CONFIG, CHART_CONFIG } from '../config.js';

Chart.register(ChartDataLabels);

export function createSalesEvolutionChart(data, containerId = 'salesEvolutionChart') {
    const ctx = document.getElementById(containerId);
    
    if (!ctx) return null;

    // Nettoyer le graphique existant s'il y en a un
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }

    return new Chart(ctx, {
        type: 'line',
        data: formatChartData(data),
        options: getChartOptions(ctx)
    });
}

function formatChartData(data) {
    return {
        labels: data.map(sale => sale.date),
        datasets: [{
            label: 'Nombre de ventes',
            data: data.map(sale => sale.count),
            borderColor: CHART_CONFIG.COLORS.PRIMARY,
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                return createGradient(ctx);
            },
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointBackgroundColor: CHART_CONFIG.COLORS.PRIMARY,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 8,
        }]
    };
}

function getChartOptions(ctx) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            datalabels: {
                align: 'top',
                anchor: 'bottom',
                color: '#666',
                font: {
                    weight: 'bold'
                },
                formatter: (value) => value
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#666',
                bodyColor: '#666',
                borderColor: CHART_CONFIG.COLORS.PRIMARY,
                borderWidth: 1,
                padding: 10,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                },
                callbacks: {
                    label: (context) => `Ventes: ${context.parsed.y}`
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#666',
                    font: {
                        size: 12
                    }
                }
            },
            y: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    stepSize: 1,
                    color: '#666',
                    font: {
                        size: 12
                    }
                },
                beginAtZero: true
            }
        },
        animations: {
            tension: {
                duration: 1000,
                easing: 'linear'
            },
            scale: {
                duration: 500
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        }
    };
}

function createGradient(ctx) {
    const height = ctx.canvas.height;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    const primaryColor = CHART_CONFIG.COLORS.PRIMARY;
    
    gradient.addColorStop(0, `${primaryColor}66`); // 40% opacity
    gradient.addColorStop(1, `${primaryColor}00`); // 0% opacity
    
    return gradient;
}

// Fonction utilitaire pour créer des charts personnalisés
export function createCustomSalesChart(config) {
    const { containerId, data, options = {} } = config;
    
    const defaultOptions = getChartOptions(document.getElementById(containerId));
    const chartConfig = {
        type: 'line',
        data: formatChartData(data),
        options: {
            ...defaultOptions,
            ...options
        }
    };

    return createSalesEvolutionChart(data, containerId);
}

// Export des configurations par défaut
export const DEFAULT_CHART_CONFIG = {
    height: CHART_CONFIG.DEFAULT_HEIGHT,
    colors: CHART_CONFIG.COLORS,
    options: getChartOptions(null)
};
