// ============================================
// schedule.js - Jadwal Harian V1.0
// Tampilkan Jam + Nama Kegiatan
// ============================================

const Schedule = {
    selectedDate: new Date().toISOString().split('T')[0],
    
    render(container) {
        const schedules = Storage.getSchedules().filter(s => s.date === this.selectedDate);
        schedules.sort((a, b) => a.time.localeCompare(b.time));
        
        const dateObj = new Date(this.selectedDate);
        const todayStr = new Date().toISOString().split('T')[0];
        const isToday = this.selectedDate === todayStr;
        
        const html = `
            <div style="padding:4px 0;">
                
                <!-- Date Navigation -->
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
                    <button class="btn btn-secondary" id="btn-prev-day" style="flex:0;padding:10px 14px;">
                        <i data-lucide="chevron-left" width="18" height="18"></i>
                    </button>
                    <input type="date" class="input-field" id="input-schedule-date" value="${this.selectedDate}" 
                           style="flex:1;text-align:center;font-weight:600;font-size:14px;">
                    <button class="btn btn-secondary" id="btn-next-day" style="flex:0;padding:10px 14px;">
                        <i data-lucide="chevron-right" width="18" height="18"></i>
                    </button>
                </div>
                
                <!-- Day Indicator -->
                <div style="text-align:center;margin-bottom:16px;">
                    <p style="font-size:11px;color:var(--text-tertiary);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">
                        ${dateObj.toLocaleDateString('id-ID', { weekday: 'long' })}
                    </p>
                    <p style="font-size:24px;font-weight:800;">
                        ${dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    ${isToday ? '<span style="font-size:10px;background:var(--accent-glow);color:var(--accent-light);padding:3px 10px;border-radius:10px;font-weight:600;">HARI INI</span>' : ''}
                </div>
                
                <!-- Schedule List -->
                <div class="section-header">
                    <h2><i data-lucide="clock" width="18" height="18"></i> Kegiatan</h2>
                    <span class="badge">${schedules.length}</span>
                </div>
                
                <div id="schedule-list">
                    ${schedules.length === 0 ? `
                        <div class="empty">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <p style="margin-top:8px;">Tidak ada kegiatan</p>
                            <p style="font-size:10px;">Tambahkan jadwal harianmu</p>
                        </div>
                    ` : schedules.map(s => this.renderScheduleItem(s)).join('')}
                </div>
                
                <button class="btn-add" id="btn-add-schedule" style="margin-top:8px;">
                    <i data-lucide="plus" width="16" height="16"></i> Tambah Kegiatan
                </button>
                
                ${schedules.length > 0 ? `
                <!-- Timeline Summary -->
                <div class="card glass" style="margin-top:16px;padding:16px;">
                    <h3 style="font-size:12px;font-weight:700;color:var(--text-secondary);margin-bottom:10px;display:flex;align-items:center;gap:6px;">
                        <i data-lucide="bar-chart-2" width="14" height="14"></i> Ringkasan Waktu
                    </h3>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <div style="flex:1;height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;display:flex;">
                            ${this.renderTimeBlocks(schedules)}
                        </div>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:9px;color:var(--text-tertiary);">
                        <span>00:00</span>
                        <span>12:00</span>
                        <span>23:59</span>
                    </div>
                    <p style="text-align:center;font-size:10px;color:var(--text-tertiary);margin-top:8px;">
                        ${schedules.length} kegiatan • ${this.countTotalHours(schedules)} total
                    </p>
                </div>
                ` : ''}
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindEvents();
        setTimeout(() => lucide.createIcons(), 50);
    },
    
    renderScheduleItem(schedule) {
        const timeColor = this.getTimeColor(schedule.time);
        
        return `
            <div class="list-item" data-id="${schedule.id}" style="align-items:flex-start;gap:12px;padding:14px;">
                <div style="min-width:60px;text-align:center;">
                    <div style="font-size:18px;font-weight:800;color:var(--accent-light);letter-spacing:-0.02em;">${schedule.time}</div>
                    <div style="width:28px;height:4px;background:${timeColor};border-radius:2px;margin:4px auto 0;"></div>
                </div>
                <div class="list-info" style="padding-top:2px;">
                    <div class="list-title" style="font-size:13px;">${this.escape(schedule.title)}</div>
                    ${schedule.note ? `<div class="list-subtitle">${this.escape(schedule.note)}</div>` : ''}
                </div>
                <button class="list-delete schedule-delete" style="margin-top:2px;">
                    <i data-lucide="trash-2" width="14" height="14"></i>
                </button>
            </div>
        `;
    },
    
    renderTimeBlocks(schedules) {
        const colors = ['#3B82F6','#8B5CF6','#22C55E','#F59E0B','#EF4444','#EC4899','#06B6D4'];
        return schedules.map((s, i) => {
            const [h, m] = (s.time || '12:00').split(':').map(Number);
            const pct = ((h * 60 + (m || 0)) / 1440) * 100;
            return `<div style="width:${Math.max(pct, 2)}%;height:100%;background:${colors[i % colors.length]};border-radius:3px;opacity:0.8;" title="${s.time} - ${s.title}"></div>`;
        }).join('');
    },
    
    getTimeColor(time) {
        const hour = parseInt(time?.split(':')[0]) || 12;
        if (hour < 9) return '#F59E0B'; // pagi
        if (hour < 12) return '#3B82F6'; // siang
        if (hour < 17) return '#22C55E'; // sore
        if (hour < 20) return '#8B5CF6'; // malam
        return '#EC4899'; // malam larut
    },
    
    countTotalHours(schedules) {
        // Estimasi: anggap setiap kegiatan ~1 jam
        return schedules.length + ' kegiatan';
    },
    
    bindEvents() {
        // Date navigation
        document.getElementById('btn-prev-day')?.addEventListener('click', () => {
            const d = new Date(this.selectedDate);
            d.setDate(d.getDate() - 1);
            this.selectedDate = d.toISOString().split('T')[0];
            this.refresh();
        });
        
        document.getElementById('btn-next-day')?.addEventListener('click', () => {
            const d = new Date(this.selectedDate);
            d.setDate(d.getDate() + 1);
            this.selectedDate = d.toISOString().split('T')[0];
            this.refresh();
        });
        
        document.getElementById('input-schedule-date')?.addEventListener('change', (e) => {
            this.selectedDate = e.target.value;
            this.refresh();
        });
        
        // Add schedule
        document.getElementById('btn-add-schedule')?.addEventListener('click', () => {
            const time = prompt('🕐 Jam (contoh: 07.00, 14.30):');
            if (!time || !time.trim()) return;
            
            const title = prompt('📝 Nama kegiatan:');
            if (!title || !title.trim()) return;
            
            const note = prompt('📋 Catatan (opsional):') || '';
            
            Storage.addSchedule({
                date: this.selectedDate,
                time: time.trim(),
                title: title.trim(),
                note: note.trim()
            });
            
            this.refresh();
            App.toast('✅ Jadwal ditambahkan!');
        });
        
        // Delete schedule
        document.querySelectorAll('#schedule-list .list-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.schedule-delete')) return;
                // Edit
                const id = item.dataset.id;
                const schedules = Storage.getSchedules();
                const s = schedules.find(sc => sc.id === id);
                if (!s) return;
                
                const newTime = prompt('🕐 Jam:', s.time);
                if (newTime) {
                    const newTitle = prompt('📝 Nama kegiatan:', s.title);
                    if (newTitle) {
                        Storage.updateSchedule(id, { time: newTime, title: newTitle });
                        this.refresh();
                    }
                }
            });
            
            item.querySelector('.schedule-delete')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Hapus jadwal ini?')) {
                    Storage.deleteSchedule(item.dataset.id);
                    this.refresh();
                    App.toast('🗑️ Jadwal dihapus');
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
