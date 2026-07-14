// ============================================
// books.js - Buku Dibaca
// ============================================

const Books = {
    activeTab: 'all',
    
    render(container) {
        const books = Storage.getBooks();
        const filtered = this.activeTab === 'all' 
            ? books 
            : books.filter(b => b.status === this.activeTab);
        
        const wishlist = books.filter(b => b.status === 'wishlist').length;
        const reading = books.filter(b => b.status === 'reading').length;
        const done = books.filter(b => b.status === 'done').length;
        
        const html = `
            <div style="padding:4px 0;">
                
                <!-- Stats -->
                <div style="display:flex;gap:6px;margin-bottom:14px;">
                    <div class="stat-card" onclick="Books.setTab('all')" style="cursor:pointer;${this.activeTab==='all'?'border-color:var(--accent);':''}">
                        <div class="stat-value">${books.length}</div>
                        <div class="stat-label">Semua</div>
                    </div>
                    <div class="stat-card" onclick="Books.setTab('wishlist')" style="cursor:pointer;${this.activeTab==='wishlist'?'border-color:var(--accent);':''}">
                        <div class="stat-value amber">${wishlist}</div>
                        <div class="stat-label">Wishlist</div>
                    </div>
                    <div class="stat-card" onclick="Books.setTab('reading')" style="cursor:pointer;${this.activeTab==='reading'?'border-color:var(--accent);':''}">
                        <div class="stat-value" style="color:var(--accent-light);">${reading}</div>
                        <div class="stat-label">Dibaca</div>
                    </div>
                    <div class="stat-card" onclick="Books.setTab('done')" style="cursor:pointer;${this.activeTab==='done'?'border-color:var(--accent);':''}">
                        <div class="stat-value green">${done}</div>
                        <div class="stat-label">Selesai</div>
                    </div>
                </div>
                
                <div id="books-list">
                    ${filtered.length === 0 ? `
                        <div class="empty">
                            <i data-lucide="bookmark" width="40" height="40" style="color:var(--text-tertiary);"></i>
                            <p style="margin-top:8px;">Belum ada buku</p>
                        </div>
                    ` : filtered.map(b => this.renderBookItem(b)).join('')}
                </div>
                
                <button class="btn-add" id="btn-add-book" style="margin-top:8px;">
                    <i data-lucide="plus" width="16" height="16"></i> Tambah Buku
                </button>
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindEvents();
        setTimeout(() => lucide.createIcons(), 50);
    },
    
    renderBookItem(book) {
        const statusBadge = {
            wishlist: '<span style="font-size:9px;padding:2px 8px;border-radius:10px;background:var(--warning-bg);color:var(--warning);">Wishlist</span>',
            reading: '<span style="font-size:9px;padding:2px 8px;border-radius:10px;background:var(--accent-glow);color:var(--accent-light);">Dibaca</span>',
            done: '<span style="font-size:9px;padding:2px 8px;border-radius:10px;background:var(--success-bg);color:var(--success);">Selesai</span>'
        };
        
        return `
            <div class="list-item" data-id="${book.id}">
                <i data-lucide="book-open" width="20" height="20" style="color:var(--text-tertiary);"></i>
                <div class="list-info">
                    <div class="list-title">${this.escape(book.title)}</div>
                    <div class="list-subtitle">${this.escape(book.author || '')}</div>
                </div>
                ${statusBadge[book.status] || ''}
                <button class="list-delete">
                    <i data-lucide="more-horizontal" width="14" height="14"></i>
                </button>
            </div>
        `;
    },
    
    setTab(tab) {
        this.activeTab = tab;
        this.refresh();
    },
    
    bindEvents() {
        document.getElementById('btn-add-book')?.addEventListener('click', () => {
            const title = prompt('Judul buku:');
            if (!title || !title.trim()) return;
            const author = prompt('Penulis:') || '';
            
            Storage.addBook({
                title: title.trim(),
                author: author.trim(),
                status: 'wishlist'
            });
            
            this.refresh();
            App.toast('📚 Buku ditambahkan!');
        });
        
        document.querySelectorAll('#books-list .list-item').forEach(item => {
            const id = item.dataset.id;
            
            item.addEventListener('click', (e) => {
                if (e.target.closest('.list-delete')) return;
                const book = Storage.getBooks().find(b => b.id === id);
                if (!book) return;
                
                const next = book.status === 'wishlist' ? 'reading' 
                           : book.status === 'reading' ? 'done' : 'wishlist';
                
                Storage.updateBook(id, { status: next });
                this.refresh();
                App.toast(next === 'done' ? '🎉 Buku selesai!' : '📖 Status diupdate');
            });
            
            item.querySelector('.list-delete')?.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Hapus buku?')) {
                    Storage.deleteBook(id);
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