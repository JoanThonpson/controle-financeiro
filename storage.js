class Storage {
    // ✅ MUDANÇA APENAS AQUI - Resto IGUAL!
    static getData() {
        // 1. Buscar usuário atual
        const currentUserStr = localStorage.getItem('currentUser');
        
        // 2. Se não tem usuário logado, retorna dados vazios
        if (!currentUserStr) {
            console.warn('⚠️ Nenhum usuário logado. Retornando dados vazios.');
            return { revenues: [], expenses: [], futureExpenses: [] };
        }
        
        try {
            const currentUser = JSON.parse(currentUserStr);
            const userDataKey = `financialData_${currentUser.id}`;
            const userData = localStorage.getItem(userDataKey);
            
            // 3. Se usuário já tem dados, retorna
            if (userData) {
                return JSON.parse(userData);
            } 
            // 4. Se é primeiro acesso, cria dados vazios
            else {
                const emptyData = { revenues: [], expenses: [], futureExpenses: [] };
                localStorage.setItem(userDataKey, JSON.stringify(emptyData));
                return emptyData;
            }
        } catch (error) {
            console.error('❌ Erro ao buscar dados:', error);
            return { revenues: [], expenses: [], futureExpenses: [] };
        }
    }

    static saveData(data) {
        // ✅ MUDANÇA APENAS AQUI
        const currentUserStr = localStorage.getItem('currentUser');
        if (!currentUserStr) {
            console.error('❌ Não há usuário logado para salvar dados.');
            return false;
        }
        
        try {
            const currentUser = JSON.parse(currentUserStr);
            const userDataKey = `financialData_${currentUser.id}`;
            localStorage.setItem(userDataKey, JSON.stringify(data));
            console.log('✅ Dados salvos para usuário:', currentUser.email);
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar dados:', error);
            return false;
        }
    }

    // ✅ TODO O RESTO PERMANECE EXATAMENTE IGUAL!
    // RECEITAS (mantém igual)
    static addRevenue(revenue) {
        const data = this.getData();  // ← Já pega dados do usuário certo!
        revenue.id = Date.now().toString();
        data.revenues.push(revenue);
        this.saveData(data);  // ← Já salva para o usuário certo!
        return revenue;
    }

    static updateRevenue(updatedRevenue) {
        const data = this.getData();
        const index = data.revenues.findIndex(r => r.id === updatedRevenue.id);
        if (index !== -1) {
            data.revenues[index] = { ...data.revenues[index], ...updatedRevenue };
            this.saveData(data);
            return true;
        }
        return false;
    }

    static deleteRevenue(id) {
        const data = this.getData();
        data.revenues = data.revenues.filter(r => r.id !== id);
        this.saveData(data);
    }

    // ✅ DESPESAS NORMAIS (mantém igual)
    static addExpense(expense) {
        const data = this.getData();
        expense.id = Date.now().toString();
        expense.isFuture = false;
        data.expenses.push(expense);
        this.saveData(data);
        return expense;
    }

    static updateExpense(updatedExpense) {
        const data = this.getData();
        const index = data.expenses.findIndex(e => e.id === updatedExpense.id);
        if (index !== -1) {
            data.expenses[index] = { ...data.expenses[index], ...updatedExpense };
            this.saveData(data);
            return true;
        }
        return false;
    }

    static deleteExpense(id) {
        const data = this.getData();
        data.expenses = data.expenses.filter(e => e.id !== id);
        this.saveData(data);
    }

    // ✅ DESPESAS FUTURAS (mantém igual)
    static addFutureExpense(expense) {
        const data = this.getData();
        expense.id = Date.now().toString();
        expense.isFuture = true;
        data.futureExpenses.push(expense);
        this.saveData(data);
        return expense;
    }

    static updateFutureExpense(updatedExpense) {
        const data = this.getData();
        const index = data.futureExpenses.findIndex(e => e.id === updatedExpense.id);
        if (index !== -1) {
            data.futureExpenses[index] = { ...data.futureExpenses[index], ...updatedExpense };
            this.saveData(data);
            return true;
        }
        return false;
    }

    static deleteFutureExpense(id) {
        const data = this.getData();
        data.futureExpenses = data.futureExpenses.filter(e => e.id !== id);
        this.saveData(data);
    }

    // ✅ CONSULTAS (mantém igual - já usam getData)
    static getRevenuesByPeriod(startDate, endDate) {
        const data = this.getData();
        return data.revenues.filter(revenue => {
            const revenueDate = new Date(revenue.date);
            return revenueDate >= new Date(startDate) && revenueDate <= new Date(endDate);
        });
    }

    static getExpensesByPeriod(startDate, endDate) {
        const data = this.getData();
        const normalExpenses = data.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
        });
        
        const futureExpenses = data.futureExpenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
        });

        return [...normalExpenses, ...futureExpenses];
    }

    static getNormalExpenses() {
        const data = this.getData();
        return data.expenses.filter(expense => !expense.isFuture);
    }

    static getFutureExpenses() {
        const data = this.getData();
        return data.futureExpenses;
    }

    // ✅ NOVO: Função para migrar dados antigos (opcional)
    static migrateOldData() {
        const oldData = localStorage.getItem('financialData');
        const currentUserStr = localStorage.getItem('currentUser');
        
        if (oldData && currentUserStr) {
            try {
                const currentUser = JSON.parse(currentUserStr);
                const userDataKey = `financialData_${currentUser.id}`;
                
                // Só migra se usuário não tiver dados ainda
                if (!localStorage.getItem(userDataKey)) {
                    localStorage.setItem(userDataKey, oldData);
                    console.log('✅ Dados antigos migrados para:', currentUser.email);
                }
                return true;
            } catch (error) {
                console.error('❌ Erro na migração:', error);
                return false;
            }
        }
        return false;
    }
}