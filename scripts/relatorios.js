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
        // ✅ EVENTO CORRIGIDO PARA O SELECTOR DE PERÍODO
        const reportPeriod = document.getElementById('reportPeriod');
        if (reportPeriod) {
            reportPeriod.addEventListener('change', (e) => {
                this.handlePeriodChange(e.target.value);
            });
        }

        // Generate report button
        document.getElementById('generateReportBtn')?.addEventListener('click', () => {
            this.generateReport();
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

        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput) startDateInput.value = firstDay.toISOString().split('T')[0];
        if (endDateInput) endDateInput.value = lastDay.toISOString().split('T')[0];
    }

    handlePeriodChange(period) {
        console.log('📅 Período selecionado:', period);
        
        const customDateFields = document.getElementById('customDateFields');
        const customDateFieldsEnd = document.getElementById('customDateFieldsEnd');
        
        // ✅ MOSTRAR/OCULTAR CAMPOS DE DATA PERSONALIZADA
        if (period === 'custom') {
            if (customDateFields) customDateFields.style.display = 'block';
            if (customDateFieldsEnd) customDateFieldsEnd.style.display = 'block';
            return; // Não altera datas para custom
        } else {
            if (customDateFields) customDateFields.style.display = 'none';
            if (customDateFieldsEnd) customDateFieldsEnd.style.display = 'none';
        }

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
            default:
                return;
        }

        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput) startDateInput.value = startDate.toISOString().split('T')[0];
        if (endDateInput) endDateInput.value = endDate.toISOString().split('T')[0];
    }

    generateReport() {
        const startDate = document.getElementById('startDate')?.value;
        const endDate = document.getElementById('endDate')?.value;

        if (!startDate || !endDate) {
            alert('Por favor, selecione as datas de início e fim.');
            return;
        }

        // ✅ CORREÇÃO: Incluir futureExpenses nos relatórios
        const revenues = Storage.getRevenuesByPeriod(startDate, endDate);
        const expenses = Storage.getExpensesByPeriod(startDate, endDate); // Já inclui futuras

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

        // ✅ CORREÇÃO: Incluir futureExpenses no agrupamento
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
                        label: 'Despesas (Normais + Futuras)',
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

        // ✅ CORREÇÃO: Agrupar despesas normais e futuras juntas
        const incomeByCategory = this.groupByCategory(revenues);
        const expensesByCategory = this.groupByCategory(expenses);

        container.innerHTML = `
            <div class="table-container">
                <table>
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
                                <td><span class="badge income-badge">Receita</span></td>
                                <td style="color: #059669; font-weight: bold;">${this.formatCurrency(amount)}</td>
                                <td>${totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(1) : '0'}%</td>
                            </tr>
                        `).join('')}
                        
                        <!-- Expense Rows -->
                        ${Object.entries(expensesByCategory).map(([category, amount]) => `
                            <tr>
                                <td>${category}</td>
                                <td><span class="badge expense-badge">Despesa</span></td>
                                <td style="color: #dc2626; font-weight: bold;">${this.formatCurrency(amount)}</td>
                                <td>${totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : '0'}%</td>
                            </tr>
                        `).join('')}
                        
                        <!-- Totals -->
                        <tr class="total-row">
                            <td colspan="2"><strong>TOTAL RECEITAS</strong></td>
                            <td style="color: #059669; font-weight: bold;">${this.formatCurrency(totalIncome)}</td>
                            <td><strong>100%</strong></td>
                        </tr>
                        <tr class="total-row">
                            <td colspan="2"><strong>TOTAL DESPESAS</strong></td>
                            <td style="color: #dc2626; font-weight: bold;">${this.formatCurrency(totalExpenses)}</td>
                            <td><strong>100%</strong></td>
                        </tr>
                        <tr class="balance-row ${balance >= 0 ? 'positive-balance' : 'negative-balance'}">
                            <td colspan="2"><strong>SALDO FINAL</strong></td>
                            <td style="color: ${balance >= 0 ? '#059669' : '#dc2626'}; font-weight: bold;">${this.formatCurrency(balance)}</td>
                            <td><strong>-</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
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

        // ✅ CORREÇÃO: Incluir todas as despesas (normais + futuras)
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

    // ✅ CORREÇÃO: Export PDF melhorado - remove sidebar e mantém apenas relatórios
    exportToPDF() {
        // Criar estilos temporários para impressão
        const printStyles = `
            <style>
                @media print {
                    .sidebar, .nav-links, .page-header .btn-secondary, 
                    .report-filters, #exportPdfBtn, .main-content > :not(#relatorios) {
                        display: none !important;
                    }
                    
                    .main-content {
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                    }
                    
                    #relatorios {
                        display: block !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 20px !important;
                    }
                    
                    .report-results {
                        margin-top: 20px !important;
                    }
                    
                    body {
                        background: white !important;
                        color: black !important;
                    }
                    
                    .chart-container {
                        page-break-inside: avoid;
                    }
                    
                    .table-container {
                        page-break-inside: avoid;
                    }
                    
                    h1 {
                        color: black !important;
                        margin-bottom: 20px !important;
                    }
                }
                
                .badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: bold;
                }
                
                .income-badge {
                    background: #d1fae5;
                    color: #065f46;
                }
                
                .expense-badge {
                    background: #fee2e2;
                    color: #991b1b;
                }
                
                .total-row {
                    border-top: 2px solid #1e293b;
                    background: #f8fafc;
                }
                
                .balance-row {
                    border-top: 3px double #1e293b;
                    font-size: 1.1em;
                }
                
                .positive-balance {
                    background: #d1fae5 !important;
                }
                
                .negative-balance {
                    background: #fee2e2 !important;
                }
            </style>
        `;
        
        // Adicionar estilos temporários
        document.head.insertAdjacentHTML('beforeend', printStyles);
        
        // Chamar impressão
        window.print();
        
        // Remover estilos temporários após impressão
        setTimeout(() => {
            const styles = document.head.querySelectorAll('style');
            if (styles.length > 0) {
                styles[styles.length - 1].remove();
            }
        }, 1000);
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
        this.generateReport();
    }
}

// ✅ INICIALIZAÇÃO CORRETA
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Inicializando Relatórios...');
    window.relatorios = new Relatorios();
});