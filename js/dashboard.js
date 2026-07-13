// ============================================
// dashboard.js - Home Dashboard
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
                <div style="margin-bottom: 20px; padding: 4px 4px 0;">
                    <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-tertiary);margin-bottom:4px;">
                        ${dateStr}
                    </p>
                    <h2 style="font-size:28px;font-weight:900;letter-spacing:-0.04em;line-height:1.2;">
                        ${greeting},<br>
                        <span style="background:var(--gradient-1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
                            ${this.escapeHTML(userName)}
                        </span> 👋
                    </h2>
                </div>
                
                <!-- Stats Grid -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
                    <div class="stat-card" onclick="App.switchTab('tasks')" style="cursor:pointer;">
                        <div class="stat-icon">📋</div>
                        <div class="stat-value">${stats.tasksToday}</div>
                        <div class="stat-label">Tugas Hari Ini</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">✅</div>
                        <div class="stat-value green">${stats.tasksCompletedToday}</div>
                        <div class="stat-label">Selesai Hari Ini</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⏳</div>
                        <div class="stat-value amber">${stats.tasksPending}</div>
                        <div class="stat-label">Belum Selesai</div>
                    </div>
                    <div class="stat-card" onclick="App.switchTab('finance')" style="cursor:pointer;">
                        <div class="stat-icon">💰</div>
                        <div class="stat-value" style="color:var(--danger);background:none;-webkit-text-fill-color:var(--danger);">
                            Rp ${this.formatAmount(stats.expenseToday)}
                        </div>
                        <div class="stat-label">Pengeluaran Hari Ini</div>
                    </div>
                </div>
                
                <!-- Month Summary Card -->
                <div class="card glass" style="margin-bottom:16px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                        <h3 style="font-size:13px;font-weight:700;color:var(--text-secondary);letter-spacing:-0.01em;">
                            📊 Ringkasan Bulan Ini
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
                    <button class="card" style="text-align:center;cursor:pointer;border:none;padding:20px 16px;"
                            onclick="App.switchTab('tasks'); setTimeout(() => Tasks.openModal(), 300);">
                        <div style="font-size:32px;margin-bottom:8px;">➕</div>
                        <div style="font-size:12px;font-weight:700;color:var(--text-secondary);">Tambah Tugas</div>
                    </button>
                    <button class="card" style="text-align:center;cursor:pointer;border:none;padding:20px 16px;"
                            onclick="App.switchTab('finance'); setTimeout(() => Finance.openModal(), 300);">
                        <div style="font-size:32px;margin-bottom:8px;">💸</div>
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