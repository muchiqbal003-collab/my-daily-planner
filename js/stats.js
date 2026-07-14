// ============================================
// stats.js - Dashboard Statistik
// ============================================

const Stats = {
    
    render(container) {
        const stats = Storage.getStats();
        const habits = Storage.getHabits();
        const tasks = Storage.getTasks();
        const focus = Storage.getFocusSessions();
        const expenses = Storage.getExpenses();
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekStartStr = weekStart.toISOString().split('T')[0];
        
        const completedThisWeek = tasks.filter(t => t.completed && t.completedAt && t.completedAt >= weekStartStr).length;
        const focusThisWeek = focus.filter(s => s.date >= weekStartStr).length;
        const expenseThisWeek = expenses.filter(e => e.date >= weekStartStr).reduce((s, e) => s + e.amount, 0);
        
        const html = `
            <div style="padding:4px 0;">
                
                <div class="section-header">
                    <h2><i data-lucide="bar-chart-2" width="20" height="20"></i> Statistik Mingguan</h2>
                </div>
                
                <!-- Summary -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
                    <div class="stat-card">
                        <i data-lucide="flame" width="22" height="22" style="color:#F59E0B;margin-bottom:4px;"></i>
                        <div class="stat-value amber">${stats.habitRate}%</div>
                        <div class="stat-label">Habit Selesai</div>
                    </div>
                    <div class="stat-card">
                        <i data-lucide="check-square" width="22" height="22" style="color:var(--accent-light);margin-bottom:4px;"></i>
                        <div class="stat-value">${completedThisWeek}</div>
                        <div class="stat-label">Tugas Selesai</div>
                    </div>
                    <div class="stat-card">
                        <i data-lucide="timer" width="22" height="22" style="color:#22C55E;margin-bottom:4px;"></i>
                        <div class="stat-value green">${focusThisWeek}</div>
                        <div class="stat-label">Sesi Fokus</div>
                    </div>
                    <div class="stat-card">
                        <i data-lucide="wallet" width="22" height="22" style="color:#EF4444;margin-bottom:4px;"></i>
                        <div class="stat-value red">Rp ${App.formatAmount(expenseThisWeek)}</div>
                        <div class="stat-label">Pengeluaran</div>
                    </div>
                </div>
                
                <!-- Habit Breakdown -->
                ${habits.length > 0 ? `
                <div class="card glass" style="margin-bottom:10px;">
                    <h3 style="font-size:12px;font-weight:700;color:var(--text-secondary);margin-bottom:10px;">
                        <i data-lucide="flame" width="16" height="16"></i> Habit Breakdown
                    </h3>
                    ${habits.map(h => `
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                            <span style="font-size:12px;">${this.escape(h.name)}</span>
                            <span style="font-size:11px;font-weight:700;">🔥 ${h.streak} hari</span>
                        </div>
                        <div style="height:4px;background:var(--bg-tertiary);border-radius:2px;margin-bottom:10px;">
                            <div style="width:${Math.min((h.streak / 30) * 100, 100)}%;height:100%;background:var(--gradient-1);border-radius:2px;"></div>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                <!-- All-time Stats -->
                <div class="card glass">
                    <h3 style="font-size:12px;font-weight:700;color:var(--text-secondary);margin-bottom:10px;">
                        <i data-lucide="clock" width="16" height="16"></i> Total
                    </h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                        <div style="text-align:center;padding:8px;">
                            <div style="font-size:24px;font-weight:900;">${stats.tasksCompletedTotal}</div>
                            <div style="font-size:10px;color:var(--text-tertiary);">Tugas Selesai</div>
                        </div>
                        <div style="text-align:center;padding:8px;">
                            <div style="font-size:24px;font-weight:900;">${stats.focusTotal}</div>
                            <div style="font-size:10px;color:var(--text-tertiary);">Sesi Fokus</div>
                        </div>
                        <div style="text-align:center;padding:8px;">
                            <div style="font-size:24px;font-weight:900;">${stats.bestStreak}</div>
                            <div style="font-size:10px;color:var(--text-tertiary);">Streak Terbaik</div>
                        </div>
                        <div style="text-align:center;padding:8px;">
                            <div style="font-size:24px;font-weight:900;">${habits.length}</div>
                            <div style="font-size:10px;color:var(--text-tertiary);">Habit Aktif</div>
                        </div>
                    </div>
                </div>
                
            </div>
        `;
        
        container.innerHTML = html;
        setTimeout(() => lucide.createIcons(), 50);
    },
    
    escape(str) {
        const div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }
};