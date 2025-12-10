class Despesas {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupFormControl();
        this.loadData();
    }

    bindEvents() {
        document.getElementById('expenseForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleExpenseSubmit();
        });
    }

    setupFormControl() {
        const expenseForm = document.getElementById('expenseForm');
        if (expenseForm) {
            // Clonar formulário para limpar listeners
            const newForm = expenseForm.cloneNode(true);
            expenseForm.parentNode.replaceChild(newForm, expenseForm);
            
            // Adicionar nosso listener para despesas normais
            newForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleExpenseSubmit();
            });
            
            // Manter botão cancelar funcionando
            const cancelBtn = document.getElementById('cancelExpenseBtn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    document.getElementById('expenseModal').style.display = 'none';
                });
            }
        }
    }

    loadData() {
        console.log('🔄 Carregando dados das despesas...');
        const data = Storage.getData();
        
        // ✅ CORREÇÃO: Usar apenas despesas normais (não futuras)
        const normalExpenses = data.expenses.filter(expense => !expense.isFuture);
        
        this.renderFixedExpenses(normalExpenses);
        this.renderVariableExpenses(normalExpenses);
    }

    renderFixedExpenses(expenses) {
        const container = document.getElementById('fixedExpenseList');
        if (!container) return;

        const fixedExpenses = expenses.filter(e => e.type === 'fixed');

        if (fixedExpenses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Nenhuma despesa fixa cadastrada</p>
                    <button class="btn-primary" onclick="despesas.abrirNovaDespesa()">+ Adicionar Despesa Fixa</button>
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

        if (variableExpenses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Nenhuma despesa variável cadastrada</p>
                    <button class="btn-primary" onclick="despesas.abrirNovaDespesa()">+ Adicionar Despesa Variável</button>                </div>
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
        const expense = data.expenses.find(e => e.id === id && !e.isFuture);
        if (expense) {
            this.abrirModalEdicao(expense);
        }
    }

    abrirModalEdicao(expense) {
        const modal = document.getElementById('expenseModal');
        const title = document.getElementById('expenseModalTitle');
        const form = document.getElementById('expenseForm');

        title.textContent = 'Editar Despesa';

        // Preencher formulário
        document.getElementById('expenseId').value = expense.id;
        document.getElementById('expenseDescription').value = expense.description;
        document.getElementById('expenseAmount').value = expense.amount;
        document.getElementById('expenseDate').value = expense.date;
        document.getElementById('expenseType').value = expense.type;
        document.getElementById('expenseCategory').value = expense.category;
        document.getElementById('expensePaymentMethod').value = expense.paymentMethod || 'dinheiro';
        document.getElementById('expenseNotes').value = expense.notes || '';

        // Ocultar campo tipo na edição
        document.getElementById('expenseTypeGroup').style.display = 'none';

        modal.style.display = 'block';
    }
    
    abrirNovaDespesa() {
        const modal = document.getElementById('expenseModal');
        const title = document.getElementById('expenseModalTitle');
        const form = document.getElementById('expenseForm');
    
        title.textContent = 'Nova Despesa';
        form.reset();
        document.getElementById('expenseId').value = '';
        document.getElementById('expenseTypeGroup').style.display = 'block';
        modal.style.display = 'block';
 }

    deleteExpense(id) {
        if (confirm('Tem certeza que deseja excluir esta despesa?')) {
            Storage.deleteExpense(id);
            this.loadData();
            
            if (window.dashboard && window.dashboard.loadData) {
                window.dashboard.loadData();
            }
        }
    }

    handleExpenseSubmit() {
        try {
            const expenseId = document.getElementById('expenseId').value;
            const isEditing = !!expenseId;
            
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
                isFuture: false
            };

            if (isEditing) {
                Storage.updateExpense(expense);
            } else {
                Storage.addExpense(expense);
            }

            document.getElementById('expenseModal').style.display = 'none';
            this.loadData();
            
            if (window.dashboard && window.dashboard.loadData) {
                window.dashboard.loadData();
            }
            
            alert(`✅ Despesa ${isEditing ? 'atualizada' : 'cadastrada'} com sucesso!`);
            
        } catch (error) {
            console.error('❌ Erro ao salvar despesa:', error);
            alert('❌ Erro ao salvar despesa. Verifique os dados.');
        }
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

    setupExpenseFormHandler() {
        const expenseForm = document.getElementById('expenseForm');
        if (expenseForm) {
            // Remover listeners antigos para evitar duplicação
            const newForm = expenseForm.cloneNode(true);
            expenseForm.parentNode.replaceChild(newForm, expenseForm);
            
            // Adicionar nosso listener
            newForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleExpenseSubmit();
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.despesas = new Despesas();
});
