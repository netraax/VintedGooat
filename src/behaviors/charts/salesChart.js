import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ChartDataLabels);

export function createSalesEvolutionChart(data, timeRange = 'month') {
    const ctx = document.getElementById('salesEvolutionChart');

    if (ctx) {
        // Nettoyer le graphique existant s'il y en a un
        const existingChart = Chart.getChart(ctx);
        if (existingChart) {
            existingChart.destroy();
        }

        // Filtrer les données en fonction de la période
        const filteredData = filterDataByTimeRange(data, timeRange);

        // Création du nouveau graphique
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: filteredData.map(sale => sale.date),
                datasets: [{
                    label: 'Nombre de ventes',
                    data: filteredData.map(sale => sale.count),
                    borderColor: '#4CAF50',
                    backgroundColor: createGradient(ctx),
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#4CAF50',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Permet une forme rectangulaire
                plugins: {
                    legend: {
                        display: false
                    },
                    datalabels: {
                        align: 'top',
                        anchor: 'bottom',
                        color: '#555',
                        font: {
                            weight: 'bold'
                        },
                        formatter: (value) => value
                    },
                    tooltip: {
                        callbacks: {
                            label: (tooltipItem) => `Ventes: ${tooltipItem.raw}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#555',
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#555',
                            font: {
                                size: 12
                            },
                            precision: 0 // Pour éviter des ticks décimaux
                        }
                    }
                },
                animations: {
                    tension: {
                        duration: 1200,
                        easing: 'easeOutBounce'
                    }
                }
            }
        });
    }
}

// Création d'un dégradé pour le fond du graphique
function createGradient(ctx) {
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(76, 175, 80, 0.4)');
    gradient.addColorStop(1, 'rgba(76, 175, 80, 0)');
    return gradient;
}

// Filtrer les données en fonction de la période sélectionnée
function filterDataByTimeRange(data, timeRange) {
    const now = new Date();
    let filteredData;

    switch (timeRange) {
        case 'day':
            filteredData = data.filter(sale => isSameDay(new Date(sale.date), now));
            break;
        case 'week':
            filteredData = data.filter(sale => isSameWeek(new Date(sale.date), now));
            break;
        case 'month':
        default:
            filteredData = data.filter(sale => isSameMonth(new Date(sale.date), now));
    }

    return filteredData;
}

// Vérifie si deux dates sont le même jour
function isSameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
}

// Vérifie si deux dates appartiennent à la même semaine
function isSameWeek(date1, date2) {
    const weekStart1 = new Date(date1.setDate(date1.getDate() - date1.getDay()));
    const weekStart2 = new Date(date2.setDate(date2.getDate() - date2.getDay()));
    return weekStart1.toDateString() === weekStart2.toDateString();
}

// Vérifie si deux dates sont dans le même mois
function isSameMonth(date1, date2) {
    return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
}
