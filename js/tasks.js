// ============================================
// tasks.js - Tasks (Updated V3.0)
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
            <div style="padding:4px 0;">
                
                <!-- Today -->
                <div class="section">
                    <div class="section-header">
                        <h2><i data-lucide="calendar" width="18" height="18"></i> Hari Ini</h2>
                        <span class="badge">${todayTasks.length}</span>
                    </div>
                    <div id="tasks-today-list">
                        ${todayTasks.length === 0 ? `
                            <div class="empty">
                                <i data-lucide="check-circle" width="36" height="36" style="color:var(--text-tertiary);"></i>
                                <p style="margin-top:8px;">Tidak ada tugas</p>
                            </div>
                        ` : todayTasks.map(t => this.renderTaskItem(t)).join('')}
                    </div>
                    <button class="btn-add" id="btn-add-task">
                        <i data-lucide="plus" width="16" height="16"></i> Tambah Tugas
                    </button>
                </div>
                
                <!-- Pending -->
                <div class="section" style="margin-top:20px;">
                    <div class="section-header">
                        <h2><i data-lucide="clock" width="18" height="18"></i> Belum Selesai</h2>
                        <span class="badge" style="background:var(--warning-bg);color:var(--warning);">${pendingTasks.length}</span>
                    </div>
                    <div id="tasks-pending-list">
                        ${pendingTasks.length === 0 ? `
                            <div class="empty">
                                <i data-lucide="check" width="36" height="36" style="color:var(--text-tertiary);"></i>
                                <p style="margin-top:8px;">Semua selesai!</p>
                            </div>
                        ` : pendingTasks.map(t => this.renderTaskItem(t)).join('')}
                    </div>
                </div>
                
                ${completedTasks.length > 0 ? `
                <div class="section" style="margin-top:20px;opacity:0.5;">
                    <div class="section-header">
                        <h2><i data-lucide="check-square" width="18" height="18"></i> Selesai</h2>
                    </div>
                    ${completedTasks.slice(0, 5).map(t => this.renderTaskItem(t)).join('')}
                </div>
                ` : ''}
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindEvents();
        setTimeout(() => lucide.createIcons(), 50);
    },
    
    renderTaskItem(task) {
        return `
            <div class="list-item" data-id="${task.id}" style="${task.completed ? 'opacity:0.5;' : ''}">
                <div class="list-checkbox ${task.completed ? 'checked' : ''}">
                    ${task.completed ? '<i data-lucide="check" width="12" height="12" style="color:#fff;"></i>' : ''}
                </div>
                <div class="list-info">
                    <div class="list-title" style="${task.completed ? 'text-decoration:line-through;' : ''}">${this.escape(task.name)}</div>
                    ${task.note ? `<div class="list-subtitle">${this.escape(task.note)}</div>` : ''}
                </div>
                <button class="list-delete">
                    <i data-lucide="trash-2" width="14" height="14"></i>
                </button>
            </div>
        `;
    },
    
    bindEvents() {
        document.getElementById('btn-add-task')?.addEventListener('click', () => this.openModal());
        
        document.querySelectorAll('#tasks-today-list .list-item, #tasks-pending-list .list-item').forEach(item => {
            const id = item.dataset.id;
            
            item.querySelector('.list-checkbox')?.addEventListener('click', (e) => {
                e.stopPropagation();
                Storage.toggleTask(id);
                this.refresh();
            });
            
            item.addEventListener('click', (e) => {
                if (e.target.closest('.list-delete') || e.target.closest('.list-checkbox')) return;
                this.openModal(id);
            });
            
            item.querySelector('.list-delete')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Hapus tugas?')) {
                    Storage.deleteTask(id);
                    this.refresh();
                }
            });
        });
        
        this.bindModalEvents();
    },
    
    bindModalEvents() {
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
        
        if (id) {
            const task = Storage.getTasks().find(t => t.id === id);
            if (task) {
                document.getElementById('input-task-name').value = task.name || '';
                document.getElementById('input-task-note').value = task.note || '';
                document.getElementById('input-task-date').value = task.date || '';
            }
        } else {
            document.getElementById('input-task-name').value = '';
            document.getElementById('input-task-note').value = '';
            document.getElementById('input-task-date').value = new Date().toISOString().split('T')[0];
        }
        
        modal.classList.add('active');
        setTimeout(() => document.getElementById('input-task-name').focus(), 200);
        lucide.createIcons();
    },
    
    closeModal() {
        document.getElementById('modal-task').classList.remove('active');
        this.editingId = null;
    },
    
    save() {
        const name = document.getElementById('input-task-name').value.trim();
        if (!name) return;
        
        const data = {
            name,
            note: document.getElementById('input-task-note').value.trim(),
            date: document.getElementById('input-task-date').value
        };
        
        if (this.editingId) {
            Storage.updateTask(this.editingId, data);
        } else {
            Storage.addTask(data);
        }
        
        this.closeModal();
        this.refresh();
        App.toast('✅ Tersimpan!');
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
