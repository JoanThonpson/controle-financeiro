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
        document.getElementById('periodSelect')?.addEventListener('change', (e) => {
            this.loadData();
        });

        // Revenue form
        document.getElementById('revenueForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRevenueSubmit();
        });

        // Expense form
        document.getElementById('expenseForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleExpenseSubmit();
        });
    }

    loadData() {
        const data = Storage.getData();
        this.updateMetrics(data);
        this.updateRecentTransactions(data);
        this.updateCharts(data);
    }

    updateMetrics(data) {
        const totalIncome = data.revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
        const totalExpenses = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const balance = totalIncome - totalExpenses;

        document.getElementById('totalIncome').textContent = this.formatCurrency(totalIncome);
        document.getElementById('totalExpenses').textContent = this.formatCurrency(totalExpenses);
        document.getElementById('currentBalance').textContent = this.formatCurrency(balance);

        // Update balance color
        const balanceElement = document.getElementById('currentBalance');
        balanceElement.className = 'metric-value';
        if (balance >= 0) {
            balanceElement.classList.add('positive');
        } else {
            balanceElement.classList.add('negative');
        }
    }

    updateRecentTransactions(data) {
        const container = document.getElementById('recentTransactions');
        if (!container) return;

        // Combine and sort transactions by date
        const allTransactions = [
            ...data.revenues.map(r => ({ ...r, type: 'income' })),
            ...data.expenses.map(e => ({ ...e, type: 'expense' }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

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

    updateCharts(data) {
        this.updateMonthlyChart(data);
        this.updateCategoryChart(data);
    }

    updateMonthlyChart(data) {
        const ctx = document.getElementById('monthlyChart')?.getContext('2d');
        if (!ctx) return;

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

    updateCategoryChart(data) {
        const ctx = document.getElementById('categoryChart')?.getContext('2d');
        if (!ctx) return;

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
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const total = categoryData.amounts.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${context.label}: ${this.formatCurrency(context.raw)} (${percentage}%)`;
                            }
                        }
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

    handleRevenueSubmit() {
    try {
        const formData = new FormData(document.getElementById('revenueForm'));
        const revenueId = document.getElementById('revenueId').value;
        
        const revenue = {
            id: revenueId || Date.now().toString(),
            description: document.getElementById('revenueDescription').value,
            amount: parseFloat(document.getElementById('revenueAmount').value),
            date: document.getElementById('revenueDate').value,
            type: document.getElementById('revenueType').value,
            category: document.getElementById('revenueCategory').value || 'Outros'
        };

        if (revenueId && revenueId !== '') {
            Storage.updateRevenue(revenue);
        } else {
            Storage.addRevenue(revenue);
        }

        window.app.closeRevenueModal();
        this.loadData();
        
        // Reload receitas page if active
        if (typeof window.receitas !== 'undefined' && window.receitas.loadData) {
            window.receitas.loadData();
        }
    } catch (error) {
        console.error('Erro ao salvar receita:', error);
        alert('Erro ao salvar receita. Verifique os dados e tente novamente.');
    }
}

handleExpenseSubmit() {
    try {
        const expenseId = document.getElementById('expenseId').value;
        
        const expense = {
            id: expenseId || Date.now().toString(),
            description: document.getElementById('expenseDescription').value,
            amount: parseFloat(document.getElementById('expenseAmount').value),
            date: document.getElementById('expenseDate').value,
            type: document.getElementById('expenseType').value,
            category: document.getElementById('expenseCategory').value
        };

        if (expenseId && expenseId !== '') {
            Storage.updateExpense(expense);
        } else {
            Storage.addExpense(expense);
        }

        window.app.closeExpenseModal();
        this.loadData();
        
        // Reload despesas page if active
        if (typeof window.despesas !== 'undefined' && window.despesas.loadData) {
            window.despesas.loadData();
        }
    } catch (error) {
        console.error('Erro ao salvar despesa:', error);
        alert('Erro ao salvar despesa. Verifique os dados e tente novamente.');
    }
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

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});