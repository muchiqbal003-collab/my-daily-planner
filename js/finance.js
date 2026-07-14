// ============================================
// finance.js - Keuangan (Updated V3.0)
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
        
        // Top category
        const catTotals = {};
        filtered.forEach(e => {
            catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
        });
        const topCategory = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
        const topCat = topCategory ? categories.find(c => c.id === topCategory[0]) : null;
        
        const html = `
            <div style="padding:4px 0;">
                
                <!-- Summary -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
                    <div class="stat-card">
                        <i data-lucide="wallet" width="22" height="22" style="color:#EF4444;margin-bottom:4px;"></i>
                        <div class="stat-value red">Rp ${App.formatAmount(total)}</div>
                        <div class="stat-label">Total</div>
                    </div>
                    <div class="stat-card">
                        <i data-lucide="trending-up" width="22" height="22" style="color:var(--accent-light);margin-bottom:4px;"></i>
                        <div class="stat-value">Rp ${App.formatAmount(avg)}</div>
                        <div class="stat-label">Rata-rata/Hari</div>
                    </div>
                </div>
                
                ${topCat ? `
                <div class="card glass" style="text-align:center;padding:14px;margin-bottom:12px;">
                    <span style="font-size:10px;color:var(--text-tertiary);">Kategori Terbanyak</span>
                    <div style="font-size:28px;margin:4px 0;">${topCat.icon}</div>
                    <div style="font-weight:700;">${topCat.name}</div>
                    <div style="color:var(--danger);font-weight:600;font-size:12px;">Rp ${App.formatAmount(topCategory[1])}</div>
                </div>
                ` : ''}
                
                <!-- Filter -->
                <div class="filter-row">
                    <select id="filter-period" class="filter-select">
                        <option value="week">Minggu Ini</option>
                        <option value="month" selected>Bulan Ini</option>
                        <option value="year">Tahun Ini</option>
                        <option value="all">Semua</option>
                    </select>
                </div>
                
                <!-- Expense List -->
                <div class="section-header">
                    <h2><i data-lucide="list" width="18" height="18"></i> Pengeluaran</h2>
                    <span class="badge">${filtered.length}</span>
                </div>
                <div id="expense-list">
                    ${filtered.length === 0 ? `
                        <div class="empty">
                            <i data-lucide="wallet" width="36" height="36" style="color:var(--text-tertiary);"></i>
                            <p style="margin-top:8px;">Belum ada pengeluaran</p>
                        </div>
                    ` : filtered.map(e => this.renderExpenseItem(e)).join('')}
                </div>
                
                <button class="btn-add" id="btn-add-expense" style="margin-top:8px;">
                    <i data-lucide="plus" width="16" height="16"></i> Tambah Pengeluaran
                </button>
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindEvents();
        setTimeout(() => lucide.createIcons(), 50);
    },
    
    renderExpenseItem(expense) {
        const cat = Storage.getCategories().find(c => c.id === expense.category);
        const icon = cat ? cat.icon : '❓';
        const name = cat ? cat.name : expense.category;
        const dateStr = App.formatDate(expense.date);
        
        return `
            <div class="list-item" data-id="${expense.id}">
                <div style="font-size:22px;">${icon}</div>
                <div class="list-info">
                    <div class="list-title">${name}</div>
                    <div class="list-subtitle">${expense.note ? this.escape(expense.note) + ' • ' : ''}${dateStr}</div>
                </div>
                <div class="list-amount">-Rp ${expense.amount.toLocaleString('id-ID')}</div>
            </div>
        `;
    },
    
    bindEvents() {
        document.getElementById('btn-add-expense')?.addEventListener('click', () => this.openModal());
        
        document.getElementById('filter-period')?.addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.refresh();
        });
        
        document.querySelectorAll('#expense-list .list-item').forEach(item => {
            item.addEventListener('click', () => this.openModal(item.dataset.id));
        });
        
        this.bindModalEvents();
    },
    
    bindModalEvents() {
        if (this._bound) return;
        this._bound = true;
        
        document.getElementById('modal-expense-close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('btn-expense-cancel')?.addEventListener('click', () => this.closeModal());
        document.getElementById('btn-expense-save')?.addEventListener('click', () => this.save());
        document.getElementById('btn-expense-delete')?.addEventListener('click', () => this.delete());
        document.querySelector('#modal-expense .modal-backdrop')?.addEventListener('click', () => this.closeModal());
        
        // Init categories
        const select = document.getElementById('input-expense-category');
        if (select && select.children.length === 0) {
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
        document.getElementById('btn-expense-delete').style.display = id ? 'flex' : 'none';
        
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
            document.getElementById('input-expense-note').value = '';
            document.getElementById('input-expense-date').value = new Date().toISOString().split('T')[0];
        }
        
        modal.classList.add('active');
        setTimeout(() => document.getElementById('input-expense-amount').focus(), 200);
        lucide.createIcons();
    },
    
    closeModal() {
        document.getElementById('modal-expense').classList.remove('active');
        this.editingId = null;
    },
    
    save() {
        const amount = parseInt(document.getElementById('input-expense-amount').value);
        if (!amount || amount <= 0) return;
        
        const data = {
            amount,
            category: document.getElementById('input-expense-category').value,
            note: document.getElementById('input-expense-note').value.trim(),
            date: document.getElementById('input-expense-date').value
        };
        
        if (this.editingId) {
            Storage.updateExpense(this.editingId, data);
        } else {
            Storage.addExpense(data);
        }
        
        this.closeModal();
        this.refresh();
        App.toast('✅ Tersimpan!');
    },
    
    delete() {
        if (this.editingId && confirm('Hapus?')) {
            Storage.deleteExpense(this.editingId);
            this.closeModal();
            this.refresh();
            App.toast('🗑️ Dihapus!');
        }
    },
    
    refresh() {
        this.render(document.getElementById('app-content'));
    },
    
    escape(str) {
        const div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }
};
