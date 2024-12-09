// src/behaviors/charts/salesChart.js
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ChartDataLabels);

export function createSalesEvolutionChart(data) {
    const ctx = document.getElementById('salesEvolutionChart');
    
    if (ctx) {
        // Nettoyer le graphique existant s'il y en a un
        const existingChart = Chart.getChart(ctx);
        if (existingChart) {
            existingChart.destroy();
        }

        // Création du nouveau graphique
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(sale => sale.date),
                datasets: [{
                    label: 'Nombre de ventes',
                    data: data.map(sale => sale.count),
                    borderColor: '#09B1BA',
                    backgroundColor: createGradient(ctx),
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#09B1BA',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 8,
                }]
            },
            options: {
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
                        }
                    }
                },
                animations: {
                    tension: {
                        duration: 1000,
                        easing: 'linear'
                    }
                }
            }
        });
    }
}

// Création d'un dégradé pour le fond du graphique
function createGradient(ctx) {
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(9, 177, 186, 0.4)');
    gradient.addColorStop(1, 'rgba(9, 177, 186, 0)');
    return gradient;
}
