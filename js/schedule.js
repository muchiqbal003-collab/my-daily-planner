// ============================================
// schedule.js - Time Blocking
// ============================================

const Schedule = {
    selectedDate: new Date().toISOString().split('T')[0],
    
    render(container) {
        const schedules = Storage.getSchedules().filter(s => s.date === this.selectedDate);
        schedules.sort((a, b) => a.time.localeCompare(b.time));
        
        const html = `
            <div style="padding:4px 0;">
                
                <!-- Date Picker -->
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
                    <button class="btn btn-secondary" id="btn-prev-day" style="flex:0;padding:8px 12px;">
                        <i data-lucide="chevron-left" width="16" height="16"></i>
                    </button>
                    <input type="date" class="input-field" id="input-schedule-date" value="${this.selectedDate}" 
                           style="flex:1;margin:0 8px;text-align:center;">
                    <button class="btn btn-secondary" id="btn-next-day" style="flex:0;padding:8px 12px;">
                        <i data-lucide="chevron-right" width="16" height="16"></i>
                    </button>
                </div>
                
                <div class="section-header">
                    <h2><i data-lucide="calendar-clock" width="20" height="20"></i> Jadwal</h2>
                    <span class="badge">${schedules.length}</span>
                </div>
                
                <div id="schedule-list">
                    ${schedules.length === 0 ? `
                        <div class="empty">
                            <i data-lucide="calendar" width="40" height="40" style="color:var(--text-tertiary);"></i>
                            <p style="margin-top:8px;">Tidak ada jadwal</p>
                        </div>
                    ` : schedules.map(s => this.renderScheduleItem(s)).join('')}
                </div>
                
                <button class="btn-add" id="btn-add-schedule" style="margin-top:8px;">
                    <i data-lucide="plus" width="16" height="16"></i> Tambah Jadwal
                </button>
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindEvents();
        setTimeout(() => lucide.createIcons(), 50);
    },
    
    renderScheduleItem(schedule) {
        return `
            <div class="list-item" data-id="${schedule.id}">
                <div style="min-width:55px;font-weight:700;color:var(--accent-light);font-size:13px;">${schedule.time}</div>
                <div class="list-info">
                    <div class="list-title">${this.escape(schedule.title)}</div>
                    ${schedule.note ? `<div class="list-subtitle">${this.escape(schedule.note)}</div>` : ''}
                </div>
                <button class="list-delete">
                    <i data-lucide="trash-2" width="14" height="14"></i>
                </button>
            </div>
        `;
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
        
        // Add
        document.getElementById('btn-add-schedule')?.addEventListener('click', () => {
            const time = prompt('Jam (contoh: 07.00):');
            if (!time) return;
            const title = prompt('Judul:');
            if (!title) return;
            const note = prompt('Catatan (opsional):');
            
            Storage.addSchedule({
                date: this.selectedDate,
                time: time,
                title: title,
                note: note || ''
            });
            this.refresh();
            App.toast('✅ Jadwal ditambahkan!');
        });
        
        // Delete
        document.querySelectorAll('#schedule-list .list-item').forEach(item => {
            const id = item.dataset.id;
            item.querySelector('.list-delete')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Hapus jadwal?')) {
                    Storage.deleteSchedule(id);
                    this.refresh();
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