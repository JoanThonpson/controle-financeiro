class Relatorios {
    constructor() {
        this.chart = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setDefaultDates();
    }

    bindEvents() {
        // Generate report button
        document.getElementById('generateReportBtn')?.addEventListener('click', () => {
            this.generateReport();
        });

        // Period selector change
        document.getElementById('reportPeriod')?.addEventListener('change', (e) => {
            this.handlePeriodChange(e.target.value);
        });

        // Export PDF button
        document.getElementById('exportPdfBtn')?.addEventListener('click', () => {
            this.exportToPDF();
        });
    }

    setDefaultDates() {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        document.getElementById('startDate').value = firstDay.toISOString().split('T')[0];
        document.getElementById('endDate').value = lastDay.toISOString().split('T')[0];
    }

    handlePeriodChange(period) {
        const now = new Date();
        let startDate, endDate;

        switch(period) {
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
                break;
            case 'semester':
                const semester = Math.floor(now.getMonth() / 6);
                startDate = new Date(now.getFullYear(), semester * 6, 1);
                endDate = new Date(now.getFullYear(), (semester + 1) * 6, 0);
                break;
            case 'custom':
                // Don't change dates for custom
                return;
        }

        document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
        document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    }

    generateReport() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (!startDate || !endDate) {
            alert('Por favor, selecione as datas de início e fim.');
            return;
        }

        const revenues = Storage.getRevenuesByPeriod(startDate, endDate);
        const expenses = Storage.getExpensesByPeriod(startDate, endDate);

        this.updateCharts(revenues, expenses, startDate, endDate);
        this.updateTable(revenues, expenses);
    }

    updateCharts(revenues, expenses, startDate, endDate) {
        this.updateMainChart(revenues, expenses, startDate, endDate);
    }

    updateMainChart(revenues, expenses, startDate, endDate) {
        const ctx = document.getElementById('reportChart')?.getContext('2d');
        if (!ctx) return;

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        // Group by date
        const dateData = this.groupByDate(revenues, expenses, startDate, endDate);
        
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dateData.labels,
                datasets: [
                    {
                        label: 'Receitas',
                        data: dateData.income,
                        backgroundColor: 'rgba(5, 150, 105, 0.8)',
                        borderColor: '#059669',
                        borderWidth: 1
                    },
                    {
                        label: 'Despesas',
                        data: dateData.expenses,
                        backgroundColor: 'rgba(220, 38, 38, 0.8)',
                        borderColor: '#dc2626',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: `Relatório: ${this.formatDate(startDate)} à ${this.formatDate(endDate)}`
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${this.formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    updateTable(revenues, expenses) {
        const container = document.getElementById('reportDataTable');
        if (!container) return;

        const totalIncome = revenues.reduce((sum, r) => sum + r.amount, 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const balance = totalIncome - totalExpenses;

        // Group by category for detailed view
        const incomeByCategory = this.groupByCategory(revenues);
        const expensesByCategory = this.groupByCategory(expenses);

        container.innerHTML = `
            <thead>
                <tr>
                    <th>Categoria</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Percentual</th>
                </tr>
            </thead>
            <tbody>
                <!-- Income Rows -->
                ${Object.entries(incomeByCategory).map(([category, amount]) => `
                    <tr>
                        <td>${category}</td>
                        <td>Receita</td>
                        <td style="color: #059669; font-weight: bold;">${this.formatCurrency(amount)}</td>
                        <td>${((amount / totalIncome) * 100).toFixed(1)}%</td>
                    </tr>
                `).join('')}
                
                <!-- Expense Rows -->
                ${Object.entries(expensesByCategory).map(([category, amount]) => `
                    <tr>
                        <td>${category}</td>
                        <td>Despesa</td>
                        <td style="color: #dc2626; font-weight: bold;">${this.formatCurrency(amount)}</td>
                        <td>${((amount / totalExpenses) * 100).toFixed(1)}%</td>
                    </tr>
                `).join('')}
                
                <!-- Totals -->
                <tr style="border-top: 2px solid #1e293b; font-weight: bold;">
                    <td colspan="2">TOTAL RECEITAS</td>
                    <td style="color: #059669;">${this.formatCurrency(totalIncome)}</td>
                    <td>100%</td>
                </tr>
                <tr>
                    <td colspan="2">TOTAL DESPESAS</td>
                    <td style="color: #dc2626;">${this.formatCurrency(totalExpenses)}</td>
                    <td>100%</td>
                </tr>
                <tr style="border-top: 2px solid #1e293b; background: #f8fafc;">
                    <td colspan="2">SALDO FINAL</td>
                    <td style="color: ${balance >= 0 ? '#059669' : '#dc2626'};">${this.formatCurrency(balance)}</td>
                    <td>-</td>
                </tr>
            </tbody>
        `;
    }

    groupByDate(revenues, expenses, startDate, endDate) {
        const dates = {};
        const current = new Date(startDate);
        const end = new Date(endDate);

        // Initialize all dates in range
        while (current <= end) {
            const key = current.toISOString().split('T')[0];
            dates[key] = { income: 0, expenses: 0 };
            current.setDate(current.getDate() + 1);
        }

        // Add revenues
        revenues.forEach(revenue => {
            const key = revenue.date;
            if (dates[key]) {
                dates[key].income += revenue.amount;
            }
        });

        // Add expenses
        expenses.forEach(expense => {
            const key = expense.date;
            if (dates[key]) {
                dates[key].expenses += expense.amount;
            }
        });

        return {
            labels: Object.keys(dates).map(date => this.formatDate(date)),
            income: Object.values(dates).map(d => d.income),
            expenses: Object.values(dates).map(d => d.expenses)
        };
    }

    groupByCategory(items) {
        const categories = {};
        
        items.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = 0;
            }
            categories[item.category] += item.amount;
        });

        return categories;
    }

    exportToPDF() {
        // Simple PDF export using window.print() for now
        // In a real application, you might use libraries like jsPDF or html2pdf.js
        window.print();
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    }

    loadData() {
        // Generate report when page is loaded
        this.generateReport();
    }
}

// Initialize relatorios when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.relatorios = new Relatorios();
});