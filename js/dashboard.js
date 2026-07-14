// ============================================
// dashboard.js - Home Dashboard V3.0
// ============================================

const Dashboard = {
    
    render(container) {
        const stats = Storage.getStats();
        const profile = Storage.getProfile();
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        const habits = Storage.getHabits();
        const schedules = Storage.getSchedules().filter(s => s.date === todayStr);
        const todayJournal = Storage.getTodayJournal();
        const todayMood = Storage.getTodayMood();
        
        const greeting = this.getGreeting();
        const userName = profile.name || 'Kamu';
        const dateStr = today.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
        
        const html = `
            <div style="padding:4px 0;">
                
                <!-- Greeting -->
                <div style="margin-bottom:20px;padding:0 4px;">
                    <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-tertiary);">${dateStr}</p>
                    <h2 style="font-size:26px;font-weight:900;letter-spacing:-0.04em;line-height:1.2;">
                        ${greeting},<br>
                        <span style="background:var(--gradient-1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${this.escape(userName)}</span>
                    </h2>
                </div>
                
                <!-- Stats Grid -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
                    <div class="stat-card" onclick="App.navigateTo('tasks')">
                        <i data-lucide="check-square" width="22" height="22" style="color:var(--accent-light);margin-bottom:6px;"></i>
                        <div class="stat-value">${stats.tasksToday}</div>
                        <div class="stat-label">Tugas Hari Ini</div>
                    </div>
                    <div class="stat-card" onclick="App.navigateTo('habits')">
                        <i data-lucide="flame" width="22" height="22" style="color:#F59E0B;margin-bottom:6px;"></i>
                        <div class="stat-value amber">${stats.habitRate}%</div>
                        <div class="stat-label">Habit Selesai</div>
                    </div>
                    <div class="stat-card" onclick="App.navigateTo('focus')">
                        <i data-lucide="timer" width="22" height="22" style="color:#22C55E;margin-bottom:6px;"></i>
                        <div class="stat-value green">${stats.focusThisWeek}</div>
                        <div class="stat-label">Fokus Minggu Ini</div>
                    </div>
                    <div class="stat-card" onclick="App.navigateTo('finance')">
                        <i data-lucide="wallet" width="22" height="22" style="color:#EF4444;margin-bottom:6px;"></i>
                        <div class="stat-value red">Rp ${App.formatAmount(stats.expenseToday)}</div>
                        <div class="stat-label">Pengeluaran Hari Ini</div>
                    </div>
                </div>
                
                <!-- Today Schedule -->
                ${schedules.length > 0 ? `
                <div class="card glass" style="margin-bottom:10px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                        <h3 style="font-size:12px;font-weight:700;color:var(--text-secondary);display:flex;align-items:center;gap:6px;">
                            <i data-lucide="calendar-clock" width="16" height="16"></i> Jadwal Hari Ini
                        </h3>
                        <span style="font-size:10px;color:var(--text-tertiary);cursor:pointer;" onclick="App.navigateTo('schedule')">Lihat →</span>
                    </div>
                    ${schedules.slice(0, 3).map(s => `
                        <div style="display:flex;align-items:center;gap:10px;padding:6px 0;font-size:12px;">
                            <span style="color:var(--accent-light);font-weight:600;min-width:70px;">${s.time}</span>
                            <span>${this.escape(s.title)}</span>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                <!-- Quick Actions -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <button class="card" style="text-align:center;cursor:pointer;border:none;padding:16px;"
                            onclick="App.navigateTo('tasks'); setTimeout(() => Tasks.openModal(), 200);">
                        <i data-lucide="plus-circle" width="28" height="28" style="color:var(--accent-light);margin-bottom:6px;"></i>
                        <div style="font-size:11px;font-weight:700;color:var(--text-secondary);">Tambah Tugas</div>
                    </button>
                    <button class="card" style="text-align:center;cursor:pointer;border:none;padding:16px;"
                            onclick="App.navigateTo('finance'); setTimeout(() => Finance.openModal(), 200);">
                        <i data-lucide="plus-square" width="28" height="28" style="color:var(--accent-light);margin-bottom:6px;"></i>
                        <div style="font-size:11px;font-weight:700;color:var(--text-secondary);">Catat Pengeluaran</div>
                    </button>
                    <button class="card" style="text-align:center;cursor:pointer;border:none;padding:16px;"
                            onclick="App.navigateTo('focus')">
                        <i data-lucide="play-circle" width="28" height="28" style="color:#22C55E;margin-bottom:6px;"></i>
                        <div style="font-size:11px;font-weight:700;color:var(--text-secondary);">Mulai Fokus</div>
                    </button>
                    <button class="card" style="text-align:center;cursor:pointer;border:none;padding:16px;"
                            onclick="App.navigateTo('ideas')">
                        <i data-lucide="lightbulb" width="28" height="28" style="color:#F59E0B;margin-bottom:6px;"></i>
                        <div style="font-size:11px;font-weight:700;color:var(--text-secondary);">Catat Ide</div>
                    </button>
                </div>
                
            </div>
        `;
        
        container.innerHTML = html;
        setTimeout(() => lucide.createIcons(), 50);
    },
    
    getGreeting() {
        const h = new Date().getHours();
        if (h < 11) return 'Selamat Pagi';
        if (h < 15) return 'Selamat Siang';
        if (h < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    },
    
    escape(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};
