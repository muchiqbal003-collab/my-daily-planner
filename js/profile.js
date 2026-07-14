// ============================================
// profile.js - Profile & Settings V3.0
// Foto kiri + Nama + Quote + Menu
// ============================================

const Profile = {
    
    render(container) {
        const profile = Storage.getProfile();
        const hasPin = Storage.hasPin();
        
        const html = `
            <div style="padding:4px 0;">
                
                <!-- Profile Header Card -->
                <div class="card glass" style="padding:20px;margin-bottom:16px;">
                    <div style="display:flex;align-items:center;gap:16px;">
                        
                        <!-- Foto Kiri -->
                        <div style="position:relative;flex-shrink:0;">
                            <div class="profile-avatar" style="width:80px;height:80px;border-radius:50%;background:var(--bg-tertiary);
                                display:flex;align-items:center;justify-content:center;font-size:36px;
                                border:2px solid var(--border-medium);overflow:hidden;
                                box-shadow:var(--shadow-md);">
                                ${profile.photo 
                                    ? `<img src="${profile.photo}" alt="Foto" style="width:100%;height:100%;object-fit:cover;">` 
                                    : `<span>${profile.name ? profile.name.charAt(0).toUpperCase() : '👤'}</span>`}
                            </div>
                            <button class="btn-change-photo" id="btn-change-photo" title="Ganti Foto"
                                style="position:absolute;bottom:-2px;right:-2px;width:28px;height:28px;
                                border-radius:50%;background:var(--gradient-1);color:#fff;border:2px solid var(--bg-secondary);
                                cursor:pointer;display:flex;align-items:center;justify-content:center;
                                font-size:12px;box-shadow:var(--shadow-sm);">
                                <i data-lucide="camera" width="13" height="13"></i>
                            </button>
                        </div>
                        
                        <!-- Nama + Quote Kanan -->
                        <div style="flex:1;min-width:0;">
                            <input type="text" class="profile-name-input" id="profile-name" 
                                placeholder="Nama Kamu" value="${this.escape(profile.name)}" maxlength="40"
                                style="width:100%;padding:8px 12px;border-radius:8px;border:1.5px solid var(--border-medium);
                                background:var(--bg-tertiary);color:var(--text-primary);font-size:16px;font-weight:700;
                                font-family:'Inter',sans-serif;text-align:left;margin-bottom:6px;">
                            <input type="text" class="profile-quote-input" id="profile-quote"
                                placeholder="Tulis quote motivasi kamu..."
                                value="${this.escape(profile.quote || '')}" maxlength="100"
                                style="width:100%;padding:6px 12px;border-radius:8px;border:1.5px solid var(--border-medium);
                                background:var(--bg-tertiary);color:var(--text-secondary);font-size:12px;font-weight:400;
                                font-family:'Inter',sans-serif;font-style:italic;">
                        </div>
                        
                    </div>
                    
                    <!-- File size info -->
                    <p style="font-size:9px;color:var(--text-tertiary);margin-top:8px;text-align:right;">
                        ${profile.photo ? 'Foto tersimpan • Max 5MB' : 'Belum ada foto • Max 5MB'}
                    </p>
                </div>
                
                <!-- Quote Display (kalau ada) -->
                ${profile.quote ? `
                <div class="card glass" style="text-align:center;padding:16px;margin-bottom:16px;">
                    <i data-lucide="quote" width="20" height="20" style="color:var(--text-tertiary);margin-bottom:6px;"></i>
                    <p style="font-style:italic;color:var(--text-secondary);font-size:13px;">"${this.escape(profile.quote)}"</p>
                    <p style="font-size:9px;color:var(--text-tertiary);margin-top:4px;">— ${this.escape(profile.name) || 'Kamu'}</p>
                </div>
                ` : ''}
                
                <!-- Stats Mini -->
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:16px;">
                    <div class="stat-card" style="cursor:pointer;" onclick="App.navigateTo('habits')">
                        <div style="font-size:20px;font-weight:800;">${Storage.getHabits().length}</div>
                        <div class="stat-label">Habits</div>
                    </div>
                    <div class="stat-card" style="cursor:pointer;" onclick="App.navigateTo('tasks')">
                        <div style="font-size:20px;font-weight:800;">${Storage.getTasks().filter(t => !t.completed).length}</div>
                        <div class="stat-label">Tugas</div>
                    </div>
                    <div class="stat-card" style="cursor:pointer;" onclick="App.navigateTo('goals')">
                        <div style="font-size:20px;font-weight:800;">${Storage.getGoals().length}</div>
                        <div class="stat-label">Goals</div>
                    </div>
                </div>
                
                <!-- Menu Items -->
                <div class="card" style="padding:0;overflow:hidden;margin-bottom:16px;">
                    <button class="settings-item" id="btn-settings">
                        <i data-lucide="settings" width="18" height="18"></i>
                        <div>
                            <div style="font-weight:600;">Pengaturan</div>
                            <div style="font-size:10px;color:var(--text-tertiary);">Tema & preferensi</div>
                        </div>
                        <span class="settings-arrow">›</span>
                    </button>
                    <button class="settings-item" id="btn-pin-setup">
                        <i data-lucide="lock" width="18" height="18"></i>
                        <div>
                            <div style="font-weight:600;">${hasPin ? 'Ubah PIN' : 'Atur PIN'}</div>
                            <div style="font-size:10px;color:var(--text-tertiary);">
                                ${hasPin ? 'Ganti kode keamanan' : 'Aktifkan kunci aplikasi'}
                            </div>
                        </div>
                        <span class="settings-arrow">›</span>
                    </button>
                    <button class="settings-item" id="btn-backup">
                        <i data-lucide="download" width="18" height="18"></i>
                        <div>
                            <div style="font-weight:600;">Backup Data</div>
                            <div style="font-size:10px;color:var(--text-tertiary);">Simpan semua data ke file</div>
                        </div>
                        <span class="settings-arrow">›</span>
                    </button>
                    <button class="settings-item" id="btn-restore">
                        <i data-lucide="upload" width="18" height="18"></i>
                        <div>
                            <div style="font-weight:600;">Restore Data</div>
                            <div style="font-size:10px;color:var(--text-tertiary);">Pulihkan dari file backup</div>
                        </div>
                        <span class="settings-arrow">›</span>
                    </button>
                    <button class="settings-item" id="btn-reset" style="color:var(--danger);">
                        <i data-lucide="alert-triangle" width="18" height="18"></i>
                        <div>
                            <div style="font-weight:600;color:var(--danger);">Reset Semua</div>
                            <div style="font-size:10px;color:var(--text-tertiary);">Hapus seluruh data</div>
                        </div>
                        <span class="settings-arrow" style="color:var(--danger);">›</span>
                    </button>
                </div>
                
                <!-- App Info -->
                <div style="text-align:center;">
                    <p class="app-version">Hariku V3.0 • Premium</p>
                    <p style="font-size:9px;color:var(--text-tertiary);margin-top:2px;">
                        ${Storage.getStats().tasksCompletedTotal} tugas selesai • ${Storage.getStats().focusTotal} sesi fokus
                    </p>
                </div>
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindEvents();
        setTimeout(() => lucide.createIcons(), 50);
    },
    
    bindEvents() {
        // Change photo
        const btnPhoto = document.getElementById('btn-change-photo');
        if (btnPhoto) {
            btnPhoto.replaceWith(btnPhoto.cloneNode(true));
            document.getElementById('btn-change-photo')?.addEventListener('click', () => {
                document.getElementById('file-photo-input').click();
            });
        }
        
        // File input — max 5MB
        const fileInput = document.getElementById('file-photo-input');
        if (fileInput) {
            fileInput.replaceWith(fileInput.cloneNode(true));
            document.getElementById('file-photo-input')?.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                // Validasi ukuran max 5MB
                if (file.size > 5 * 1024 * 1024) {
                    App.toast('⚠️ Ukuran maksimal 5MB!');
                    return;
                }
                
                // Validasi tipe file
                if (!file.type.startsWith('image/')) {
                    App.toast('⚠️ File harus gambar!');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (ev) => {
                    // Kompres gambar sebelum simpan
                    this.compressImage(ev.target.result, 300, (compressed) => {
                        const p = Storage.getProfile();
                        p.photo = compressed;
                        Storage.saveProfile(p);
                        this.refresh();
                        App.toast('✅ Foto diupdate!');
                    });
                };
                reader.readAsDataURL(file);
            });
        }
        
        // Name input
        const nameInput = document.getElementById('profile-name');
        if (nameInput) {
            nameInput.replaceWith(nameInput.cloneNode(true));
            document.getElementById('profile-name')?.addEventListener('input', (e) => {
                const p = Storage.getProfile();
                p.name = e.target.value.trim();
                Storage.saveProfile(p);
            });
        }
        
        // Quote input
        const quoteInput = document.getElementById('profile-quote');
        if (quoteInput) {
            quoteInput.replaceWith(quoteInput.cloneNode(true));
            document.getElementById('profile-quote')?.addEventListener('input', (e) => {
                const p = Storage.getProfile();
                p.quote = e.target.value.trim();
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
                    if (Storage.importAll(ev.target.result)) {
                        App.toast('✅ Data direstore!');
                        App.refreshAll();
                    } else {
                        App.toast('❌ Format tidak valid!');
                    }
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
    
    // Kompres gambar sebelum simpan
    compressImage(base64, maxSize, callback) {
        const img = new Image();
        img.src = base64;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Resize kalau terlalu besar
            if (width > height) {
                if (width > maxSize) {
                    height *= maxSize / width;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width *= maxSize / height;
                    height = maxSize;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Kompres ke JPEG 70%
            callback(canvas.toDataURL('image/jpeg', 0.7));
        };
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
