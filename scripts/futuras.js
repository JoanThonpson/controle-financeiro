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
        // Não devemos ter dois listeners competindo pelo mesmo form
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
        
        console.log('📅 Despesas futuras para renderizar:', sortedExpenses);

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

        // ✅ CORREÇÃO: Mostrar campo de tipo para despesas futuras
        const typeGroup = document.getElementById('expenseTypeGroup');
        if (typeGroup) {
            typeGroup.style.display = 'block';
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
        document.getElementById('expensePaymentMethod').value = data.paymentMethod || 'dinheiro';
        document.getElementById('expenseNotes').value = data.notes || '';
    }

    editFutureExpense(id) {
        const data = Storage.getData();
        const expense = data.futureExpenses.find(e => e.id === id);
        if (expense) {
            console.log('✏️ Editando despesa futura:', expense);
            this.openFutureExpenseModal(expense);
        }
    }

    // ✅ NOVO MÉTODO: Handle específico para despesas futuras
    handleFutureExpenseSubmit() {
        try {
            console.log('📝 Iniciando submit da despesa FUTURA...');
            
            const expenseId = document.getElementById('expenseId').value;
            const isEditing = !!expenseId;
            
            // ✅ VALIDAÇÃO
            const description = document.getElementById('expenseDescription').value.trim();
            const amount = parseFloat(document.getElementById('expenseAmount').value);
            const date = document.getElementById('expenseDate').value;
            const category = document.getElementById('expenseCategory').value.trim();
            
            if (!description || !amount || !date || !category) {
                alert('❌ Por favor, preencha todos os campos obrigatórios (Descrição, Valor, Data e Categoria).');
                return;
            }

            if (amount <= 0 || isNaN(amount)) {
                alert('❌ O valor deve ser maior que zero.');
                return;
            }

            const paymentMethod = document.getElementById('expensePaymentMethod').value;
            const notes = document.getElementById('expenseNotes').value;
            const type = document.getElementById('expenseType').value;

            const expense = {
                id: expenseId || Date.now().toString(),
                description: description,
                amount: amount,
                date: date,
                category: category,
                type: type,
                paymentMethod: paymentMethod,
                notes: notes,
                // ✅ GARANTIR que seja salva como despesa FUTURA
                isFuture: true
            };

            console.log('💾 Salvando despesa FUTURA:', expense);

            // ✅ SALVAR APENAS COMO DESPESA FUTURA
            if (isEditing) {
                Storage.updateFutureExpense(expense);
                console.log('✅ Despesa futura atualizada');
            } else {
                Storage.addFutureExpense(expense);
                console.log('✅ Nova despesa futura criada');
            }

            window.app.closeExpenseModal();
            this.loadData();
            
            // ✅ ATUALIZAR DASHBOARD
            if (window.dashboard && window.dashboard.loadData) {
                window.dashboard.loadData();
            }
            
            alert(`✅ Despesa futura ${isEditing ? 'atualizada' : 'agendada'} com sucesso!`);
            
        } catch (error) {
            console.error('❌ Erro ao salvar despesa futura:', error);
            alert('❌ Erro ao salvar despesa futura. Verifique os dados.');
        }
    }

    deleteFutureExpense(id) {
        if (confirm('Tem certeza que deseja excluir esta despesa futura?')) {
            Storage.deleteFutureExpense(id);
            this.loadData();
            
            // Update dashboard if active
            if (window.dashboard && window.dashboard.loadData) {
                window.dashboard.loadData();
            }
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

    // ✅ FORMATAÇÃO FORMA DE PAGAMENTO
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

// ✅ CORREÇÃO: Adicionar event listener específico para despesas futuras
document.addEventListener('DOMContentLoaded', () => {
    window.futuras = new Futuras();
    
    // ✅ LISTENER ESPECÍFICO para detectar quando o modal é aberto para despesas futuras
    document.addEventListener('click', (e) => {
        if (e.target.id === 'addFutureExpenseBtn' || 
            (e.target.closest && e.target.closest('#addFutureExpenseBtn'))) {
            
            // ✅ REMOVER qualquer listener anterior do form
            const expenseForm = document.getElementById('expenseForm');
            const newExpenseForm = expenseForm.cloneNode(true);
            expenseForm.parentNode.replaceChild(newExpenseForm, expenseForm);
            
            // ✅ ADICIONAR listener específico para despesas futuras
            newExpenseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                window.futuras.handleFutureExpenseSubmit();
            });
        }
    });
});