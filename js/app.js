// ============================================
// app.js - Main Controller V3.1
// Sidebar + Bottom Nav + 16 Pages
// ============================================

const App = {
    currentPage: 'dashboard',
    sidebarOpen: false,
    
    // PIN variables
    pinInput: '',
    pinAttempts: 0,
    maxAttempts: 3,
    cooldownTimer: null,
    cooldownSeconds: 0,
    
    // PIN Modal variables
    modalPinInput: '',
    modalPinStep: 1,
    modalPinFirst: '',
    
    // Page titles
    pageTitles: {
        dashboard: 'Dashboard',
        habits: 'Habit Tracker',
        tasks: 'Tugas',
        finance: 'Keuangan',
        invest: 'Investasi',
        goals: 'Life Goals',
        schedule: 'Jadwal Harian',
        journal: 'Jurnal Harian',
        ideas: 'Catatan Ide',
        books: 'Buku Dibaca',
        learn: 'Wishlist Belajar',
        mood: 'Mood Tracker',
        achievements: 'Achievement',
        reminders: 'Reminder',
        stats: 'Statistik',
        profile: 'Pengaturan'
    },
    
    // ========== INIT ==========
    init() {
        console.log('🚀 Hariku V3.1 starting...');
        
        const darkMode = Storage.getSetting('darkMode', true);
        if (darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.querySelector('meta[name="theme-color"]').content = '#121212';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            document.querySelector('meta[name="theme-color"]').content = '#FAFAFA';
        }
        
        if (Storage.hasPin()) {
            this.showPinScreen();
        } else {
            this.showAppScreen();
        }
        
        this.bindSidebar();
        this.bindNavigation();
        this.bindThemeToggle();
        this.bindPinKeypad();
        this.bindModalPinKeypad();
        this.bindPinReset();
        
        lucide.createIcons();
        
        console.log('✅ App initialized');
    },
    
    // ========== SIDEBAR ==========
    bindSidebar() {
        document.getElementById('btn-menu')?.addEventListener('click', () => this.openSidebar());
        document.getElementById('sidebar-close')?.addEventListener('click', () => this.closeSidebar());
        document.getElementById('sidebar-overlay')?.addEventListener('click', () => this.closeSidebar());
        
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    this.navigateTo(page);
                    this.closeSidebar();
                }
            });
        });
        
        // Swipe gesture
        let touchStartX = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });
        
        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchEndX - touchStartX;
            
            if (diff > 80 && touchStartX < 30 && !this.sidebarOpen) {
                this.openSidebar();
            }
            
            if (diff < -80 && this.sidebarOpen) {
                this.closeSidebar();
            }
        });
    },
    
    openSidebar() {
        this.sidebarOpen = true;
        document.getElementById('sidebar').classList.add('active');
        document.getElementById('sidebar-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    },
    
    closeSidebar() {
        this.sidebarOpen = false;
        document.getElementById('sidebar').classList.remove('active');
        document.getElementById('sidebar-overlay').classList.remove('active');
        document.body.style.overflow = '';
    },
    
    // ========== NAVIGATION ==========
    bindNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                if (page) this.navigateTo(page);
            });
        });
    },
    
    navigateTo(page) {
        if (this.currentPage === page) return;
        this.currentPage = page;
        
        // Update sidebar
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        
        // Update bottom nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        
        // Update title
        document.getElementById('app-title').textContent = this.pageTitles[page] || 'Hariku';
        
        // Render
        const container = document.getElementById('app-content');
        if (!container) return;
        container.innerHTML = '';
        
        this.renderPage(page, container);
        
        setTimeout(() => lucide.createIcons(), 100);
        container.scrollTop = 0;
    },
    
    renderPage(page, container) {
        switch(page) {
            case 'dashboard': Dashboard.render(container); break;
            case 'habits': Habits.render(container); break;
            case 'tasks': Tasks.render(container); break;
            case 'finance': Finance.render(container); break;
            case 'invest': Invest.render(container); break;
            case 'goals': Goals.render(container); break;
            case 'schedule': Schedule.render(container); break;
            case 'journal': Journal.render(container); break;
            case 'ideas': Ideas.render(container); break;
            case 'books': Books.render(container); break;
            case 'learn': Learn.render(container); break;
            case 'mood': Mood.render(container); break;
            case 'achievements': Achievements.render(container); break;
            case 'reminders': Reminders.render(container); break;
            case 'stats': Stats.render(container); break;
            case 'profile': Profile.render(container); break;
            default: Dashboard.render(container);
        }
    },
    
    refreshAll() {
        const current = this.currentPage;
        this.currentPage = '';
        this.navigateTo(current);
    },
    
    // ========== THEME ==========
    bindThemeToggle() {
        document.getElementById('btn-theme')?.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.documentElement.setAttribute('data-theme', 'light');
                document.querySelector('meta[name="theme-color"]').content = '#FAFAFA';
                Storage.saveSetting('darkMode', false);
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                document.querySelector('meta[name="theme-color"]').content = '#121212';
                Storage.saveSetting('darkMode', true);
            }
            lucide.createIcons();
        });
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
        document.getElementById('app-screen').style.display = 'flex';
        document.getElementById('app-screen').classList.add('active');
        
        this.navigateTo('dashboard');
        lucide.createIcons();
    },
    
    updatePinGreeting() {
        const profile = Storage.getProfile();
        const avatar = document.getElementById('pin-avatar');
        
        if (profile.photo) {
            avatar.innerHTML = `<img src="${profile.photo}" alt="Foto">`;
        } else if (profile.name) {
            avatar.innerHTML = `<span>${profile.name.charAt(0).toUpperCase()}</span>`;
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
                    if (this.pinInput.length > 0) this.pinInput = this.pinInput.slice(0, -1);
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
        document.getElementById('pin-cooldown').textContent = 'Tunggu 30 detik...';
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
                document.getElementById('pin-cooldown').textContent = 'Tunggu ' + this.cooldownSeconds + ' detik...';
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
        
        document.getElementById('modal-pin-desc').textContent = 'Buat PIN 6 digit';
        document.getElementById('pin-modal-error').textContent = '';
        document.getElementById('modal-pin-setup').classList.add('active');
        lucide.createIcons();
    },
    
    bindModalPinKeypad() {
        document.querySelectorAll('.keypad-btn-modal[data-key]').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.key;
                
                if (key === 'delete') {
                    if (this.modalPinInput.length > 0) this.modalPinInput = this.modalPinInput.slice(0, -1);
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
            document.getElementById('modal-pin-desc').textContent = 'Konfirmasi PIN';
        } else {
            if (this.modalPinInput === this.modalPinFirst) {
                Storage.savePINHash(this.hashPin(this.modalPinInput));
                this.closePinSetupModal();
                this.toast('✅ PIN berhasil disimpan!');
                if (this.currentPage === 'profile') Profile.refresh();
            } else {
                document.getElementById('pin-modal-error').textContent = 'PIN tidak cocok!';
                this.modalPinStep = 1;
                this.modalPinFirst = '';
                this.modalPinInput = '';
                this.updatePinDots('pin-dots-modal', '');
                document.getElementById('modal-pin-desc').textContent = 'Buat PIN 6 digit';
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
        dots.forEach((dot, i) => dot.classList.toggle('filled', i < input.length));
    },
    
    hashPin(pin) {
        let hash = 0;
        const str = pin + 'hariku-salt-v3';
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
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
        this._toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
    },
    
    formatAmount(amount) {
        if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M';
        if (amount >= 1000) return (amount / 1000).toFixed(0) + 'K';
        return amount.toString();
    },
    
    formatDate(dateStr) {
        const d = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (dateStr === today.toISOString().split('T')[0]) return 'Hari ini';
        if (dateStr === yesterday.toISOString().split('T')[0]) return 'Kemarin';
        if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Besok';
        
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());

window.addEventListener('popstate', () => {
    if (Storage.hasPin() && document.getElementById('pin-screen').style.display === 'flex') {
        history.pushState(null, '', window.location.href);
    }
});
history.pushState(null, '', window.location.href);
