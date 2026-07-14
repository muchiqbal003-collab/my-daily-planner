// ============================================
// learn.js - Wishlist Belajar
// ============================================

const Learn = {
    
    render(container) {
        const items = Storage.getLearnList();
        
        const html = `
            <div style="padding:4px 0;">
                
                <div class="section-header">
                    <h2><i data-lucide="graduation-cap" width="20" height="20"></i> Wishlist Belajar</h2>
                    <span class="badge">${items.length}</span>
                </div>
                
                <div id="learn-list">
                    ${items.length === 0 ? `
                        <div class="empty">
                            <i data-lucide="graduation-cap" width="40" height="40" style="color:var(--text-tertiary);"></i>
                            <p style="margin-top:8px;">Belum ada wishlist</p>
                        </div>
                    ` : items.map(item => this.renderLearnItem(item)).join('')}
                </div>
                
                <button class="btn-add" id="btn-add-learn" style="margin-top:8px;">
                    <i data-lucide="plus" width="16" height="16"></i> Tambah Skill
                </button>
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindEvents();
        setTimeout(() => lucide.createIcons(), 50);
    },
    
    renderLearnItem(item) {
        const pct = item.progress || 0;
        return `
            <div class="list-item" data-id="${item.id}" style="flex-direction:column;align-items:stretch;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                    <div class="list-title">${this.escape(item.name)}</div>
                    <span style="font-size:11px;font-weight:700;color:var(--accent-light);">${pct}%</span>
                </div>
                <div style="width:100%;height:5px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
                    <div style="width:${pct}%;height:100%;background:var(--gradient-1);border-radius:3px;"></div>
                </div>
                <div style="display:flex;justify-content:flex-end;margin-top:6px;">
                    <button class="list-delete" style="width:24px;height:24px;">
                        <i data-lucide="trash-2" width="12" height="12"></i>
                    </button>
                </div>
            </div>
        `;
    },
    
    bindEvents() {
        document.getElementById('btn-add-learn')?.addEventListener('click', () => {
            const name = prompt('Skill yang ingin dipelajari:');
            if (!name || !name.trim()) return;
            
            Storage.addLearnItem({ name: name.trim(), progress: 0 });
            this.refresh();
            App.toast('🎓 Ditambahkan!');
        });
        
        document.querySelectorAll('#learn-list .list-item').forEach(item => {
            const id = item.dataset.id;
            
            item.addEventListener('click', (e) => {
                if (e.target.closest('.list-delete')) return;
                const learn = Storage.getLearnList().find(l => l.id === id);
                if (!learn) return;
                
                const pct = prompt('Progress (%)', learn.progress);
                if (pct !== null && !isNaN(pct) && pct >= 0 && pct <= 100) {
                    Storage.updateLearnItem(id, { progress: parseInt(pct) });
                    this.refresh();
                }
            });
            
            item.querySelector('.list-delete')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Hapus?')) {
                    Storage.deleteLearnItem(id);
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