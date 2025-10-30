class Despesas {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadData();
    }

    bindEvents() {
        // Expense form submission
        document.getElementById('expenseForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleExpenseSubmit();
        });
    }

    loadData() {
        const data = Storage.getData();
        this.renderFixedExpenses(data.expenses);
        this.renderVariableExpenses(data.expenses);
    }

    renderFixedExpenses(expenses) {
        const container = document.getElementById('fixedExpenseList');
        if (!container) {
            console.error('Container #fixedExpenseList não encontrado');
            return;
        }

        const fixedExpenses = expenses.filter(e => e.type === 'fixed');
        
        console.log('Despesas fixas encontradas:', fixedExpenses); // Debug
        
        container.innerHTML = fixedExpenses.map(expense => `
            <div class="expense-item" data-id="${expense.id}">
                <div class="item-info">
                    <div class="item-description">${expense.description}</div>
                    <div class="item-category">${expense.category}</div>
                </div>
                <div class="item-details">
                    <div class="item-amount">${this.formatCurrency(expense.amount)}</div>
                    <div class="item-date">${this.formatDate(expense.date)}</div>
                </div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="despesas.editExpense('${expense.id}')">✏️ Editar</button>
                    <button class="btn-danger" onclick="despesas.deleteExpense('${expense.id}')">🗑️ Excluir</button>
                </div>
            </div>
        `).join('');

        // Show empty state
        if (fixedExpenses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Nenhuma despesa fixa cadastrada</p>
                    <button class="btn-primary" onclick="app.openExpenseModal()">+ Adicionar Despesa Fixa</button>
                </div>
            `;
        }
    }

    renderVariableExpenses(expenses) {
        const container = document.getElementById('variableExpenseList');
        if (!container) {
            console.error('Container #variableExpenseList não encontrado');
            return;
        }

        const variableExpenses = expenses.filter(e => e.type === 'variable');
        
        console.log('Despesas variáveis encontradas:', variableExpenses); // Debug
        
        container.innerHTML = variableExpenses.map(expense => `
            <div class="expense-item" data-id="${expense.id}">
                <div class="item-info">
                    <div class="item-description">${expense.description}</div>
                    <div class="item-category">${expense.category}</div>
                </div>
                <div class="item-details">
                    <div class="item-amount">${this.formatCurrency(expense.amount)}</div>
                    <div class="item-date">${this.formatDate(expense.date)}</div>
                </div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="despesas.editExpense('${expense.id}')">✏️ Editar</button>
                    <button class="btn-danger" onclick="despesas.deleteExpense('${expense.id}')">🗑️ Excluir</button>
                </div>
            </div>
        `).join('');

        // Show empty state
        if (variableExpenses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Nenhuma despesa variável cadastrada</p>
                    <button class="btn-primary" onclick="app.openExpenseModal()">+ Adicionar Despesa Variável</button>
                </div>
            `;
        }
    }

    editExpense(id) {
        const data = Storage.getData();
        const expense = data.expenses.find(e => e.id === id);
        if (expense) {
            window.app.openExpenseModal(expense);
        }
    }

    deleteExpense(id) {
        if (confirm('Tem certeza que deseja excluir esta despesa?')) {
            Storage.deleteExpense(id);
            this.loadData();
            
            // Update dashboard if active
            if (window.dashboard && window.dashboard.loadData) {
                window.dashboard.loadData();
            }
        }
    }

    handleExpenseSubmit() {
        const expenseId = document.getElementById('expenseId').value;
        
        const expense = {
            id: expenseId || Date.now().toString(),
            description: document.getElementById('expenseDescription').value,
            amount: parseFloat(document.getElementById('expenseAmount').value),
            date: document.getElementById('expenseDate').value,
            type: document.getElementById('expenseType').value,
            category: document.getElementById('expenseCategory').value
        };

        if (expenseId) {
            Storage.updateExpense(expense);
        } else {
            Storage.addExpense(expense);
        }

        window.app.closeExpenseModal();
        this.loadData();
        
        // Update dashboard if active
        if (window.dashboard && window.dashboard.loadData) {
            window.dashboard.loadData();
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

// Initialize despesas when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.despesas = new Despesas();
});