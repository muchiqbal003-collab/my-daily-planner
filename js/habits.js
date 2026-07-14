// ============================================
// habits.js - Habit Tracker V3.0
// Dashboard + Weekly Check + Streak
// ============================================

const Habits = {
    
    render(container) {
        const habits = Storage.getHabits();
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // Calculate overall progress
        const totalHabits = habits.length;
        const doneToday = habits.filter(h => h.logs[todayStr]).length;
        const progressPct = totalHabits > 0 ? Math.round((doneToday / totalHabits) * 100) : 0;
        
        // Generate 7 days for weekly view
        const weekDays = this.generateWeekDays();
        
        const html = `
            <div style="padding:4px 0;">
                
                <!-- Dashboard Progress -->
                <div class="card glass" style="text-align:center;padding:20px;margin-bottom:14px;">
                    <div style="position:relative;width:120px;height:120px;margin:0 auto 14px;">
                        <svg width="120" height="120" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="52" stroke="var(--bg-tertiary)" stroke-width="10" fill="none"/>
                            <circle cx="60" cy="60" r="52" stroke="url(#habitGradient)" stroke-width="10" fill="none"
                                stroke-dasharray="${2 * Math.PI * 52}" 
                                stroke-dashoffset="${2 * Math.PI * 52 * (1 - progressPct / 100)}"
                                stroke-linecap="round" transform="rotate(-90 60 60)" 
                                style="transition:stroke-dashoffset 0.8s ease;"/>
                            <defs>
                                <linearGradient id="habitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:#3B82F6"/>
                                    <stop offset="100%" style="stop-color:#8B5CF6"/>
                                </linearGradient>
                            </defs>
                        </svg>
                        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
                            <div style="font-size:28px;font-weight:900;">${progressPct}%</div>
                            <div style="font-size:9px;color:var(--text-tertiary);">${doneToday}/${totalHabits} selesai</div>
                        </div>
                    </div>
                    <p style="font-weight:600;font-size:13px;">Habit Hari Ini</p>
                    
                    <!-- Quick Stats -->
                    <div style="display:flex;gap:8px;margin-top:12px;">
                        <div style="flex:1;background:var(--bg-tertiary);border-radius:10px;padding:10px;">
                            <div style="font-size:20px;font-weight:800;">🔥</div>
                            <div style="font-size:10px;color:var(--text-secondary);">Streak Terbaik</div>
                            <div style="font-weight:700;font-size:14px;">${Math.max(...habits.map(h => h.bestStreak), 0)} hari</div>
                        </div>
                        <div style="flex:1;background:var(--bg-tertiary);border-radius:10px;padding:10px;">
                            <div style="font-size:20px;font-weight:800;">✅</div>
                            <div style="font-size:10px;color:var(--text-secondary);">Total Check-in</div>
                            <div style="font-weight:700;font-size:14px;">${this.countTotalChecks(habits)}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Weekly Day Selector -->
                <div style="display:flex;gap:4px;margin-bottom:14px;overflow-x:auto;padding:4px 0;" id="week-selector">
                    ${weekDays.map((d, i) => `
                        <div style="flex:1;text-align:center;min-width:36px;cursor:pointer;
                            ${d.dateStr === todayStr ? 'background:var(--accent-glow);border-radius:12px;padding:6px 4px;' : 'padding:6px 4px;'}">
                            <div style="font-size:9px;color:var(--text-tertiary);font-weight:600;">${d.dayName}</div>
                            <div style="font-weight:700;font-size:13px;${d.dateStr === todayStr ? 'color:var(--accent-light);' : ''}">${d.dayNum}</div>
                            ${this.renderDayIndicator(habits, d.dateStr)}
                        </div>
                    `).join('')}
                </div>
                
                <!-- Habit List -->
                <div class="section-header">
                    <h2><i data-lucide="flame" width="18" height="18"></i> Daftar Habit</h2>
                    <span class="badge">${habits.length}</span>
                </div>
                
                <div id="habits-list">
                    ${habits.length === 0 ? `
                        <div class="empty">
                            <i data-lucide="flame" width="40" height="40" style="color:var(--text-tertiary);"></i>
                            <p style="margin-top:8px;">Belum ada habit</p>
                            <p style="font-size:10px;">Tambah habit dan mulai tracking!</p>
                        </div>
                    ` : habits.map(h => this.renderHabitItem(h, weekDays)).join('')}
                </div>
                
                <button class="btn-add" id="btn-add-habit" style="margin-top:8px;">
                    <i data-lucide="plus" width="16" height="16"></i> Tambah Habit
                </button>
                
                ${habits.length > 0 ? `
                <!-- Monthly Grid -->
                <div class="card glass" style="margin-top:14px;">
                    <h3 style="font-size:12px;font-weight:700;color:var(--text-secondary);margin-bottom:10px;">
                        <i data-lucide="calendar" width="14" height="14"></i> ${habits[0]?.name || 'Habit'} — Bulan Ini
                    </h3>
                    <div style="display:flex;gap:2px;flex-wrap:wrap;" id="month-grid">
                        ${habits.length > 0 ? this.renderMonthGrid(habits[0]) : ''}
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:8px;color:var(--text-tertiary);">
                        <span>Awal bulan</span>
                        <span>Sekarang</span>
                    </div>
                </div>
                ` : ''}
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindEvents(habits, weekDays);
        setTimeout(() => lucide.createIcons(), 50);
    },
    
    generateWeekDays() {
        const days = [];
        const today = new Date();
        const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            days.push({
                dateStr: d.toISOString().split('T')[0],
                dayName: dayNames[d.getDay()],
                dayNum: d.getDate(),
                isToday: i === 0
            });
        }
        
        return days;
    },
    
    renderDayIndicator(habits, dateStr) {
        const total = habits.length;
        if (total === 0) return '';
        
        const done = habits.filter(h => h.logs[dateStr]).length;
        const pct = Math.round((done / total) * 100);
        let color = 'var(--bg-tertiary)';
        if (pct === 100) color = 'var(--success)';
        else if (pct >= 50) color = 'var(--warning)';
        else if (pct > 0) color = 'var(--accent)';
        
        return `<div style="width:6px;height:6px;border-radius:50%;background:${color};margin:4px auto 0;"></div>`;
    },
    
    renderHabitItem(habit, weekDays) {
        const todayStr = new Date().toISOString().split('T')[0];
        
        return `
            <div class="list-item habit-item" data-id="${habit.id}" style="flex-direction:column;align-items:stretch;padding:14px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                    <div>
                        <div class="list-title" style="font-size:14px;">${this.escape(habit.name)}</div>
                        <div style="font-size:10px;color:var(--text-tertiary);">
                            🔥 Streak: <strong style="color:var(--warning);">${habit.streak} hari</strong> • Terbaik: ${habit.bestStreak}
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                        ${habit.logs[todayStr] ? `
                            <span style="font-size:10px;color:var(--success);font-weight:700;">✓ Done</span>
                        ` : `
                            <span style="font-size:10px;color:var(--text-tertiary);">Pending</span>
                        `}
                        <button class="list-delete habit-delete" style="width:24px;height:24px;">
                            <i data-lucide="trash-2" width="12" height="12"></i>
                        </button>
                    </div>
                </div>
                
                <!-- 7 Day Circles -->
                <div style="display:flex;gap:6px;justify-content:space-between;" class="habit-circles">
                    ${weekDays.map(d => {
                        const checked = habit.logs[d.dateStr] || false;
                        return `
                            <div class="habit-circle ${checked ? 'checked' : ''}" 
                                data-habit-id="${habit.id}" 
                                data-date="${d.dateStr}"
                                style="width:32px;height:32px;border-radius:50%;border:2px solid ${checked ? 'var(--success)' : 'var(--border-medium)'};
                                    background:${checked ? 'var(--success)' : 'transparent'};
                                    display:flex;align-items:center;justify-content:center;cursor:pointer;
                                    transition:all 0.2s;font-size:10px;
                                    ${d.isToday ? 'box-shadow:0 0 8px var(--accent-glow);' : ''}">
                                ${checked ? '<span style="color:#fff;font-weight:700;">✓</span>' : ''}
                            </div>
                            <div style="font-size:8px;color:var(--text-tertiary);text-align:center;">${d.dayName}</div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },
    
    renderMonthGrid(habit) {
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        let html = '';
        
        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(today.getFullYear(), today.getMonth(), i);
            const dateStr = d.toISOString().split('T')[0];
            const checked = habit.logs[dateStr] || false;
            const isToday = i === today.getDate();
            
            html += `
                <div style="width:14px;height:14px;border-radius:3px;
                    background:${checked ? 'var(--success)' : 'var(--bg-tertiary)'};
                    ${isToday ? 'border:2px solid var(--accent);' : ''}
                    ${checked ? '' : 'opacity:0.5;'}
                    margin:1px;"
                    title="${dateStr}">
                </div>
            `;
        }
        
        return html;
    },
    
    countTotalChecks(habits) {
        let total = 0;
        habits.forEach(h => {
            Object.values(h.logs).forEach(v => {
                if (v) total++;
            });
        });
        return total;
    },
    
    bindEvents(habits, weekDays) {
        // Add habit
        document.getElementById('btn-add-habit')?.addEventListener('click', () => {
            const name = prompt('Nama habit:');
            if (name && name.trim()) {
                Storage.addHabit({ name: name.trim() });
                this.refresh();
                App.toast('✅ Habit ditambahkan!');
            }
        });
        
        // Habit circles (check/uncheck)
        document.querySelectorAll('.habit-circle').forEach(circle => {
            circle.addEventListener('click', (e) => {
                e.stopPropagation();
                const habitId = circle.dataset.habitId;
                const date = circle.dataset.date;
                
                Storage.toggleHabitLog(habitId, date);
                this.refresh();
            });
        });
        
        // Delete habit
        document.querySelectorAll('.habit-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const habitId = btn.closest('.habit-item')?.dataset.id;
                if (habitId && confirm('Hapus habit ini?')) {
                    Storage.deleteHabit(habitId);
                    this.refresh();
                    App.toast('🗑️ Habit dihapus');
                }
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
