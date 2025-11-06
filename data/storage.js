class Storage {
    static getData() {
        const data = localStorage.getItem('financialData');
        return data ? JSON.parse(data) : { revenues: [], expenses: [], futureExpenses: [] };
    }

    static saveData(data) {
        localStorage.setItem('financialData', JSON.stringify(data));
    }

    // ✅ RECEITAS
    static addRevenue(revenue) {
        const data = this.getData();
        revenue.id = Date.now().toString();
        data.revenues.push(revenue);
        this.saveData(data);
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

    // ✅ DESPESAS NORMAIS
    static addExpense(expense) {
        const data = this.getData();
        expense.id = Date.now().toString();
        // ✅ GARANTIR que não seja salva como future
        expense.isFuture = false;
        data.expenses.push(expense);
        this.saveData(data);
        return expense;
    }

    static updateExpense(updatedExpense) {
        const data = this.getData();
        const index = data.expenses.findIndex(e => e.id === updatedExpense.id);
        if (index !== -1) {
            // ✅ GARANTIR que campos antigos não sejam perdidos
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

    // ✅ DESPESAS FUTURAS
    static addFutureExpense(expense) {
        const data = this.getData();
        expense.id = Date.now().toString();
        // ✅ MARCAR claramente como despesa futura
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

    // ✅ CONSULTAS POR PERÍODO - INCLUINDO FUTURAS
    static getRevenuesByPeriod(startDate, endDate) {
        const data = this.getData();
        return data.revenues.filter(revenue => {
            const revenueDate = new Date(revenue.date);
            return revenueDate >= new Date(startDate) && revenueDate <= new Date(endDate);
        });
    }

    static getExpensesByPeriod(startDate, endDate) {
        const data = this.getData();
        // ✅ INCLUIR despesas normais E futuras no período
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

    // ✅ CONSULTA APENAS DESPESAS NORMAIS (para página Despesas)
    static getNormalExpenses() {
        const data = this.getData();
        return data.expenses.filter(expense => !expense.isFuture);
    }

    // ✅ CONSULTA APENAS DESPESAS FUTURAS (para página Futuras)
    static getFutureExpenses() {
        const data = this.getData();
        return data.futureExpenses;
    }
}