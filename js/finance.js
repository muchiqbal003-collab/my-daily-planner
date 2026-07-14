// ============================================
// finance.js - Keuangan V4.0
// Ringkasan + Pemasukan + Pengeluaran (Dashboard Analytic)
// ============================================

const Finance = {
    activeTab: 'ringkasan',
    editingExpenseId: null,
    editingIncomeId: null,
    
    render(container) {
        const html = `
            <div style="padding:4px 0;">
                
                <!-- Tab Navigation -->
                <div style="display:flex;gap:4px;background:var(--bg-tertiary);border-radius:var(--radius-md);padding:4px;margin-bottom:16px;">
                    <button class="finance-tab ${this.activeTab === 'ringkasan' ? 'active' : ''}" data-tab="ringkasan" 
                        style="flex:1;padding:10px;border:none;border-radius:10px;cursor:pointer;font-weight:600;font-size:12px;font-family:'Inter',sans-serif;
                        ${this.activeTab === 'ringkasan' ? 'background:var(--bg-secondary);color:var(--text-primary);box-shadow:var(--shadow-sm);' : 'background:transparent;color:var(--text-tertiary);'}">
                        <i data-lucide="pie-chart" width="14" height="14"></i> Ringkasan
                    </button>
                    <button class="finance-tab ${this.activeTab === 'pemasukan' ? 'active' : ''}" data-tab="pemasukan"
                        style="flex:1;padding:10px;border:none;border-radius:10px;cursor:pointer;font-weight:600;font-size:12px;font-family:'Inter',sans-serif;
                        ${this.activeTab === 'pemasukan' ? 'background:var(--bg-secondary);color:var(--text-primary);box-shadow:var(--shadow-sm);' : 'background:transparent;color:var(--text-tertiary);'}">
                        <i data-lucide="trending-up" width="14" height="14"></i> Pemasukan
                    </button>
                    <button class="finance-tab ${this.activeTab === 'pengeluaran' ? 'active' : ''}" data-tab="pengeluaran"
                        style="flex:1;padding:10px;border:none;border-radius:10px;cursor:pointer;font-weight:600;font-size:12px;font-family:'Inter',sans-serif;
                        ${this.activeTab === 'pengeluaran' ? 'background:var(--bg-secondary);color:var(--text-primary);box-shadow:var(--shadow-sm);' : 'background:transparent;color:var(--text-tertiary);'}">
                        <i data-lucide="trending-down" width="14" height="14"></i> Pengeluaran
                    </button>
                </div>
                
                <div id="finance-content">
                    ${this.activeTab === 'ringkasan' ? this.renderRingkasan() : ''}
                    ${this.activeTab === 'pemasukan' ? this.renderPemasukan() : ''}
                    ${this.activeTab === 'pengeluaran' ? this.renderPengeluaran() : ''}
                </div>
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindTabEvents();
        
        if (this.activeTab === 'ringkasan') setTimeout(() => this.renderDonutChart(), 150);
        if (this.activeTab === 'pemasukan') this.bindPemasukanEvents();
        if (this.activeTab === 'pengeluaran') this.bindPengeluaranEvents();
        
        setTimeout(() => lucide.createIcons(), 50);
    },
    
    // ==================== RINGKASAN ====================
    renderRingkasan() {
        const today = new Date().toISOString().split('T')[0];
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        
        const incomes = Storage.getIncomes ? Storage.getIncomes() : [];
        const expenses = Storage.getExpenses();
        
        const incomeMonth = incomes.filter(i => i.date >= monthStart).reduce((s, i) => s + i.amount, 0);
        const expenseMonth = expenses.filter(e => e.date >= monthStart).reduce((s, e) => s + e.amount, 0);
        const saldo = incomeMonth - expenseMonth;
        
        const budget = Storage.getSetting('monthlyBudget', incomeMonth || 5000000);
        const budgetUsage = budget > 0 ? Math.round((expenseMonth / budget) * 100) : 0;
        
        // Perbandingan bulan lalu
        const lastMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0];
        const lastMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0];
        const expenseLastMonth = expenses.filter(e => e.date >= lastMonthStart && e.date <= lastMonthEnd).reduce((s, e) => s + e.amount, 0);
        const incomeLastMonth = incomes.filter(i => i.date >= lastMonthStart && i.date <= lastMonthEnd).reduce((s, i) => s + i.amount, 0);
        
        const expenseChange = expenseLastMonth > 0 ? Math.round(((expenseMonth - expenseLastMonth) / expenseLastMonth) * 100) : 0;
        const incomeChange = incomeLastMonth > 0 ? Math.round(((incomeMonth - incomeLastMonth) / incomeLastMonth) * 100) : 0;
        
        return `
            <!-- Saldo Card -->
            <div class="card glass" style="margin-bottom:14px;padding:20px;">
                <div style="display:flex;align-items:center;gap:16px;">
                    <div style="flex:1;">
                        <p style="font-size:10px;color:var(--text-tertiary);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Saldo Bulan Ini</p>
                        <p style="font-size:28px;font-weight:900;letter-spacing:-0.04em;color:${saldo >= 0 ? 'var(--success)' : 'var(--danger)'};margin:4px 0;">
                            Rp ${Math.abs(saldo).toLocaleString('id-ID')}
                        </p>
                        <p style="font-size:10px;color:var(--text-tertiary);">
                            Total pemasukan: Rp ${incomeMonth.toLocaleString('id-ID')}
                        </p>
                    </div>
                    <div style="width:90px;height:90px;position:relative;">
                        <canvas id="donut-chart" width="90" height="90"></canvas>
                        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
                            <span style="font-size:13px;font-weight:900;color:${budgetUsage > 80 ? 'var(--danger)' : 'var(--text-primary)'};">${budgetUsage}%</span>
                        </div>
                    </div>
                </div>
                
                <!-- Progress Bar -->
                <div style="margin-top:14px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                        <span style="font-size:10px;color:var(--text-tertiary);">Pengeluaran</span>
                        <span style="font-size:10px;font-weight:700;">Rp ${expenseMonth.toLocaleString('id-ID')} / Rp ${budget.toLocaleString('id-ID')}</span>
                    </div>
                    <div style="height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;">
                        <div style="width:${Math.min(budgetUsage, 100)}%;height:100%;background:${budgetUsage > 80 ? '#EF4444' : 'var(--gradient-1)'};border-radius:4px;transition:width 0.5s;"></div>
                    </div>
                </div>
            </div>
            
            <!-- Analytic Cards -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
                <div class="card glass" style="padding:14px;cursor:pointer;" onclick="document.querySelector('.finance-tab[data-tab=pemasukan]').click()">
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                        <div style="width:32px;height:32px;border-radius:8px;background:rgba(34,197,94,0.15);display:flex;align-items:center;justify-content:center;">
                            <i data-lucide="arrow-down-left" width="16" height="16" style="color:#22C55E;"></i>
                        </div>
                        <span style="font-size:10px;color:var(--text-tertiary);font-weight:600;">PEMASUKAN</span>
                    </div>
                    <div style="font-size:18px;font-weight:800;">Rp ${App.formatAmount(incomeMonth)}</div>
                    <div style="font-size:10px;color:${incomeChange >= 0 ? '#22C55E' : '#EF4444'};margin-top:2px;">
                        ${incomeChange >= 0 ? '↑' : '↓'} ${Math.abs(incomeChange)}% dari bulan lalu
                    </div>
                </div>
                
                <div class="card glass" style="padding:14px;cursor:pointer;" onclick="document.querySelector('.finance-tab[data-tab=pengeluaran]').click()">
                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                        <div style="width:32px;height:32px;border-radius:8px;background:rgba(239,68,68,0.15);display:flex;align-items:center;justify-content:center;">
                            <i data-lucide="arrow-up-right" width="16" height="16" style="color:#EF4444;"></i>
                        </div>
                        <span style="font-size:10px;color:var(--text-tertiary);font-weight:600;">PENGELUARAN</span>
                    </div>
                    <div style="font-size:18px;font-weight:800;">Rp ${App.formatAmount(expenseMonth)}</div>
                    <div style="font-size:10px;color:${expenseChange <= 0 ? '#22C55E' : '#EF4444'};margin-top:2px;">
                        ${expenseChange > 0 ? '↑' : '↓'} ${Math.abs(expenseChange)}% dari bulan lalu
                    </div>
                </div>
            </div>
            
            <!-- Weekly Bar Chart -->
            <div class="card glass" style="margin-bottom:14px;padding:16px;">
                <h3 style="font-size:12px;font-weight:700;color:var(--text-secondary);margin-bottom:12px;">
                    <i data-lucide="bar-chart-2" width="14" height="14"></i> Pengeluaran Minggu Ini
                </h3>
                <div style="display:flex;align-items:flex-end;gap:4px;height:100px;" id="weekly-chart">
                    ${this.renderWeeklyChart(expenses, incomes)}
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:8px;color:var(--text-tertiary);">
                    <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
                </div>
                <div style="display:flex;gap:12px;margin-top:8px;font-size:9px;">
                    <span style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;background:#EF4444;border-radius:2px;"></span> Pengeluaran</span>
                    <span style="display:flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;background:#22C55E;border-radius:2px;"></span> Pemasukan</span>
                </div>
            </div>
            
            <!-- Category Breakdown -->
            <div class="card glass" style="padding:16px;">
                <h3 style="font-size:12px;font-weight:700;color:var(--text-secondary);margin-bottom:12px;">
                    <i data-lucide="layers" width="14" height="14"></i> Kategori Pengeluaran
                </h3>
                ${this.renderCategoryBreakdown(expenses, monthStart)}
            </div>
        `;
    },
    
    renderWeeklyChart(expenses, incomes) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        
        const weekData = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            weekData.push({
                expense: expenses.filter(e => e.date === dateStr).reduce((s, e) => s + e.amount, 0),
                income: incomes.filter(inc => inc.date === dateStr).reduce((s, inc) => s + inc.amount, 0)
            });
        }
        
        const maxVal = Math.max(...weekData.map(d => d.expense + d.income), 10000);
        const today = new Date().getDay();
        
        return weekData.map((d, i) => {
            const expenseH = (d.expense / maxVal) * 80;
            const incomeH = (d.income / maxVal) * 80;
            const totalH = Math.max(expenseH + incomeH, 2);
            
            return `
                <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;">
                    <div style="width:100%;max-width:28px;height:80px;display:flex;flex-direction:column-reverse;border-radius:4px;overflow:hidden;${i === today ? 'box-shadow:0 0 8px var(--accent-glow);' : ''}">
                        <div style="width:100%;height:${expenseH}px;background:#EF4444;transition:height 0.3s;border-radius:2px 2px 0 0;"></div>
                        <div style="width:100%;height:${incomeH}px;background:#22C55E;transition:height 0.3s;"></div>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    renderCategoryBreakdown(expenses, monthStart) {
        const categories = Storage.getCategories();
        const monthExpenses = expenses.filter(e => e.date >= monthStart);
        const totalExpense = monthExpenses.reduce((s, e) => s + e.amount, 0);
        
        const catTotals = {};
        monthExpenses.forEach(e => {
            catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
        });
        
        const sorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);
        
        if (sorted.length === 0) {
            return '<p style="text-align:center;color:var(--text-tertiary);font-size:11px;padding:10px;">Belum ada pengeluaran</p>';
        }
        
        const colors = ['#3B82F6', '#EF4444', '#F59E0B', '#22C55E', '#8B5CF6'];
        const maxAmount = sorted[0][1];
        
        return sorted.map(([catId, amount], i) => {
            const cat = categories.find(c => c.id === catId);
            const name = cat ? cat.name : catId;
            const icon = cat ? cat.icon : '❓';
            const barWidth = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
            
            return `
                <div style="margin-bottom:10px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                        <span style="font-size:11px;display:flex;align-items:center;gap:6px;">
                            <span>${icon}</span> ${name}
                        </span>
                        <span style="font-size:10px;font-weight:700;">Rp ${App.formatAmount(amount)}</span>
                    </div>
                    <div style="height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
                        <div style="width:${barWidth}%;height:100%;background:${colors[i]};border-radius:3px;transition:width 0.5s;"></div>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    renderDonutChart() {
        setTimeout(() => {
            const canvas = document.getElementById('donut-chart');
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
            const expenses = Storage.getExpenses().filter(e => e.date >= monthStart);
            const expenseMonth = expenses.reduce((s, e) => s + e.amount, 0);
            const incomes = Storage.getIncomes ? Storage.getIncomes() : [];
            const incomeMonth = incomes.filter(i => i.date >= monthStart).reduce((s, i) => s + i.amount, 0);
            const budget = incomeMonth || Storage.getSetting('monthlyBudget', 5000000);
            const pct = budget > 0 ? Math.min(expenseMonth / budget, 1) : 0;
            
            ctx.clearRect(0, 0, 90, 90);
            
            // Background circle
            ctx.beginPath();
            ctx.arc(45, 45, 35, 0, 2 * Math.PI);
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-tertiary').trim();
            ctx.lineWidth = 8;
            ctx.stroke();
            
            // Progress arc
            if (pct > 0) {
                ctx.beginPath();
                ctx.arc(45, 45, 35, -Math.PI / 2, -Math.PI / 2 + (2 * Math.PI * pct));
                const gradient = ctx.createLinearGradient(0, 0, 90, 90);
                gradient.addColorStop(0, '#3B82F6');
                gradient.addColorStop(1, '#8B5CF6');
                ctx.strokeStyle = pct > 0.8 ? '#EF4444' : gradient;
                ctx.lineWidth = 8;
                ctx.lineCap = 'round';
                ctx.stroke();
            }
        }, 100);
    },
    
    // ==================== PEMASUKAN ====================
    renderPemasukan() {
        const incomes = Storage.getIncomes ? Storage.getIncomes() : [];
        const sorted = [...incomes].sort((a, b) => new Date(b.date) - new Date(a.date));
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const totalMonth = incomes.filter(i => i.date >= monthStart).reduce((s, i) => s + i.amount, 0);
        
        return `
            <div class="stat-card" style="margin-bottom:12px;padding:16px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                    <div style="width:36px;height:36px;border-radius:10px;background:rgba(34,197,94,0.15);display:flex;align-items:center;justify-content:center;">
                        <i data-lucide="trending-up" width="18" height="18" style="color:#22C55E;"></i>
                    </div>
                    <span style="font-size:11px;color:var(--text-tertiary);font-weight:600;">TOTAL PEMASUKAN BULAN INI</span>
                </div>
                <div class="stat-value green" style="font-size:24px;">Rp ${totalMonth.toLocaleString('id-ID')}</div>
            </div>
            
            <div id="income-list">
                ${sorted.length === 0 ? `
                    <div class="empty">
                        <i data-lucide="wallet" width="36" height="36" style="color:var(--text-tertiary);"></i>
                        <p style="margin-top:8px;">Belum ada pemasukan</p>
                    </div>
                ` : sorted.map(i => this.renderIncomeItem(i)).join('')}
            </div>
            
            <button class="btn-add" id="btn-add-income" style="margin-top:8px;">
                <i data-lucide="plus" width="16" height="16"></i> Tambah Pemasukan
            </button>
        `;
    },
    
    renderIncomeItem(income) {
        const dateStr = App.formatDate(income.date);
        return `
            <div class="list-item" data-income-id="${income.id}" style="cursor:pointer;">
                <div style="font-size:22px;">💰</div>
                <div class="list-info">
                    <div class="list-title">${this.escape(income.source || 'Pemasukan')}</div>
                    <div class="list-subtitle">${income.note ? this.escape(income.note) + ' • ' : ''}${dateStr}</div>
                </div>
                <div style="font-size:14px;font-weight:700;color:#22C55E;">+Rp ${income.amount.toLocaleString('id-ID')}</div>
                <button class="list-delete income-delete-btn">
                    <i data-lucide="trash-2" width="14" height="14"></i>
                </button>
            </div>
        `;
    },
    
    bindPemasukanEvents() {
        document.getElementById('btn-add-income')?.addEventListener('click', () => this.openIncomeModal());
        
        document.querySelectorAll('#income-list .list-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.income-delete-btn')) return;
                this.openIncomeModal(item.dataset.incomeId);
            });
            
            item.querySelector('.income-delete-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Hapus pemasukan ini?')) {
                    if (Storage.deleteIncome) Storage.deleteIncome(item.dataset.incomeId);
                    this.refresh();
                    App.toast('🗑️ Pemasukan dihapus');
                }
            });
        });
    },
    
    openIncomeModal(id = null) {
        const incomes = Storage.getIncomes ? Storage.getIncomes() : [];
        const existing = id ? incomes.find(i => i.id === id) : null;
        
        const source = prompt('💰 Sumber pemasukan:', existing?.source || '');
        if (!source || !source.trim()) return;
        
        const amountStr = prompt('💵 Jumlah (Rp):', existing?.amount || '');
        if (!amountStr) return;
        const amount = parseInt(amountStr.replace(/\D/g, ''));
        if (!amount || amount <= 0) return;
        
        const note = prompt('📝 Catatan (opsional):', existing?.note || '') || '';
        const dateStr = prompt('📅 Tanggal (YYYY-MM-DD):', existing?.date || new Date().toISOString().split('T')[0]);
        if (!dateStr) return;
        
        const data = {
            source: source.trim(),
            amount: amount,
            note: note.trim(),
            date: dateStr
        };
        
        if (id && Storage.updateIncome) {
            Storage.updateIncome(id, data);
            App.toast('✅ Pemasukan diupdate!');
        } else if (Storage.addIncome) {
            Storage.addIncome(data);
            App.toast('✅ Pemasukan dicatat!');
        } else {
            // Fallback
            incomes.unshift({
                id: Date.now().toString(36),
                ...data,
                createdAt: new Date().toISOString()
            });
            if (Storage.saveIncomes) Storage.saveIncomes(incomes);
            App.toast('✅ Pemasukan dicatat!');
        }
        
        this.refresh();
    },
    
    // ==================== PENGELUARAN ====================
    renderPengeluaran() {
        const expenses = Storage.getExpenses();
        const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const totalMonth = expenses.filter(e => e.date >= monthStart).reduce((s, e) => s + e.amount, 0);
        
        return `
            <div class="stat-card" style="margin-bottom:12px;padding:16px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                    <div style="width:36px;height:36px;border-radius:10px;background:rgba(239,68,68,0.15);display:flex;align-items:center;justify-content:center;">
                        <i data-lucide="trending-down" width="18" height="18" style="color:#EF4444;"></i>
                    </div>
                    <span style="font-size:11px;color:var(--text-tertiary);font-weight:600;">TOTAL PENGELUARAN BULAN INI</span>
                </div>
                <div class="stat-value red" style="font-size:24px;">Rp ${totalMonth.toLocaleString('id-ID')}</div>
            </div>
            
            <div id="expense-list">
                ${sorted.length === 0 ? `
                    <div class="empty">
                        <i data-lucide="receipt" width="36" height="36" style="color:var(--text-tertiary);"></i>
                        <p style="margin-top:8px;">Belum ada pengeluaran</p>
                    </div>
                ` : sorted.map(e => this.renderExpenseItem(e)).join('')}
            </div>
            
            <button class="btn-add" id="btn-add-expense" style="margin-top:8px;">
                <i data-lucide="plus" width="16" height="16"></i> Tambah Pengeluaran
            </button>
        `;
    },
    
    renderExpenseItem(expense) {
        const cat = Storage.getCategories().find(c => c.id === expense.category);
        const icon = cat ? cat.icon : '❓';
        const name = cat ? cat.name : expense.category;
        const dateStr = App.formatDate(expense.date);
        
        return `
            <div class="list-item" data-expense-id="${expense.id}">
                <div style="font-size:22px;">${icon}</div>
                <div class="list-info">
                    <div class="list-title">${name}</div>
                    <div class="list-subtitle">${expense.note ? this.escape(expense.note) + ' • ' : ''}${dateStr}</div>
                </div>
                <div class="list-amount">-Rp ${expense.amount.toLocaleString('id-ID')}</div>
                <button class="list-delete expense-delete">
                    <i data-lucide="trash-2" width="14" height="14"></i>
                </button>
            </div>
        `;
    },
    
    bindPengeluaranEvents() {
        document.getElementById('btn-add-expense')?.addEventListener('click', () => this.openExpenseModal());
        
        document.querySelectorAll('#expense-list .list-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.expense-delete')) return;
                this.openExpenseModal(item.dataset.expenseId);
            });
            
            item.querySelector('.expense-delete')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Hapus?')) {
                    Storage.deleteExpense(item.dataset.expenseId);
                    this.refresh();
                }
            });
        });
        
        this.bindExpenseModalEvents();
    },
    
    bindExpenseModalEvents() {
        if (this._expenseModalBound) return;
        this._expenseModalBound = true;
        
        document.getElementById('modal-expense-close')?.addEventListener('click', () => this.closeExpenseModal());
        document.getElementById('btn-expense-cancel')?.addEventListener('click', () => this.closeExpenseModal());
        document.getElementById('btn-expense-save')?.addEventListener('click', () => this.saveExpense());
        document.getElementById('btn-expense-delete')?.addEventListener('click', () => this.deleteExpense());
        document.querySelector('#modal-expense .modal-backdrop')?.addEventListener('click', () => this.closeExpenseModal());
        
        const select = document.getElementById('input-expense-category');
        if (select && select.children.length === 0) {
            select.innerHTML = Storage.getCategories().map(c => 
                `<option value="${c.id}">${c.icon} ${c.name}</option>`
            ).join('');
        }
    },
    
    openExpenseModal(id = null) {
        this.editingExpenseId = id;
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
    
    closeExpenseModal() {
        document.getElementById('modal-expense').classList.remove('active');
        this.editingExpenseId = null;
    },
    
    saveExpense() {
        const amount = parseInt(document.getElementById('input-expense-amount').value);
        if (!amount || amount <= 0) return;
        
        const data = {
            amount,
            category: document.getElementById('input-expense-category').value,
            note: document.getElementById('input-expense-note').value.trim(),
            date: document.getElementById('input-expense-date').value
        };
        
        if (this.editingExpenseId) {
            Storage.updateExpense(this.editingExpenseId, data);
        } else {
            Storage.addExpense(data);
        }
        
        this.closeExpenseModal();
        this.refresh();
        App.toast('✅ Tersimpan!');
    },
    
    deleteExpense() {
        if (this.editingExpenseId && confirm('Hapus?')) {
            Storage.deleteExpense(this.editingExpenseId);
            this.closeExpenseModal();
            this.refresh();
        }
    },
    
    // ==================== HELPERS ====================
    bindTabEvents() {
        document.querySelectorAll('.finance-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.activeTab = tab.dataset.tab;
                this.refresh();
            });
        });
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
