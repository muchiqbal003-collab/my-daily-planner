// ============================================
// invest.js - Portfolio Investasi V2.0
// 3 Tab: Ringkasan + Transaksi + Target
// ============================================

const Invest = {
    activeTab: 'ringkasan',
    editingTransId: null,
    editingTargetId: null,
    
    render(container) {
        const html = `
            <div style="padding:4px 0;">
                
                <!-- Tab Navigation -->
                <div style="display:flex;gap:4px;background:var(--bg-tertiary);border-radius:var(--radius-md);padding:4px;margin-bottom:16px;">
                    <button class="invest-tab ${this.activeTab === 'ringkasan' ? 'active' : ''}" data-tab="ringkasan"
                        style="flex:1;padding:10px;border:none;border-radius:10px;cursor:pointer;font-weight:600;font-size:12px;font-family:'Inter',sans-serif;
                        ${this.activeTab === 'ringkasan' ? 'background:var(--bg-secondary);color:var(--text-primary);box-shadow:var(--shadow-sm);' : 'background:transparent;color:var(--text-tertiary);'}">
                        <i data-lucide="pie-chart" width="14" height="14"></i> Ringkasan
                    </button>
                    <button class="invest-tab ${this.activeTab === 'transaksi' ? 'active' : ''}" data-tab="transaksi"
                        style="flex:1;padding:10px;border:none;border-radius:10px;cursor:pointer;font-weight:600;font-size:12px;font-family:'Inter',sans-serif;
                        ${this.activeTab === 'transaksi' ? 'background:var(--bg-secondary);color:var(--text-primary);box-shadow:var(--shadow-sm);' : 'background:transparent;color:var(--text-tertiary);'}">
                        <i data-lucide="list" width="14" height="14"></i> Transaksi
                    </button>
                    <button class="invest-tab ${this.activeTab === 'target' ? 'active' : ''}" data-tab="target"
                        style="flex:1;padding:10px;border:none;border-radius:10px;cursor:pointer;font-weight:600;font-size:12px;font-family:'Inter',sans-serif;
                        ${this.activeTab === 'target' ? 'background:var(--bg-secondary);color:var(--text-primary);box-shadow:var(--shadow-sm);' : 'background:transparent;color:var(--text-tertiary);'}">
                        <i data-lucide="target" width="14" height="14"></i> Target
                    </button>
                </div>
                
                <div id="invest-content">
                    ${this.activeTab === 'ringkasan' ? this.renderRingkasan() : ''}
                    ${this.activeTab === 'transaksi' ? this.renderTransaksi() : ''}
                    ${this.activeTab === 'target' ? this.renderTarget() : ''}
                </div>
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindTabEvents();
        
        if (this.activeTab === 'ringkasan') setTimeout(() => this.renderCharts(), 150);
        if (this.activeTab === 'transaksi') this.bindTransaksiEvents();
        if (this.activeTab === 'target') this.bindTargetEvents();
        
        setTimeout(() => lucide.createIcons(), 50);
    },
    
    // ==================== RINGKASAN ====================
    renderRingkasan() {
        const totalPortfolio = Storage.getTotalPortfolio();
        const monthlyData = Storage.getMonthlyTransactions(6);
        const portfolioByCat = Storage.getPortfolioByCategory();
        const categories = Storage.getInvestCategories();
        const targets = Storage.getTargets();
        
        const maxMonthly = Math.max(...monthlyData.map(m => m.total), 10000);
        
        return `
            <!-- Total Portfolio -->
            <div class="card glass" style="text-align:center;padding:20px;margin-bottom:14px;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" stroke-width="1.5" style="margin-bottom:8px;">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                <p style="font-size:10px;color:var(--text-tertiary);font-weight:600;text-transform:uppercase;">Total Portfolio</p>
                <p style="font-size:30px;font-weight:900;color:var(--accent-light);">Rp ${totalPortfolio.toLocaleString('id-ID')}</p>
                <p style="font-size:10px;color:var(--text-tertiary);">${monthlyData.reduce((s, m) => s + m.count, 0)} transaksi</p>
            </div>
            
            <!-- Grafik Perkembangan -->
            <div class="card glass" style="padding:16px;margin-bottom:14px;">
                <h3 style="font-size:12px;font-weight:700;color:var(--text-secondary);margin-bottom:12px;">
                    <i data-lucide="chart-line" width="14" height="14"></i> Perkembangan
                </h3>
                <div style="display:flex;align-items:flex-end;gap:6px;height:100px;">
                    ${monthlyData.map((m, i) => {
                        const h = (m.total / maxMonthly) * 90;
                        const isLatest = i === monthlyData.length - 1;
                        return `
                            <div style="flex:1;text-align:center;">
                                <div style="height:90px;display:flex;align-items:flex-end;justify-content:center;">
                                    <div style="width:100%;max-width:28px;height:${Math.max(h, 2)}px;
                                        background:${isLatest ? 'var(--gradient-1)' : 'var(--bg-tertiary)'};
                                        border-radius:4px 4px 0 0;transition:height 0.3s;">
                                    </div>
                                </div>
                                <div style="font-size:8px;color:var(--text-tertiary);margin-top:4px;">${m.label}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <!-- Alokasi Portofolio -->
            ${Object.keys(portfolioByCat).length > 0 ? `
            <div class="card glass" style="padding:16px;margin-bottom:14px;text-align:center;">
                <h3 style="font-size:12px;font-weight:700;color:var(--text-secondary);margin-bottom:10px;text-align:left;">
                    <i data-lucide="chart-pie" width="14" height="14"></i> Alokasi Portofolio
                </h3>
                <div style="width:160px;height:160px;margin:0 auto;">
                    <canvas id="invest-pie-chart" width="160" height="160"></canvas>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:10px;">
                    ${Object.entries(portfolioByCat).map(([cat, amount]) => {
                        const catObj = categories.find(c => c.name === cat || c.id === cat);
                        const pct = totalPortfolio > 0 ? ((amount / totalPortfolio) * 100).toFixed(1) : 0;
                        return `
                            <span style="font-size:9px;display:flex;align-items:center;gap:4px;">
                                <span style="width:8px;height:8px;border-radius:2px;background:${catObj?.color || '#666'};"></span>
                                ${catObj?.icon || '💰'} ${cat} ${pct}%
                            </span>
                        `;
                    }).join('')}
                </div>
            </div>
            ` : ''}
            
            <!-- Target Aktif -->
            ${targets.length > 0 ? `
            <div class="card glass" style="padding:16px;">
                <h3 style="font-size:12px;font-weight:700;color:var(--text-secondary);margin-bottom:10px;display:flex;align-items:center;gap:6px;">
                    <i data-lucide="target" width="14" height="14"></i> Target Aktif
                </h3>
                ${targets.map(t => {
                    const progress = Storage.getTargetProgress(t.id);
                    const pct = t.targetAmount > 0 ? Math.round((progress / t.targetAmount) * 100) : 0;
                    return `
                        <div style="margin-bottom:12px;">
                            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                                <span>${t.icon || '🎯'} ${this.escape(t.title)}</span>
                                <span style="font-size:11px;font-weight:700;">Rp ${App.formatAmount(progress)} / Rp ${App.formatAmount(t.targetAmount)}</span>
                            </div>
                            <div style="height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
                                <div style="width:${pct}%;height:100%;background:${t.color || 'var(--gradient-1)'};border-radius:3px;"></div>
                            </div>
                            <div style="font-size:9px;color:var(--text-tertiary);text-align:right;margin-top:2px;">${pct}%</div>
                        </div>
                    `;
                }).join('')}
            </div>
            ` : ''}
        `;
    },
    
    renderCharts() {
        setTimeout(() => {
            const canvas = document.getElementById('invest-pie-chart');
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            const portfolioByCat = Storage.getPortfolioByCategory();
            const categories = Storage.getInvestCategories();
            const total = Storage.getTotalPortfolio();
            
            const entries = Object.entries(portfolioByCat);
            if (entries.length === 0) return;
            
            ctx.clearRect(0, 0, 160, 160);
            
            let startAngle = -Math.PI / 2;
            
            entries.forEach(([cat, amount]) => {
                const catObj = categories.find(c => c.name === cat || c.id === cat);
                const sliceAngle = (amount / total) * 2 * Math.PI;
                
                ctx.beginPath();
                ctx.moveTo(80, 80);
                ctx.arc(80, 80, 60, startAngle, startAngle + sliceAngle);
                ctx.closePath();
                ctx.fillStyle = catObj?.color || '#666';
                ctx.fill();
                
                // Label
                const midAngle = startAngle + sliceAngle / 2;
                const pct = Math.round((amount / total) * 100);
                if (pct > 10) {
                    const lx = 80 + Math.cos(midAngle) * 38;
                    const ly = 80 + Math.sin(midAngle) * 38;
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 10px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(pct + '%', lx, ly);
                }
                
                startAngle += sliceAngle;
            });
            
            // Center
            ctx.beginPath();
            ctx.arc(80, 80, 35, 0, 2 * Math.PI);
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim();
            ctx.fill();
            
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
            ctx.font = 'bold 13px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Rp ' + App.formatAmount(total), 80, 80);
        }, 200);
    },
    
    // ==================== TRANSAKSI ====================
    renderTransaksi() {
        const transactions = Storage.getTransactions();
        const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
        const total = Storage.getTotalPortfolio();
        const categories = Storage.getInvestCategories();
        const targets = Storage.getTargets();
        
        return `
            <div class="stat-card" style="margin-bottom:12px;padding:16px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                    <div style="width:36px;height:36px;border-radius:10px;background:rgba(59,130,246,0.15);display:flex;align-items:center;justify-content:center;">
                        <i data-lucide="wallet" width="18" height="18" style="color:var(--accent-light);"></i>
                    </div>
                    <span style="font-size:11px;color:var(--text-tertiary);font-weight:600;">TOTAL DISETOR</span>
                </div>
                <div class="stat-value" style="font-size:24px;">Rp ${total.toLocaleString('id-ID')}</div>
            </div>
            
            <div id="trans-list">
                ${sorted.length === 0 ? `
                    <div class="empty">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="1.5">
                            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
                        </svg>
                        <p style="margin-top:8px;">Belum ada transaksi</p>
                    </div>
                ` : sorted.map(t => this.renderTransItem(t, categories, targets)).join('')}
            </div>
            
            <button class="btn-add" id="btn-add-trans" style="margin-top:8px;">
                <i data-lucide="plus" width="16" height="16"></i> Tambah Setor
            </button>
        `;
    },
    
    renderTransItem(trans, categories, targets) {
        const cat = categories.find(c => c.name === trans.category || c.id === trans.category);
        const target = targets.find(t => t.id === trans.targetId);
        const dateStr = App.formatDate(trans.date);
        
        return `
            <div class="list-item" data-trans-id="${trans.id}">
                <div style="font-size:22px;">${cat?.icon || '💰'}</div>
                <div class="list-info">
                    <div class="list-title">${this.escape(trans.platform)} • ${this.escape(trans.category)}</div>
                    <div class="list-subtitle">
                        ${dateStr}
                        ${target ? ' • 🎯 ' + this.escape(target.title) : ''}
                        ${trans.note ? ' • ' + this.escape(trans.note) : ''}
                    </div>
                </div>
                <div style="font-size:14px;font-weight:700;color:#22C55E;">+Rp ${trans.amount.toLocaleString('id-ID')}</div>
                <button class="list-delete trans-delete">
                    <i data-lucide="trash-2" width="14" height="14"></i>
                </button>
            </div>
        `;
    },
    
    bindTransaksiEvents() {
        document.getElementById('btn-add-trans')?.addEventListener('click', () => this.openTransModal());
        
        document.querySelectorAll('#trans-list .list-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.trans-delete')) return;
                this.openTransModal(item.dataset.transId);
            });
            
            item.querySelector('.trans-delete')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Hapus transaksi?')) {
                    Storage.deleteTransaction(item.dataset.transId);
                    this.refresh();
                    App.toast('🗑️ Transaksi dihapus');
                }
            });
        });
    },
    
    openTransModal(id = null) {
        const transactions = Storage.getTransactions();
        const existing = id ? transactions.find(t => t.id === id) : null;
        const categories = Storage.getInvestCategories();
        const targets = Storage.getTargets();
        
        const platform = prompt('🏦 Platform (Bibit, Ajaib, dll):', existing?.platform || '');
        if (!platform || !platform.trim()) return;
        
        const amountStr = prompt('💵 Jumlah setor (Rp):', existing?.amount || '');
        if (!amountStr) return;
        const amount = parseInt(amountStr.replace(/\D/g, ''));
        if (!amount || amount <= 0) return;
        
        // Pilih kategori
        const catNames = categories.map(c => c.name).join(', ');
        const category = prompt('📊 Kategori (' + catNames + '):', existing?.category || categories[0]?.name || 'Lainnya');
        if (!category) return;
        
        // Pilih target (opsional)
        let targetId = null;
        if (targets.length > 0) {
            const targetList = targets.map((t, i) => (i+1) + '. ' + t.icon + ' ' + t.title).join('\n');
            const targetChoice = prompt('🎯 Target (0 = tidak ada):\n' + targetList, existing?.targetId ? (targets.findIndex(t => t.id === existing.targetId) + 1).toString() : '0');
            if (targetChoice && targetChoice !== '0') {
                const idx = parseInt(targetChoice) - 1;
                if (targets[idx]) targetId = targets[idx].id;
            }
        }
        
        const note = prompt('📝 Catatan (opsional):', existing?.note || '') || '';
        const dateStr = prompt('📅 Tanggal (YYYY-MM-DD):', existing?.date || new Date().toISOString().split('T')[0]);
        if (!dateStr) return;
        
        const data = {
            platform: platform.trim(),
            amount,
            category: category.trim(),
            targetId,
            note: note.trim(),
            date: dateStr
        };
        
        if (id) {
            Storage.updateTransaction(id, data);
            App.toast('✅ Transaksi diupdate!');
        } else {
            Storage.addTransaction(data);
            App.toast('✅ Setor dicatat!');
        }
        
        this.refresh();
    },
    
    // ==================== TARGET ====================
    renderTarget() {
        const targets = Storage.getTargets();
        
        return `
            <div id="target-list">
                ${targets.length === 0 ? `
                    <div class="empty">
                        <i data-lucide="target" width="36" height="36" style="color:var(--text-tertiary);"></i>
                        <p style="margin-top:8px;">Belum ada target</p>
                        <p style="font-size:10px;">Buat target investasimu</p>
                    </div>
                ` : targets.map(t => {
                    const progress = Storage.getTargetProgress(t.id);
                    const pct = t.targetAmount > 0 ? Math.round((progress / t.targetAmount) * 100) : 0;
                    const deadline = t.deadline ? new Date(t.deadline) : null;
                    const deadlineStr = deadline ? deadline.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }) : 'Tanpa deadline';
                    const daysLeft = deadline ? Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24)) : null;
                    
                    return `
                        <div class="card glass" style="padding:16px;margin-bottom:10px;" data-target-id="${t.id}">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                                <span style="font-weight:700;font-size:14px;">${t.icon || '🎯'} ${this.escape(t.title)}</span>
                                <span style="font-size:12px;font-weight:800;color:${pct >= 100 ? '#22C55E' : 'var(--accent-light)'};">${pct}%</span>
                            </div>
                            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                                <span style="font-size:11px;color:var(--text-secondary);">Rp ${progress.toLocaleString('id-ID')} / Rp ${t.targetAmount.toLocaleString('id-ID')}</span>
                            </div>
                            <div style="height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;margin-bottom:6px;">
                                <div style="width:${Math.min(pct, 100)}%;height:100%;background:${t.color || 'var(--gradient-1)'};border-radius:4px;transition:width 0.5s;"></div>
                            </div>
                            <div style="display:flex;justify-content:space-between;align-items:center;font-size:9px;color:var(--text-tertiary);">
                                <span>${deadlineStr}</span>
                                ${daysLeft !== null ? `<span style="color:${daysLeft < 30 ? '#EF4444' : 'var(--text-tertiary)'};">${daysLeft} hari lagi</span>` : ''}
                            </div>
                            <div style="display:flex;gap:4px;margin-top:8px;">
                                <button class="btn btn-secondary target-edit-btn" style="flex:1;font-size:10px;padding:6px;">
                                    <i data-lucide="edit-3" width="12" height="12"></i> Edit
                                </button>
                                <button class="btn btn-danger target-delete-btn" style="flex:0.5;font-size:10px;padding:6px;">
                                    <i data-lucide="trash-2" width="12" height="12"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <button class="btn-add" id="btn-add-target" style="margin-top:8px;">
                <i data-lucide="plus" width="16" height="16"></i> Tambah Target
            </button>
        `;
    },
    
    bindTargetEvents() {
        document.getElementById('btn-add-target')?.addEventListener('click', () => this.openTargetModal());
        
        document.querySelectorAll('#target-list .card').forEach(card => {
            const id = card.dataset.targetId;
            
            card.querySelector('.target-edit-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openTargetModal(id);
            });
            
            card.querySelector('.target-delete-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Hapus target ini?')) {
                    Storage.deleteTarget(id);
                    this.refresh();
                    App.toast('🗑️ Target dihapus');
                }
            });
        });
    },
    
    openTargetModal(id = null) {
        const targets = Storage.getTargets();
        const existing = id ? targets.find(t => t.id === id) : null;
        
        const title = prompt('🎯 Nama target:', existing?.title || '');
        if (!title || !title.trim()) return;
        
        const targetStr = prompt('💵 Target jumlah (Rp):', existing?.targetAmount || '');
        if (!targetStr) return;
        const targetAmount = parseInt(targetStr.replace(/\D/g, ''));
        if (!targetAmount || targetAmount <= 0) return;
        
        const icon = prompt('🖼️ Icon (emoji):', existing?.icon || '🎯') || '🎯';
        const color = prompt('🎨 Warna (hex):', existing?.color || '#3B82F6') || '#3B82F6';
        const deadline = prompt('📅 Deadline (YYYY-MM-DD, kosongkan kalau tidak ada):', existing?.deadline || '') || '';
        
        const data = {
            title: title.trim(),
            targetAmount,
            icon,
            color,
            deadline: deadline || null
        };
        
        if (id) {
            Storage.updateTarget(id, data);
            App.toast('✅ Target diupdate!');
        } else {
            Storage.addTarget(data);
            App.toast('✅ Target dibuat!');
        }
        
        this.refresh();
    },
    
    // ==================== HELPERS ====================
    bindTabEvents() {
        document.querySelectorAll('.invest-tab').forEach(tab => {
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
