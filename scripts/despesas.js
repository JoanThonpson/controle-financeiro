class Despesas {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadData();
    }

    bindEvents() {
        document.getElementById('expenseForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleExpenseSubmit();
        });
    }

    loadData() {
        const data = Storage.getData();
        // ✅ CORREÇÃO: Usar apenas despesas normais (não futuras)
        const normalExpenses = data.expenses.filter(expense => !expense.isFuture);
        this.renderFixedExpenses(normalExpenses);
        this.renderVariableExpenses(normalExpenses);
    }

    renderFixedExpenses(expenses) {
        const container = document.getElementById('fixedExpenseList');
        if (!container) {
            console.error('Container #fixedExpenseList não encontrado');
            return;
        }

        const fixedExpenses = expenses.filter(e => e.type === 'fixed');
        console.log('🔧 Despesas fixas para renderizar:', fixedExpenses);

        if (fixedExpenses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Nenhuma despesa fixa cadastrada</p>
                    <button class="btn-primary" onclick="app.openExpenseModal()">+ Adicionar Despesa Fixa</button>
                </div>
            `;
        } else {
            container.innerHTML = fixedExpenses.map(expense => `
                <div class="expense-item" data-id="${expense.id}">
                    <div class="item-info">
                        <div class="item-description">${expense.description}</div>
                        <div class="item-category">${expense.category}</div>
                        ${expense.paymentMethod ? `<div class="item-payment">💳 ${this.formatPaymentMethod(expense.paymentMethod)}</div>` : ''}
                        ${expense.notes ? `<div class="item-notes">📝 ${expense.notes}</div>` : ''}
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
        }
    }

    renderVariableExpenses(expenses) {
        const container = document.getElementById('variableExpenseList');
        if (!container) return;

        const variableExpenses = expenses.filter(e => e.type === 'variable');
        console.log('🎯 Despesas variáveis para renderizar:', variableExpenses);

        if (variableExpenses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Nenhuma despesa variável cadastrada</p>
                    <button class="btn-primary" onclick="app.openExpenseModal()">+ Adicionar Despesa Variável</button>
                </div>
            `;
        } else {
            container.innerHTML = variableExpenses.map(expense => `
                <div class="expense-item" data-id="${expense.id}">
                    <div class="item-info">
                        <div class="item-description">${expense.description}</div>
                        <div class="item-category">${expense.category}</div>
                        ${expense.paymentMethod ? `<div class="item-payment">💳 ${this.formatPaymentMethod(expense.paymentMethod)}</div>` : ''}
                        ${expense.notes ? `<div class="item-notes">📝 ${expense.notes}</div>` : ''}
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
        }
    }

    editExpense(id) {
        const data = Storage.getData();
        // ✅ CORREÇÃO: Buscar apenas em despesas normais
        const expense = data.expenses.find(e => e.id === id && !e.isFuture);
        if (expense) {
            console.log('✏️ Editando despesa:', expense);
            window.app.openExpenseModal(expense);
        } else {
            console.error('❌ Despesa não encontrada ou é uma despesa futura');
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

    // ✅ MÉTODO handleExpenseSubmit CORRIGIDO - SALVAR APENAS COMO DESPESA NORMAL
    handleExpenseSubmit() {
        try {
            console.log('📝 Iniciando submit da despesa NORMAL...');
            
            const expenseId = document.getElementById('expenseId').value;
            const isEditing = !!expenseId;
            
            // ✅ VALIDAÇÃO SIMPLES - APENAS 4 CAMPOS OBRIGATÓRIOS
            const description = document.getElementById('expenseDescription').value.trim();
            const amount = parseFloat(document.getElementById('expenseAmount').value);
            const date = document.getElementById('expenseDate').value;
            const category = document.getElementById('expenseCategory').value.trim();
            
            // ✅ VALIDAÇÃO IDÊNTICA ÀS RECEITAS
            if (!description || !amount || !date || !category) {
                alert('❌ Por favor, preencha todos os campos obrigatórios (Descrição, Valor, Data e Categoria).');
                return;
            }

            if (amount <= 0 || isNaN(amount)) {
                alert('❌ O valor deve ser maior que zero.');
                return;
            }

            // ✅ CAMPOS NÃO OBRIGATÓRIOS
            const paymentMethod = document.getElementById('expensePaymentMethod').value;
            const notes = document.getElementById('expenseNotes').value;

            // ✅ DETERMINA TIPO (igual receitas)
            let type;
            if (isEditing) {
                const originalData = Storage.getData();
                const originalExpense = originalData.expenses.find(e => e.id === expenseId);
                type = originalExpense ? originalExpense.type : 'fixed';
            } else {
                type = document.getElementById('expenseType').value;
            }

            const expense = {
                id: expenseId || Date.now().toString(),
                description: description,
                amount: amount,
                date: date,
                category: category,
                type: type,
                paymentMethod: paymentMethod,
                notes: notes,
                // ✅ GARANTIR que seja salva como despesa NORMAL
                isFuture: false
            };

            console.log('💾 Salvando despesa NORMAL:', expense);

            // ✅ SALVAR APENAS COMO DESPESA NORMAL
            if (isEditing) {
                Storage.updateExpense(expense);
                console.log('✅ Despesa normal atualizada');
            } else {
                Storage.addExpense(expense);
                console.log('✅ Nova despesa normal criada');
            }

            // ✅ FECHA MODAL E RECARREGA
            window.app.closeExpenseModal();
            this.loadData();
            
            // ✅ ATUALIZAR DASHBOARD
            if (window.dashboard && window.dashboard.loadData) {
                window.dashboard.loadData();
            }
            
            alert(`✅ Despesa ${isEditing ? 'atualizada' : 'cadastrada'} com sucesso!`);
            
        } catch (error) {
            console.error('❌ Erro ao salvar despesa:', error);
            alert('❌ Erro ao salvar despesa. Verifique os dados.');
        }
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

    // ✅ MÉTODOS DE FORMATAÇÃO
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