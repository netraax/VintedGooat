// Transaction parser module
import { updateAnalytics } from './analytics.js';
import { showNotification } from './notifications.js';

export function initTransactionParser() {
    const analyzeButton = document.getElementById('analyze-pro');
    if (analyzeButton) {
        analyzeButton.addEventListener('click', handleTransactionAnalysis);
    }
}

export function parseTransactions(text) {
    const data = {
        summary: extractSummary(text),
        transactions: extractTransactions(text),
        metrics: {}
    };

    return calculateTransactionMetrics(data);
}

function handleTransactionAnalysis() {
    const input = document.getElementById('pro-input');
    const text = input.value.trim();

    if (!text) {
        showNotification('Veuillez coller l\'historique des transactions', 'error');
        return;
    }

    try {
        const data = parseTransactions(text);
        updateAnalytics('transaction_analysis', data);
        displayTransactionResults(data);
    } catch (error) {
        console.error('Transaction parsing error:', error);
        showNotification('Erreur lors de l\'analyse des transactions', 'error');
    }
}

function extractSummary(text) {
    const summary = {
        initialBalance: 0,
        finalBalance: 0,
        period: {
            start: null,
            end: null
        }
    };

    // Extract balances
    const finalBalanceMatch = text.match(/Solde final\s*(\d+[.,]\d+)\s*€/);
    const initialBalanceMatch = text.match(/Solde initial\s*(\d+[.,]\d+)\s*€/);

    if (finalBalanceMatch) {
        summary.finalBalance = parseFloat(finalBalanceMatch[1].replace(',', '.'));
    }
    if (initialBalanceMatch) {
        summary.initialBalance = parseFloat(initialBalanceMatch[1].replace(',', '.'));
    }

    // Extract period
    const datePattern = /(\d{1,2}\s+\w+\s+\d{4})/g;
    const dates = [...text.matchAll(datePattern)].map(match => new Date(match[1]));
    
    if (dates.length > 0) {
        summary.period.start = new Date(Math.min(...dates));
        summary.period.end = new Date(Math.max(...dates));
    }

    return summary;
}

function extractTransactions(text) {
    const transactions = [];
    const transactionPattern = /([^\n]+)\n([+-]?\d+[.,]\d+)\s*€\n(\d{1,2}\s+\w+\s+\d{4})/g;
    let match;

    while ((match = transactionPattern.exec(text)) !== null) {
        const transaction = {
            description: match[1].trim(),
            amount: parseFloat(match[2].replace(',', '.')),
            date: new Date(match[3]),
            type: determineTransactionType(match[1].trim()),
        };

        transactions.push(transaction);
    }

    return transactions;
}

function determineTransactionType(description) {
    if (description.includes('Vente')) return 'sale';
    if (description.includes('Commande')) return 'expense';
    if (description.includes('Transfert')) return 'transfer';
    if (description.includes('Boost')) return 'marketing';
    return 'other';
}

function calculateTransactionMetrics(data) {
    const metrics = {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        salesByPeriod: {},
        expensesByCategory: {},
        averageOrderValue: 0,
    };

    // Calculate basic metrics
    data.transactions.forEach(transaction => {
        if (transaction.amount > 0) {
            metrics.totalRevenue += transaction.amount;
        } else {
            metrics.totalExpenses += Math.abs(transaction.amount);
        }

        // Group by period (month)
        const monthYear = transaction.date.toISOString().slice(0, 7);
        if (!metrics.salesByPeriod[monthYear]) {
            metrics.salesByPeriod[monthYear] = 0;
        }
        metrics.salesByPeriod[monthYear] += transaction.amount;

        // Group expenses by category
        if (transaction.amount < 0) {
            if (!metrics.expensesByCategory[transaction.type]) {
                metrics.expensesByCategory[transaction.type] = 0;
            }
            metrics.expensesByCategory[transaction.type] += Math.abs(transaction.amount);
        }
    });

    // Calculate net profit
    metrics.netProfit = metrics.totalRevenue - metrics.totalExpenses;

    // Calculate average order value
    const sales = data.transactions.filter(t => t.type === 'sale');
    metrics.averageOrderValue = sales.length > 0 
        ? sales.reduce((sum, sale) => sum + sale.amount, 0) / sales.length 
        : 0;

    data.metrics = metrics;
    return data;
}

function displayTransactionResults(data) {
    // Implementation of transaction results display
    // This will be handled by the UI manager
}
