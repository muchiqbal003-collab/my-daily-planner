// ============================================
// charts.js - Canvas Chart Renderer
// ============================================

const Charts = {
    currentType: 'category',
    
    render(canvasId, expenses, categories) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        
        // Set canvas size
        const container = canvas.parentElement;
        const w = container.clientWidth;
        const h = 200;
        
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.scale(dpr, dpr);
        
        // Clear
        ctx.clearRect(0, 0, w, h);
        
        if (this.currentType === 'category') {
            this.renderPieChart(ctx, w, h, expenses, categories);
        } else {
            this.renderBarChart(ctx, w, h, expenses);
        }
    },
    
    renderPieChart(ctx, w, h, expenses, categories) {
        // Calculate totals per category
        const totals = {};
        categories.forEach(c => totals[c.id] = 0);
        expenses.forEach(e => {
            if (totals[e.category] !== undefined) {
                totals[e.category] += e.amount;
            } else if (!totals[e.category]) {
                totals[e.category] = e.amount;
            }
        });
        
        const activeCategories = categories.filter(c => totals[c.id] > 0);
        
        if (activeCategories.length === 0) {
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim();
            ctx.font = '500 13px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Belum ada data pengeluaran', w / 2, h / 2);
            return;
        }
        
        const total = activeCategories.reduce((s, c) => s + totals[c.id], 0);
        const colors = [
            '#6366f1', '#8b5cf6', '#a78bfa', '#22c55e', '#f59e0b',
            '#ef4444', '#06b6d4', '#ec4899', '#14b8a6', '#f97316'
        ];
        
        const cx = w / 2;
        const cy = h / 2 - 5;
        const radius = Math.min(cx, cy) - 25;
        
        let startAngle = -Math.PI / 2;
        
        // Draw slices
        activeCategories.forEach((cat, i) => {
            const sliceAngle = (totals[cat.id] / total) * 2 * Math.PI;
            
            // Draw slice
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            
            // Gradient fill
            const grad = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius);
            grad.addColorStop(0, colors[i % colors.length]);
            grad.addColorStop(1, colors[i % colors.length] + 'cc');
            ctx.fillStyle = grad;
            ctx.fill();
            
            // Slice border
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim();
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw icon in center of slice
            const midAngle = startAngle + sliceAngle / 2;
            const iconX = cx + Math.cos(midAngle) * (radius * 0.65);
            const iconY = cy + Math.sin(midAngle) * (radius * 0.65);
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(cat.icon, iconX, iconY);
            
            startAngle += sliceAngle;
        });
        
        // Center circle (donut hole)
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.5, 0, 2 * Math.PI);
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim();
        ctx.fill();
        
        // Center text
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
        ctx.font = '800 16px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.formatAmount(total), cx, cy);
        
        // Legend
        const legendY = h - 5;
        ctx.font = '600 9px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim();
        const legendText = activeCategories.map(c => `${c.icon} ${c.name}`).join('  •  ');
        ctx.fillText(legendText, w / 2, legendY);
    },
    
    renderBarChart(ctx, w, h, expenses) {
        // Group by date
        const daily = {};
        expenses.forEach(e => {
            daily[e.date] = (daily[e.date] || 0) + e.amount;
        });
        
        const dates = Object.keys(daily).sort();
        const recentDates = dates.slice(-7);
        
        if (recentDates.length === 0) {
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim();
            ctx.font = '500 13px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Belum ada data pengeluaran', w / 2, h / 2);
            return;
        }
        
        const maxAmount = Math.max(...recentDates.map(d => daily[d]), 1);
        const padding = { top: 20, bottom: 30, left: 5, right: 5 };
        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;
        const barGap = 8;
        const barWidth = (chartW / recentDates.length) - barGap;
        
        // Draw bars
        recentDates.forEach((date, i) => {
            const x = padding.left + i * (chartW / recentDates.length) + barGap / 2;
            const barH = (daily[date] / maxAmount) * chartH;
            const y = padding.top + chartH - barH;
            
            // Bar gradient
            const grad = ctx.createLinearGradient(x, y, x, y + barH);
            grad.addColorStop(0, '#818cf8');
            grad.addColorStop(1, '#6366f1');
            
            ctx.fillStyle = grad;
            ctx.beginPath();
            this.roundRect(ctx, x, y, barWidth, barH, 6);
            ctx.fill();
            
            // Amount label
            if (daily[date] > 0) {
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
                ctx.font = '600 9px "Inter", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(this.formatAmount(daily[date]), x + barWidth / 2, y - 6);
            }
            
            // Date label
            const d = new Date(date);
            const dateLabel = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-tertiary').trim();
            ctx.font = '600 8px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(dateLabel, x + barWidth / 2, h - 8);
        });
    },
    
    roundRect(ctx, x, y, w, h, r) {
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
    },
    
    formatAmount(amount) {
        if (amount >= 1000000) return 'Rp ' + (amount / 1000000).toFixed(1) + 'M';
        if (amount >= 1000) return 'Rp ' + (amount / 1000).toFixed(0) + 'K';
        return 'Rp ' + amount;
    },
    
    setType(type) {
        this.currentType = type;
    }
};