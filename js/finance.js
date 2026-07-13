// ============================================
// finance.js - Expense Management (SVG Icons)
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
                        <div style="margin-bottom:10px;">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="1" x2="12" y2="23"/>
                                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                            </svg>
                        </div>
                        <div class="stat-value" style="color:var(--danger);background:none;-webkit-text-fill-color:var(--danger);">
                            Rp ${this.formatAmount(total)}
                        </div>
                        <div class="stat-label">Total Pengeluaran</div>
                    </div>
                    <div class="stat-card">
                        <div style="margin-bottom:10px;">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                            </svg>
                        </div>
                        <div class="stat-value" style="font-size:20px;">
                            Rp ${this.formatAmount(avg)}
                        </div>
                        <div class="stat-label">Rata-rata/Hari</div>
                    </div>
                </div>
                
                ${topCat ? `
                <div class="card glass" style="margin-bottom:14px;text-align:center;padding:16px;">
                    <div style="margin-bottom:6px;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                    </div>
                    <span style="font-size:11px;color:var(--text-tertiary);font-weight:600;">Kategori Terbanyak</span>
                    <div style="font-size:28px;margin:4px 0;">${topCat.icon}</div>
                    <div style="font-weight:700;font-size:14px;">${topCat.name}</div>
                    <div style="color:var(--danger);font-weight:600;font-size:12px;">Rp ${this.formatAmount(topCategory[1])}</div>
                </div>
                ` : ''}
                
                <!-- Chart -->
                <div class="card glass" style="margin-bottom:14px;">
                    <div class="chart-tabs">
                        <button class="chart-tab ${Charts.currentType === 'category' ? 'active' : ''}" data-type="category">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="vertical-align:middle;margin-right:4px;">
                                <path d="M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10z"/>
                            </svg>
                            Kategori
                        </button>
                        <button class="chart-tab ${Charts.currentType === 'daily' ? 'active' : ''}" data-type="daily">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="vertical-align:middle;margin-right:4px;">
                                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                            </svg>
                            Harian
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
                    <h2 style="display:flex;align-items:center;gap:8px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                            <rect x="2" y="4" width="20" height="16" rx="2"/>
                            <path d="M2 10h20"/>
                        </svg>
                        Daftar Pengeluaran
                    </h2>
                    <span class="badge">${filtered.length}</span>
                </div>
                <div id="expense-list">
                    ${filtered.length === 0
                        ? `<div class="empty">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="1.5" stroke-linecap="round" style="margin-bottom:10px;">
                                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            <p>Belum ada catatan pengeluaran</p>
                           </div>`
                        : filtered.map(e => this.renderExpenseItem(e)).join('')}
                </div>
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindEvents();
        
        setTimeout(() => {
            Charts.render('chart-canvas', filtered, categories);
        }, 150);
    },
    
    renderExpenseItem(expense) {
        const cat = Storage.getCategories().find(c => c.id === expense.category);
        const icon = cat ? cat.icon : '❓';
        const name = cat ? cat.name : expense.category;
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
            const newTab = tab.cloneNode(true);
            tab.parentNode.replaceChild(newTab, tab);
            newTab.addEventListener('click', () => {
                document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
                newTab.classList.add('active');
                Charts.setType(newTab.dataset.type);
                const filtered = this.filterExpenses(Storage.getExpenses(), this.currentFilter);
                Charts.render('chart-canvas', filtered, Storage.getCategories());
            });
        });
        
        // Filter
        const filterSelect = document.getElementById('filter-period');
        if (filterSelect) {
            const newFilter = filterSelect.cloneNode(true);
            filterSelect.parentNode.replaceChild(newFilter, filterSelect);
            newFilter.value = this.currentFilter;
            newFilter.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.refresh();
            });
        }
        
        // Expense items
        document.querySelectorAll('#expense-list .list-item').forEach(item => {
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            newItem.addEventListener('click', () => this.openModal(newItem.dataset.id));
        });
        
        // Modal events
        this.bindModalEventsOnce();
        
        // Render category select
        const select = document.getElementById('input-expense-category');
        if (select && select.children.length === 0) {
            select.innerHTML = Storage.getCategories().map(c => 
                `<option value="${c.id}">${c.icon} ${c.name}</option>`
            ).join('');
        }
    },
    
    bindModalEventsOnce() {
        if (this._modalBound) return;
        this._modalBound = true;
        
        document.getElementById('modal-expense-close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('btn-expense-cancel')?.addEventListener('click', () => this.closeModal());
        document.getElementById('btn-expense-save')?.addEventListener('click', () => this.save());
        document.getElementById('btn-expense-delete')?.addEventListener('click', () => this.delete());
        document.querySelector('#modal-expense .modal-backdrop')?.addEventListener('click', () => this.closeModal());
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
