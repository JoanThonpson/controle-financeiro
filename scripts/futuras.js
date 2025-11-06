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

        // ✅ CORREÇÃO: REMOVER event listener conflitante do expenseForm
        // O expenseForm já é gerenciado pela classe Despesas
    }

    loadData() {
        const data = Storage.getData();
        // ✅ CORREÇÃO: Usar apenas despesas futuras
        const futureExpenses = data.futureExpenses;
        this.renderFutureExpenses(futureExpenses);
    }

    renderFutureExpenses(expenses) {
        const container = document.getElementById('futureExpensesList');
        if (!container) return;
        
        // Sort by date
        const sortedExpenses = expenses.sort((a, b) => new Date(a.date) - new Date(b.date));

        if (sortedExpenses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Nenhuma despesa futura agendada</p>
                    <button class="btn-primary" onclick="futuras.openFutureExpenseModal()">
                        + Agendar Despesa Futura
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = sortedExpenses.map(expense => `
                <div class="future-expense-item" data-id="${expense.id}">
                    <div class="item-info">
                        <div class="item-description">${expense.description}</div>
                        <div class="item-category">${expense.category} • Vencimento: ${this.formatDate(expense.date)}</div>
                        ${expense.paymentMethod ? `<div class="item-payment">💳 ${this.formatPaymentMethod(expense.paymentMethod)}</div>` : ''}
                        ${expense.notes ? `<div class="item-notes">📝 ${expense.notes}</div>` : ''}
                    </div>
                    <div class="item-details">
                        <div class="item-amount">${this.formatCurrency(expense.amount)}</div>
                        <div class="item-status ${this.getExpenseStatus(expense.date)}">
                            ${this.getExpenseStatusText(expense.date)}
                        </div>
                    </div>
                    <div class="item-actions">
                        <button class="btn-edit" onclick="futuras.editFutureExpense('${expense.id}')">✏️ Editar</button>
                        <button class="btn-danger" onclick="futuras.deleteFutureExpense('${expense.id}')">🗑️ Excluir</button>
                    </div>
                </div>
            `).join('');
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

        // ✅ CORREÇÃO: OCULTAR campo "Tipo" para despesas futuras
        const typeGroup = document.getElementById('expenseTypeGroup');
        if (typeGroup) {
            typeGroup.style.display = 'none';
        }

        modal.style.display = 'block';
    }

    fillFutureExpenseForm(data) {
        document.getElementById('expenseId').value = data.id;
        document.getElementById('expenseDescription').value = data.description;
        document.getElementById('expenseAmount').value = data.amount;
        document.getElementById('expenseDate').value = data.date;
        document.getElementById('expenseCategory').value = data.category;
        document.getElementById('expensePaymentMethod').value = data.paymentMethod || 'dinheiro';
        document.getElementById('expenseNotes').value = data.notes || '';
        
        // ✅ CORREÇÃO: Não preencher tipo (campo estará oculto)
    }

    editFutureExpense(id) {
        const data = Storage.getData();
        const expense = data.futureExpenses.find(e => e.id === id);
        if (expense) {
            this.openFutureExpenseModal(expense);
        }
    }

    // ✅ CORREÇÃO: Handle específico para despesas futuras
    handleFutureExpenseSubmit() {
        try {
            const expenseId = document.getElementById('expenseId').value;
            
            const expense = {
                id: expenseId || Date.now().toString(),
                description: document.getElementById('expenseDescription').value,
                amount: parseFloat(document.getElementById('expenseAmount').value),
                date: document.getElementById('expenseDate').value,
                category: document.getElementById('expenseCategory').value,
                // ✅ CORREÇÃO: Tipo fixo como 'variable' para futuras
                type: 'variable',
                paymentMethod: document.getElementById('expensePaymentMethod').value,
                notes: document.getElementById('expenseNotes').value,
                // ✅ CORREÇÃO: Garantir que seja salva como despesa FUTURA
                isFuture: true
            };

            if (!expense.description || !expense.amount || !expense.date || !expense.category) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }

            if (expenseId && expenseId !== '') {
                // Update existing expense
                Storage.updateFutureExpense(expense);
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

    formatPaymentMethod(method) {
        const methods = {
            'dinheiro': 'Dinheiro',
            'cartao_credito': 'Cartão Crédito', 
            'cartao_debito': 'Cartão Débito',
            'pix': 'PIX',
            'transferencia': 'Transferência'
        };
        return methods[method] || method;
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

// ✅ CORREÇÃO: Inicialização simples sem conflitos
document.addEventListener('DOMContentLoaded', () => {
    window.futuras = new Futuras();
});