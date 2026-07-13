// ============================================
// tasks.js - Task Management
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
                        <h2>📋 Hari Ini</h2>
                        <span class="badge">${todayTasks.length}</span>
                    </div>
                    <div id="tasks-today-list">
                        ${todayTasks.length === 0 
                            ? '<div class="empty">✨ Tidak ada tugas hari ini</div>' 
                            : todayTasks.map(t => this.renderTaskItem(t)).join('')}
                    </div>
                    <button class="btn-add" id="btn-add-task">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Tambah Tugas Baru
                    </button>
                </div>
                
                <!-- Pending Tasks -->
                <div class="section" style="margin-top:24px;">
                    <div class="section-header">
                        <h2>⏳ Belum Selesai</h2>
                        <span class="badge">${pendingTasks.length}</span>
                    </div>
                    <div id="tasks-pending-list">
                        ${pendingTasks.length === 0 
                            ? '<div class="empty">🎉 Semua tugas sudah selesai!</div>' 
                            : pendingTasks.map(t => this.renderTaskItem(t)).join('')}
                    </div>
                </div>
                
                ${completedTasks.length > 0 ? `
                <!-- Completed Tasks -->
                <div class="section" style="margin-top:24px;opacity:0.6;">
                    <div class="section-header">
                        <h2>✅ Selesai</h2>
                        <span class="badge">${completedTasks.slice(0, 5).length} terakhir</span>
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
                    ${isCompleted ? '✓' : ''}
                </div>
                <div class="list-info">
                    <div class="list-title" style="${isCompleted ? 'text-decoration:line-through;' : ''}">
                        ${this.escapeHTML(task.name)}
                    </div>
                    ${task.note ? `<div class="list-subtitle">${this.escapeHTML(task.note)}</div>` : ''}
                    ${task.date ? `<div class="list-subtitle" style="font-size:10px;">📅 ${this.formatDate(task.date)}</div>` : ''}
                </div>
                <button class="list-delete" title="Hapus">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
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
        document.getElementById('btn-add-task')?.addEventListener('click', () => this.openModal());
        
        // Task items
        document.querySelectorAll('.list-item[data-id]').forEach(item => {
            const id = item.dataset.id;
            
            // Checkbox toggle
            item.querySelector('.list-checkbox')?.addEventListener('click', (e) => {
                e.stopPropagation();
                Storage.toggleTask(id);
                this.refresh();
            });
            
            // Edit on click
            item.addEventListener('click', (e) => {
                if (e.target.closest('.list-delete')) return;
                if (e.target.closest('.list-checkbox')) return;
                this.openModal(id);
            });
            
            // Delete button
            item.querySelector('.list-delete')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteTask(id);
            });
        });
        
        // Modal events
        document.getElementById('modal-task-close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('btn-task-cancel')?.addEventListener('click', () => this.closeModal());
        document.getElementById('btn-task-save')?.addEventListener('click', () => this.save());
        document.querySelector('#modal-task .modal-backdrop')?.addEventListener('click', () => this.closeModal());
    },
    
    openModal(id = null) {
        this.editingId = id;
        const modal = document.getElementById('modal-task');
        
        document.getElementById('modal-task-title').textContent = id ? 'Edit Tugas' : 'Tambah Tugas Baru';
        
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