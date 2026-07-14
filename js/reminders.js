// ============================================
// reminders.js - Reminder
// ============================================

const Reminders = {
    
    render(container) {
        const reminders = Storage.getReminders();
        const active = reminders.filter(r => !r.done);
        const done = reminders.filter(r => r.done);
        
        const html = `
            <div style="padding:4px 0;">
                
                <div class="section-header">
                    <h2><i data-lucide="bell" width="20" height="20"></i> Reminder Aktif</h2>
                    <span class="badge">${active.length}</span>
                </div>
                
                <div id="reminders-active">
                    ${active.length === 0 ? `
                        <div class="empty">
                            <i data-lucide="bell-off" width="32" height="32" style="color:var(--text-tertiary);"></i>
                            <p style="margin-top:8px;">Tidak ada reminder</p>
                        </div>
                    ` : active.map(r => this.renderReminderItem(r)).join('')}
                </div>
                
                <button class="btn-add" id="btn-add-reminder" style="margin-top:8px;">
                    <i data-lucide="plus" width="16" height="16"></i> Tambah Reminder
                </button>
                
                ${done.length > 0 ? `
                <div class="section" style="margin-top:20px;opacity:0.5;">
                    <div class="section-header">
                        <h2><i data-lucide="check-circle" width="18" height="18"></i> Selesai</h2>
                    </div>
                    ${done.slice(0, 5).map(r => this.renderReminderItem(r)).join('')}
                </div>
                ` : ''}
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindEvents();
        setTimeout(() => lucide.createIcons(), 50);
    },
    
    renderReminderItem(reminder) {
        return `
            <div class="list-item" data-id="${reminder.id}" style="${reminder.done ? 'opacity:0.5;' : ''}">
                <div class="list-checkbox ${reminder.done ? 'checked' : ''}">
                    ${reminder.done ? '<i data-lucide="check" width="12" height="12" style="color:#fff;"></i>' : ''}
                </div>
                <div class="list-info">
                    <div class="list-title" style="${reminder.done ? 'text-decoration:line-through;' : ''}">${this.escape(reminder.title)}</div>
                    <div class="list-subtitle">${this.escape(reminder.note || '')}</div>
                </div>
                ${reminder.date ? `<span style="font-size:10px;color:var(--text-tertiary);">${reminder.date}</span>` : ''}
                <button class="list-delete">
                    <i data-lucide="trash-2" width="14" height="14"></i>
                </button>
            </div>
        `;
    },
    
    bindEvents() {
        document.getElementById('btn-add-reminder')?.addEventListener('click', () => {
            const title = prompt('Judul reminder:');
            if (!title || !title.trim()) return;
            const note = prompt('Catatan:') || '';
            const date = prompt('Tanggal (YYYY-MM-DD):') || '';
            
            Storage.addReminder({
                title: title.trim(),
                note: note.trim(),
                date: date.trim(),
                done: false
            });
            
            this.refresh();
            App.toast('🔔 Reminder ditambahkan!');
        });
        
        document.querySelectorAll('#reminders-active .list-item').forEach(item => {
            const id = item.dataset.id;
            
            item.querySelector('.list-checkbox')?.addEventListener('click', (e) => {
                e.stopPropagation();
                const reminder = Storage.getReminders().find(r => r.id === id);
                if (reminder) {
                    Storage.updateReminder(id, { done: !reminder.done });
                    this.refresh();
                }
            });
            
            item.querySelector('.list-delete')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Hapus reminder?')) {
                    Storage.deleteReminder(id);
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
        div.textContent = str || '';
        return div.innerHTML;
    }
};