// Navegação entre páginas - CORRIGIDO
class App {
    constructor() {
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        console.log('🚀 Iniciando aplicação...');
        this.bindEvents();
        this.initializeData();
        this.loadPageData('dashboard');
    }

    bindEvents() {
        console.log('🔗 Configurando eventos...');
        
        // ✅ NAVEGAÇÃO CORRIGIDA - Event delegation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link') || e.target.closest('.nav-link')) {
                e.preventDefault();
                const link = e.target.classList.contains('nav-link') ? e.target : e.target.closest('.nav-link');
                const page = link.getAttribute('data-page');
                console.log('📱 Navegando para:', page);
                this.navigateTo(page);
            }
        });

        // ✅ MODAIS CORRIGIDOS
        this.setupModals();
    }

    navigateTo(page) {
        console.log('🔄 Navegando para página:', page);
        
        // Remove active class de todas as páginas e links
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        document.querySelectorAll('.nav-link').forEach(l => {
            l.classList.remove('active');
        });

        // Adiciona active class à página e link atual
        const pageElement = document.getElementById(page);
        const linkElement = document.querySelector(`[data-page="${page}"]`);
        
        if (pageElement) {
            pageElement.classList.add('active');
            console.log('✅ Página ativada:', page);
        } else {
            console.error('❌ Página não encontrada:', page);
        }
        
        if (linkElement) {
            linkElement.classList.add('active');
        }

        this.currentPage = page;
        
        // Carrega dados específicos da página
        this.loadPageData(page);
    }

    setupModals() {
        console.log('📦 Configurando modais...');
        
        // ✅ MODAL RECEITA - Corrigido
        const addRevenueBtn = document.getElementById('addRevenueBtn');
        const cancelRevenueBtn = document.getElementById('cancelRevenueBtn');

        if (addRevenueBtn) {
            addRevenueBtn.addEventListener('click', () => {
                console.log('➕ Abrindo modal receita');
                this.openRevenueModal();
            });
        }

        if (cancelRevenueBtn) {
            cancelRevenueBtn.addEventListener('click', () => {
                this.closeRevenueModal();
            });
        }

        // ✅ MODAL DESPESA - Corrigido  
        const addExpenseBtn = document.getElementById('addExpenseBtn');
        const cancelExpenseBtn = document.getElementById('cancelExpenseBtn');

        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', () => {
                console.log('➕ Abrindo modal despesa');
                this.openExpenseModal();
            });
        }

        if (cancelExpenseBtn) {
            cancelExpenseBtn.addEventListener('click', () => {
                this.closeExpenseModal();
            });
        }

        // Fechar modais clicando fora
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('revenueModal')) {
                this.closeRevenueModal();
            }
            if (e.target === document.getElementById('expenseModal')) {
                this.closeExpenseModal();
            }
        });
    }

    // ✅ INICIALIZAÇÃO DE DADOS CORRIGIDA
    initializeData() {
        console.log('📊 Verificando dados...');
        const existingData = localStorage.getItem('financialData');
        
        if (!existingData) {
            console.log('🆕 Criando dados de exemplo...');
            this.initializeSampleData();
        } else {
            console.log('✅ Dados existentes encontrados');
        }
    }

    initializeSampleData() {
        const sampleData = {
            revenues: [
                {
                    id: '1',
                    description: 'Salário',
                    amount: 3500.00,
                    date: new Date().toISOString().split('T')[0],
                    type: 'fixed',
                    category: 'Trabalho',
                    notes: 'Salário mensal'
                },
                {
                    id: '2',
                    description: 'Freelance',
                    amount: 1200.00,
                    date: new Date().toISOString().split('T')[0],
                    type: 'variable', 
                    category: 'Trabalho Extra',
                    notes: 'Projeto website'
                }
            ],
            expenses: [
                {
                    id: '1',
                    description: 'Aluguel',
                    amount: 1200.00,
                    date: new Date().toISOString().split('T')[0],
                    type: 'fixed',
                    category: 'Moradia',
                    notes: 'Aluguel apartamento',
                    paymentMethod: 'transferencia'
                },
                {
                    id: '2',
                    description: 'Supermercado',
                    amount: 450.50,
                    date: new Date().toISOString().split('T')[0],
                    type: 'variable',
                    category: 'Alimentação',
                    paymentMethod: 'cartao_credito',
                    notes: 'Compra do mês'
                }
            ],
            futureExpenses: []
        };

        localStorage.setItem('financialData', JSON.stringify(sampleData));
        console.log('✅ Dados de exemplo criados com sucesso!');
        console.log('📦 Dados:', sampleData);
    }

    // ✅ MODAIS CORRIGIDOS
    openRevenueModal(editData = null) {
        const modal = document.getElementById('revenueModal');
        const title = document.getElementById('revenueModalTitle');
        const form = document.getElementById('revenueForm');
        const typeGroup = document.getElementById('revenueTypeGroup');

        if (editData) {
            title.textContent = 'Editar Receita';
            this.fillRevenueForm(editData);
            typeGroup.style.display = 'none';
        } else {
            title.textContent = 'Nova Receita';
            form.reset();
            typeGroup.style.display = 'block';
        }

        modal.style.display = 'block';
    }

    closeRevenueModal() {
        document.getElementById('revenueModal').style.display = 'none';
        document.getElementById('revenueForm').reset();
        document.getElementById('revenueTypeGroup').style.display = 'block';
    }

    // ✅ MÉTODO openExpenseModal CORRIGIDO - SEM ERROS
    openExpenseModal(editData = null) {
        const modal = document.getElementById('expenseModal');
        const title = document.getElementById('expenseModalTitle');
        const form = document.getElementById('expenseForm');
        const typeGroup = document.getElementById('expenseTypeGroup');

        if (editData) {
            title.textContent = 'Editar Despesa';
            this.fillExpenseForm(editData);
            
            // ✅ OCULTAR campo tipo na edição
            typeGroup.style.display = 'none';
        } else {
            title.textContent = 'Nova Despesa';
            form.reset();
            
            // ✅ MOSTRAR campo tipo no cadastro novo
            typeGroup.style.display = 'block';
        }

        modal.style.display = 'block';
    }

    // ✅ MÉTODO toggleVariableFields CORRIGIDO - SEM REFERÊNCIAS A CAMPOS REMOVIDOS
    toggleVariableFields(expenseType) {
        
        console.log('Tipo de despesa selecionado:', expenseType);
        
        // ❌ REMOVIDO - Referências a campos que não existem mais
        // ❌ REMOVIDO - const localField = document.getElementById('localField');
        
        // ✅ Se precisar de comportamento específico no futuro, implementar aqui
    }

    closeExpenseModal() {
        document.getElementById('expenseModal').style.display = 'none';
        document.getElementById('expenseForm').reset();
        document.getElementById('expenseTypeGroup').style.display = 'block';
    }

    fillRevenueForm(data) {
        document.getElementById('revenueId').value = data.id;
        document.getElementById('revenueDescription').value = data.description;
        document.getElementById('revenueAmount').value = data.amount;
        document.getElementById('revenueDate').value = data.date;
        document.getElementById('revenueType').value = data.type;
        document.getElementById('revenueCategory').value = data.category;
        document.getElementById('revenueNotes').value = data.notes || '';
    }

    fillExpenseForm(data) {
        document.getElementById('expenseId').value = data.id;
        document.getElementById('expenseDescription').value = data.description;
        document.getElementById('expenseAmount').value = data.amount;
        document.getElementById('expenseDate').value = data.date;
        document.getElementById('expenseType').value = data.type;
        document.getElementById('expenseCategory').value = data.category;
        document.getElementById('expensePaymentMethod').value = data.paymentMethod || 'dinheiro';
        document.getElementById('expenseNotes').value = data.notes || '';
    }

    loadPageData(page) {
    console.log('📂 Carregando dados da página:', page);
    
    switch(page) {
        case 'dashboard':
            // ✅ CORREÇÃO: Garantir que dashboard existe antes de chamar
            setTimeout(() => {
                if (window.dashboard && typeof window.dashboard.loadData === 'function') {
                    window.dashboard.loadData();
                } else {
                    console.log('⏳ Dashboard ainda não inicializado, aguardando...');
                    // Tentar novamente após um tempo
                    setTimeout(() => {
                        if (window.dashboard && typeof window.dashboard.loadData === 'function') {
                            window.dashboard.loadData();
                        }
                    }, 500);
                }
            }, 100);
            break;
        case 'receitas':
            if (window.receitas && typeof window.receitas.loadData === 'function') {
                window.receitas.loadData();
            }
            break;
        case 'despesas':
            if (window.despesas && typeof window.despesas.loadData === 'function') {
                window.despesas.loadData();
            }
            break;
        case 'futuras':
            if (window.futuras && typeof window.futuras.loadData === 'function') {
                window.futuras.loadData();
            }
            break;
        case 'relatorios':
            if (window.relatorios && typeof window.relatorios.loadData === 'function') {
                window.relatorios.loadData();
            }
            break;
        }
    }
}


document.addEventListener('DOMContentLoaded', function() {
    console.log('=== 🚀 SISTEMA INICIANDO ===');
    window.app = new App();
    console.log('=== ✅ SISTEMA INICIADO ===');
});