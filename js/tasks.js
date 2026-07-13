// ============================================
// tasks.js - Task Management (SVG Icons)
// ============================================

const Tasks = {
    editingId: null,
    
    render(container) {
        const tasks = Storage.getTasks();
        const today = new Date().toISOString().split('T')[0];
        
        const todayTasks = tasks.filter(t => t.date === today && !t.completed);
        const pendingTasks = tasks.filter(t => !t.completed && t.date !== today);
        const completedTasks = tasks.filter(t => t.completed);
        
        const html = `
            <div style="padding: 4px 0;">
                
                <!-- Today Tasks -->
                <div class="section">
                    <div class="section-header">
                        <h2 style="display:flex;align-items:center;gap:8px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            Hari Ini
                        </h2>
                        <span class="badge">${todayTasks.length}</span>
                    </div>
                    <div id="tasks-today-list">
                        ${todayTasks.length === 0 
                            ? `<div class="empty">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="1.5" stroke-linecap="round" style="margin-bottom:10px;">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="8" y1="12" x2="16" y2="12"/>
                                </svg>
                                <p>Tidak ada tugas hari ini</p>
                               </div>` 
                            : todayTasks.map(t => this.renderTaskItem(t)).join('')}
                    </div>
                    <button class="btn-add" id="btn-add-task">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Tambah Tugas Baru
                    </button>
                </div>
                
                <!-- Pending Tasks -->
                <div class="section" style="margin-top:24px;">
                    <div class="section-header">
                        <h2 style="display:flex;align-items:center;gap:8px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            Belum Selesai
                        </h2>
                        <span class="badge" style="background:var(--warning-bg);color:var(--warning);">${pendingTasks.length}</span>
                    </div>
                    <div id="tasks-pending-list">
                        ${pendingTasks.length === 0 
                            ? `<div class="empty">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="1.5" stroke-linecap="round" style="margin-bottom:10px;">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="16 10 11 15 8 12"/>
                                </svg>
                                <p>Semua tugas sudah selesai!</p>
                               </div>` 
                            : pendingTasks.map(t => this.renderTaskItem(t)).join('')}
                    </div>
                </div>
                
                ${completedTasks.length > 0 ? `
                <!-- Completed Tasks -->
                <div class="section" style="margin-top:24px;opacity:0.5;">
                    <div class="section-header">
                        <h2 style="display:flex;align-items:center;gap:8px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                <polyline points="9 11 12 14 22 4"/>
                                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                            </svg>
                            Selesai
                        </h2>
                        <span class="badge" style="background:var(--success-bg);color:var(--success);">${completedTasks.slice(0, 5).length} terakhir</span>
                    </div>
                    <div id="tasks-completed-list">
                        ${completedTasks.slice(0, 5).map(t => this.renderTaskItem(t)).join('')}
                    </div>
                </div>
                ` : ''}
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindEvents();
    },
    
    renderTaskItem(task) {
        const isCompleted = task.completed;
        return `
            <div class="list-item ${isCompleted ? 'task-completed' : ''}" data-id="${task.id}" style="${isCompleted ? 'opacity:0.5;' : ''}">
                <div class="list-checkbox ${isCompleted ? 'checked' : ''}">
                    ${isCompleted ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
                </div>
                <div class="list-info">
                    <div class="list-title" style="${isCompleted ? 'text-decoration:line-through;' : ''}">
                        ${this.escapeHTML(task.name)}
                    </div>
                    ${task.note ? `<div class="list-subtitle">${this.escapeHTML(task.note)}</div>` : ''}
                    ${task.date ? `<div class="list-subtitle" style="font-size:10px;display:flex;align-items:center;gap:4px;">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                        ${this.formatDate(task.date)}
                    </div>` : ''}
                </div>
                <button class="list-delete" title="Hapus">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                </button>
            </div>
        `;
    },
    
    bindEvents() {
        // Add button
        const addBtn = document.getElementById('btn-add-task');
        if (addBtn) {
            const newAddBtn = addBtn.cloneNode(true);
            addBtn.parentNode.replaceChild(newAddBtn, addBtn);
            newAddBtn.addEventListener('click', () => this.openModal());
        }
        
        // Task items
        document.querySelectorAll('.list-item[data-id]').forEach(item => {
            const id = item.dataset.id;
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            // Checkbox toggle
            newItem.querySelector('.list-checkbox')?.addEventListener('click', (e) => {
                e.stopPropagation();
                Storage.toggleTask(id);
                this.refresh();
            });
            
            // Edit on click
            newItem.addEventListener('click', (e) => {
                if (e.target.closest('.list-delete')) return;
                if (e.target.closest('.list-checkbox')) return;
                this.openModal(id);
            });
            
            // Delete button
            newItem.querySelector('.list-delete')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteTask(id);
            });
        });
        
        // Modal events - bind once
        this.bindModalEventsOnce();
    },
    
    bindModalEventsOnce() {
        if (this._modalBound) return;
        this._modalBound = true;
        
        document.getElementById('modal-task-close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('btn-task-cancel')?.addEventListener('click', () => this.closeModal());
        document.getElementById('btn-task-save')?.addEventListener('click', () => this.save());
        document.querySelector('#modal-task .modal-backdrop')?.addEventListener('click', () => this.closeModal());
    },
    
    openModal(id = null) {
        this.editingId = id;
        const modal = document.getElementById('modal-task');
        
        document.getElementById('modal-task-title').innerHTML = id 
            ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" stroke-width="2.5" stroke-linecap="round" style="vertical-align:middle;margin-right:6px;">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
               </svg>Edit Tugas`
            : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" stroke-width="2.5" stroke-linecap="round" style="vertical-align:middle;margin-right:6px;">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
               </svg>Tambah Tugas Baru`;
        
        if (id) {
            const task = Storage.getTasks().find(t => t.id === id);
            if (task) {
                document.getElementById('input-task-name').value = task.name || '';
                document.getElementById('input-task-note').value = task.note || '';
                document.getElementById('input-task-date').value = task.date || new Date().toISOString().split('T')[0];
            }
        } else {
            document.getElementById('input-task-name').value = '';
            document.getElementById('input-task-note').value = '';
            document.getElementById('input-task-date').value = new Date().toISOString().split('T')[0];
        }
        
        modal.classList.add('active');
        setTimeout(() => document.getElementById('input-task-name').focus(), 200);
    },
    
    closeModal() {
        document.getElementById('modal-task').classList.remove('active');
        this.editingId = null;
    },
    
    save() {
        const name = document.getElementById('input-task-name').value.trim();
        if (!name) {
            App.toast('⚠️ Nama tugas harus diisi!');
            return;
        }
        
        const data = {
            name: name,
            note: document.getElementById('input-task-note').value.trim(),
            date: document.getElementById('input-task-date').value
        };
        
        if (this.editingId) {
            Storage.updateTask(this.editingId, data);
            App.toast('✅ Tugas diupdate!');
        } else {
            Storage.addTask(data);
            App.toast('✅ Tugas ditambahkan!');
        }
        
        this.closeModal();
        this.refresh();
    },
    
    deleteTask(id) {
        if (confirm('Hapus tugas ini?')) {
            Storage.deleteTask(id);
            this.refresh();
            App.toast('🗑️ Tugas dihapus');
        }
    },
    
    refresh() {
        this.render(document.getElementById('app-content'));
    },
    
    formatDate(dateStr) {
        const d = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (dateStr === today.toISOString().split('T')[0]) return 'Hari ini';
        if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Besok';
        if (dateStr === yesterday.toISOString().split('T')[0]) return 'Kemarin';
        
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    },
    
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};
