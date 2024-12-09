// src/behaviors/pdfExport.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function exportToPDF(data, type = 'single') {
    const doc = new jsPDF();
    
    // Couleurs personnalisées
    const colors = {
        primary: [9, 177, 186],    // #09B1BA
        secondary: [70, 70, 70],   // #464646
        accent: [255, 107, 107],   // #FF6B6B
        background: [245, 245, 245] // #F5F5F5
    };
    
    // En-tête stylisé
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
    
    // Titre principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('VintedGooat', 15, 20);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Rapport d\'Analyse', 15, 30);

    // Date de génération
    doc.setTextColor(...colors.secondary);
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 15, 50);
    
    let currentY = 60;
    
    // Sélection du type de rapport
    switch(type) {
        case 'single':
            currentY = generateSingleShopReport(doc, data, currentY, colors);
            break;
        case 'comparison':
            currentY = generateComparisonReport(doc, data, currentY, colors);
            break;
        case 'pro':
            currentY = generateProReport(doc, data, currentY, colors);
            break;
    }
    
    // Pied de page
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...colors.secondary);
        doc.text('VintedGooat - Analyse de boutiques Vinted', 15, doc.internal.pageSize.height - 10);
        doc.text(`Page ${i}/${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
    }
    
    // Sauvegarde du PDF
    const fileName = `vintedgooat-rapport-${type}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
}

function generateSingleShopReport(doc, data, startY, colors) {
    let currentY = startY;
    
    // Section Informations Boutique
    doc.setFontSize(18);
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations de la Boutique', 15, currentY);
    currentY += 10;
    
    // Tableau des informations de base
    doc.autoTable({
        startY: currentY,
        head: [['Métrique', 'Valeur']],
        body: [
            ['Nom de la boutique', data.profile.shopName],
            ['Note moyenne', `${data.profile.rating.toFixed(1)}/5`],
            ['Abonnés', data.profile.followers.toString()],
            ['Évaluations totales', data.profile.totalRatings.toString()],
            ['Articles en vente', data.metrics.totalItems.toString()],
            ['Articles vendus', data.metrics.itemsSold.toString()],
            ['Taux de conversion', `${data.metrics.conversionRate.toFixed(2)}%`],
            ['Prix moyen', `${data.metrics.averagePrice.toFixed(2)}€`]
        ],
        headStyles: {
            fillColor: colors.primary,
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [250, 250, 250]
        },
        styles: {
            fontSize: 11,
            cellPadding: 5
        }
    });
    
    currentY = doc.lastAutoTable.finalY + 20;

    function generateComparisonReport(doc, data, startY, colors) {
    let currentY = startY;
    const { shop1, shop2, comparison } = data;
    
    // Titre de la comparaison
    doc.setFontSize(18);
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'bold');
    doc.text('Comparaison des Boutiques', 15, currentY);
    currentY += 15;

    // Sous-titre avec les noms des boutiques
    doc.setFontSize(12);
    doc.setTextColor(...colors.secondary);
    doc.text(`${shop1.profile.shopName} vs ${shop2.profile.shopName}`, 15, currentY);
    currentY += 15;

    // Tableau de comparaison
    doc.autoTable({
        startY: currentY,
        head: [[
            'Métrique',
            shop1.profile.shopName,
            shop2.profile.shopName,
            'Différence'
        ]],
        body: [
            ['Abonnés',
                shop1.metrics.abonnés?.toString() || '0',
                shop2.metrics.abonnés?.toString() || '0',
                formatDifference(comparison.abonnés)
            ],
            ['Note moyenne',
                formatValue(shop1.metrics.note_moyenne, '/5'),
                formatValue(shop2.metrics.note_moyenne, '/5'),
                formatDifference(comparison.note_moyenne)
            ],
            ['Articles vendus',
                shop1.metrics.articles_vendus?.toString() || '0',
                shop2.metrics.articles_vendus?.toString() || '0',
                formatDifference(comparison.articles_vendus)
            ],
            ['Prix moyen',
                formatValue(shop1.metrics.prix_moyen, '€'),
                formatValue(shop2.metrics.prix_moyen, '€'),
                formatDifference(comparison.prix_moyen, '€')
            ]
        ],
        headStyles: {
            fillColor: colors.primary,
            textColor: [255, 255, 255],
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [250, 250, 250]
        },
        styles: {
            fontSize: 11,
            cellPadding: 5
        }
    });

    currentY = doc.lastAutoTable.finalY + 20;

    // Graphique de comparaison (barres horizontales)
    const metrics = ['abonnés', 'articles_vendus'];
    const barHeight = 20;
    const barGap = 10;
    const maxWidth = 160;

    doc.setFontSize(14);
    doc.setTextColor(...colors.primary);
    doc.text('Comparaison Visuelle', 15, currentY);
    currentY += 15;

    metrics.forEach((metric, index) => {
        const value1 = shop1.metrics[metric] || 0;
        const value2 = shop2.metrics[metric] || 0;
        const maxValue = Math.max(value1, value2);
        
        // Titre de la métrique
        doc.setFontSize(10);
        doc.setTextColor(...colors.secondary);
        doc.text(formatMetricName(metric), 15, currentY);

        // Barre boutique 1
        const width1 = (value1 / maxValue) * maxWidth;
        doc.setFillColor(...colors.primary);
        doc.rect(50, currentY - 7, width1, barHeight/2, 'F');
        doc.text(value1.toString(), 50 + width1 + 5, currentY - 2);

        // Barre boutique 2
        const width2 = (value2 / maxValue) * maxWidth;
        doc.setFillColor(...colors.accent);
        doc.rect(50, currentY - 7 + barHeight/2, width2, barHeight/2, 'F');
        doc.text(value2.toString(), 50 + width2 + 5, currentY + 8);

        currentY += barHeight + barGap;
    });

    return currentY;
}

