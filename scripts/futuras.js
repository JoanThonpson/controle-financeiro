class Futuras {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadData();
    }

    bindEvents() {
        // Add future expense button
        const addButton = document.getElementById('addFutureExpenseBtn');
        if (addButton) {
            addButton.addEventListener('click', () => {
                this.openFutureExpenseModal();
            });
        }

        // Expense form submission for future expenses
        const expenseForm = document.getElementById('expenseForm');
        if (expenseForm) {
            expenseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFutureExpenseSubmit();
            });
        }
    }

    loadData() {
        const data = Storage.getData();
        this.renderFutureExpenses(data.futureExpenses);
    }

    renderFutureExpenses(expenses) {
        const container = document.getElementById('futureExpensesList');
        if (!container) return;
        
        // Sort by date
        const sortedExpenses = expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        container.innerHTML = sortedExpenses.map(expense => `
            <div class="future-expense-item" data-id="${expense.id}">
                <div class="item-info">
                    <div class="item-description">${expense.description}</div>
                    <div class="item-category">${expense.category} • Vencimento: ${this.formatDate(expense.date)}</div>
                    ${expense.notes ? `<div class="item-notes">${expense.notes}</div>` : ''}
                </div>
                <div class="item-details">
                    <div class="item-amount">${this.formatCurrency(expense.amount)}</div>
                    <div class="item-status ${this.getExpenseStatus(expense.date)}">
                        ${this.getExpenseStatusText(expense.date)}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="btn-danger" onclick="futuras.deleteFutureExpense('${expense.id}')">
                        🗑️ Excluir
                    </button>
                </div>
            </div>
        `).join('');

        // Show empty state
        if (expenses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Nenhuma despesa futura agendada</p>
                    <button class="btn-primary" onclick="futuras.openFutureExpenseModal()">
                        + Agendar Despesa Futura
                    </button>
                </div>
            `;
        }
    }

    openFutureExpenseModal(editData = null) {
        const modal = document.getElementById('expenseModal');
        const title = document.getElementById('expenseModalTitle');
        const form = document.getElementById('expenseForm');
        
        if (!modal || !title || !form) return;

        if (editData) {
            title.textContent = 'Editar Despesa Futura';
            this.fillFutureExpenseForm(editData);
        } else {
            title.textContent = 'Agendar Despesa Futura';
            form.reset();
            
            // Set default date to next month
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            document.getElementById('expenseDate').value = nextMonth.toISOString().split('T')[0];
        }

        modal.style.display = 'block';
    }

    fillFutureExpenseForm(data) {
        document.getElementById('expenseId').value = data.id;
        document.getElementById('expenseDescription').value = data.description;
        document.getElementById('expenseAmount').value = data.amount;
        document.getElementById('expenseDate').value = data.date;
        document.getElementById('expenseType').value = data.type || 'variable';
        document.getElementById('expenseCategory').value = data.category;
    }

    handleFutureExpenseSubmit() {
        try {
            const expenseId = document.getElementById('expenseId').value;
            
            const expense = {
                id: expenseId || Date.now().toString(),
                description: document.getElementById('expenseDescription').value,
                amount: parseFloat(document.getElementById('expenseAmount').value),
                date: document.getElementById('expenseDate').value,
                type: document.getElementById('expenseType').value,
                category: document.getElementById('expenseCategory').value,
                isFuture: true
            };

            if (!expense.description || !expense.amount || !expense.date || !expense.category) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            if (expenseId && expenseId !== '') {
                // Update existing expense
                Storage.updateExpense(expense);
            } else {
                // Add new future expense
                Storage.addFutureExpense(expense);
            }

            window.app.closeExpenseModal();
            this.loadData();
            
        } catch (error) {
            console.error('Erro ao salvar despesa futura:', error);
            alert('Erro ao salvar despesa futura. Verifique os dados e tente novamente.');
        }
    }

    deleteFutureExpense(id) {
        if (confirm('Tem certeza que deseja excluir esta despesa futura?')) {
            Storage.deleteFutureExpense(id);
            this.loadData();
        }
    }

    getExpenseStatus(expenseDate) {
        const today = new Date();
        const expense = new Date(expenseDate);
        const diffTime = expense - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'overdue';
        if (diffDays <= 7) return 'upcoming';
        return 'future';
    }

    getExpenseStatusText(expenseDate) {
        const today = new Date();
        const expense = new Date(expenseDate);
        const diffTime = expense - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return `Vencida há ${Math.abs(diffDays)} dias`;
        if (diffDays === 0) return 'Vence hoje';
        if (diffDays === 1) return 'Vence amanhã';
        if (diffDays <= 7) return `Vence em ${diffDays} dias`;
        return `Vence em ${diffDays} dias`;
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

// Initialize futuras when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.futuras = new Futuras();
});