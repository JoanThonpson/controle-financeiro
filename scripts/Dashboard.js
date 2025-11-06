class Dashboard {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadData();
    }

    bindEvents() {
        // Period selector
        const periodSelect = document.getElementById('periodSelect');
        if (periodSelect) {
            periodSelect.addEventListener('change', (e) => {
                this.loadData();
            });
        }
    }

    loadData() {
        console.log('📊 Carregando dados do dashboard...');
        
        try {
            const data = Storage.getData();
            console.log('📦 Dados carregados:', data);
            
            this.updateMetrics(data);
            this.updateRecentTransactions(data);
            this.updateCharts(data);
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
        }
    }

    updateMetrics(data) {
        console.log('📈 Atualizando métricas...');
        
        const totalIncome = data.revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
        const totalExpenses = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const balance = totalIncome - totalExpenses;

        const incomeElement = document.getElementById('totalIncome');
        const expensesElement = document.getElementById('totalExpenses');
        const balanceElement = document.getElementById('currentBalance');

        if (incomeElement) incomeElement.textContent = this.formatCurrency(totalIncome);
        if (expensesElement) expensesElement.textContent = this.formatCurrency(totalExpenses);
        if (balanceElement) {
            balanceElement.textContent = this.formatCurrency(balance);
            balanceElement.style.color = balance >= 0 ? '#059669' : '#dc2626';
        }

        console.log('✅ Métricas atualizadas:', { totalIncome, totalExpenses, balance });
    }

    updateRecentTransactions(data) {
        const container = document.getElementById('recentTransactions');
        if (!container) {
            console.error('❌ Container recentTransactions não encontrado');
            return;
        }

        // Combine and sort transactions by date
        const allTransactions = [
            ...data.revenues.map(r => ({ ...r, type: 'income' })),
            ...data.expenses.map(e => ({ ...e, type: 'expense' }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

        console.log('🔄 Transações recentes:', allTransactions);

        if (allTransactions.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Nenhuma transação recente</p></div>';
        } else {
            container.innerHTML = allTransactions.map(transaction => `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-description">${transaction.description}</div>
                        <div class="transaction-category">${transaction.category}</div>
                    </div>
                    <div class="transaction-details">
                        <div class="transaction-amount ${transaction.type}">
                            ${transaction.type === 'income' ? '+' : '-'} ${this.formatCurrency(transaction.amount)}
                        </div>
                        <div class="transaction-date">${this.formatDate(transaction.date)}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    updateCharts(data) {
        this.updateMonthlyChart(data);
        this.updateCategoryChart(data);
    }

    updateMonthlyChart(data) {
        const ctx = document.getElementById('monthlyChart')?.getContext('2d');
        if (!ctx) {
            console.error('❌ Canvas monthlyChart não encontrado');
            return;
        }

        // Destroy existing chart
        if (this.charts.monthly) {
            this.charts.monthly.destroy();
        }

        // Group by month
        const monthlyData = this.groupByMonth(data);
        
        this.charts.monthly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [
                    {
                        label: 'Receitas',
                        data: monthlyData.income,
                        borderColor: '#059669',
                        backgroundColor: 'rgba(5, 150, 105, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Despesas',
                        data: monthlyData.expenses,
                        borderColor: '#dc2626',
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
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

    updateCategoryChart(data) {
        const ctx = document.getElementById('categoryChart')?.getContext('2d');
        if (!ctx) {
            console.error('❌ Canvas categoryChart não encontrado');
            return;
        }

        // Destroy existing chart
        if (this.charts.category) {
            this.charts.category.destroy();
        }

        // Group expenses by category
        const categoryData = this.groupByCategory(data.expenses);
        
        this.charts.category = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categoryData.labels,
                datasets: [{
                    data: categoryData.amounts,
                    backgroundColor: [
                        '#059669', '#dc2626', '#d97706', '#7c3aed', '#0891b2',
                        '#65a30d', '#ca8a04', '#db2777', '#4338ca', '#0d9488'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }

    groupByMonth(data) {
        const months = {};
        const currentYear = new Date().getFullYear();
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentYear, new Date().getMonth() - i, 1);
            const key = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
            months[key] = { income: 0, expenses: 0 };
        }

        // Add revenues
        data.revenues.forEach(revenue => {
            const date = new Date(revenue.date);
            const key = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
            if (months[key]) {
                months[key].income += revenue.amount;
            }
        });

        // Add expenses
        data.expenses.forEach(expense => {
            const date = new Date(expense.date);
            const key = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
            if (months[key]) {
                months[key].expenses += expense.amount;
            }
        });

        return {
            labels: Object.keys(months),
            income: Object.values(months).map(m => m.income),
            expenses: Object.values(months).map(m => m.expenses)
        };
    }

    groupByCategory(expenses) {
        const categories = {};
        
        expenses.forEach(expense => {
            if (!categories[expense.category]) {
                categories[expense.category] = 0;
            }
            categories[expense.category] += expense.amount;
        });

        // Sort by amount and get top 10
        const sorted = Object.entries(categories)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        return {
            labels: sorted.map(([category]) => category),
            amounts: sorted.map(([,amount]) => amount)
        };
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
}

// ✅ INICIALIZAÇÃO CORRETA DO DASHBOARD
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Inicializando Dashboard...');
    window.dashboard = new Dashboard();
});