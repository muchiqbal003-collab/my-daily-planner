// ============================================
// achievements.js - Achievement Timeline
// ============================================

const Achievements = {
    
    render(container) {
        // Auto-check achievements
        Storage.checkAchievements();
        const achievements = Storage.getAchievements();
        
        const html = `
            <div style="padding:4px 0;">
                
                <div class="section-header">
                    <h2><i data-lucide="trophy" width="20" height="20"></i> Achievement</h2>
                    <span class="badge">${achievements.length}</span>
                </div>
                
                <div id="achievements-list">
                    ${achievements.length === 0 ? `
                        <div class="empty">
                            <i data-lucide="trophy" width="40" height="40" style="color:var(--text-tertiary);"></i>
                            <p style="margin-top:8px;">Belum ada achievement</p>
                            <p style="font-size:10px;">Selesaikan tugas & habit untuk mendapatkan achievement</p>
                        </div>
                    ` : achievements.map(a => this.renderAchievementItem(a)).join('')}
                </div>
                
                <!-- Progress Overview -->
                <div class="card glass" style="margin-top:14px;">
                    <h3 style="font-size:12px;font-weight:700;color:var(--text-secondary);margin-bottom:10px;">
                        <i data-lucide="bar-chart-2" width="16" height="16"></i> Progress Overview
                    </h3>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                        ${this.renderProgressCards()}
                    </div>
                </div>
                
            </div>
        `;
        
        container.innerHTML = html;
        setTimeout(() => lucide.createIcons(), 50);
    },
    
    renderAchievementItem(achievement) {
        const date = new Date(achievement.date);
        const dateStr = date.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' });
        
        return `
            <div class="list-item">
                <div style="font-size:28px;">${achievement.icon || '🏆'}</div>
                <div class="list-info">
                    <div class="list-title">${this.escape(achievement.title)}</div>
                    <div class="list-subtitle">${dateStr}</div>
                </div>
                <div style="color:${achievement.color || 'var(--accent)'};font-size:20px;">⭐</div>
            </div>
        `;
    },
    
    renderProgressCards() {
        const tasks = Storage.getTasks();
        const habits = Storage.getHabits();
        const focus = Storage.getFocusSessions();
        
        const completedTasks = tasks.filter(t => t.completed).length;
        const bestStreak = Math.max(...habits.map(h => h.bestStreak), 0);
        const totalFocus = focus.length;
        
        return `
            <div class="stat-card">
                <div style="font-size:12px;color:var(--text-secondary);">Tugas Selesai</div>
                <div style="font-size:22px;font-weight:900;">${completedTasks}/100</div>
                <div style="height:4px;background:var(--bg-tertiary);border-radius:2px;margin-top:4px;">
                    <div style="width:${Math.min(completedTasks, 100)}%;height:100%;background:var(--accent);border-radius:2px;"></div>
                </div>
            </div>
            <div class="stat-card">
                <div style="font-size:12px;color:var(--text-secondary);">Streak Terbaik</div>
                <div style="font-size:22px;font-weight:900;">${bestStreak}/30</div>
                <div style="height:4px;background:var(--bg-tertiary);border-radius:2px;margin-top:4px;">
                    <div style="width:${Math.min(bestStreak * 3.33, 100)}%;height:100%;background:#F59E0B;border-radius:2px;"></div>
                </div>
            </div>
            <div class="stat-card">
                <div style="font-size:12px;color:var(--text-secondary);">Sesi Fokus</div>
                <div style="font-size:22px;font-weight:900;">${totalFocus}</div>
            </div>
            <div class="stat-card">
                <div style="font-size:12px;color:var(--text-secondary);">Total Habits</div>
                <div style="font-size:22px;font-weight:900;">${habits.length}</div>
            </div>
        `;
    },
    
    escape(str) {
        const div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }
};