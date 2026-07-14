// ============================================
// mood.js - Mood Tracker
// ============================================

const Mood = {
    selectedMonth: new Date().getMonth(),
    selectedYear: new Date().getFullYear(),
    
    moods: [
        { value: 'great', icon: '😊', label: 'Sangat Baik', color: '#22C55E' },
        { value: 'good', icon: '🙂', label: 'Baik', color: '#3B82F6' },
        { value: 'okay', icon: '😐', label: 'Biasa', color: '#F59E0B' },
        { value: 'bad', icon: '😞', label: 'Buruk', color: '#EF4444' },
        { value: 'terrible', icon: '😡', label: 'Sangat Buruk', color: '#8B5CF6' }
    ],
    
    render(container) {
        const today = new Date().toISOString().split('T')[0];
        const todayMood = Storage.getTodayMood();
        const allMoods = Storage.getMoods();
        
        // Get month data
        const daysInMonth = new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();
        const monthDays = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const date = `${this.selectedYear}-${String(this.selectedMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            monthDays.push({
                date,
                day: i,
                mood: allMoods[date] || null
            });
        }
        
        const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        
        const html = `
            <div style="padding:4px 0;">
                
                <!-- Today's Mood -->
                <div class="card glass" style="text-align:center;padding:20px;margin-bottom:14px;">
                    <p style="font-size:11px;color:var(--text-tertiary);font-weight:600;margin-bottom:12px;">MOOD HARI INI</p>
                    ${todayMood ? `
                        <div style="font-size:48px;margin-bottom:6px;">${this.moods.find(m => m.value === todayMood.mood)?.icon || '😐'}</div>
                        <p style="font-weight:700;font-size:15px;">${this.moods.find(m => m.value === todayMood.mood)?.label || ''}</p>
                        <p style="font-size:10px;color:var(--text-tertiary);margin-top:4px;">${new Date(todayMood.timestamp).toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'})}</p>
                    ` : `
                        <p style="color:var(--text-secondary);margin-bottom:14px;">Belum diisi</p>
                        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;" id="mood-selector">
                            ${this.moods.map(m => `
                                <button class="mood-btn" data-mood="${m.value}" 
                                    style="font-size:32px;padding:8px 12px;border-radius:16px;border:1px solid var(--border);background:var(--bg-tertiary);cursor:pointer;transition:all 0.2s;">
                                    ${m.icon}
                                </button>
                            `).join('')}
                        </div>
                    `}
                </div>
                
                <!-- Month Navigation -->
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                    <button class="btn btn-secondary" id="btn-prev-month" style="flex:0;padding:6px 10px;">
                        <i data-lucide="chevron-left" width="16" height="16"></i>
                    </button>
                    <span style="font-weight:700;font-size:14px;">${monthNames[this.selectedMonth]} ${this.selectedYear}</span>
                    <button class="btn btn-secondary" id="btn-next-month" style="flex:0;padding:6px 10px;">
                        <i data-lucide="chevron-right" width="16" height="16"></i>
                    </button>
                </div>
                
                <!-- Calendar Grid -->
                <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;text-align:center;">
                    ${['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => 
                        `<div style="font-size:9px;color:var(--text-tertiary);font-weight:600;padding:4px 0;">${d}</div>`
                    ).join('')}
                    ${monthDays.map(d => `
                        <div style="padding:6px 2px;border-radius:8px;font-size:11px;
                            ${d.date === today ? 'border:2px solid var(--accent);' : ''}
                            ${d.mood ? `background:${this.moods.find(m => m.value === d.mood.mood)?.color}20;` : ''}">
                            <div>${d.day}</div>
                            <div style="font-size:14px;">${d.mood ? this.moods.find(m => m.value === d.mood.mood)?.icon : ''}</div>
                        </div>
                    `).join('')}
                </div>
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindEvents();
        setTimeout(() => lucide.createIcons(), 50);
    },
    
    bindEvents() {
        // Mood selector
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mood = btn.dataset.mood;
                Storage.saveMood(new Date().toISOString().split('T')[0], mood);
                this.refresh();
                App.toast('😊 Mood dicatat!');
            });
        });
        
        // Month navigation
        document.getElementById('btn-prev-month')?.addEventListener('click', () => {
            if (this.selectedMonth === 0) {
                this.selectedMonth = 11;
                this.selectedYear--;
            } else {
                this.selectedMonth--;
            }
            this.refresh();
        });
        
        document.getElementById('btn-next-month')?.addEventListener('click', () => {
            if (this.selectedMonth === 11) {
                this.selectedMonth = 0;
                this.selectedYear++;
            } else {
                this.selectedMonth++;
            }
            this.refresh();
        });
    },
    
    refresh() {
        this.render(document.getElementById('app-content'));
    }
};