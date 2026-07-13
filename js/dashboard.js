// ============================================
// dashboard.js - Home Dashboard (SVG Icons)
// ============================================

const Dashboard = {
    
    render(container) {
        const stats = Storage.getStats();
        const profile = Storage.getProfile();
        const today = new Date();
        
        const greeting = this.getGreeting();
        const userName = profile.name || 'Kamu';
        const dateStr = today.toLocaleDateString('id-ID', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        
        const html = `
            <div style="padding: 4px 0;">
                
                <!-- Greeting -->
                <div style="margin-bottom: 24px; padding: 4px 4px 0;">
                    <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-tertiary);margin-bottom:6px;">
                        ${dateStr}
                    </p>
                    <h2 style="font-size:32px;font-weight:900;letter-spacing:-0.04em;line-height:1.15;">
                        ${greeting},<br>
                        <span style="background:var(--gradient-1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
                            ${this.escapeHTML(userName)}
                        </span>
                    </h2>
                </div>
                
                <!-- Stats Grid 2x2 -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
                    
                    <!-- Card 1: Tugas Hari Ini -->
                    <div class="stat-card" onclick="App.switchTab('tasks')" style="cursor:pointer;">
                        <div style="margin-bottom:10px;">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 11l3 3L22 4"/>
                                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                            </svg>
                        </div>
                        <div class="stat-value">${stats.tasksToday}</div>
                        <div class="stat-label">Tugas Hari Ini</div>
                    </div>
                    
                    <!-- Card 2: Selesai -->
                    <div class="stat-card">
                        <div style="margin-bottom:10px;">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="16 10 11 15 8 12"/>
                            </svg>
                        </div>
                        <div class="stat-value green">${stats.tasksCompletedToday}</div>
                        <div class="stat-label">Selesai Hari Ini</div>
                    </div>
                    
                    <!-- Card 3: Pending -->
                    <div class="stat-card">
                        <div style="margin-bottom:10px;">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                        </div>
                        <div class="stat-value amber">${stats.tasksPending}</div>
                        <div class="stat-label">Belum Selesai</div>
                    </div>
                    
                    <!-- Card 4: Pengeluaran -->
                    <div class="stat-card" onclick="App.switchTab('finance')" style="cursor:pointer;">
                        <div style="margin-bottom:10px;">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="1" x2="12" y2="23"/>
                                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                            </svg>
                        </div>
                        <div class="stat-value" style="color:var(--danger);background:none;-webkit-text-fill-color:var(--danger);">
                            Rp ${this.formatAmount(stats.expenseToday)}
                        </div>
                        <div class="stat-label">Pengeluaran Hari Ini</div>
                    </div>
                    
                </div>
                
                <!-- Month Summary Card -->
                <div class="card glass" style="margin-bottom:16px;padding:18px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
                        <h3 style="font-size:13px;font-weight:700;color:var(--text-secondary);letter-spacing:-0.01em;display:flex;align-items:center;gap:8px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            Ringkasan Bulan Ini
                        </h3>
                        <span style="font-size:10px;color:var(--text-tertiary);font-weight:600;">
                            ${today.toLocaleDateString('id-ID', { month:'long', year:'numeric' })}
                        </span>
                    </div>
                    <div style="display:flex;align-items:center;gap:16px;">
                        <div style="flex:1;text-align:center;">
                            <div class="summary-label">Total Pengeluaran</div>
                            <div class="summary-value" style="color:var(--danger);">
                                Rp ${this.formatAmount(stats.expenseMonth)}
                            </div>
                        </div>
                        <div style="width:1px;height:40px;background:var(--border);"></div>
                        <div style="flex:1;text-align:center;">
                            <div class="summary-label">Total Tugas</div>
                            <div class="summary-value">${stats.totalTasks}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                    <button class="card" style="text-align:center;cursor:pointer;border:none;padding:20px 16px;transition:all 0.2s;"
                            onclick="App.switchTab('tasks'); setTimeout(() => Tasks.openModal(), 300);">
                        <div style="margin-bottom:8px;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" stroke-width="1.8" stroke-linecap="round">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="16"/>
                                <line x1="8" y1="12" x2="16" y2="12"/>
                            </svg>
                        </div>
                        <div style="font-size:12px;font-weight:700;color:var(--text-secondary);">Tambah Tugas</div>
                    </button>
                    <button class="card" style="text-align:center;cursor:pointer;border:none;padding:20px 16px;transition:all 0.2s;"
                            onclick="App.switchTab('finance'); setTimeout(() => Finance.openModal(), 300);">
                        <div style="margin-bottom:8px;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" stroke-width="1.8" stroke-linecap="round">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                                <line x1="1" y1="10" x2="23" y2="10"/>
                            </svg>
                        </div>
                        <div style="font-size:12px;font-weight:700;color:var(--text-secondary);">Catat Pengeluaran</div>
                    </button>
                </div>
                
            </div>
        `;
        
        container.innerHTML = html;
    },
    
    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 11) return 'Selamat Pagi';
        if (hour < 15) return 'Selamat Siang';
        if (hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
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
