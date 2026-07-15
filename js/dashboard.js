// ============================================
// dashboard.js - Home Dashboard V3.1
// Quote Motivasi + Stats + Jadwal Hari Ini + Investasi
// ============================================

const Dashboard = {
    
    render(container) {
        const stats = Storage.getStats();
        const profile = Storage.getProfile();
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        const habits = Storage.getHabits();
        const schedules = Storage.getSchedules().filter(s => s.date === todayStr);
        schedules.sort((a, b) => a.time.localeCompare(b.time));
        
        const greeting = this.getGreeting();
        const userName = profile.name || 'Kamu';
        const dateStr = today.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
        
        const html = `
            <div style="padding:4px 0;">
                
                <!-- Greeting -->
                <div style="margin-bottom:16px;padding:0 4px;">
                    <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-tertiary);">${dateStr}</p>
                    <h2 style="font-size:26px;font-weight:900;letter-spacing:-0.04em;line-height:1.2;">
                        ${greeting},<br>
                        <span style="background:var(--gradient-1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${this.escape(userName)}</span>
                    </h2>
                </div>
                
                <!-- Quote Card (kalau ada) -->
                ${profile.quote ? `
                <div class="card glass" style="text-align:center;padding:16px;margin-bottom:14px;border-left:3px solid var(--accent);">
                    <div style="display:flex;align-items:flex-start;gap:8px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" stroke-width="2" stroke-linecap="round" style="flex-shrink:0;margin-top:2px;opacity:0.6;">
                            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
                        </svg>
                        <div style="text-align:left;">
                            <p style="font-style:italic;color:var(--text-secondary);font-size:12px;line-height:1.5;">"${this.escape(profile.quote)}"</p>
                            <p style="font-size:9px;color:var(--text-tertiary);margin-top:4px;">— ${this.escape(userName)}</p>
                        </div>
                    </div>
                </div>
                ` : ''}
                
                <!-- Quick Stats Grid 2x2 -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
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
                    <div class="stat-card" onclick="App.navigateTo('invest')">
                        <i data-lucide="trending-up" width="22" height="22" style="${stats.profit >= 0 ? 'color:#22C55E;' : 'color:#EF4444;'}margin-bottom:6px;"></i>
                        <div class="stat-value ${stats.profit >= 0 ? 'green' : 'red'}">Rp ${App.formatAmount(stats.totalCurrent)}</div>
                        <div class="stat-label">Portfolio</div>
                    </div>
                    <div class="stat-card" onclick="App.navigateTo('finance')">
                        <i data-lucide="wallet" width="22" height="22" style="color:#EF4444;margin-bottom:6px;"></i>
                        <div class="stat-value red">Rp ${App.formatAmount(stats.expenseToday)}</div>
                        <div class="stat-label">Pengeluaran Hari Ini</div>
                    </div>
                </div>
                
                <!-- Jadwal Hari Ini -->
                <div class="card glass" style="margin-bottom:14px;padding:16px;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                        <h3 style="font-size:13px;font-weight:700;color:var(--text-secondary);display:flex;align-items:center;gap:6px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            Jadwal Hari Ini
                        </h3>
                        <span style="font-size:10px;color:var(--accent-light);cursor:pointer;font-weight:600;" onclick="App.navigateTo('schedule')">
                            Semua →
                        </span>
                    </div>
                    
                    ${schedules.length === 0 ? `
                        <div style="text-align:center;padding:16px;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="1.5" stroke-linecap="round" style="margin-bottom:8px;">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <p style="font-size:11px;color:var(--text-tertiary);">Belum ada jadwal hari ini</p>
                            <button style="margin-top:8px;font-size:10px;color:var(--accent-light);background:none;border:none;cursor:pointer;font-weight:600;" 
                                onclick="App.navigateTo('schedule'); setTimeout(() => document.getElementById('btn-add-schedule')?.click(), 300);">
                                + Tambah Jadwal
                            </button>
                        </div>
                    ` : `
                        <div style="display:flex;flex-direction:column;gap:2px;">
                            ${schedules.slice(0, 4).map(s => `
                                <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;transition:all 0.15s;"
                                     onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='transparent'">
                                    <div style="min-width:52px;">
                                        <span style="font-size:15px;font-weight:700;color:var(--accent-light);letter-spacing:-0.02em;">${s.time}</span>
                                    </div>
                                    <div style="flex:1;">
                                        <span style="font-size:13px;font-weight:500;">${this.escape(s.title)}</span>
                                        ${s.note ? `<span style="font-size:10px;color:var(--text-tertiary);display:block;">${this.escape(s.note)}</span>` : ''}
                                    </div>
                                    <div style="width:6px;height:6px;border-radius:50%;background:${this.getTimeColor(s.time)};"></div>
                                </div>
                            `).join('')}
                        </div>
                        ${schedules.length > 4 ? `
                            <p style="text-align:center;font-size:10px;color:var(--text-tertiary);margin-top:8px;">
                                +${schedules.length - 4} kegiatan lainnya
                            </p>
                        ` : ''}
                    `}
                </div>
                
                <!-- Quick Actions -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <button class="card" style="text-align:center;cursor:pointer;border:none;padding:16px;"
                            onclick="App.navigateTo('tasks'); setTimeout(() => Tasks.openModal(), 200);">
                        <i data-lucide="plus-circle" width="28" height="28" style="color:var(--accent-light);margin-bottom:6px;"></i>
                        <div style="font-size:11px;font-weight:700;color:var(--text-secondary);">Tambah Tugas</div>
                    </button>
                    <button class="card" style="text-align:center;cursor:pointer;border:none;padding:16px;"
                            onclick="App.navigateTo('finance');">
                        <i data-lucide="plus-square" width="28" height="28" style="color:var(--accent-light);margin-bottom:6px;"></i>
                        <div style="font-size:11px;font-weight:700;color:var(--text-secondary);">Catat Pengeluaran</div>
                    </button>
                    <button class="card" style="text-align:center;cursor:pointer;border:none;padding:16px;"
                            onclick="App.navigateTo('schedule')">
                        <i data-lucide="calendar-plus" width="28" height="28" style="color:#22C55E;margin-bottom:6px;"></i>
                        <div style="font-size:11px;font-weight:700;color:var(--text-secondary);">Tambah Jadwal</div>
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
    
    getTimeColor(time) {
        const hour = parseInt(time?.split(':')[0]) || 12;
        if (hour < 9) return '#F59E0B';
        if (hour < 12) return '#3B82F6';
        if (hour < 17) return '#22C55E';
        if (hour < 20) return '#8B5CF6';
        return '#EC4899';
    },
    
    escape(str) {
        const div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }
};
