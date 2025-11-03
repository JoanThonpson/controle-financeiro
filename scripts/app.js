// Navegação entre páginas
class App {
    constructor() {
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadInitialData();
    }

    bindEvents() {
        // Navegação
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(link.dataset.page);
            });
        });

        // Modals
        this.setupModals();
    }

    navigateTo(page) {
        // Remove active class from all pages and links
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

        // Add active class to current page and link
        document.getElementById(page).classList.add('active');
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        this.currentPage = page;
        
        // Load page-specific data
        this.loadPageData(page);
    }

    setupModals() {
        // Revenue Modal
        const revenueModal = document.getElementById('revenueModal');
        const addRevenueBtn = document.getElementById('addRevenueBtn');
        const cancelRevenueBtn = document.getElementById('cancelRevenueBtn');

        addRevenueBtn?.addEventListener('click', () => this.openRevenueModal());
        cancelRevenueBtn?.addEventListener('click', () => this.closeRevenueModal());

        // Expense Modal
        const expenseModal = document.getElementById('expenseModal');
        const addExpenseBtn = document.getElementById('addExpenseBtn');
        const cancelExpenseBtn = document.getElementById('cancelExpenseBtn');

        addExpenseBtn?.addEventListener('click', () => this.openExpenseModal());
        cancelExpenseBtn?.addEventListener('click', () => this.closeExpenseModal());

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target === revenueModal) this.closeRevenueModal();
            if (e.target === expenseModal) this.closeExpenseModal();
        });
    }

    openRevenueModal(editData = null) {
        const modal = document.getElementById('revenueModal');
        const title = document.getElementById('revenueModalTitle');
        const form = document.getElementById('revenueForm');

        if (editData) {
            title.textContent = 'Editar Receita';
            this.fillRevenueForm(editData);
        } else {
            title.textContent = 'Nova Receita';
            form.reset();
        }

        modal.style.display = 'block';
    }

    closeRevenueModal() {
        document.getElementById('revenueModal').style.display = 'none';
        document.getElementById('revenueForm').reset();
    }

    // NO app.js - MODIFICAR openExpenseModal
openExpenseModal(editData = null) {
    const modal = document.getElementById('expenseModal');
    const title = document.getElementById('expenseModalTitle');
    const form = document.getElementById('expenseForm');
    const typeGroup = document.getElementById('expenseTypeGroup');
    const variableFields = document.getElementById('variableFields');
    const localField = document.getElementById('localField');

    if (editData) {
        title.textContent = 'Editar Despesa';
        this.fillExpenseForm(editData);
        
        // ⭐⭐ OCULTAR campo tipo na edição ⭐⭐
        typeGroup.style.display = 'none';
        
        // ⭐⭐ MOSTRAR/OCULTAR campos extras baseado no tipo ⭐⭐
        this.toggleVariableFields(editData.type);
    } else {
        title.textContent = 'Nova Despesa';
        form.reset();
        
        // ⭐⭐ MOSTRAR campo tipo no cadastro novo ⭐⭐
        typeGroup.style.display = 'block';
        
        // ⭐⭐ ESCONDER campos extras inicialmente ⭐⭐
        this.toggleVariableFields('fixed');
    }

    modal.style.display = 'block';
    
    // ⭐⭐ LISTENER para mostrar campos quando tipo mudar ⭐⭐
    document.getElementById('expenseType').addEventListener('change', (e) => {
        this.toggleVariableFields(e.target.value);
    });
}

// ⭐⭐ NOVO MÉTODO para controlar campos variáveis ⭐⭐
toggleVariableFields(expenseType) {
    const variableFields = document.getElementById('variableFields');
    const localField = document.getElementById('localField');
    
    if (expenseType === 'variable') {
        variableFields.style.display = 'block';
        localField.style.display = 'block';
    } else {
        variableFields.style.display = 'none';
        localField.style.display = 'none';
    }
}


fillExpenseForm(data) {
    document.getElementById('expenseId').value = data.id;
    document.getElementById('expenseDescription').value = data.description;
    document.getElementById('expenseAmount').value = data.amount;
    document.getElementById('expenseDate').value = data.date;
    document.getElementById('expenseType').value = data.type;
    document.getElementById('expenseCategory').value = data.category;
    
    
    document.getElementById('expensePaymentMethod').value = data.paymentMethod || 'dinheiro';
    document.getElementById('expenseLocal').value = data.local || '';
    document.getElementById('expenseNotes').value = data.notes || '';
}

    closeExpenseModal() {
        document.getElementById('expenseModal').style.display = 'none';
        document.getElementById('expenseForm').reset();
    }

    fillRevenueForm(data) {
        document.getElementById('revenueId').value = data.id;
        document.getElementById('revenueDescription').value = data.description;
        document.getElementById('revenueAmount').value = data.amount;
        document.getElementById('revenueDate').value = data.date;
        document.getElementById('revenueType').value = data.type;
        document.getElementById('revenueCategory').value = data.category || '';
    }

    fillExpenseForm(data) {
        document.getElementById('expenseId').value = data.id;
        document.getElementById('expenseDescription').value = data.description;
        document.getElementById('expenseAmount').value = data.amount;
        document.getElementById('expenseDate').value = data.date;
        document.getElementById('expenseType').value = data.type;
        document.getElementById('expenseCategory').value = data.category;
    }

    loadInitialData() {
        // Initialize with sample data or load from localStorage
        if (!localStorage.getItem('financialData')) {
            this.initializeSampleData();
        }
    }

    initializeSampleData() {
        const sampleData = {
            revenues: [
                {
                    id: '1',
                    description: 'Salário',
                    amount: 3583.00,
                    date: new Date().toISOString().split('T')[0],
                    type: 'fixed',
                    category: 'Salário'
                },
                {
                    id: '2', 
                    description: 'Remuneração Extra',
                    amount: 1200.00,
                    date: new Date().toISOString().split('T')[0],
                    type: 'fixed',
                    category: 'Extra'
                }
            ],
            expenses: [
                {
                    id: '1',
                    description: 'Transporte',
                    amount: 250.00,
                    date: new Date().toISOString().split('T')[0],
                    type: 'fixed',
                    category: 'Transporte'
                },
                {
                    id: '2',
                    description: 'Pós-graduação',
                    amount: 307.00,
                    date: new Date().toISOString().split('T')[0],
                    type: 'fixed',
                    category: 'Educação'
                }
            ],
            futureExpenses: []
        };

        localStorage.setItem('financialData', JSON.stringify(sampleData));
    }

    loadPageData(page) {
        switch(page) {
            case 'dashboard':
                if (window.dashboard) window.dashboard.loadData();
                break;
            case 'receitas':
                if (window.receitas) window.receitas.loadData();
                break;
            case 'despesas':
                if (window.despesas) window.despesas.loadData();
                break;
            case 'futuras':
                if (window.futuras) window.futuras.loadData();
                break;
            case 'relatorios':
                if (window.relatorios) window.relatorios.loadData();
                break;
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});