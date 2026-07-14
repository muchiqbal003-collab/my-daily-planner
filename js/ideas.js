// ============================================
// ideas.js - Catatan Ide
// ============================================

const Ideas = {
    
    render(container) {
        const ideas = Storage.getIdeas();
        
        const html = `
            <div style="padding:4px 0;">
                
                <div class="section-header">
                    <h2><i data-lucide="lightbulb" width="20" height="20"></i> Catatan Ide</h2>
                    <span class="badge">${ideas.length}</span>
                </div>
                
                <div id="ideas-list">
                    ${ideas.length === 0 ? `
                        <div class="empty">
                            <i data-lucide="lightbulb" width="40" height="40" style="color:var(--text-tertiary);"></i>
                            <p style="margin-top:8px;">Belum ada ide</p>
                            <p style="font-size:10px;">Catat ide yang tiba-tiba muncul</p>
                        </div>
                    ` : ideas.map(i => this.renderIdeaItem(i)).join('')}
                </div>
                
                <button class="btn-add" id="btn-add-idea" style="margin-top:8px;">
                    <i data-lucide="plus" width="16" height="16"></i> Tambah Ide
                </button>
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindEvents();
        setTimeout(() => lucide.createIcons(), 50);
    },
    
    renderIdeaItem(idea) {
        const date = new Date(idea.createdAt);
        const dateStr = date.toLocaleDateString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
        const tagColors = {
            bisnis: '#3B82F6',
            aplikasi: '#8B5CF6',
            konten: '#22C55E',
            penelitian: '#F59E0B',
            lainnya: '#EF4444'
        };
        const tagColor = tagColors[idea.tag] || '#666';
        
        return `
            <div class="list-item" data-id="${idea.id}" style="flex-direction:column;align-items:stretch;">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:4px;">
                    <div style="font-weight:600;font-size:13px;">${this.escape(idea.title)}</div>
                    ${idea.tag ? `<span style="font-size:9px;padding:2px 8px;border-radius:10px;background:${tagColor}20;color:${tagColor};font-weight:600;">${idea.tag}</span>` : ''}
                </div>
                <div style="font-size:11px;color:var(--text-secondary);margin-bottom:6px;">${this.escape(idea.content)}</div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:9px;color:var(--text-tertiary);">${dateStr}</span>
                    <button class="list-delete" style="width:24px;height:24px;">
                        <i data-lucide="trash-2" width="12" height="12"></i>
                    </button>
                </div>
            </div>
        `;
    },
    
    bindEvents() {
        document.getElementById('btn-add-idea')?.addEventListener('click', () => {
            const title = prompt('Judul ide:');
            if (!title || !title.trim()) return;
            
            const content = prompt('Deskripsi:') || '';
            const tag = prompt('Tag (bisnis, aplikasi, konten, penelitian, lainnya):') || '';
            
            Storage.addIdea({
                title: title.trim(),
                content: content.trim(),
                tag: tag.trim().toLowerCase()
            });
            
            this.refresh();
            App.toast('💡 Ide dicatat!');
        });
        
        document.querySelectorAll('#ideas-list .list-item').forEach(item => {
            item.querySelector('.list-delete')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Hapus ide ini?')) {
                    Storage.deleteIdea(item.dataset.id);
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