// ============================================
// profile.js - Profile & Settings (SVG Icons)
// ============================================

const Profile = {
    
    render(container) {
        const profile = Storage.getProfile();
        const hasPin = Storage.hasPin();
        
        const html = `
            <div style="padding:4px 0;">
                
                <!-- Profile Card -->
                <div class="card glass" style="text-align:center;padding:28px 20px;margin-bottom:18px;">
                    <div class="profile-avatar-section" style="margin:0 auto 16px;">
                        <div class="profile-avatar">
                            ${profile.photo 
                                ? `<img src="${profile.photo}" alt="Foto Profil">` 
                                : `<span style="font-size:42px;">${profile.name ? profile.name.charAt(0).toUpperCase() : '👤'}</span>`}
                        </div>
                        <button class="btn-change-photo" id="btn-change-photo" title="Ganti Foto">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                                <circle cx="12" cy="13" r="4"/>
                            </svg>
                        </button>
                    </div>
                    <input type="text" class="profile-name-input" id="profile-name" 
                           placeholder="Nama Kamu" value="${this.escapeHTML(profile.name)}" maxlength="30">
                </div>
                
                <!-- Menu Items -->
                <div class="card" style="padding:0;overflow:hidden;margin-bottom:18px;">
                    
                    <button class="settings-item" id="btn-settings">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="1.8" stroke-linecap="round">
                            <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                        </svg>
                        <div>
                            <div style="font-weight:600;">Pengaturan</div>
                            <div style="font-size:10px;color:var(--text-tertiary);">Tema, tampilan</div>
                        </div>
                        <span class="settings-arrow">›</span>
                    </button>
                    
                    <button class="settings-item" id="btn-pin-setup">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="1.8" stroke-linecap="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0110 0v4"/>
                        </svg>
                        <div>
                            <div style="font-weight:600;">${hasPin ? 'Ubah PIN' : 'Atur PIN'}</div>
                            <div style="font-size:10px;color:var(--text-tertiary);">
                                ${hasPin ? 'Ganti kode keamanan' : 'Aktifkan kunci aplikasi'}
                            </div>
                        </div>
                        <span class="settings-arrow">›</span>
                    </button>
                    
                    <button class="settings-item" id="btn-backup">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="1.8" stroke-linecap="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        <div>
                            <div style="font-weight:600;">Backup Data</div>
                            <div style="font-size:10px;color:var(--text-tertiary);">Simpan ke file</div>
                        </div>
                        <span class="settings-arrow">›</span>
                    </button>
                    
                    <button class="settings-item" id="btn-restore">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="1.8" stroke-linecap="round">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <div>
                            <div style="font-weight:600;">Restore Data</div>
                            <div style="font-size:10px;color:var(--text-tertiary);">Pulihkan dari file</div>
                        </div>
                        <span class="settings-arrow">›</span>
                    </button>
                    
                    <button class="settings-item" id="btn-reset" style="color:var(--danger);">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="1.8" stroke-linecap="round">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <div>
                            <div style="font-weight:600;color:var(--danger);">Reset Semua</div>
                            <div style="font-size:10px;color:var(--text-tertiary);">Hapus seluruh data</div>
                        </div>
                        <span class="settings-arrow" style="color:var(--danger);">›</span>
                    </button>
                    
                </div>
                
                <!-- App Info -->
                <div style="text-align:center;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="1.5" stroke-linecap="round" style="margin-bottom:8px;">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                    <p class="app-version">Hariku v2.0 • Premium</p>
                    <p style="font-size:9px;color:var(--text-tertiary);margin-top:4px;">Dibuat dengan ❤️</p>
                </div>
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindEvents();
    },
    
    bindEvents() {
        if (this._bound) return;
        this._bound = true;
        
        // Change photo
        document.getElementById('btn-change-photo')?.addEventListener('click', () => {
            document.getElementById('file-photo-input').click();
        });
        
        document.getElementById('file-photo-input')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 2 * 1024 * 1024) {
                App.toast('⚠️ Maksimal 2MB!');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (ev) => {
                const profile = Storage.getProfile();
                profile.photo = ev.target.result;
                Storage.saveProfile(profile);
                this.refresh();
                App.toast('✅ Foto diupdate!');
            };
            reader.readAsDataURL(file);
        });
        
        // Name change
        document.getElementById('profile-name')?.addEventListener('input', (e) => {
            const profile = Storage.getProfile();
            profile.name = e.target.value.trim();
            Storage.saveProfile(profile);
        });
        
        // Settings
        document.getElementById('btn-settings')?.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            document.getElementById('setting-darkmode').checked = isDark;
            document.getElementById('modal-settings').classList.add('active');
        });
        
        document.getElementById('modal-settings-close')?.addEventListener('click', () => {
            document.getElementById('modal-settings').classList.remove('active');
        });
        
        document.querySelector('#modal-settings .modal-backdrop')?.addEventListener('click', () => {
            document.getElementById('modal-settings').classList.remove('active');
        });
        
        document.getElementById('setting-darkmode')?.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.documentElement.setAttribute('data-theme', 'dark');
                document.querySelector('meta[name="theme-color"]').content = '#09090d';
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                document.querySelector('meta[name="theme-color"]').content = '#f5f5f9';
            }
            Storage.saveSetting('darkMode', e.target.checked);
        });
        
        // PIN Setup
        document.getElementById('btn-pin-setup')?.addEventListener('click', () => {
            App.openPinSetupModal();
        });
        
        // Backup
        document.getElementById('btn-backup')?.addEventListener('click', () => {
            const data = Storage.exportAll();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'hariku-backup-' + new Date().toISOString().split('T')[0] + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            App.toast('💾 Backup berhasil!');
        });
        
        // Restore
        document.getElementById('btn-restore')?.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    if (Storage.importAll(ev.target.result)) {
                        App.toast('✅ Data direstore!');
                        App.refreshAll();
                    } else {
                        App.toast('❌ Format file tidak valid!');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        });
        
        // Reset
        document.getElementById('btn-reset')?.addEventListener('click', () => {
            document.getElementById('modal-reset').classList.add('active');
        });
        
        document.getElementById('btn-reset-confirm')?.addEventListener('click', () => {
            Storage.resetAll();
            document.getElementById('modal-reset').classList.remove('active');
            App.toast('⚠️ Semua data direset!');
            App.refreshAll();
        });
        
        document.getElementById('btn-reset-cancel')?.addEventListener('click', () => {
            document.getElementById('modal-reset').classList.remove('active');
        });
        
        document.getElementById('modal-reset-close')?.addEventListener('click', () => {
            document.getElementById('modal-reset').classList.remove('active');
        });
        
        document.querySelector('#modal-reset .modal-backdrop')?.addEventListener('click', () => {
            document.getElementById('modal-reset').classList.remove('active');
        });
    },
    
    refresh() {
        this._bound = false; // Reset flag biar re-bind
        this.render(document.getElementById('app-content'));
    },
    
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }
};
