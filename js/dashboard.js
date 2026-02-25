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
        // Period selector - ✅ CORRIGIDO: Removido "Personalizado"
        const periodSelect = document.getElementById('periodSelect');
        if (periodSelect) {
            periodSelect.innerHTML = `
                <option value="current-month">Este Mês</option>
                <option value="last-month">Mês Anterior</option>
                <option value="current-year">Este Ano</option>
            `;
            
            periodSelect.addEventListener('change', (e) => {
                this.loadData();
            });
        }
    }

    loadData() {
        console.log('📊 Carregando dados do dashboard...');
        
        try {
            const periodSelect = document.getElementById('periodSelect');
            const selectedPeriod = periodSelect ? periodSelect.value : 'current-month';
            
            console.log('📅 Período selecionado:', selectedPeriod);
            
            const data = Storage.getData();
            const filteredData = this.filterDataByPeriod(data, selectedPeriod);
            
            console.log('📦 Dados filtrados:', filteredData);
            
            this.updateMetrics(filteredData);
            this.updateRecentTransactions(filteredData);
            this.updateCharts(filteredData, selectedPeriod);
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
        }
    }

    // ✅ NOVO MÉTODO: Filtrar dados pelo período selecionado
    filterDataByPeriod(data, period) {
        const now = new Date();
        let startDate, endDate;

        switch(period) {
            case 'last-month':
                // ✅ CORREÇÃO: Mês anterior corretamente calculado
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'current-year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            case 'current-month':
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
        }

        console.log('📅 Filtro aplicado:', { period, startDate, endDate });

        // Filtrar receitas
        const filteredRevenues = data.revenues.filter(revenue => {
            const revenueDate = new Date(revenue.date);
            return revenueDate >= startDate && revenueDate <= endDate;
        });

        // Filtrar despesas normais
        const filteredExpenses = data.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= startDate && expenseDate <= endDate;
        });

        // Filtrar despesas futuras
        const filteredFutureExpenses = data.futureExpenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= startDate && expenseDate <= endDate;
        });

        return {
            revenues: filteredRevenues,
            expenses: filteredExpenses,
            futureExpenses: filteredFutureExpenses
        };
    }

    updateMetrics(data) {
        console.log('📈 Atualizando métricas...');
        
        // ✅ INCLUIR futureExpenses nas métricas totais
        const totalIncome = data.revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
        const totalNormalExpenses = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalFutureExpenses = data.futureExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalExpenses = totalNormalExpenses + totalFutureExpenses;
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

        console.log('✅ Métricas atualizadas:', { 
            totalIncome, 
            totalNormalExpenses, 
            totalFutureExpenses, 
            totalExpenses, 
            balance 
        });
    }

    updateRecentTransactions(data) {
        const container = document.getElementById('recentTransactions');
        if (!container) {
            console.error('❌ Container recentTransactions não encontrado');
            return;
        }

        // ✅ COMBINAR receitas, despesas normais E futuras
        const allTransactions = [
            ...data.revenues.map(r => ({ ...r, type: 'income' })),
            ...data.expenses.map(e => ({ ...e, type: 'expense' })),
            ...data.futureExpenses.map(f => ({ ...f, type: 'future-expense' }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

        console.log('🔄 Transações recentes:', allTransactions);

        if (allTransactions.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Nenhuma transação recente</p></div>';
        } else {
            container.innerHTML = allTransactions.map(transaction => `
                <div class="transaction-item ${transaction.type === 'future-expense' ? 'future-transaction' : ''}">
                    <div class="transaction-info">
                        <div class="transaction-description">
                            ${transaction.description}
                            ${transaction.type === 'future-expense' ? ' ⏰' : ''}
                        </div>
                        <div class="transaction-category">${transaction.category}</div>
                    </div>
                    <div class="transaction-details">
                        <div class="transaction-amount ${transaction.type}">
                            ${transaction.type === 'income' ? '+' : '-'} ${this.formatCurrency(transaction.amount)}
                            ${transaction.type === 'future-expense' ? ' (Futura)' : ''}
                        </div>
                        <div class="transaction-date">${this.formatDate(transaction.date)}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    updateCharts(data, period) {
        this.updateMonthlyChart(data, period);
        this.updateCategoryChart(data);
    }

    updateMonthlyChart(data, period) {
        const ctx = document.getElementById('monthlyChart')?.getContext('2d');
        if (!ctx) {
            console.error('❌ Canvas monthlyChart não encontrado');
            return;
        }

        // Destroy existing chart
        if (this.charts.monthly) {
            this.charts.monthly.destroy();
        }

        // ✅ CORREÇÃO: Agrupar pelos dados JÁ FILTRADOS pelo período
        const monthlyData = this.groupFilteredDataByMonth(data, period);
        
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
                        label: 'Despesas Normais',
                        data: monthlyData.normalExpenses,
                        borderColor: '#dc2626',
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Despesas Futuras',
                        data: monthlyData.futureExpenses,
                        borderColor: '#d97706',
                        backgroundColor: 'rgba(217, 119, 6, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderDash: [5, 5]
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
                        text: this.getChartTitle(period)
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

    // ✅ NOVO MÉTODO: Agrupar dados já filtrados
    groupFilteredDataByMonth(data, period) {
        const now = new Date();
        let months = {};
        
        // Definir range de meses baseado no período
        switch(period) {
            case 'last-month':
                // Apenas o mês anterior
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const key = lastMonth.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
                months[key] = { income: 0, normalExpenses: 0, futureExpenses: 0 };
                break;
                
            case 'current-year':
                // Todos os meses do ano
                for (let i = 0; i < 12; i++) {
                    const date = new Date(now.getFullYear(), i, 1);
                    const key = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
                    months[key] = { income: 0, normalExpenses: 0, futureExpenses: 0 };
                }
                break;
                
            case 'current-month':
            default:
                // Apenas o mês atual
                const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const currentKey = currentMonth.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
                months[currentKey] = { income: 0, normalExpenses: 0, futureExpenses: 0 };
                break;
        }

        // Processar receitas
        data.revenues.forEach(revenue => {
            const date = new Date(revenue.date);
            const key = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
            if (months[key]) {
                months[key].income += revenue.amount;
            }
        });

        // Processar despesas normais
        data.expenses.forEach(expense => {
            const date = new Date(expense.date);
            const key = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
            if (months[key]) {
                months[key].normalExpenses += expense.amount;
            }
        });

        // Processar despesas futuras
        data.futureExpenses.forEach(expense => {
            const date = new Date(expense.date);
            const key = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
            if (months[key]) {
                months[key].futureExpenses += expense.amount;
            }
        });

        return {
            labels: Object.keys(months),
            income: Object.values(months).map(m => m.income),
            normalExpenses: Object.values(months).map(m => m.normalExpenses),
            futureExpenses: Object.values(months).map(m => m.futureExpenses)
        };
    }

    // ✅ NOVO MÉTODO: Título do gráfico baseado no período
    getChartTitle(period) {
        const titles = {
            'current-month': 'Este Mês',
            'last-month': 'Mês Anterior', 
            'current-year': 'Este Ano'
        };
        return titles[period] || 'Dashboard Financeiro';
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

        // ✅ AGRUPAR despesas normais E futuras por categoria
        const allExpenses = [...data.expenses, ...data.futureExpenses];
        const categoryData = this.groupByCategory(allExpenses);
        
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
                    title: {
                        display: true,
                        text: 'Gastos por Categoria'
                    }
                }
            }
        });
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

// ✅ CORREÇÃO: Inicialização mais robusta do Dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Inicializando Dashboard...');
    
    // Aguardar um pouco para garantir que o DOM esteja completamente carregado
    setTimeout(() => {
        if (document.getElementById('dashboard')?.classList.contains('active')) {
            window.dashboard = new Dashboard();
            console.log('✅ Dashboard inicializado com sucesso!');
        } else {
            console.log('⏳ Dashboard não é a página ativa, aguardando...');
        }
    }, 100);
});

// ✅ CORREÇÃO: Recarregar dashboard quando a página for ativada
document.addEventListener('DOMContentLoaded', function() {
    // Observar mudanças na página ativa
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const dashboardPage = document.getElementById('dashboard');
                if (dashboardPage && dashboardPage.classList.contains('active')) {
                    if (!window.dashboard) {
                        window.dashboard = new Dashboard();
                    } else {
                        window.dashboard.loadData();
                    }
                }
            }
        });
    });

    // Observar mudanças nas páginas
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        observer.observe(page, { attributes: true });
    });
});