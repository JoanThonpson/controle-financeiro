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
        document.getElementById('addFutureExpenseBtn')?.addEventListener('click', () => {
            this.openFutureExpenseModal();
        });
    }

    loadData() {
        const data = Storage.getData();
        this.renderFutureExpenses(data.futureExpenses);
    }

    renderFutureExpenses(expenses) {
        const container = document.getElementById('futureExpensesList');
        if (!container) return;
        
        container.innerHTML = expenses.map(expense => `
            <div class="future-expense-item" data-id="${expense.id}">
                <div class="item-info">
                    <div class="item-description">${expense.description}</div>
                    <div class="item-category">${expense.category} • ${this.formatDate(expense.date)}</div>
                </div>
                <div class="item-details">
                    <div class="item-amount">${this.formatCurrency(expense.amount)}</div>
                </div>
                <div class="item-actions">
                    <button class="btn-danger" onclick="futuras.deleteFutureExpense('${expense.id}')">🗑️ Excluir</button>
                </div>
            </div>
        `).join('');

        // Show empty state
        if (expenses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Nenhuma despesa futura agendada</p>
                    <button class="btn-primary" onclick="futuras.openFutureExpenseModal()">+ Agendar Despesa</button>
                </div>
            `;
        }
    }

    openFutureExpenseModal() {
        const modal = document.getElementById('expenseModal');
        const title = document.getElementById('expenseModalTitle');
        const typeSelect = document.getElementById('expenseType');
        
        if (modal && title && typeSelect) {
            title.textContent = 'Agendar Despesa Futura';
            typeSelect.value = 'variable'; // Default para variável em despesas futuras
            modal.style.display = 'block';
        }
    }

    deleteFutureExpense(id) {
        if (confirm('Tem certeza que deseja excluir esta despesa futura?')) {
            Storage.deleteFutureExpense(id);
            this.loadData();
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

// Initialize futuras when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.futuras = new Futuras();
});