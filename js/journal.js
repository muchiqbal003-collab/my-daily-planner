// ============================================
// journal.js - Jurnal Harian
// ============================================

const Journal = {
    
    render(container) {
        const today = new Date().toISOString().split('T')[0];
        const journal = Storage.getTodayJournal();
        const journals = Storage.getJournals().slice(0, 7); // 7 terakhir
        
        const html = `
            <div style="padding:4px 0;">
                
                <div class="section-header">
                    <h2><i data-lucide="book-open" width="20" height="20"></i> Jurnal Hari Ini</h2>
                </div>
                
                ${journal ? this.renderJournalDetail(journal) : this.renderJournalForm()}
                
                ${journals.length > 1 ? `
                <div class="section" style="margin-top:20px;">
                    <div class="section-header">
                        <h2><i data-lucide="clock" width="18" height="18"></i> Sebelumnya</h2>
                    </div>
                    ${journals.filter(j => j.date !== today).slice(0, 5).map(j => this.renderJournalMini(j)).join('')}
                </div>
                ` : ''}
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindEvents();
        setTimeout(() => lucide.createIcons(), 50);
    },
    
    renderJournalForm() {
        return `
            <div class="card glass" id="journal-form">
                <div style="margin-bottom:12px;">
                    <label class="input-label">✅ Apa yang berhasil hari ini?</label>
                    <textarea class="input-field" id="input-success" placeholder="Tulis di sini..." rows="2"></textarea>
                </div>
                <div style="margin-bottom:12px;">
                    <label class="input-label">❌ Apa yang gagal?</label>
                    <textarea class="input-field" id="input-fail" placeholder="Tulis di sini..." rows="2"></textarea>
                </div>
                <div style="margin-bottom:12px;">
                    <label class="input-label">📝 Apa yang dipelajari?</label>
                    <textarea class="input-field" id="input-learned" placeholder="Tulis di sini..." rows="2"></textarea>
                </div>
                <div style="margin-bottom:14px;">
                    <label class="input-label">🙏 Apa yang disyukuri?</label>
                    <textarea class="input-field" id="input-grateful" placeholder="Tulis di sini..." rows="2"></textarea>
                </div>
                <button class="btn btn-primary" id="btn-save-journal" style="width:100%;">
                    <i data-lucide="save" width="16" height="16"></i> Simpan Jurnal
                </button>
            </div>
        `;
    },
    
    renderJournalDetail(journal) {
        return `
            <div class="card glass">
                <div style="margin-bottom:10px;">
                    <span style="font-size:10px;color:var(--text-tertiary);">✅ Berhasil</span>
                    <p style="font-size:13px;">${this.escape(journal.success)}</p>
                </div>
                <div style="margin-bottom:10px;">
                    <span style="font-size:10px;color:var(--text-tertiary);">❌ Gagal</span>
                    <p style="font-size:13px;">${this.escape(journal.fail)}</p>
                </div>
                <div style="margin-bottom:10px;">
                    <span style="font-size:10px;color:var(--text-tertiary);">📝 Dipelajari</span>
                    <p style="font-size:13px;">${this.escape(journal.learned)}</p>
                </div>
                <div>
                    <span style="font-size:10px;color:var(--text-tertiary);">🙏 Disyukuri</span>
                    <p style="font-size:13px;">${this.escape(journal.grateful)}</p>
                </div>
                <button class="btn btn-secondary" id="btn-edit-journal" style="width:100%;margin-top:12px;">
                    <i data-lucide="edit-3" width="14" height="14"></i> Edit
                </button>
            </div>
        `;
    },
    
    renderJournalMini(journal) {
        const d = new Date(journal.date);
        const dateStr = d.toLocaleDateString('id-ID', { weekday:'short', day:'numeric', month:'short' });
        
        return `
            <div class="list-item">
                <i data-lucide="book-open" width="18" height="18" style="color:var(--text-tertiary);"></i>
                <div class="list-info">
                    <div class="list-title">${dateStr}</div>
                    <div class="list-subtitle">${this.escape(journal.success?.substring(0, 50) || '')}...</div>
                </div>
            </div>
        `;
    },
    
    bindEvents() {
        document.getElementById('btn-save-journal')?.addEventListener('click', () => {
            const success = document.getElementById('input-success')?.value.trim();
            const fail = document.getElementById('input-fail')?.value.trim();
            const learned = document.getElementById('input-learned')?.value.trim();
            const grateful = document.getElementById('input-grateful')?.value.trim();
            
            if (!success && !fail && !learned && !grateful) return;
            
            Storage.addJournal({
                date: new Date().toISOString().split('T')[0],
                success, fail, learned, grateful
            });
            
            this.refresh();
            App.toast('✅ Jurnal disimpan!');
        });
        
        document.getElementById('btn-edit-journal')?.addEventListener('click', () => {
            const journal = Storage.getTodayJournal();
            if (journal) {
                Storage.getJournals().splice(Storage.getJournals().findIndex(j => j.id === journal.id), 1);
                Storage.saveJournals(Storage.getJournals());
                this.refresh();
            }
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