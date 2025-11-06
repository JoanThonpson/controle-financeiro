class Receitas {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadData();
    }

    bindEvents() {
        // Revenue form submission
        document.getElementById('revenueForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRevenueSubmit();
        });
    }

    loadData() {
        const data = Storage.getData();
        this.renderFixedRevenues(data.revenues);
        this.renderVariableRevenues(data.revenues);
    }

    renderFixedRevenues(revenues) {
        const container = document.getElementById('fixedRevenueList');
        if (!container) {
            console.error('Container #fixedRevenueList não encontrado');
            return;
        }

        const fixedRevenues = revenues.filter(r => r.type === 'fixed');
        
        console.log('Receitas fixas encontradas:', fixedRevenues); // Debug
        
        container.innerHTML = fixedRevenues.map(revenue => `
            <div class="revenue-item" data-id="${revenue.id}">
                <div class="item-info">
                    <div class="item-description">${revenue.description}</div>
                    <div class="item-category">${revenue.category}</div>
                    ${revenue.notes ? `<div class="item-notes">📝 ${revenue.notes}</div>` : ''}
                </div>
                <div class="item-details">
                    <div class="item-amount">${this.formatCurrency(revenue.amount)}</div>
                    <div class="item-date">${this.formatDate(revenue.date)}</div>
                </div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="receitas.editRevenue('${revenue.id}')">✏️ Editar</button>
                    <button class="btn-danger" onclick="receitas.deleteRevenue('${revenue.id}')">🗑️ Excluir</button>
                </div>
            </div>
        `).join('');

        // Show empty state
        if (fixedRevenues.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Nenhuma receita fixa cadastrada</p>
                    <button class="btn-primary" onclick="app.openRevenueModal()">+ Adicionar Receita Fixa</button>
                </div>
            `;
        }
    }

    renderVariableRevenues(revenues) {
        const container = document.getElementById('variableRevenueList');
        if (!container) {
            console.error('Container #variableRevenueList não encontrado');
            return;
        }

        const variableRevenues = revenues.filter(r => r.type === 'variable');
        
        console.log('Receitas variáveis encontradas:', variableRevenues); // Debug
        
        container.innerHTML = variableRevenues.map(revenue => `
            <div class="revenue-item" data-id="${revenue.id}">
                <div class="item-info">
                    <div class="item-description">${revenue.description}</div>
                    <div class="item-category">${revenue.category}</div>
                    ${revenue.notes ? `<div class="item-notes">📝 ${revenue.notes}</div>` : ''}
                </div>
                <div class="item-details">
                    <div class="item-amount">${this.formatCurrency(revenue.amount)}</div>
                    <div class="item-date">${this.formatDate(revenue.date)}</div>
                </div>
                <div class="item-actions">
                    <button class="btn-edit" onclick="receitas.editRevenue('${revenue.id}')">✏️ Editar</button>
                    <button class="btn-danger" onclick="receitas.deleteRevenue('${revenue.id}')">🗑️ Excluir</button>
                </div>
            </div>
        `).join('');

        // Show empty state
        if (variableRevenues.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Nenhuma receita variável cadastrada</p>
                    <button class="btn-primary" onclick="app.openRevenueModal()">+ Adicionar Receita Variável</button>
                </div>
            `;
        }
    }

    editRevenue(id) {
        const data = Storage.getData();
        const revenue = data.revenues.find(r => r.id === id);
        if (revenue) {
            window.app.openRevenueModal(revenue);
        }
    }

    deleteRevenue(id) {
        if (confirm('Tem certeza que deseja excluir esta receita?')) {
            Storage.deleteRevenue(id);
            this.loadData();
            
            // Update dashboard if active
            if (window.dashboard && window.dashboard.loadData) {
                window.dashboard.loadData();
            }
        }
    }

    // ✅ SUBMIT CORRETO COM VALIDAÇÃO APENAS DOS CAMPOS OBRIGATÓRIOS
    handleRevenueSubmit() {
        try {
            const revenueId = document.getElementById('revenueId').value;
            const isEditing = !!revenueId;
            
            // ✅ VALIDAÇÃO APENAS DOS CAMPOS OBRIGATÓRIOS
            const description = document.getElementById('revenueDescription').value.trim();
            const amount = parseFloat(document.getElementById('revenueAmount').value);
            const date = document.getElementById('revenueDate').value;
            const category = document.getElementById('revenueCategory').value.trim();
            
            // ✅ APENAS 4 CAMPOS OBRIGATÓRIOS
            if (!description || !amount || !date || !category) {
                alert('❌ Por favor, preencha todos os campos obrigatórios (Descrição, Valor, Data e Categoria).');
                return;
            }

            if (amount <= 0 || isNaN(amount)) {
                alert('❌ O valor deve ser maior que zero.');
                return;
            }

            const revenue = {
                id: revenueId || Date.now().toString(),
                description: description,
                amount: amount,
                date: date,
                category: category,
                // ✅ TIPO CORRETO (original na edição, novo no cadastro)
                type: isEditing ? 
                    this.getOriginalRevenueType(revenueId) :
                    document.getElementById('revenueType').value,
                // ✅ CAMPO OBSERVAÇÃO (NÃO OBRIGATÓRIO)
                notes: document.getElementById('revenueNotes').value
            };

            console.log('💾 Salvando receita:', revenue);

            if (revenueId) {
                Storage.updateRevenue(revenue);
            } else {
                Storage.addRevenue(revenue);
            }

            window.app.closeRevenueModal();
            this.loadData();
            
            // Update dashboard if active
            if (window.dashboard && window.dashboard.loadData) {
                window.dashboard.loadData();
            }
            
            alert(`✅ Receita ${isEditing ? 'atualizada' : 'cadastrada'} com sucesso!`);
            
        } catch (error) {
            console.error('Erro ao salvar receita:', error);
            alert('❌ Erro ao salvar receita. Verifique os dados.');
        }
    }

    // ✅ MÉTODO AUXILIAR PARA BUSCAR TIPO ORIGINAL
    getOriginalRevenueType(revenueId) {
        const data = Storage.getData();
        const revenue = data.revenues.find(r => r.id === revenueId);
        return revenue ? revenue.type : 'fixed';
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

// Initialize receitas when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.receitas = new Receitas();
});