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
    const variableExpenses = expenses.filter(e => e.type === 'variable');
    
    container.innerHTML = variableExpenses.map(expense => `
        <div class="expense-item" data-id="${expense.id}">
            <div class="item-info">
                <div class="item-description">${expense.description}</div>
                <div class="item-category">${expense.category}</div>
                <!-- ⭐⭐ NOVOS CAMPOS NA LISTA ⭐⭐ -->
                ${expense.local ? `<div class="item-local">🏪 ${expense.local}</div>` : ''}
                ${expense.paymentMethod ? `<div class="item-payment">💳 ${this.formatPaymentMethod(expense.paymentMethod)}</div>` : ''}
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
    try {
        const expenseId = document.getElementById('expenseId').value;
        const isEditing = !!expenseId; 
        
        
        const description = document.getElementById('expenseDescription').value.trim();
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const date = document.getElementById('expenseDate').value;
        const category = document.getElementById('expenseCategory').value.trim();
        
        if (!description || !amount || !date || !category) {
            alert('❌ Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (amount <= 0) {
            alert('❌ O valor deve ser maior que zero.');
            return;
        }

        const expense = {
            id: expenseId || Date.now().toString(),
            description: description,
            amount: amount,
            date: date,
            category: category,
            
            type: isEditing ? 
                this.getOriginalExpenseType(expenseId) : 
                document.getElementById('expenseType').value,
          
            paymentMethod: document.getElementById('expensePaymentMethod').value,
            local: document.getElementById('expenseLocal').value,
            notes: document.getElementById('expenseNotes').value
        };

        if (isEditing) {
            Storage.updateExpense(expense);
        } else {
            Storage.addExpense(expense);
        }

        window.app.closeExpenseModal();
        this.loadData();
        
        
        alert(`✅ Despesa ${isEditing ? 'atualizada' : 'cadastrada'} com sucesso!`);
        
    } catch (error) {
        console.error('Erro ao salvar despesa:', error);
        alert('❌ Erro ao salvar despesa. Verifique os dados e tente novamente.');
    }
}


getOriginalExpenseType(expenseId) {
    const data = Storage.getData();
    const expense = data.expenses.find(e => e.id === expenseId);
    return expense ? expense.type : 'fixed';
}

}