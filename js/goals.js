// ============================================
// goals.js - Life Goals
// ============================================

const Goals = {
    
    render(container) {
        const goals = Storage.getGoals();
        
        const html = `
            <div style="padding:4px 0;">
                
                <div class="section-header">
                    <h2><i data-lucide="target" width="20" height="20"></i> Life Goals</h2>
                    <span class="badge">${goals.length}</span>
                </div>
                
                <div id="goals-list">
                    ${goals.length === 0 ? `
                        <div class="empty">
                            <i data-lucide="target" width="40" height="40" style="color:var(--text-tertiary);"></i>
                            <p style="margin-top:8px;">Belum ada goals</p>
                        </div>
                    ` : goals.map(g => this.renderGoalItem(g)).join('')}
                </div>
                
                <button class="btn-add" id="btn-add-goal" style="margin-top:8px;">
                    <i data-lucide="plus" width="16" height="16"></i> Tambah Goal
                </button>
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindEvents();
        setTimeout(() => lucide.createIcons(), 50);
    },
    
    renderGoalItem(goal) {
        const pct = goal.progress || 0;
        return `
            <div class="list-item" data-id="${goal.id}" style="flex-direction:column;align-items:stretch;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                    <div class="list-title" style="font-size:13px;">${this.escape(goal.title)}</div>
                    <span style="font-size:11px;font-weight:700;color:var(--accent-light);">${pct}%</span>
                </div>
                <div style="width:100%;height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
                    <div style="width:${pct}%;height:100%;background:var(--gradient-1);border-radius:3px;transition:width 0.5s;"></div>
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:6px;">
                    <span style="font-size:10px;color:var(--text-tertiary);">${goal.milestones?.length || 0} milestones</span>
                    <button class="list-delete" style="width:24px;height:24px;">
                        <i data-lucide="trash-2" width="12" height="12"></i>
                    </button>
                </div>
            </div>
        `;
    },
    
    bindEvents() {
        document.getElementById('btn-add-goal')?.addEventListener('click', () => {
            const title = prompt('Nama goal:');
            if (title && title.trim()) {
                Storage.addGoal({ title: title.trim(), progress: 0, milestones: [] });
                this.refresh();
                App.toast('✅ Goal ditambahkan!');
            }
        });
        
        document.querySelectorAll('#goals-list .list-item').forEach(item => {
            const id = item.dataset.id;
            
            item.addEventListener('click', (e) => {
                if (e.target.closest('.list-delete')) return;
                const goal = Storage.getGoals().find(g => g.id === id);
                if (goal) {
                    const pct = prompt('Progress (%)', goal.progress);
                    if (pct !== null && !isNaN(pct) && pct >= 0 && pct <= 100) {
                        Storage.updateGoal(id, { progress: parseInt(pct) });
                        this.refresh();
                    }
                }
            });
            
            item.querySelector('.list-delete')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Hapus goal ini?')) {
                    Storage.deleteGoal(id);
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