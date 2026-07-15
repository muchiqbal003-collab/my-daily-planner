// ============================================
// invest.js - Portfolio Investasi V1.0
// ============================================

const Invest = {
    editingId: null,
    
    render(container) {
        const investments = Storage.getInvestments();
        const stats = Storage.getTotalInvestment();
        
        const html = `
            <div style="padding:4px 0;">
                
                <!-- Total Portfolio Card -->
                <div class="card glass" style="text-align:center;padding:20px;margin-bottom:14px;">
                    <div style="margin-bottom:8px;">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                        </svg>
                    </div>
                    <p style="font-size:10px;color:var(--text-tertiary);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Total Portfolio</p>
                    <p style="font-size:28px;font-weight:900;letter-spacing:-0.03em;color:var(--accent-light);">
                        Rp ${stats.totalCurrent.toLocaleString('id-ID')}
                    </p>
                </div>
                
                <!-- Profit/Loss Cards -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
                    <div class="card glass" style="padding:14px;text-align:center;">
                        <i data-lucide="arrow-down-to-line" width="20" height="20" style="color:var(--text-secondary);margin-bottom:4px;"></i>
                        <p style="font-size:9px;color:var(--text-tertiary);font-weight:600;">Total Disetor</p>
                        <p style="font-size:16px;font-weight:800;">Rp ${App.formatAmount(stats.totalInvested)}</p>
                    </div>
                    <div class="card glass" style="padding:14px;text-align:center;">
                        <i data-lucide="${stats.profit >= 0 ? 'trending-up' : 'trending-down'}" width="20" height="20" 
                           style="color:${stats.profit >= 0 ? '#22C55E' : '#EF4444'};margin-bottom:4px;"></i>
                        <p style="font-size:9px;color:var(--text-tertiary);font-weight:600;">Profit / Loss</p>
                        <p style="font-size:16px;font-weight:800;color:${stats.profit >= 0 ? '#22C55E' : '#EF4444'};">
                            ${stats.profit >= 0 ? '+' : ''}Rp ${App.formatAmount(Math.abs(stats.profit))}
                        </p>
                        <p style="font-size:10px;color:${stats.profit >= 0 ? '#22C55E' : '#EF4444'};">
                            (${stats.profitPct.toFixed(1)}%)
                        </p>
                    </div>
                </div>
                
                ${investments.length > 0 ? `
                <!-- Donut Chart Alokasi -->
                <div class="card glass" style="padding:16px;margin-bottom:14px;text-align:center;">
                    <h3 style="font-size:12px;font-weight:700;color:var(--text-secondary);margin-bottom:10px;text-align:left;">
                        <i data-lucide="chart-pie" width="14" height="14"></i> Alokasi Portfolio
                    </h3>
                    <div style="width:160px;height:160px;margin:0 auto;" id="invest-chart-container">
                        <canvas id="invest-donut-chart" width="160" height="160"></canvas>
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:10px;" id="invest-legend">
                        ${investments.map((inv, i) => {
                            const colors = ['#3B82F6','#8B5CF6','#22C55E','#F59E0B','#EF4444','#EC4899','#06B6D4','#F97316'];
                            const pct = stats.totalCurrent > 0 ? ((inv.currentValue || inv.amount) / stats.totalCurrent * 100).toFixed(1) : 0;
                            return `
                                <span style="font-size:9px;display:flex;align-items:center;gap:4px;">
                                    <span style="width:8px;height:8px;border-radius:2px;background:${colors[i % colors.length]};"></span>
                                    ${this.escape(inv.platform)} ${pct}%
                                </span>
                            `;
                        }).join('')}
                    </div>
                </div>
                ` : ''}
                
                <!-- Investment List -->
                <div class="section-header">
                    <h2><i data-lucide="briefcase" width="18" height="18"></i> Portfolio Saya</h2>
                    <span class="badge">${investments.length}</span>
                </div>
                
                <div id="invest-list">
                    ${investments.length === 0 ? `
                        <div class="empty">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="1.5" stroke-linecap="round">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
                            </svg>
                            <p style="margin-top:8px;">Belum ada investasi</p>
                            <p style="font-size:10px;">Tambahkan platform investasimu</p>
                        </div>
                    ` : investments.map(inv => this.renderInvestItem(inv)).join('')}
                </div>
                
                <button class="btn-add" id="btn-add-invest" style="margin-top:8px;">
                    <i data-lucide="plus" width="16" height="16"></i> Tambah Investasi
                </button>
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindEvents();
        setTimeout(() => {
            lucide.createIcons();
            if (investments.length > 0) this.renderDonutChart(investments);
        }, 100);
    },
    
    renderInvestItem(investment) {
        const profit = (investment.currentValue || investment.amount) - investment.amount;
        const profitPct = investment.amount > 0 ? (profit / investment.amount * 100).toFixed(1) : 0;
        const isPositive = profit >= 0;
        const colors = ['#3B82F6','#8B5CF6','#22C55E','#F59E0B','#EF4444','#EC4899','#06B6D4','#F97316'];
        const colorIndex = Storage.getInvestments().findIndex(inv => inv.id === investment.id) % colors.length;
        
        return `
            <div class="list-item" data-invest-id="${investment.id}" style="flex-direction:column;align-items:stretch;cursor:pointer;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <div style="width:10px;height:10px;border-radius:50%;background:${colors[colorIndex]};"></div>
                        <span style="font-weight:700;font-size:13px;">${this.escape(investment.platform)}</span>
                    </div>
                    <span style="font-size:12px;font-weight:700;color:${isPositive ? '#22C55E' : '#EF4444'};">
                        ${isPositive ? '+' : ''}${profitPct}%
                    </span>
                </div>
                
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                    <span style="font-size:10px;color:var(--text-tertiary);">Disetor: Rp ${(investment.amount || 0).toLocaleString('id-ID')}</span>
                    <span style="font-size:10px;color:var(--text-tertiary);">Sekarang: Rp ${(investment.currentValue || investment.amount || 0).toLocaleString('id-ID')}</span>
                </div>
                
                <div style="height:5px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
                    <div style="width:${Math.min(((investment.currentValue || investment.amount) / (investment.amount || 1)) * 50, 100)}%;height:100%;
                        background:${isPositive ? '#22C55E' : '#EF4444'};border-radius:3px;"></div>
                </div>
                
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
                    <span style="font-size:9px;color:var(--text-tertiary);">
                        ${investment.note ? this.escape(investment.note) : 'No notes'}
                    </span>
                    <div style="display:flex;gap:4px;">
                        <button class="list-delete invest-update-btn" style="width:24px;height:24px;" title="Update Nilai">
                            <i data-lucide="edit-3" width="12" height="12"></i>
                        </button>
                        <button class="list-delete invest-delete-btn" style="width:24px;height:24px;" title="Hapus">
                            <i data-lucide="trash-2" width="12" height="12"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    renderDonutChart(investments) {
        setTimeout(() => {
            const canvas = document.getElementById('invest-donut-chart');
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            const stats = Storage.getTotalInvestment();
            const colors = ['#3B82F6','#8B5CF6','#22C55E','#F59E0B','#EF4444','#EC4899','#06B6D4','#F97316'];
            
            ctx.clearRect(0, 0, 160, 160);
            
            let startAngle = -Math.PI / 2;
            const total = stats.totalCurrent || 1;
            
            investments.forEach((inv, i) => {
                const value = inv.currentValue || inv.amount || 0;
                const sliceAngle = (value / total) * 2 * Math.PI;
                
                if (sliceAngle > 0) {
                    ctx.beginPath();
                    ctx.moveTo(80, 80);
                    ctx.arc(80, 80, 60, startAngle, startAngle + sliceAngle);
                    ctx.closePath();
                    ctx.fillStyle = colors[i % colors.length];
                    ctx.fill();
                    
                    // Label inside slice
                    const midAngle = startAngle + sliceAngle / 2;
                    const labelX = 80 + Math.cos(midAngle) * 38;
                    const labelY = 80 + Math.sin(midAngle) * 38;
                    
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 10px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const pct = ((value / total) * 100).toFixed(0);
                    if (parseInt(pct) > 8) {
                        ctx.fillText(pct + '%', labelX, labelY);
                    }
                    
                    startAngle += sliceAngle;
                }
            });
            
            // Center hole
            ctx.beginPath();
            ctx.arc(80, 80, 35, 0, 2 * Math.PI);
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim();
            ctx.fill();
            
            // Center text
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Rp ' + App.formatAmount(total), 80, 80);
        }, 150);
    },
    
    bindEvents() {
        document.getElementById('btn-add-invest')?.addEventListener('click', () => this.openModal());
        
        document.querySelectorAll('#invest-list .list-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.invest-update-btn') || e.target.closest('.invest-delete-btn')) return;
                this.openModal(item.dataset.investId);
            });
            
            item.querySelector('.invest-update-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.updateValue(item.dataset.investId);
            });
            
            item.querySelector('.invest-delete-btn')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Hapus investasi ini?')) {
                    Storage.deleteInvestment(item.dataset.investId);
                    this.refresh();
                    App.toast('🗑️ Investasi dihapus');
                }
            });
        });
    },
    
    openModal(id = null) {
        this.editingId = id;
        const investments = Storage.getInvestments();
        const existing = id ? investments.find(inv => inv.id === id) : null;
        
        const platform = prompt('🏦 Nama platform (Bibit, Ajaib, dll):', existing?.platform || '');
        if (!platform || !platform.trim()) return;
        
        const amountStr = prompt('💵 Jumlah disetor (Rp):', existing?.amount || '');
        if (!amountStr) return;
        const amount = parseInt(amountStr.replace(/\D/g, ''));
        if (!amount || amount <= 0) return;
        
        const currentStr = prompt('📊 Nilai sekarang (Rp):', existing?.currentValue || amount || '');
        const currentValue = parseInt(currentStr.replace(/\D/g, '')) || amount;
        
        const note = prompt('📝 Catatan (opsional):', existing?.note || '') || '';
        
        const data = {
            platform: platform.trim(),
            amount: amount,
            currentValue: currentValue,
            note: note.trim()
        };
        
        if (id) {
            Storage.updateInvestment(id, data);
            App.toast('✅ Investasi diupdate!');
        } else {
            Storage.addInvestment(data);
            App.toast('✅ Investasi ditambahkan!');
        }
        
        this.refresh();
    },
    
    updateValue(id) {
        const investments = Storage.getInvestments();
        const inv = investments.find(i => i.id === id);
        if (!inv) return;
        
        const newValue = prompt('📊 Update nilai sekarang (Rp):', inv.currentValue || inv.amount || '');
        if (!newValue) return;
        const value = parseInt(newValue.replace(/\D/g, ''));
        if (!value || value <= 0) return;
        
        Storage.updateInvestment(id, { currentValue: value });
        this.refresh();
        App.toast('✅ Nilai diupdate!');
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
