// ============================================
// finance.js - Expense Management
// ============================================

const Finance = {
    editingId: null,
    currentFilter: 'month',
    
    render(container) {
        const expenses = Storage.getExpenses();
        const categories = Storage.getCategories();
        
        const filtered = this.filterExpenses(expenses, this.currentFilter);
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const total = filtered.reduce((s, e) => s + e.amount, 0);
        const uniqueDays = new Set(filtered.map(e => e.date)).size;
        const avg = uniqueDays > 0 ? Math.round(total / uniqueDays) : 0;
        
        // Kategori tertinggi
        const catTotals = {};
        filtered.forEach(e => {
            catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
        });
        const topCategory = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
        const topCat = topCategory ? categories.find(c => c.id === topCategory[0]) : null;
        
        const html = `
            <div style="padding:4px 0;">
                
                <!-- Summary Cards -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
                    <div class="stat-card">
                        <div class="stat-icon">💸</div>
                        <div class="stat-value" style="color:var(--danger);background:none;-webkit-text-fill-color:var(--danger);">
                            Rp ${this.formatAmount(total)}
                        </div>
                        <div class="stat-label">Total Pengeluaran</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-value" style="font-size:20px;">
                            Rp ${this.formatAmount(avg)}
                        </div>
                        <div class="stat-label">Rata-rata/Hari</div>
                    </div>
                </div>
                
                ${topCat ? `
                <div class="card glass" style="margin-bottom:14px;text-align:center;padding:14px;">
                    <span style="font-size:11px;color:var(--text-tertiary);font-weight:600;">Kategori Terbanyak</span>
                    <div style="font-size:20px;margin:4px 0;">${topCat.icon}</div>
                    <div style="font-weight:700;font-size:14px;">${topCat.name}</div>
                    <div style="color:var(--danger);font-weight:600;font-size:12px;">Rp ${this.formatAmount(topCategory[1])}</div>
                </div>
                ` : ''}
                
                <!-- Chart -->
                <div class="card glass" style="margin-bottom:14px;">
                    <div class="chart-tabs">
                        <button class="chart-tab ${Charts.currentType === 'category' ? 'active' : ''}" data-type="category">
                            📊 Kategori
                        </button>
                        <button class="chart-tab ${Charts.currentType === 'daily' ? 'active' : ''}" data-type="daily">
                            📅 Harian
                        </button>
                    </div>
                    <div style="width:100%;">
                        <canvas id="chart-canvas"></canvas>
                    </div>
                </div>
                
                <!-- Filter -->
                <div class="filter-row">
                    <select id="filter-period" class="filter-select">
                        <option value="week" ${this.currentFilter === 'week' ? 'selected' : ''}>🗓 Minggu Ini</option>
                        <option value="month" ${this.currentFilter === 'month' ? 'selected' : ''}>📅 Bulan Ini</option>
                        <option value="year" ${this.currentFilter === 'year' ? 'selected' : ''}>📆 Tahun Ini</option>
                        <option value="all" ${this.currentFilter === 'all' ? 'selected' : ''}>📚 Semua</option>
                    </select>
                </div>
                
                <!-- Expense List -->
                <div class="section-header">
                    <h2>💳 Daftar Pengeluaran</h2>
                    <span class="badge">${filtered.length}</span>
                </div>
                <div id="expense-list">
                    ${filtered.length === 0
                        ? '<div class="empty">📭 Belum ada catatan pengeluaran</div>'
                        : filtered.map(e => this.renderExpenseItem(e)).join('')}
                </div>
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindEvents();
        
        // Render chart
        setTimeout(() => {
            Charts.render('chart-canvas', filtered, categories);
        }, 150);
    },
    
    renderExpenseItem(expense) {
        const cat = Storage.getCategories().find(c => c.id === expense.category);
        const icon = cat ? cat.icon : '❓';
        const name = cat ? cat.name : expense.category;
        const date = new Date(expense.date);
        const dateStr = this.formatDate(expense.date);
        
        return `
            <div class="list-item" data-id="${expense.id}">
                <div style="font-size:26px;flex-shrink:0;">${icon}</div>
                <div class="list-info">
                    <div class="list-title">${name}</div>
                    <div class="list-subtitle">
                        ${expense.note ? this.escapeHTML(expense.note) + ' • ' : ''}${dateStr}
                    </div>
                </div>
                <div class="list-amount">-Rp ${expense.amount.toLocaleString('id-ID')}</div>
            </div>
        `;
    },
    
    bindEvents() {
        // Chart tabs
        document.querySelectorAll('.chart-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                Charts.setType(tab.dataset.type);
                const filtered = this.filterExpenses(Storage.getExpenses(), this.currentFilter);
                Charts.render('chart-canvas', filtered, Storage.getCategories());
            });
        });
        
        // Filter
        document.getElementById('filter-period')?.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.refresh();
        });
        
        // Expense items
        document.querySelectorAll('#expense-list .list-item').forEach(item => {
            item.addEventListener('click', () => this.openModal(item.dataset.id));
        });
        
        // Modal events
        document.getElementById('modal-expense-close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('btn-expense-cancel')?.addEventListener('click', () => this.closeModal());
        document.getElementById('btn-expense-save')?.addEventListener('click', () => this.save());
        document.getElementById('btn-expense-delete')?.addEventListener('click', () => this.delete());
        document.querySelector('#modal-expense .modal-backdrop')?.addEventListener('click', () => this.closeModal());
        
        // Render category select
        const select = document.getElementById('input-expense-category');
        if (select && select.options.length === 0) {
            select.innerHTML = Storage.getCategories().map(c => 
                `<option value="${c.id}">${c.icon} ${c.name}</option>`
            ).join('');
        }
    },
    
    filterExpenses(expenses, period) {
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        let start;
        
        switch(period) {
            case 'week':
                start = new Date(now);
                start.setDate(now.getDate() - now.getDay());
                start.setHours(0, 0, 0, 0);
                break;
            case 'month':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                start = new Date(now.getFullYear(), 0, 1);
                break;
            case 'all':
                return [...expenses];
            default:
                start = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        
        return expenses.filter(e => {
            const d = new Date(e.date);
            d.setHours(0, 0, 0, 0);
            return d >= start && d <= now;
        });
    },
    
    openModal(id = null) {
        this.editingId = id;
        const modal = document.getElementById('modal-expense');
        const deleteBtn = document.getElementById('btn-expense-delete');
        
        document.getElementById('modal-expense-title').textContent = id ? 'Edit Pengeluaran' : 'Catat Pengeluaran';
        if (deleteBtn) deleteBtn.style.display = id ? 'flex' : 'none';
        
        if (id) {
            const exp = Storage.getExpenses().find(e => e.id === id);
            if (exp) {
                document.getElementById('input-expense-amount').value = exp.amount;
                document.getElementById('input-expense-category').value = exp.category;
                document.getElementById('input-expense-note').value = exp.note || '';
                document.getElementById('input-expense-date').value = exp.date;
            }
        } else {
            document.getElementById('input-expense-amount').value = '';
            document.getElementById('input-expense-category').value = 'food';
            document.getElementById('input-expense-note').value = '';
            document.getElementById('input-expense-date').value = new Date().toISOString().split('T')[0];
        }
        
        modal.classList.add('active');
        setTimeout(() => document.getElementById('input-expense-amount').focus(), 200);
    },
    
    closeModal() {
        document.getElementById('modal-expense').classList.remove('active');
        this.editingId = null;
    },
    
    save() {
        const amountStr = document.getElementById('input-expense-amount').value;
        const amount = parseInt(amountStr.replace(/\D/g, ''));
        
        if (!amount || amount <= 0) {
            App.toast('⚠️ Jumlah harus diisi!');
            return;
        }
        
        const data = {
            amount: amount,
            category: document.getElementById('input-expense-category').value,
            note: document.getElementById('input-expense-note').value.trim(),
            date: document.getElementById('input-expense-date').value
        };
        
        if (this.editingId) {
            Storage.updateExpense(this.editingId, data);
            App.toast('✅ Pengeluaran diupdate!');
        } else {
            Storage.addExpense(data);
            App.toast('✅ Pengeluaran dicatat!');
        }
        
        this.closeModal();
        this.refresh();
    },
    
    delete() {
        if (this.editingId && confirm('Hapus pengeluaran ini?')) {
            Storage.deleteExpense(this.editingId);
            this.closeModal();
            this.refresh();
            App.toast('🗑️ Pengeluaran dihapus');
        }
    },
    
    refresh() {
        this.render(document.getElementById('app-content'));
    },
    
    formatDate(dateStr) {
        const d = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (dateStr === today.toISOString().split('T')[0]) return 'Hari ini';
        if (dateStr === yesterday.toISOString().split('T')[0]) return 'Kemarin';
        
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    },
    
    formatAmount(amount) {
        if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M';
        if (amount >= 1000) return (amount / 1000).toFixed(0) + 'K';
        return amount.toString();
    },
    
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};