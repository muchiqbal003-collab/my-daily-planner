// ============================================
// focus.js - Pomodoro Timer
// ============================================

const Focus = {
    timerSeconds: 25 * 60,
    remaining: 25 * 60,
    isRunning: false,
    timerInterval: null,
    sessions: 0,
    
    render(container) {
        const today = new Date().toISOString().split('T')[0];
        const sessions = Storage.getFocusSessions();
        const todaySessions = sessions.filter(s => s.date === today).length;
        const totalSessions = sessions.length;
        
        const mins = Math.floor(this.remaining / 60);
        const secs = this.remaining % 60;
        const timeStr = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
        
        const html = `
            <div style="padding:4px 0;text-align:center;">
                
                <!-- Timer Circle -->
                <div style="position:relative;width:200px;height:200px;margin:20px auto 24px;">
                    <svg width="200" height="200" viewBox="0 0 200 200">
                        <circle cx="100" cy="100" r="90" stroke="var(--bg-tertiary)" stroke-width="8" fill="none"/>
                        <circle cx="100" cy="100" r="90" stroke="var(--accent)" stroke-width="8" fill="none"
                                stroke-dasharray="${2 * Math.PI * 90}" 
                                stroke-dashoffset="${2 * Math.PI * 90 * (1 - (this.timerSeconds - this.remaining) / this.timerSeconds)}"
                                stroke-linecap="round" transform="rotate(-90 100 100)" 
                                style="transition:stroke-dashoffset 1s linear;"/>
                    </svg>
                    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
                        <div style="font-size:42px;font-weight:900;letter-spacing:-0.04em;" id="timer-display">${timeStr}</div>
                        <div style="font-size:10px;color:var(--text-tertiary);">${this.isRunning ? 'Fokus...' : 'Siap'}</div>
                    </div>
                </div>
                
                <!-- Controls -->
                <div style="display:flex;gap:10px;justify-content:center;margin-bottom:20px;">
                    <button class="btn btn-primary" id="btn-start-pause" style="flex:0;padding:12px 28px;font-size:15px;">
                        <i data-lucide="${this.isRunning ? 'pause' : 'play'}" width="18" height="18"></i>
                        ${this.isRunning ? 'Pause' : 'Mulai'}
                    </button>
                    <button class="btn btn-secondary" id="btn-reset" style="flex:0;padding:12px 20px;">
                        <i data-lucide="rotate-ccw" width="18" height="18"></i>
                    </button>
                </div>
                
                <!-- Stats -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <div class="stat-card">
                        <i data-lucide="timer" width="20" height="20" style="color:var(--accent-light);margin-bottom:4px;"></i>
                        <div class="stat-value">${todaySessions}</div>
                        <div class="stat-label">Sesi Hari Ini</div>
                    </div>
                    <div class="stat-card">
                        <i data-lucide="zap" width="20" height="20" style="color:#F59E0B;margin-bottom:4px;"></i>
                        <div class="stat-value amber">${totalSessions}</div>
                        <div class="stat-label">Total Sesi</div>
                    </div>
                </div>
                
            </div>
        `;
        
        container.innerHTML = html;
        this.bindEvents();
        setTimeout(() => lucide.createIcons(), 50);
    },
    
    bindEvents() {
        document.getElementById('btn-start-pause')?.addEventListener('click', () => {
            if (this.isRunning) {
                this.pause();
            } else {
                this.start();
            }
        });
        
        document.getElementById('btn-reset')?.addEventListener('click', () => {
            this.reset();
        });
    },
    
    start() {
        this.isRunning = true;
        this.timerInterval = setInterval(() => {
            if (this.remaining > 0) {
                this.remaining--;
                this.updateDisplay();
                
                if (this.remaining === 0) {
                    this.complete();
                }
            }
        }, 1000);
        this.updateDisplay();
    },
    
    pause() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        this.updateDisplay();
    },
    
    reset() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        this.remaining = this.timerSeconds;
        this.updateDisplay();
    },
    
    complete() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        this.remaining = this.timerSeconds;
        this.sessions++;
        
        Storage.saveFocusSession({
            date: new Date().toISOString().split('T')[0],
            duration: this.timerSeconds,
            completedAt: new Date().toISOString()
        });
        
        App.toast('✅ Sesi fokus selesai!');
        this.updateDisplay();
        
        // Refresh untuk update stats
        setTimeout(() => this.refresh(), 500);
    },
    
    updateDisplay() {
        const mins = Math.floor(this.remaining / 60);
        const secs = this.remaining % 60;
        const timeStr = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
        
        const display = document.getElementById('timer-display');
        if (display) display.textContent = timeStr;
        
        const btn = document.getElementById('btn-start-pause');
        if (btn) {
            btn.innerHTML = `<i data-lucide="${this.isRunning ? 'pause' : 'play'}" width="18" height="18"></i> ${this.isRunning ? 'Pause' : 'Mulai'}`;
            lucide.createIcons();
        }
    },
    
    refresh() {
        this.render(document.getElementById('app-content'));
    }
};