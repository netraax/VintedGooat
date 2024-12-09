// src/behaviors/pdfExport.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function exportToPDF(data, type = 'single') {
    const doc = new jsPDF();
    
    // Configuration de base
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    
    // En-tête
    doc.setFontSize(20);
    doc.text('VintedGooat - Rapport d\'Analyse', margin, margin);
    doc.setFontSize(12);
    doc.text(`Généré le ${new Date().toLocaleString()}`, margin, margin + 10);
    
    let currentY = margin + 20;
    
    // Sélection du type de rapport
    switch(type) {
        case 'single':
            currentY = generateSingleShopReport(doc, data, currentY);
            break;
        case 'comparison':
            currentY = generateComparisonReport(doc, data, currentY);
            break;
        case 'pro':
            currentY = generateProReport(doc, data, currentY);
            break;
    }
    
    // Pied de page
    doc.setFontSize(10);
    doc.text('VintedGooat - Analyse de boutiques Vinted', margin, doc.internal.pageSize.height - 10);
    
    // Sauvegarde du PDF
    const fileName = `vintedgooat-rapport-${type}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
}

function generateSingleShopReport(doc, data, startY) {
    let currentY = startY;
    
    // Informations de la boutique
    doc.setFontSize(16);
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
        margin: { top: 15 }
    });
    
    currentY = doc.lastAutoTable.finalY + 15;
    
    // Statistiques de performance
    if (data.metrics.topBrands) {
        doc.setFontSize(16);
        doc.text('Top Marques', 15, currentY);
        currentY += 10;
        
        const brandsArray = Object.entries(data.metrics.topBrands)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([brand, count]) => [brand, count.toString()]);
            
        doc.autoTable({
            startY: currentY,
            head: [['Marque', 'Nombre d\'articles']],
            body: brandsArray,
            margin: { top: 15 }
        });
        
        currentY = doc.lastAutoTable.finalY + 15;
    }
    
    return currentY;
}

function generateComparisonReport(doc, data, startY) {
    const { shop1, shop2, comparison } = data;
    let currentY = startY;
    
    // En-tête de comparaison
    doc.setFontSize(16);
    doc.text('Comparaison des Boutiques', 15, currentY);
    currentY += 10;
    
    // Tableau de comparaison
    doc.autoTable({
        startY: currentY,
        head: [['Métrique', shop1.profile.shopName, shop2.profile.shopName, 'Différence']],
        body: [
            ['Abonnés', 
                shop1.profile.followers.toString(),
                shop2.profile.followers.toString(),
                `${comparison.followers.difference} (${comparison.followers.percentage}%)`
            ],
            ['Note moyenne',
                shop1.profile.rating.toFixed(1),
                shop2.profile.rating.toFixed(1),
                `${comparison.rating.difference} (${comparison.rating.percentage}%)`
            ],
            ['Articles vendus',
                shop1.metrics.itemsSold.toString(),
                shop2.metrics.itemsSold.toString(),
                `${comparison.itemsSold.difference} (${comparison.itemsSold.percentage}%)`
            ],
            ['Prix moyen',
                `${shop1.metrics.averagePrice.toFixed(2)}€`,
                `${shop2.metrics.averagePrice.toFixed(2)}€`,
                `${comparison.averagePrice.difference}€ (${comparison.averagePrice.percentage}%)`
            ],
            ['Taux de conversion',
                `${shop1.metrics.conversionRate.toFixed(2)}%`,
                `${shop2.metrics.conversionRate.toFixed(2)}%`,
                `${comparison.conversionRate.difference}% (${comparison.conversionRate.percentage}%)`
            ]
        ],
        margin: { top: 15 }
    });
    
    currentY = doc.lastAutoTable.finalY + 15;
    
    // Analyse des marques communes
    if (comparison.brandOverlap) {
        doc.setFontSize(16);
        doc.text('Analyse des Marques', 15, currentY);
        currentY += 10;
        
        doc.autoTable({
            startY: currentY,
            head: [['Type', 'Nombre', 'Détails']],
            body: [
                ['Marques communes', 
                    comparison.brandOverlap.totalCommon.toString(),
                    comparison.brandOverlap.commonBrands.slice(0, 3).join(', ') + '...'
                ],
                ['Marques uniques (Boutique 1)',
                    comparison.brandOverlap.totalUnique1.toString(),
                    comparison.brandOverlap.uniqueBrands1.slice(0, 3).join(', ') + '...'
                ],
                ['Marques uniques (Boutique 2)',
                    comparison.brandOverlap.totalUnique2.toString(),
                    comparison.brandOverlap.uniqueBrands2.slice(0, 3).join(', ') + '...'
                ]
            ],
            margin: { top: 15 }
        });
    }
    
    return currentY;
}

function generateProReport(doc, data, startY) {
    let currentY = startY;
    
    // Informations financières
    doc.setFontSize(16);
    doc.text('Analyse Professionnelle', 15, currentY);
    currentY += 10;
    
    // Tableau des métriques pro
    doc.autoTable({
        startY: currentY,
        head: [['Métrique', 'Valeur']],
        body: [
            ['Chiffre d\'affaires', `${data.financials?.totalRevenue?.toFixed(2)}€`],
            ['Dépenses marketing', `${data.financials?.boostExpenses?.toFixed(2)}€`],
            ['Solde actuel', `${data.financials?.currentBalance?.toFixed(2)}€`],
            ['Revenu moyen par article', `${data.metrics?.revenuePerItem?.toFixed(2)}€`],
            ['Vélocité des ventes', `${data.metrics?.salesVelocity?.toFixed(2)} ventes/semaine`]
        ],
        margin: { top: 15 }
    });
    
    currentY = doc.lastAutoTable.finalY + 15;
    
    return currentY;
}

function formatDate(date) {
    return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}
