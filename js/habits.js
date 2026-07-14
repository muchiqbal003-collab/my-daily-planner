// ============================================
// habits.js - Habit Tracker
// ============================================

const Habits = {
    today: new Date().toISOString().split('T')[0],
    
    render(container) {
        const habits = Storage.getHabits();
        
        const html = `
            <div style="padding:4px 0;">
                
                <div class="section-header">
                    <h2><i data-lucide="flame" width="20" height="20"></i> Habit Hari Ini</h2>
                    <span class="badge">${habits.length}</span>
                </div>
                
                <div id="habits-list">
                    ${habits.length === 0 ? `
                        <div class="empty">
                            <i data-lucide="flame" width="40" height="40" style="color:var(--text-tertiary);"></i>
                            <p style="margin-top:8px;">Belum ada habit</p>
                            <p style="font-size:10px;">Tambahkan habit harianmu</p>
                        </div>
                    ` : habits.map(h => this.renderHabitItem(h)).join('')}
                </div>
                
                <button class="btn-add" id="btn-add-habit" style="margin-top:8px;">
                    <i data-lucide="plus" width="16" height="16"></i> Tambah Habit
                </button>
                
                ${habits.length > 0 ? `
                <!-- Streak Summary -->
                <div class="card glass" style="margin-top:16px;">
                    <h3 style="font-size:12px;font-weight:700;color:var(--text-secondary);margin-bottom:10px;">
                        <i data-lucide="bar-chart-2" width="16" height="16"></i> Statistik Mingguan
                    </h3>
                    <div style="display:flex;gap:4px;">
                        ${this.renderWeekSummary(habits)}
                    </div>
                </div>
                ` : ''}
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindEvents();
        setTimeout(() => lucide.createIcons(), 50);
    },
    
    renderHabitItem(habit) {
        const done = habit.logs[this.today] || false;
        return `
            <div class="list-item" data-id="${habit.id}">
                <div class="list-checkbox ${done ? 'checked' : ''}" style="cursor:pointer;">
                    ${done ? '<i data-lucide="check" width="12" height="12" style="color:#fff;"></i>' : ''}
                </div>
                <div class="list-info">
                    <div class="list-title">${this.escape(habit.name)}</div>
                    <div class="list-subtitle">
                        🔥 ${habit.streak} hari • Terbaik: ${habit.bestStreak}
                    </div>
                </div>
                <button class="list-delete" title="Hapus">
                    <i data-lucide="trash-2" width="14" height="14"></i>
                </button>
            </div>
        `;
    },
    
    renderWeekSummary(habits) {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]);
        }
        
        return habits.slice(0, 1).map(h => {
            return days.map(date => {
                const done = h.logs[date];
                const isToday = date === this.today;
                return `
                    <div style="flex:1;text-align:center;">
                        <div style="width:100%;padding-top:100%;background:${done ? 'var(--success)' : 'var(--bg-tertiary)'};border-radius:4px;position:relative;${isToday ? 'border:2px solid var(--accent);' : ''}">
                            ${done ? '<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:10px;">✓</span>' : ''}
                        </div>
                        <div style="font-size:8px;color:var(--text-tertiary);margin-top:3px;">${['Min','Sen','Sel','Rab','Kam','Jum','Sab'][new Date(date).getDay()]}</div>
                    </div>
                `;
            }).join('');
        }).join('');
    },
    
    bindEvents() {
        document.getElementById('btn-add-habit')?.addEventListener('click', () => {
            const name = prompt('Nama habit:');
            if (name && name.trim()) {
                Storage.addHabit({ name: name.trim() });
                this.refresh();
                App.toast('✅ Habit ditambahkan!');
            }
        });
        
        document.querySelectorAll('#habits-list .list-item').forEach(item => {
            const id = item.dataset.id;
            
            item.querySelector('.list-checkbox')?.addEventListener('click', (e) => {
                e.stopPropagation();
                Storage.toggleHabitLog(id, this.today);
                this.refresh();
            });
            
            item.querySelector('.list-delete')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Hapus habit ini?')) {
                    Storage.deleteHabit(id);
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
        div.textContent = str;
        return div.innerHTML;
    }
};