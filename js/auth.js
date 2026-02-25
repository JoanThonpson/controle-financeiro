// scripts/auth.js
// Sistema de autenticação para o controle financeiro

class Auth {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Verificar se há usuário logado ao inicializar
        this.checkAuthState();
    }

    // Verificar estado de autenticação
    checkAuthState() {
        const userData = localStorage.getItem('currentUser');
        const users = this.getUsers();
        
        if (userData) {
            const user = JSON.parse(userData);
            // Verificar se o usuário ainda existe
            const userExists = users.find(u => u.id === user.id);
            if (userExists) {
                this.currentUser = user;
                return true;
            } else {
                this.logout();
            }
        }
        return false;
    }

    // Obter lista de usuários
    getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    // Salvar lista de usuários
    saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Registrar novo usuário
    register(userData) {
        try {
            const users = this.getUsers();
            
            // Verificar se email já existe
            const existingUser = users.find(user => user.email === userData.email);
            if (existingUser) {
                return {
                    success: false,
                    message: 'Este email já está cadastrado.'
                };
            }

            // Criar novo usuário
            const newUser = {
                id: Date.now().toString(),
                email: userData.email,
                password: userData.password, // Em produção, usar hash!
                name: userData.name || '',
                createdAt: new Date().toISOString(),
               
            };

            this.saveUserFinancialData({ // Método da classe Auth
                revenues: [],
                expenses: [],
                futureExpenses: []
            }); 

            users.push(newUser);
            this.saveUsers(users);

            return {
                success: true,
                message: 'Conta criada com sucesso!',
                user: newUser
            };

        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            return {
                success: false,
                message: 'Erro ao criar conta. Tente novamente.'
            };
        }
    }

    // Login do usuário
    login(email, password) {
        try {
            const users = this.getUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                // Remover password do objeto salvo
                const { password: _, ...userWithoutPassword } = user;
                
                this.currentUser = userWithoutPassword;
                localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
                
                // Redirecionar para o app
                window.location.href = 'index.html';
                
                return {
                    success: true,
                    message: 'Login realizado com sucesso!'
                };
            } else {
                return {
                    success: false,
                    message: 'Email ou senha incorretos.'
                };
            }

        } catch (error) {
            console.error('Erro ao fazer login:', error);
            return {
                success: false,
                message: 'Erro ao fazer login. Tente novamente.'
            };
        }
    }

    // Logout do usuário
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        
        // Redirecionar para login
        window.location.href = 'login.html';
    }

    // Verificar se usuário está logado
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Obter usuário atual
    getCurrentUser() {
        return this.currentUser;
    }

    // Obter dados financeiros do usuário atual
    getUserFinancialData() {
        if (!this.currentUser) return null;
        
        const users = this.getUsers();
        const user = users.find(u => u.id === this.currentUser.id);
        return user ? user.financialData : null;
    }

    // Salvar dados financeiros do usuário atual
    saveUserFinancialData(financialData) {
        if (!this.currentUser) return false;

        try {
            const users = this.getUsers();
            const userIndex = users.findIndex(u => u.id === this.currentUser.id);
            
            if (userIndex !== -1) {
                users[userIndex].financialData = financialData;
                this.saveUsers(users);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao salvar dados financeiros:', error);
            return false;
        }
    }

    // Alterar senha
    changePassword(currentPassword, newPassword) {
        if (!this.currentUser) return false;

        try {
            const users = this.getUsers();
            const userIndex = users.findIndex(u => u.id === this.currentUser.id);
            
            if (userIndex !== -1 && users[userIndex].password === currentPassword) {
                users[userIndex].password = newPassword;
                this.saveUsers(users);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            return false;
        }
    }
}

// Inicializar sistema de autenticação
window.Auth = new Auth();

// Proteger rotas - verificar se está logado ao carregar páginas protegidas
document.addEventListener('DOMContentLoaded', function() {
    const auth = window.Auth;
    
    // Se estiver na página principal (index.html) e não estiver logado, redirecionar
    if (window.location.pathname.endsWith('index.html') || 
        window.location.pathname === '/' || 
        window.location.pathname.endsWith('/')) {
        
        if (!auth.isLoggedIn()) {
            window.location.href = 'login.html';
        }
    }
    
    // Se estiver na página de login e já estiver logado, redirecionar para app
    if (window.location.pathname.includes('login.html') && auth.isLoggedIn()) {
        window.location.href = 'index.html';
    }
});

// Funções auxiliares globais
window.logout = function() {
    window.Auth.logout();
};

window.getCurrentUser = function() {
    return window.Auth.getCurrentUser();
};

window.isLoggedIn = function() {
    return window.Auth.isLoggedIn();
};