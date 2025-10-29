class Storage {
    static getData() {
        const data = localStorage.getItem('financialData');
        return data ? JSON.parse(data) : { revenues: [], expenses: [], futureExpenses: [] };
    }

    static saveData(data) {
        localStorage.setItem('financialData', JSON.stringify(data));
    }

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
            data.revenues[index] = updatedRevenue;
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

    static addExpense(expense) {
        const data = this.getData();
        expense.id = Date.now().toString();
        data.expenses.push(expense);
        this.saveData(data);
        return expense;
    }

    static updateExpense(updatedExpense) {
        const data = this.getData();
        const index = data.expenses.findIndex(e => e.id === updatedExpense.id);
        if (index !== -1) {
            data.expenses[index] = updatedExpense;
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

    static addFutureExpense(expense) {
        const data = this.getData();
        expense.id = Date.now().toString();
        data.futureExpenses.push(expense);
        this.saveData(data);
        return expense;
    }

    static deleteFutureExpense(id) {
        const data = this.getData();
        data.futureExpenses = data.futureExpenses.filter(e => e.id !== id);
        this.saveData(data);
    }

    static getRevenuesByPeriod(startDate, endDate) {
        const data = this.getData();
        return data.revenues.filter(revenue => {
            const revenueDate = new Date(revenue.date);
            return revenueDate >= new Date(startDate) && revenueDate <= new Date(endDate);
        });
    }

    static getExpensesByPeriod(startDate, endDate) {
        const data = this.getData();
        return data.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
        });
    }
}