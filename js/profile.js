// ============================================
// profile.js - Profile & Settings (V3.0)
// ============================================

const Profile = {
    
    render(container) {
        const profile = Storage.getProfile();
        const hasPin = Storage.hasPin();
        
        const html = `
            <div style="padding:4px 0;">
                
                <!-- Profile Card -->
                <div class="card glass" style="text-align:center;padding:24px 20px;margin-bottom:16px;">
                    <div class="profile-avatar-section" style="margin:0 auto 14px;">
                        <div class="profile-avatar">
                            ${profile.photo 
                                ? `<img src="${profile.photo}" alt="Foto">` 
                                : `<span style="font-size:38px;">${profile.name ? profile.name.charAt(0).toUpperCase() : '👤'}</span>`}
                        </div>
                        <button class="btn-change-photo" id="btn-change-photo">
                            <i data-lucide="camera" width="14" height="14"></i>
                        </button>
                    </div>
                    <input type="text" class="profile-name-input" id="profile-name" 
                           placeholder="Nama Kamu" value="${this.escape(profile.name)}" maxlength="30">
                </div>
                
                <!-- Menu -->
                <div class="card" style="padding:0;overflow:hidden;margin-bottom:16px;">
                    <button class="settings-item" id="btn-settings">
                        <i data-lucide="settings" width="18" height="18"></i>
                        <span>Pengaturan</span>
                        <span class="settings-arrow">›</span>
                    </button>
                    <button class="settings-item" id="btn-pin-setup">
                        <i data-lucide="lock" width="18" height="18"></i>
                        <span>${hasPin ? 'Ubah PIN' : 'Atur PIN'}</span>
                        <span class="settings-arrow">›</span>
                    </button>
                    <button class="settings-item" id="btn-backup">
                        <i data-lucide="download" width="18" height="18"></i>
                        <span>Backup Data</span>
                        <span class="settings-arrow">›</span>
                    </button>
                    <button class="settings-item" id="btn-restore">
                        <i data-lucide="upload" width="18" height="18"></i>
                        <span>Restore Data</span>
                        <span class="settings-arrow">›</span>
                    </button>
                    <button class="settings-item" id="btn-reset" style="color:var(--danger);">
                        <i data-lucide="alert-triangle" width="18" height="18"></i>
                        <span style="color:var(--danger);">Reset Semua</span>
                        <span class="settings-arrow">›</span>
                    </button>
                </div>
                
                <p class="app-version">Hariku V3.0 • Premium</p>
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindEvents();
        setTimeout(() => lucide.createIcons(), 50);
    },
    
    bindEvents() {
        // Photo
        const btnPhoto = document.getElementById('btn-change-photo');
        if (btnPhoto) {
            btnPhoto.replaceWith(btnPhoto.cloneNode(true));
            document.getElementById('btn-change-photo')?.addEventListener('click', () => {
                document.getElementById('file-photo-input').click();
            });
        }
        
        const fileInput = document.getElementById('file-photo-input');
        if (fileInput) {
            fileInput.replaceWith(fileInput.cloneNode(true));
            document.getElementById('file-photo-input')?.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file || file.size > 2 * 1024 * 1024) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const p = Storage.getProfile();
                    p.photo = ev.target.result;
                    Storage.saveProfile(p);
                    this.refresh();
                    App.toast('✅ Foto diupdate!');
                };
                reader.readAsDataURL(file);
            });
        }
        
        // Name
        const nameInput = document.getElementById('profile-name');
        if (nameInput) {
            nameInput.replaceWith(nameInput.cloneNode(true));
            document.getElementById('profile-name')?.addEventListener('input', (e) => {
                const p = Storage.getProfile();
                p.name = e.target.value.trim();
                Storage.saveProfile(p);
            });
        }
        
        // Settings
        document.getElementById('btn-settings')?.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            document.getElementById('setting-darkmode').checked = isDark;
            document.getElementById('modal-settings').classList.add('active');
            lucide.createIcons();
        });
        
        document.getElementById('modal-settings-close')?.addEventListener('click', () => {
            document.getElementById('modal-settings').classList.remove('active');
        });
        
        document.querySelector('#modal-settings .modal-backdrop')?.addEventListener('click', () => {
            document.getElementById('modal-settings').classList.remove('active');
        });
        
        document.getElementById('setting-darkmode')?.addEventListener('change', (e) => {
            const isDark = e.target.checked;
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
            document.querySelector('meta[name="theme-color"]').content = isDark ? '#121212' : '#FAFAFA';
            Storage.saveSetting('darkMode', isDark);
        });
        
        // PIN
        document.getElementById('btn-pin-setup')?.addEventListener('click', () => App.openPinSetupModal());
        
        // Backup
        document.getElementById('btn-backup')?.addEventListener('click', () => {
            const data = Storage.exportAll();
            const blob = new Blob([data], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'hariku-backup-' + new Date().toISOString().split('T')[0] + '.json';
            a.click();
            App.toast('💾 Backup berhasil!');
        });
        
        // Restore
        document.getElementById('btn-restore')?.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const f = e.target.files[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    Storage.importAll(ev.target.result);
                    App.toast('✅ Data direstore!');
                    App.refreshAll();
                };
                reader.readAsText(f);
            };
            input.click();
        });
        
        // Reset
        document.getElementById('btn-reset')?.addEventListener('click', () => {
            document.getElementById('modal-reset').classList.add('active');
            lucide.createIcons();
        });
        
        document.getElementById('btn-reset-confirm')?.addEventListener('click', () => {
            Storage.resetAll();
            document.getElementById('modal-reset').classList.remove('active');
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
        this.render(document.getElementById('app-content'));
    },
    
    escape(str) {
        const div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }
};
