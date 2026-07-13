// ============================================
// storage.js - localStorage Handler
// ============================================

const Storage = {
    PREFIX: 'hariku_',
    
    // ========== GENERIC ==========
    save(key, data) {
        try {
            localStorage.setItem(this.PREFIX + key, JSON.stringify(data));
            return true;
        } catch(e) {
            console.error('Storage error:', e);
            return false;
        }
    },
    
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(this.PREFIX + key);
            if (data === null) return defaultValue;
            return JSON.parse(data);
        } catch(e) {
            console.error('Load error:', e);
            return defaultValue;
        }
    },
    
    remove(key) {
        localStorage.removeItem(this.PREFIX + key);
    },
    
    // ========== TASKS ==========
    getTasks() {
        return this.load('tasks', []);
    },
    
    saveTasks(tasks) {
        return this.save('tasks', tasks);
    },
    
    addTask(task) {
        const tasks = this.getTasks();
        task.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        task.createdAt = new Date().toISOString();
        task.completed = false;
        task.completedAt = null;
        tasks.unshift(task);
        this.saveTasks(tasks);
        return task;
    },
    
    updateTask(id, updates) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
            this.saveTasks(tasks);
            return tasks[index];
        }
        return null;
    },
    
    deleteTask(id) {
        const tasks = this.getTasks().filter(t => t.id !== id);
        this.saveTasks(tasks);
    },
    
    toggleTask(id) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            tasks[index].completed = !tasks[index].completed;
            tasks[index].completedAt = tasks[index].completed ? new Date().toISOString() : null;
            this.saveTasks(tasks);
            return tasks[index];
        }
        return null;
    },
    
    // ========== EXPENSES ==========
    getExpenses() {
        return this.load('expenses', []);
    },
    
    saveExpenses(expenses) {
        return this.save('expenses', expenses);
    },
    
    addExpense(expense) {
        const expenses = this.getExpenses();
        expense.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        expense.createdAt = new Date().toISOString();
        expenses.unshift(expense);
        this.saveExpenses(expenses);
        return expense;
    },
    
    updateExpense(id, updates) {
        const expenses = this.getExpenses();
        const index = expenses.findIndex(e => e.id === id);
        if (index !== -1) {
            expenses[index] = { ...expenses[index], ...updates, updatedAt: new Date().toISOString() };
            this.saveExpenses(expenses);
            return expenses[index];
        }
        return null;
    },
    
    deleteExpense(id) {
        const expenses = this.getExpenses().filter(e => e.id !== id);
        this.saveExpenses(expenses);
    },
    
    // ========== CATEGORIES ==========
    getDefaultCategories() {
        return [
            { id: 'food', icon: '🍔', name: 'Makanan & Jajan' },
            { id: 'transport', icon: '🚌', name: 'Transportasi' },
            { id: 'education', icon: '📚', name: 'Pendidikan' },
            { id: 'health', icon: '💊', name: 'Kesehatan' },
            { id: 'entertainment', icon: '🎮', name: 'Hiburan' },
            { id: 'shopping', icon: '👕', name: 'Belanja' },
            { id: 'bills', icon: '💡', name: 'Tagihan' },
            { id: 'investment', icon: '📈', name: 'Investasi' },
            { id: 'savings', icon: '💰', name: 'Tabungan' },
            { id: 'other', icon: '❓', name: 'Lainnya' }
        ];
    },
    
    getCategories() {
        return this.load('categories', this.getDefaultCategories());
    },
    
    // ========== SETTINGS ==========
    getSettings() {
        return this.load('settings', {});
    },
    
    getSetting(key, defaultValue = null) {
        const settings = this.getSettings();
        return settings[key] !== undefined ? settings[key] : defaultValue;
    },
    
    saveSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        return this.save('settings', settings);
    },
    
    // ========== PROFILE ==========
    getProfile() {
        return this.load('profile', { name: '', photo: null });
    },
    
    saveProfile(profile) {
        return this.save('profile', profile);
    },
    
    // ========== PIN ==========
    getPINHash() {
        return this.load('pin_hash', null);
    },
    
    savePINHash(hash) {
        return this.save('pin_hash', hash);
    },
    
    hasPin() {
        return !!this.getPINHash();
    },
    
    // ========== BACKUP & RESTORE ==========
    exportAll() {
        const data = {
            version: '2.0',
            tasks: this.getTasks(),
            expenses: this.getExpenses(),
            categories: this.getCategories(),
            settings: this.getSettings(),
            profile: this.getProfile(),
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    },
    
    importAll(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (!data.tasks && !data.expenses) throw new Error('Invalid format');
            
            if (data.tasks) this.saveTasks(data.tasks);
            if (data.expenses) this.saveExpenses(data.expenses);
            if (data.categories) this.save('categories', data.categories);
            if (data.profile) this.saveProfile(data.profile);
            // Don't overwrite PIN
            return true;
        } catch(e) {
            console.error('Import error:', e);
            return false;
        }
    },
    
    // ========== RESET ==========
    resetAll() {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(this.PREFIX));
        keys.forEach(k => localStorage.removeItem(k));
        return true;
    },
    
    // ========== STATS ==========
    getStats() {
        const tasks = this.getTasks();
        const expenses = this.getExpenses();
        const today = new Date().toISOString().split('T')[0];
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        
        return {
            tasksToday: tasks.filter(t => t.date === today && !t.completed).length,
            tasksPending: tasks.filter(t => !t.completed).length,
            tasksCompletedToday: tasks.filter(t => t.completed && t.completedAt && t.completedAt.startsWith(today)).length,
            expenseToday: expenses.filter(e => e.date === today).reduce((s, e) => s + e.amount, 0),
            expenseMonth: expenses.filter(e => e.date >= monthStart).reduce((s, e) => s + e.amount, 0),
            totalExpenses: expenses.length,
            totalTasks: tasks.length
        };
    }
};