// Fonctions utilitaires
function formatValue(value, suffix = '') {
    if (typeof value !== 'number') return '0' + suffix;
    return value.toFixed(2) + suffix;
}

function formatDifference(diffObj, suffix = '') {
    if (!diffObj) return '0 (0%)';
    return `${diffObj.difference}${suffix} (${diffObj.percentage}%)`;
}

function formatMetricName(metric) {
    return metric.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}
    
    // Section Top Marques
    if (data.metrics.topBrands) {
        doc.setFontSize(18);
        doc.setTextColor(...colors.primary);
        doc.text('Top Marques', 15, currentY);
        currentY += 10;

        // Tableau des marques
        const brandsArray = Object.entries(data.metrics.topBrands)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([brand, count]) => [brand, count.toString()]);

        doc.autoTable({
            startY: currentY,
            head: [['Marque', 'Nombre d\'articles']],
            body: brandsArray,
            headStyles: {
                fillColor: colors.accent,
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [250, 250, 250]
            },
            styles: {
                fontSize: 11,
                cellPadding: 5
            }
        });

        currentY = doc.lastAutoTable.finalY + 10;

        // Diagramme circulaire des marques (simulé avec des rectangles colorés)
        const total = brandsArray.reduce((sum, [,count]) => sum + parseInt(count), 0);
        let startX = 15;
        const barHeight = 15;

        brandsArray.forEach(([brand, count], index) => {
            const width = (parseInt(count) / total) * 180;
            doc.setFillColor(...getColorFromIndex(index, colors));
            doc.rect(startX, currentY, width, barHeight, 'F');
            doc.setFontSize(8);
            doc.setTextColor(...colors.secondary);
            if (width > 20) {
                doc.text(`${((parseInt(count) / total) * 100).toFixed(1)}%`, startX + 2, currentY + 10);
            }
            startX += width;
        });

        // Légende
        currentY += barHeight + 10;
        brandsArray.forEach(([brand, count], index) => {
            doc.setFillColor(...getColorFromIndex(index, colors));
            doc.rect(15, currentY, 10, 10, 'F');
            doc.setTextColor(...colors.secondary);
            doc.text(`${brand} (${count})`, 30, currentY + 7);
            currentY += 15;
        });
    }
    
    return currentY;
}

function generateComparisonReport(doc, data, startY, colors) {
    // ... Code existant pour la comparaison ...
    return startY;
}

function generateProReport(doc, data, startY, colors) {
    // ... Code existant pour le rapport pro ...
    return startY;
}

function getColorFromIndex(index, colors) {
    const baseColors = [
        colors.primary,
        colors.accent,
        [70, 150, 150],  // Turquoise foncé
        [150, 70, 150],  // Violet
        [150, 150, 70]   // Jaune foncé
    ];
    return baseColors[index % baseColors.length];
}
