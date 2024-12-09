// src/behaviors/salesChart.js
import Chart from 'chart.js/auto';
import 'chartjs-plugin-datalabels';
import { fr } from 'date-fns/locale';

export function createSalesEvolutionChart(data) {
    const ctx = document.getElementById('salesEvolutionChart');
    
    if (ctx) {
        // Destruction du graphique existant s'il y en a un
        if (Chart.getChart(ctx)) {
            Chart.getChart(ctx).destroy();
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(sale => sale.date),
                datasets: [{
                    label: 'Nombre de ventes',
                    data: data.map(sale => sale.count),
                    borderColor: '#09B1BA',
                    backgroundColor: 'rgba(9, 177, 186, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#09B1BA',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#333',
                        bodyColor: '#666',
                        borderColor: '#ddd',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            title: (tooltipItems) => {
                                return `Date: ${tooltipItems[0].label}`;
                            },
                            label: (context) => {
                                return `Ventes: ${context.parsed.y}`;
                            }
                        }
                    },
                    datalabels: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            stepSize: 1,
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }
}
