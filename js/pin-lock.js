// ============================================
// pin-lock.js - Sistem PIN & Keamanan (FIXED)
// ============================================

const PinLock = {
    pinInput: '',
    maxAttempts: 3,
    attempts: 0,
    cooldownTime: 30,
    cooldownTimer: null,
    cooldownRemaining: 0,
    isSettingNewPin: false,
    newPinFirst: '',
    
    init() {
        this.pinInput = '';
        this.attempts = parseInt(Storage.load('pin_attempts', 0)) || 0;
        this.cooldownRemaining = 0;
        
        const pinHash = Storage.getPINHash();
        
        if (!pinHash) {
            this.isSettingNewPin = true;
            this.showSetPINMessage();
        } else {
            this.isSettingNewPin = false;
        }
        
        this.bindKeypad();
        this.setupResetButton();
        this.updateDots();
        this.updateProfileDisplay();
        
        console.log('🔐 PinLock initialized. isSettingNewPin:', this.isSettingNewPin);
    },
    
    bindKeypad() {
        const buttons = document.querySelectorAll('.keypad-btn[data-key]');
        
        buttons.forEach(btn => {
            // Hapus event listener lama dengan clone
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
        });
        
        // Bind ulang
        document.querySelectorAll('.keypad-btn[data-key]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.cooldownRemaining > 0) return;
                
                const key = btn.dataset.key;
                this.handleKeyPress(key);
            });
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (!document.getElementById('pin-screen').classList.contains('active')) return;
            if (this.cooldownRemaining > 0) return;
            
            if (e.key >= '0' && e.key <= '9') {
                this.handleKeyPress(e.key);
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                this.handleKeyPress('delete');
            }
        });
    },
    
    handleKeyPress(key) {
        if (key === 'delete') {
            if (this.pinInput.length > 0) {
                this.pinInput = this.pinInput.slice(0, -1);
                this.updateDots();
            }
            return;
        }
        
        if (key >= '0' && key <= '9') {
            if (this.pinInput.length < 6) {
                this.pinInput += key;
                this.updateDots();
                
                if (this.pinInput.length === 6) {
                    setTimeout(() => this.processPIN(), 250);
                }
            }
        }
    },
    
    updateDots() {
        const dots = document.querySelectorAll('#pin-dots .dot');
        dots.forEach((dot, index) => {
            if (index < this.pinInput.length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
        
        document.getElementById('pin-error').textContent = '';
    },
    
    processPIN() {
        if (this.isSettingNewPin) {
            if (!this.newPinFirst) {
                // First entry - simpan dulu
                this.newPinFirst = this.pinInput;
                this.pinInput = '';
                this.updateDots();
                document.getElementById('pin-subtitle').textContent = 'Konfirmasi PIN baru';
                document.getElementById('pin-greeting').textContent = '🔄 Ulangi PIN';
            } else {
                // Second entry - verify
                if (this.pinInput === this.newPinFirst) {
                    const hash = this.hashPIN(this.pinInput);
                    Storage.savePINHash(hash);
                    this.isSettingNewPin = false;
                    this.newPinFirst = '';
                    
                    document.getElementById('pin-greeting').textContent = '✅ Berhasil!';
                    document.getElementById('pin-subtitle').textContent = 'PIN berhasil dibuat';
                    
                    setTimeout(() => {
                        this.pinInput = '';
                        this.updateDots();
                        App.unlock();
                    }, 600);
                } else {
                    document.getElementById('pin-error').textContent = 'PIN tidak cocok. Coba lagi.';
                    this.newPinFirst = '';
                    this.pinInput = '';
                    this.updateDots();
                    document.getElementById('pin-subtitle').textContent = 'Buat PIN 6 digit baru';
                    document.getElementById('pin-greeting').textContent = '🔐 Atur PIN';
                }
            }
        } else {
            // Verify existing PIN
            this.verifyPIN();
        }
    },
    
    verifyPIN() {
        const pinHash = Storage.getPINHash();
        const inputHash = this.hashPIN(this.pinInput);
        
        if (inputHash === pinHash) {
            this.onSuccess();
        } else {
            this.onFailed();
        }
    },
    
    hashPIN(pin) {
        try {
            return CryptoJS.SHA256(pin + 'hariku-salt-2024').toString();
        } catch (e) {
            let hash = 0;
            const str = pin + 'hariku-salt-2024';
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash).toString(16);
        }
    },
    
    onSuccess() {
        this.attempts = 0;
        Storage.save('pin_attempts', 0);
        this.pinInput = '';
        
        document.querySelectorAll('#pin-dots .dot').forEach(d => d.classList.add('filled'));
        
        setTimeout(() => {
            this.updateDots();
            App.unlock();
        }, 300);
    },
    
    onFailed() {
        this.attempts++;
        Storage.save('pin_attempts', this.attempts);
        
        document.getElementById('pin-error').textContent = I18n.t('pin_error') || 'PIN salah. Coba lagi.';
        
        const dotsContainer = document.getElementById('pin-dots');
        dotsContainer.style.animation = 'none';
        dotsContainer.offsetHeight;
        dotsContainer.style.animation = 'shake 0.4s ease';
        
        this.pinInput = '';
        this.updateDots();
        
        if (this.attempts >= this.maxAttempts) {
            this.startCooldown();
        }
    },
    
    startCooldown() {
        this.cooldownRemaining = this.cooldownTime;
        this.updateCooldownDisplay();
        
        document.getElementById('pin-error').textContent = '';
        
        document.querySelectorAll('.keypad-btn[data-key]').forEach(btn => {
            btn.style.opacity = '0.5';
            btn.style.pointerEvents = 'none';
        });
        
        clearInterval(this.cooldownTimer);
        this.cooldownTimer = setInterval(() => {
            this.cooldownRemaining--;
            this.updateCooldownDisplay();
            
            if (this.cooldownRemaining <= 0) {
                clearInterval(this.cooldownTimer);
                this.attempts = 0;
                Storage.save('pin_attempts', 0);
                
                document.getElementById('pin-cooldown').textContent = '';
                document.querySelectorAll('.keypad-btn[data-key]').forEach(btn => {
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                });
            }
        }, 1000);
    },
    
    updateCooldownDisplay() {
        if (this.cooldownRemaining > 0) {
            const msg = (I18n.t('pin_cooldown') || 'Tunggu {seconds} detik')
                .replace('{seconds}', this.cooldownRemaining);
            document.getElementById('pin-cooldown').textContent = msg;
        }
    },
    
    showSetPINMessage() {
        document.getElementById('pin-greeting').textContent = '🔐 Atur PIN';
        document.getElementById('pin-subtitle').textContent = 'Buat PIN 6 digit baru';
        document.getElementById('pin-error').textContent = '';
        this.newPinFirst = '';
    },
    
    setupResetButton() {
        const resetBtn = document.getElementById('pin-reset-btn');
        const modal = document.getElementById('modal-reset-pin');
        
        if (!resetBtn || !modal) {
            console.error('❌ Reset button atau modal tidak ditemukan!');
            return;
        }
        
        resetBtn.addEventListener('click', () => {
            modal.classList.add('active');
        });
        
        document.getElementById('modal-reset-close')?.addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        document.getElementById('btn-reset-cancel')?.addEventListener('click', () => {
            modal.classList.remove('active');
        });
        
        document.getElementById('btn-reset-confirm')?.addEventListener('click', () => {
            Storage.resetAll();
            modal.classList.remove('active');
            this.pinInput = '';
            this.attempts = 0;
            this.isSettingNewPin = true;
            this.newPinFirst = '';
            this.updateDots();
            this.showSetPINMessage();
            this.showToast('Semua data telah direset!', 'error');
        });
        
        modal.querySelector('.modal-backdrop')?.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    },
    
    updateProfileDisplay() {
        const profile = Storage.getProfile();
        const avatar = document.getElementById('pin-avatar');
        const avatarText = document.getElementById('pin-avatar-text');
        
        if (!avatar || !avatarText) return;
        
        if (profile.photo) {
            avatar.innerHTML = `<img src="${profile.photo}" alt="Foto" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        } else if (profile.name) {
            avatarText.textContent = profile.name.charAt(0).toUpperCase();
        }
        
        if (profile.name && !this.isSettingNewPin) {
            document.getElementById('pin-greeting').textContent = 
                (I18n.t('pin_greeting') || 'Selamat Datang') + ', ' + profile.name;
        }
    },
    
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.className = 'toast ' + type + ' show';
        
        clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }
};