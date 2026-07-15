// ============================================
// storage.js - All Data Handler (V3.1)
// ============================================

const Storage = {
    PREFIX: 'hariku_',
    
    // ========== GENERIC CRUD ==========
    save(key, data) {
        try {
            localStorage.setItem(this.PREFIX + key, JSON.stringify(data));
            return true;
        } catch(e) {
            console.error('Storage full:', e);
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
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    },
    
    // ========== TASKS ==========
    getTasks() { return this.load('tasks', []); },
    saveTasks(tasks) { return this.save('tasks', tasks); },
    
    addTask(task) {
        const tasks = this.getTasks();
        task.id = this.generateId();
        task.createdAt = new Date().toISOString();
        task.completed = false;
        task.completedAt = null;
        tasks.unshift(task);
        this.saveTasks(tasks);
        return task;
    },
    updateTask(id, updates) {
        const tasks = this.getTasks();
        const idx = tasks.findIndex(t => t.id === id);
        if (idx !== -1) {
            tasks[idx] = { ...tasks[idx], ...updates, updatedAt: new Date().toISOString() };
            this.saveTasks(tasks);
            return tasks[idx];
        }
        return null;
    },
    deleteTask(id) { this.saveTasks(this.getTasks().filter(t => t.id !== id)); },
    toggleTask(id) {
        const tasks = this.getTasks();
        const idx = tasks.findIndex(t => t.id === id);
        if (idx !== -1) {
            tasks[idx].completed = !tasks[idx].completed;
            tasks[idx].completedAt = tasks[idx].completed ? new Date().toISOString() : null;
            this.saveTasks(tasks);
            return tasks[idx];
        }
        return null;
    },
    
    // ========== HABITS ==========
    getHabits() { return this.load('habits', []); },
    saveHabits(habits) { return this.save('habits', habits); },
    
    addHabit(habit) {
        const habits = this.getHabits();
        habit.id = this.generateId();
        habit.createdAt = new Date().toISOString();
        habit.streak = 0;
        habit.bestStreak = 0;
        habit.logs = {};
        habits.push(habit);
        this.saveHabits(habits);
        return habit;
    },
    updateHabit(id, updates) {
        const habits = this.getHabits();
        const idx = habits.findIndex(h => h.id === id);
        if (idx !== -1) {
            habits[idx] = { ...habits[idx], ...updates };
            this.saveHabits(habits);
            return habits[idx];
        }
        return null;
    },
    deleteHabit(id) { this.saveHabits(this.getHabits().filter(h => h.id !== id)); },
    toggleHabitLog(habitId, date) {
        const habits = this.getHabits();
        const idx = habits.findIndex(h => h.id === habitId);
        if (idx !== -1) {
            const habit = habits[idx];
            habit.logs[date] = !habit.logs[date];
            this.recalculateStreak(habit);
            this.saveHabits(habits);
            return habit;
        }
        return null;
    },
    recalculateStreak(habit) {
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 365; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            
            if (habit.logs[dateStr]) {
                streak++;
            } else if (i === 0) {
                continue;
            } else {
                break;
            }
        }
        
        habit.streak = streak;
        if (streak > habit.bestStreak) {
            habit.bestStreak = streak;
        }
    },
    
    // ========== EXPENSES ==========
    getExpenses() { return this.load('expenses', []); },
    saveExpenses(expenses) { return this.save('expenses', expenses); },
    
    addExpense(expense) {
        const expenses = this.getExpenses();
        expense.id = this.generateId();
        expense.createdAt = new Date().toISOString();
        expenses.unshift(expense);
        this.saveExpenses(expenses);
        return expense;
    },
    updateExpense(id, updates) {
        const expenses = this.getExpenses();
        const idx = expenses.findIndex(e => e.id === id);
        if (idx !== -1) {
            expenses[idx] = { ...expenses[idx], ...updates };
            this.saveExpenses(expenses);
            return expenses[idx];
        }
        return null;
    },
    deleteExpense(id) { this.saveExpenses(this.getExpenses().filter(e => e.id !== id)); },
    
    getCategories() {
        return this.load('categories', [
            { id: 'food', icon: '🍔', name: 'Makanan' },
            { id: 'transport', icon: '🚌', name: 'Transportasi' },
            { id: 'education', icon: '📚', name: 'Pendidikan' },
            { id: 'health', icon: '💊', name: 'Kesehatan' },
            { id: 'entertainment', icon: '🎮', name: 'Hiburan' },
            { id: 'shopping', icon: '👕', name: 'Belanja' },
            { id: 'bills', icon: '💡', name: 'Tagihan' },
            { id: 'investment', icon: '📈', name: 'Investasi' },
            { id: 'savings', icon: '💰', name: 'Tabungan' },
            { id: 'other', icon: '❓', name: 'Lainnya' }
        ]);
    },
    
    // ========== INCOMES ==========
    getIncomes() { return this.load('incomes', []); },
    saveIncomes(incomes) { return this.save('incomes', incomes); },
    
    addIncome(income) {
        const incomes = this.getIncomes();
        income.id = this.generateId();
        income.createdAt = new Date().toISOString();
        incomes.unshift(income);
        this.saveIncomes(incomes);
        return income;
    },
    updateIncome(id, updates) {
        const incomes = this.getIncomes();
        const idx = incomes.findIndex(i => i.id === id);
        if (idx !== -1) {
            incomes[idx] = { ...incomes[idx], ...updates };
            this.saveIncomes(incomes);
            return incomes[idx];
        }
        return null;
    },
    deleteIncome(id) { this.saveIncomes(this.getIncomes().filter(i => i.id !== id)); },
    
    // ========== INVESTMENTS ==========
    // ========== INVESTMENTS (Transactions + Targets) ==========

// Transaksi
getTransactions() { return this.load('transactions', []); },
saveTransactions(transactions) { return this.save('transactions', transactions); },

addTransaction(transaction) {
    const transactions = this.getTransactions();
    transaction.id = this.generateId();
    transaction.createdAt = new Date().toISOString();
    transactions.unshift(transaction);
    this.saveTransactions(transactions);
    return transaction;
},
updateTransaction(id, updates) {
    const transactions = this.getTransactions();
    const idx = transactions.findIndex(t => t.id === id);
    if (idx !== -1) {
        transactions[idx] = { ...transactions[idx], ...updates };
        this.saveTransactions(transactions);
        return transactions[idx];
    }
    return null;
},
deleteTransaction(id) {
    this.saveTransactions(this.getTransactions().filter(t => t.id !== id));
},

// Target
getTargets() { return this.load('targets', []); },
saveTargets(targets) { return this.save('targets', targets); },

addTarget(target) {
    const targets = this.getTargets();
    target.id = this.generateId();
    target.createdAt = new Date().toISOString();
    targets.push(target);
    this.saveTargets(targets);
    return target;
},
updateTarget(id, updates) {
    const targets = this.getTargets();
    const idx = targets.findIndex(t => t.id === id);
    if (idx !== -1) {
        targets[idx] = { ...targets[idx], ...updates };
        this.saveTargets(targets);
        return targets[idx];
    }
    return null;
},
deleteTarget(id) { this.saveTargets(this.getTargets().filter(t => t.id !== id)); },

// Get target progress (dari transaksi yang di-assign)
getTargetProgress(targetId) {
    const transactions = this.getTransactions();
    return transactions
        .filter(t => t.targetId === targetId)
        .reduce((sum, t) => sum + t.amount, 0);
},

// Total portfolio
getTotalPortfolio() {
    const transactions = this.getTransactions();
    return transactions.reduce((sum, t) => sum + t.amount, 0);
},

// Get portfolio by category
getPortfolioByCategory() {
    const transactions = this.getTransactions();
    const cats = {};
    transactions.forEach(t => {
        const cat = t.category || 'Lainnya';
        cats[cat] = (cats[cat] || 0) + t.amount;
    });
    return cats;
},

// Get monthly data for chart
getMonthlyTransactions(months = 6) {
    const transactions = this.getTransactions();
    const result = [];
    
    for (let i = months - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const year = d.getFullYear();
        const month = d.getMonth();
        const monthStart = new Date(year, month, 1).toISOString().split('T')[0];
        const monthEnd = new Date(year, month + 1, 0).toISOString().split('T')[0];
        
        const monthTransactions = transactions.filter(t => t.date >= monthStart && t.date <= monthEnd);
        
        result.push({
            label: d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
            total: monthTransactions.reduce((s, t) => s + t.amount, 0),
            count: monthTransactions.length
        });
    }
    
    return result;
},

// Kategori default untuk investasi
getInvestCategories() {
    return this.load('investCategories', [
        { id: 'reksadana', name: 'Reksadana', icon: '📊', color: '#3B82F6' },
        { id: 'saham', name: 'Saham', icon: '📈', color: '#22C55E' },
        { id: 'emas', name: 'Emas', icon: '🟡', color: '#F59E0B' },
        { id: 'crypto', name: 'Crypto', icon: '₿', color: '#8B5CF6' },
        { id: 'p2p', name: 'P2P Lending', icon: '🤝', color: '#EC4899' },
        { id: 'deposito', name: 'Deposito', icon: '🏦', color: '#06B6D4' },
        { id: 'properti', name: 'Properti', icon: '🏠', color: '#F97316' },
        { id: 'lainnya', name: 'Lainnya', icon: '💰', color: '#6B7280' }
    ]);
},
saveInvestCategories(cats) { return this.save('investCategories', cats); },
    
    // ========== LIFE GOALS ==========
    getGoals() { return this.load('goals', []); },
    saveGoals(goals) { return this.save('goals', goals); },
    
    addGoal(goal) {
        const goals = this.getGoals();
        goal.id = this.generateId();
        goal.createdAt = new Date().toISOString();
        goal.progress = 0;
        goal.completed = false;
        goal.milestones = [];
        goals.push(goal);
        this.saveGoals(goals);
        return goal;
    },
    updateGoal(id, updates) {
        const goals = this.getGoals();
        const idx = goals.findIndex(g => g.id === id);
        if (idx !== -1) {
            goals[idx] = { ...goals[idx], ...updates };
            this.saveGoals(goals);
            return goals[idx];
        }
        return null;
    },
    deleteGoal(id) { this.saveGoals(this.getGoals().filter(g => g.id !== id)); },
    
    // ========== SCHEDULE (Jadwal Harian) ==========
    getSchedules() { return this.load('schedules', []); },
    saveSchedules(schedules) { return this.save('schedules', schedules); },
    
    addSchedule(schedule) {
        const schedules = this.getSchedules();
        schedule.id = this.generateId();
        schedules.push(schedule);
        this.saveSchedules(schedules);
        return schedule;
    },
    updateSchedule(id, updates) {
        const schedules = this.getSchedules();
        const idx = schedules.findIndex(s => s.id === id);
        if (idx !== -1) {
            schedules[idx] = { ...schedules[idx], ...updates };
            this.saveSchedules(schedules);
            return schedules[idx];
        }
        return null;
    },
    deleteSchedule(id) { this.saveSchedules(this.getSchedules().filter(s => s.id !== id)); },
    
    // ========== FOCUS (Pomodoro) ==========
    getFocusSessions() { return this.load('focus', []); },
    saveFocusSession(session) {
        const sessions = this.getFocusSessions();
        sessions.push(session);
        return this.save('focus', sessions);
    },
    
    // ========== JOURNAL ==========
    getJournals() { return this.load('journals', []); },
    saveJournals(journals) { return this.save('journals', journals); },
    
    addJournal(journal) {
        const journals = this.getJournals();
        journal.id = this.generateId();
        journal.createdAt = new Date().toISOString();
        journals.unshift(journal);
        this.saveJournals(journals);
        return journal;
    },
    getTodayJournal() {
        const today = new Date().toISOString().split('T')[0];
        return this.getJournals().find(j => j.date === today) || null;
    },
    
    // ========== IDEAS ==========
    getIdeas() { return this.load('ideas', []); },
    saveIdeas(ideas) { return this.save('ideas', ideas); },
    
    addIdea(idea) {
        const ideas = this.getIdeas();
        idea.id = this.generateId();
        idea.createdAt = new Date().toISOString();
        ideas.unshift(idea);
        this.saveIdeas(ideas);
        return idea;
    },
    deleteIdea(id) { this.saveIdeas(this.getIdeas().filter(i => i.id !== id)); },
    
    // ========== BOOKS ==========
    getBooks() { return this.load('books', []); },
    saveBooks(books) { return this.save('books', books); },
    
    addBook(book) {
        const books = this.getBooks();
        book.id = this.generateId();
        book.status = 'wishlist';
        books.push(book);
        this.saveBooks(books);
        return book;
    },
    updateBook(id, updates) {
        const books = this.getBooks();
        const idx = books.findIndex(b => b.id === id);
        if (idx !== -1) {
            books[idx] = { ...books[idx], ...updates };
            this.saveBooks(books);
            return books[idx];
        }
        return null;
    },
    deleteBook(id) { this.saveBooks(this.getBooks().filter(b => b.id !== id)); },
    
    // ========== LEARN WISHLIST ==========
    getLearnList() { return this.load('learn', []); },
    saveLearnList(list) { return this.save('learn', list); },
    
    addLearnItem(item) {
        const list = this.getLearnList();
        item.id = this.generateId();
        item.progress = 0;
        list.push(item);
        this.saveLearnList(list);
        return item;
    },
    updateLearnItem(id, updates) {
        const list = this.getLearnList();
        const idx = list.findIndex(l => l.id === id);
        if (idx !== -1) {
            list[idx] = { ...list[idx], ...updates };
            this.saveLearnList(list);
            return list[idx];
        }
        return null;
    },
    deleteLearnItem(id) { this.saveLearnList(this.getLearnList().filter(l => l.id !== id)); },
    
    // ========== MOOD ==========
    getMoods() { return this.load('moods', {}); },
    saveMood(date, mood) {
        const moods = this.getMoods();
        moods[date] = { mood, timestamp: new Date().toISOString() };
        return this.save('moods', moods);
    },
    getTodayMood() {
        const today = new Date().toISOString().split('T')[0];
        const moods = this.getMoods();
        return moods[today] || null;
    },
    
    // ========== ACHIEVEMENTS ==========
    getAchievements() { return this.load('achievements', []); },
    addAchievement(achievement) {
        const achievements = this.getAchievements();
        achievement.id = this.generateId();
        achievement.date = new Date().toISOString();
        achievements.unshift(achievement);
        return this.save('achievements', achievements);
    },
    checkAchievements() {
        const tasks = this.getTasks();
        const habits = this.getHabits();
        const achievements = this.getAchievements();
        
        const completedTasks = tasks.filter(t => t.completed).length;
        const bestStreak = Math.max(...habits.map(h => h.bestStreak), 0);
        
        const newAchievements = [];
        
        if (completedTasks >= 10 && !achievements.find(a => a.type === 'tasks-10')) {
            newAchievements.push({ type: 'tasks-10', title: '✅ 10 Tugas Selesai', icon: 'check-square', color: '#3B82F6' });
        }
        if (completedTasks >= 50 && !achievements.find(a => a.type === 'tasks-50')) {
            newAchievements.push({ type: 'tasks-50', title: '🏆 50 Tugas Selesai', icon: 'trophy', color: '#F59E0B' });
        }
        if (completedTasks >= 100 && !achievements.find(a => a.type === 'tasks-100')) {
            newAchievements.push({ type: 'tasks-100', title: '👑 100 Tugas Selesai', icon: 'crown', color: '#8B5CF6' });
        }
        if (bestStreak >= 7 && !achievements.find(a => a.type === 'streak-7')) {
            newAchievements.push({ type: 'streak-7', title: '🔥 Streak 7 Hari', icon: 'flame', color: '#F59E0B' });
        }
        if (bestStreak >= 30 && !achievements.find(a => a.type === 'streak-30')) {
            newAchievements.push({ type: 'streak-30', title: '💪 Streak 30 Hari', icon: 'zap', color: '#22C55E' });
        }
        
        newAchievements.forEach(a => this.addAchievement(a));
        return newAchievements;
    },
    
    // ========== REMINDERS ==========
    getReminders() { return this.load('reminders', []); },
    saveReminders(reminders) { return this.save('reminders', reminders); },
    
    addReminder(reminder) {
        const reminders = this.getReminders();
        reminder.id = this.generateId();
        reminders.push(reminder);
        this.saveReminders(reminders);
        return reminder;
    },
    updateReminder(id, updates) {
        const reminders = this.getReminders();
        const idx = reminders.findIndex(r => r.id === id);
        if (idx !== -1) {
            reminders[idx] = { ...reminders[idx], ...updates };
            this.saveReminders(reminders);
            return reminders[idx];
        }
        return null;
    },
    deleteReminder(id) { this.saveReminders(this.getReminders().filter(r => r.id !== id)); },
    
    // ========== SETTINGS ==========
    getSettings() { return this.load('settings', {}); },
    getSetting(key, def = null) {
        const s = this.getSettings();
        return s[key] !== undefined ? s[key] : def;
    },
    saveSetting(key, value) {
        const s = this.getSettings();
        s[key] = value;
        return this.save('settings', s);
    },
    
    // ========== PROFILE ==========
    getProfile() { return this.load('profile', { name: '', photo: null, quote: '' }); },
    saveProfile(profile) { return this.save('profile', profile); },
    
    // ========== PIN ==========
    getPINHash() { return this.load('pin_hash', null); },
    savePINHash(hash) { return this.save('pin_hash', hash); },
    hasPin() { return !!this.getPINHash(); },
    
    // ========== BACKUP/RESTORE ==========
    exportAll() {
        return JSON.stringify({
            version: '3.1',
            tasks: this.getTasks(),
            habits: this.getHabits(),
            expenses: this.getExpenses(),
            incomes: this.getIncomes(),
            investments: this.getInvestments(),
            goals: this.getGoals(),
            schedules: this.getSchedules(),
            focus: this.getFocusSessions(),
            journals: this.getJournals(),
            ideas: this.getIdeas(),
            books: this.getBooks(),
            learn: this.getLearnList(),
            moods: this.getMoods(),
            achievements: this.getAchievements(),
            reminders: this.getReminders(),
            categories: this.getCategories(),
            settings: this.getSettings(),
            profile: this.getProfile(),
            exportDate: new Date().toISOString()
        }, null, 2);
    },
    
    importAll(json) {
        try {
            const data = JSON.parse(json);
            if (data.tasks) this.saveTasks(data.tasks);
            if (data.habits) this.saveHabits(data.habits);
            if (data.expenses) this.saveExpenses(data.expenses);
            if (data.incomes) this.saveIncomes(data.incomes);
            if (data.investments) this.saveInvestments(data.investments);
            if (data.goals) this.saveGoals(data.goals);
            if (data.schedules) this.saveSchedules(data.schedules);
            if (data.focus) this.save('focus', data.focus);
            if (data.journals) this.saveJournals(data.journals);
            if (data.ideas) this.saveIdeas(data.ideas);
            if (data.books) this.saveBooks(data.books);
            if (data.learn) this.saveLearnList(data.learn);
            if (data.moods) this.save('moods', data.moods);
            if (data.achievements) this.save('achievements', data.achievements);
            if (data.reminders) this.saveReminders(data.reminders);
            if (data.categories) this.save('categories', data.categories);
            if (data.profile) this.saveProfile(data.profile);
            return true;
        } catch(e) {
            console.error('Import failed:', e);
            return false;
        }
    },
    
    resetAll() {
        Object.keys(localStorage)
            .filter(k => k.startsWith(this.PREFIX))
            .forEach(k => localStorage.removeItem(k));
    },
    
    // ========== STATS ==========
    getStats() {
        const today = new Date().toISOString().split('T')[0];
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekStartStr = weekStart.toISOString().split('T')[0];
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        
        const tasks = this.getTasks();
        const habits = this.getHabits();
        const expenses = this.getExpenses();
        const focusSessions = this.getFocusSessions();
        const invStats = this.getTotalInvestment();
        
        let habitTotal = 0, habitDone = 0;
        habits.forEach(h => {
            if (h.logs[today]) habitDone++;
            habitTotal++;
        });
        
        const focusThisWeek = focusSessions.filter(s => s.date >= weekStartStr).length;
        const tasksToday = tasks.filter(t => t.date === today && !t.completed).length;
        const tasksCompletedToday = tasks.filter(t => t.completed && t.completedAt && t.completedAt.startsWith(today)).length;
        const tasksPending = tasks.filter(t => !t.completed).length;
        const tasksCompletedTotal = tasks.filter(t => t.completed).length;
        const expenseToday = expenses.filter(e => e.date === today).reduce((s, e) => s + e.amount, 0);
        const expenseWeek = expenses.filter(e => e.date >= weekStartStr).reduce((s, e) => s + e.amount, 0);
        const expenseMonth = expenses.filter(e => e.date >= monthStart).reduce((s, e) => s + e.amount, 0);
        
        return {
            tasksToday,
            tasksCompletedToday,
            tasksPending,
            tasksCompletedTotal,
            habitDone,
            habitTotal,
            habitRate: habitTotal > 0 ? Math.round((habitDone / habitTotal) * 100) : 0,
            expenseToday,
            expenseWeek,
            expenseMonth,
            focusThisWeek,
            focusTotal: focusSessions.length,
            bestStreak: Math.max(...habits.map(h => h.bestStreak), 0),
            totalInvested: invStats.totalInvested,
            totalCurrent: invStats.totalCurrent,
            profit: invStats.profit,
            profitPct: invStats.profitPct
        };
    }
};
