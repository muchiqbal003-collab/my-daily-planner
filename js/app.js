// ============================================
// app.js - Main Application Controller (FIXED)
// ============================================

const App = {
    currentTab: 'dashboard',
    
    // PIN lock variables
    pinInput: '',
    pinAttempts: 0,
    maxAttempts: 3,
    cooldownTimer: null,
    cooldownSeconds: 0,
    
    // PIN modal variables
    modalPinInput: '',
    modalPinStep: 1,
    modalPinFirst: '',
    
    // ========== INITIALIZATION ==========
    init() {
        console.log('🚀 Hariku v2.0 starting...');
        
        // Load theme
        const darkMode = Storage.getSetting('darkMode', true);
        if (darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.querySelector('meta[name="theme-color"]').content = '#09090d';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            document.querySelector('meta[name="theme-color"]').content = '#f5f5f9';
        }
        
        // Check PIN
        if (Storage.hasPin()) {
            this.showPinScreen();
        } else {
            this.showAppScreen();
        }
        
        // Bind core events (hanya sekali)
        this.bindNavigation();
        this.bindThemeToggle();
        this.bindPinKeypad();
        this.bindModalPinKeypad();
        this.bindPinReset();
        
        console.log('✅ App initialized');
    },
    
    // ========== NAVIGATION ==========
    bindNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.dataset.tab;
                this.switchTab(tab);
            });
        });
    },
    
    switchTab(tab) {
        // ⬅️ GUARD: Jangan render ulang tab yang sama
        if (this.currentTab === tab) return;
        
        this.currentTab = tab;
        
        // Update nav active state
        document.querySelectorAll('.nav-item').forEach(i => {
            i.classList.toggle('active', i.dataset.tab === tab);
        });
        
        // Update header title
        const titles = {
            dashboard: 'Hariku',
            tasks: 'Tugas',
            finance: 'Keuangan',
            profile: 'Profil'
        };
        document.getElementById('app-title').textContent = titles[tab] || 'Hariku';
        
        // Hapus konten lama (biar event listener ikut hilang)
        const container = document.getElementById('app-content');
        if (!container) return;
        container.innerHTML = '';
        
        // Render konten baru
        switch(tab) {
            case 'dashboard':
                Dashboard.render(container);
                break;
            case 'tasks':
                Tasks.render(container);
                break;
            case 'finance':
                Finance.render(container);
                break;
            case 'profile':
                Profile.render(container);
                break;
        }
        
        // Show/hide FAB
        const fab = document.getElementById('btn-add-expense');
        if (fab) {
            fab.style.display = tab === 'finance' ? 'flex' : 'none';
        }
    },
    
    refreshAll() {
        // Reset currentTab biar switchTab bisa jalan
        const current = this.currentTab;
        this.currentTab = '';
        this.switchTab(current);
    },
    
    // ========== THEME ==========
    bindThemeToggle() {
        const themeBtn = document.getElementById('btn-theme');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                if (isDark) {
                    document.documentElement.setAttribute('data-theme', 'light');
                    document.querySelector('meta[name="theme-color"]').content = '#f5f5f9';
                    Storage.saveSetting('darkMode', false);
                } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.querySelector('meta[name="theme-color"]').content = '#09090d';
                    Storage.saveSetting('darkMode', true);
                }
            });
        }
    },
    
    // ========== PIN SCREEN ==========
    showPinScreen() {
        document.getElementById('pin-screen').style.display = 'flex';
        document.getElementById('app-screen').style.display = 'none';
        document.getElementById('pin-screen').classList.add('active');
        document.getElementById('app-screen').classList.remove('active');
        
        this.updatePinGreeting();
        this.pinInput = '';
        this.pinAttempts = 0;
        this.updatePinDots('pin-dots', '');
        document.getElementById('pin-error').textContent = '';
        document.getElementById('pin-cooldown').textContent = '';
    },
    
    showAppScreen() {
        document.getElementById('pin-screen').style.display = 'none';
        document.getElementById('pin-screen').classList.remove('active');
        document.getElementById('app-screen').style.display = 'flex';
        document.getElementById('app-screen').classList.add('active');
        
        this.switchTab('dashboard');
    },
    
    updatePinGreeting() {
        const profile = Storage.getProfile();
        const avatar = document.getElementById('pin-avatar');
        
        if (profile.photo) {
            avatar.innerHTML = `<img src="${profile.photo}" alt="Foto">`;
        } else if (profile.name) {
            avatar.innerHTML = `<span id="pin-avatar-emoji">${profile.name.charAt(0).toUpperCase()}</span>`;
        }
        
        if (profile.name) {
            document.getElementById('pin-greeting').textContent = 'Halo, ' + profile.name;
        }
    },
    
    bindPinKeypad() {
        document.querySelectorAll('#pin-screen .keypad-btn[data-key]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.cooldownSeconds > 0) return;
                
                const key = btn.dataset.key;
                if (key === 'delete') {
                    if (this.pinInput.length > 0) {
                        this.pinInput = this.pinInput.slice(0, -1);
                    }
                } else if (this.pinInput.length < 6) {
                    this.pinInput += key;
                }
                
                this.updatePinDots('pin-dots', this.pinInput);
                document.getElementById('pin-error').textContent = '';
                
                if (this.pinInput.length === 6) {
                    setTimeout(() => this.verifyPin(), 200);
                }
            });
        });
    },
    
    verifyPin() {
        const hash = this.hashPin(this.pinInput);
        
        if (hash === Storage.getPINHash()) {
            this.pinAttempts = 0;
            this.pinInput = '';
            this.updatePinDots('pin-dots', '');
            this.showAppScreen();
            this.toast('✅ Selamat datang!');
        } else {
            this.pinAttempts++;
            this.pinInput = '';
            this.updatePinDots('pin-dots', '');
            document.getElementById('pin-error').textContent = 'PIN salah!';
            
            const dots = document.getElementById('pin-dots');
            dots.style.animation = 'none';
            dots.offsetHeight;
            dots.style.animation = 'shake 0.5s ease';
            
            if (this.pinAttempts >= this.maxAttempts) {
                this.startCooldown();
            }
        }
    },
    
    startCooldown() {
        this.cooldownSeconds = 30;
        document.getElementById('pin-cooldown').textContent = 'Terlalu banyak percobaan. Tunggu 30 detik';
        document.getElementById('pin-error').textContent = '';
        
        document.querySelectorAll('#pin-screen .keypad-btn[data-key]').forEach(b => {
            b.style.opacity = '0.4';
            b.style.pointerEvents = 'none';
        });
        
        clearInterval(this.cooldownTimer);
        this.cooldownTimer = setInterval(() => {
            this.cooldownSeconds--;
            
            if (this.cooldownSeconds <= 0) {
                clearInterval(this.cooldownTimer);
                this.pinAttempts = 0;
                document.getElementById('pin-cooldown').textContent = '';
                document.querySelectorAll('#pin-screen .keypad-btn[data-key]').forEach(b => {
                    b.style.opacity = '1';
                    b.style.pointerEvents = 'auto';
                });
            } else {
                document.getElementById('pin-cooldown').textContent = 
                    'Terlalu banyak percobaan. Tunggu ' + this.cooldownSeconds + ' detik';
            }
        }, 1000);
    },
    
    bindPinReset() {
        document.getElementById('pin-reset-btn')?.addEventListener('click', () => {
            document.getElementById('modal-reset').classList.add('active');
        });
    },
    
    // ========== PIN SETUP MODAL ==========
    openPinSetupModal() {
        this.modalPinStep = 1;
        this.modalPinFirst = '';
        this.modalPinInput = '';
        this.updatePinDots('pin-dots-modal', '');
        
        document.getElementById('modal-pin-title').innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" stroke-width="2" stroke-linecap="round" style="vertical-align:middle;margin-right:6px;">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>Atur PIN`;
        document.getElementById('modal-pin-desc').textContent = 'Buat PIN 6 digit untuk keamanan';
        document.getElementById('pin-modal-error').textContent = '';
        document.getElementById('modal-pin-setup').classList.add('active');
    },
    
    bindModalPinKeypad() {
        document.querySelectorAll('.keypad-btn-modal[data-key]').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.key;
                
                if (key === 'delete') {
                    if (this.modalPinInput.length > 0) {
                        this.modalPinInput = this.modalPinInput.slice(0, -1);
                    }
                } else if (this.modalPinInput.length < 6) {
                    this.modalPinInput += key;
                }
                
                this.updatePinDots('pin-dots-modal', this.modalPinInput);
                document.getElementById('pin-modal-error').textContent = '';
                
                if (this.modalPinInput.length === 6) {
                    setTimeout(() => this.processModalPin(), 200);
                }
            });
        });
        
        document.getElementById('modal-pin-close')?.addEventListener('click', () => this.closePinSetupModal());
        document.querySelector('#modal-pin-setup .modal-backdrop')?.addEventListener('click', () => this.closePinSetupModal());
    },
    
    processModalPin() {
        if (this.modalPinStep === 1) {
            this.modalPinFirst = this.modalPinInput;
            this.modalPinInput = '';
            this.modalPinStep = 2;
            this.updatePinDots('pin-dots-modal', '');
            
            document.getElementById('modal-pin-title').textContent = 'Konfirmasi PIN';
            document.getElementById('modal-pin-desc').textContent = 'Masukkan lagi PIN yang sama';
        } else {
            if (this.modalPinInput === this.modalPinFirst) {
                const hash = this.hashPin(this.modalPinInput);
                Storage.savePINHash(hash);
                this.closePinSetupModal();
                this.toast('✅ PIN berhasil disimpan!');
                
                if (this.currentTab === 'profile') {
                    Profile.refresh();
                }
            } else {
                document.getElementById('pin-modal-error').textContent = 'PIN tidak cocok! Coba lagi.';
                this.modalPinStep = 1;
                this.modalPinFirst = '';
                this.modalPinInput = '';
                this.updatePinDots('pin-dots-modal', '');
                
                document.getElementById('modal-pin-title').textContent = 'Atur PIN';
                document.getElementById('modal-pin-desc').textContent = 'Buat PIN 6 digit untuk keamanan';
            }
        }
    },
    
    closePinSetupModal() {
        document.getElementById('modal-pin-setup').classList.remove('active');
        this.modalPinStep = 1;
        this.modalPinFirst = '';
        this.modalPinInput = '';
    },
    
    // ========== HELPERS ==========
    updatePinDots(dotsId, input) {
        const dots = document.querySelectorAll('#' + dotsId + ' .dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('filled', i < input.length);
        });
    },
    
    hashPin(pin) {
        let hash = 0;
        const str = pin + 'hariku-salt-v2-2024';
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    },
    
    toast(message) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.classList.add('show');
        
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 2200);
    }
};

// ========== START APPLICATION ==========
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// ========== HANDLE BACK BUTTON ==========
window.addEventListener('popstate', (e) => {
    if (Storage.hasPin && Storage.hasPin() && document.getElementById('pin-screen').style.display === 'flex') {
        history.pushState(null, '', window.location.href);
    }
});

history.pushState(null, '', window.location.href);
