/**
 * Artifex ASCII Pattern Engine - Rebuilt for Clarity
 * Creates dithered geometric patterns using a dense grid of spots.
 */

class PatternEngine {
    constructor() {
        this.canvas = document.getElementById('pattern-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.spacing = 12; // Denser grid for better shape definition
        this.dotSize = 1.2;
        this.time = 0;
        
        this.mouse = { x: -1000, y: -1000 };
        
        this.init();
        this.animate();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.cols = Math.ceil(this.canvas.width / this.spacing) + 1;
        this.rows = Math.ceil(this.canvas.height / this.spacing) + 1;
    }

    // Mathematical utility for triangle distance
    getTriangleDist(x, y, tx, ty, size) {
        const dx = Math.abs(x - tx) * 1.732;
        const dy = y - ty;
        const d1 = dy + size;
        const d2 = size - dy - dx;
        const d3 = size - dy + dx;
        return -Math.min(d1, d2, d3); // Result is distance from edges
    }

    getShapeAlpha(x, y, time) {
        let alpha = 0;
        
        // 1. Large drifting circles (Primary)
        const cx1 = this.canvas.width * 0.2 + Math.cos(time * 0.4) * 150;
        const cy1 = this.canvas.height * 0.4 + Math.sin(time * 0.2) * 150;
        const dist1 = Math.sqrt((x - cx1) ** 2 + (y - cy1) ** 2);
        const radius1 = 250;
        if (Math.abs(dist1 - radius1) < 40) alpha += 0.3; // Soft glow
        if (Math.abs(dist1 - radius1) < 2) alpha += 1.0;  // Sharp ring

        // 2. Secondary sharp ring (Inner ring of Circle 1)
        if (Math.abs(dist1 - radius1 * 0.7) < 1.5) alpha += 0.8;

        // 2b. Bottom-Right Circle (Restored)
        const cx2 = this.canvas.width * 0.85 + Math.sin(this.time * 0.3) * 100;
        const cy2 = this.canvas.height * 0.85 + Math.cos(this.time * 0.5) * 100;
        const dist2 = Math.sqrt((x - cx2) ** 2 + (y - cy2) ** 2);
        const radius2 = 180 + Math.sin(this.time * 0.6) * 20;
        if (Math.abs(dist2 - radius2) < 35) alpha += 0.3; // Glow
        if (Math.abs(dist2 - radius2) < 2) alpha += 1.0;  // Sharp ring
        if (Math.abs(dist2 - radius2 * 0.6) < 1.5) alpha += 0.7; // Inner ring

        // 3. Featured Top-Right Triangle (Built like the circle)
        const tx = this.canvas.width * 0.85 + Math.sin(time * 0.3) * 50;
        const ty = this.canvas.height * 0.15 + Math.cos(time * 0.4) * 50;
        const tSize = 140 + Math.sin(time * 0.8) * 15;
        
        const distT = this.getTriangleDist(x, y, tx, ty, tSize);
        // "Circle-style" logic: thick outer glow + sharp edge
        if (Math.abs(distT) < 35) alpha += 0.3; // Glow
        if (Math.abs(distT) < 2) alpha += 1.0;  // Sharp wireframe

        // 4. Scanner Line
        const scannerY = (time * 150) % (this.canvas.height + 600) - 300;
        if (Math.abs(y - scannerY) < 1.5) alpha += 0.6;
        
        // 5. Grid/ASCII Dither Overlay
        const gridX = Math.floor(x / 300);
        const gridY = Math.floor(y / 300);
        if ((gridX + gridY) % 2 === 0 && (x % 300 < 5 || y % 300 < 5)) {
            alpha += 0.1;
        }

        // 6. Mouse Interaction
        const mDist = Math.sqrt((x - this.mouse.x) ** 2 + (y - this.mouse.y) ** 2);
        if (mDist < 120) {
            alpha += (1 - mDist / 120) * 0.4;
        }

        return Math.min(alpha, 1);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ffffff';
        this.time += 0.01;

        for (let i = 0; i < this.cols; i++) {
            for (let j = 0; j < this.rows; j++) {
                const x = i * this.spacing;
                const y = j * this.spacing;
                
                // Organic jitter
                const jX = Math.sin(this.time * 0.5 + i) * 1.5;
                const jY = Math.cos(this.time * 0.5 + j) * 1.5;
                
                const alpha = this.getShapeAlpha(x, y, this.time);
                
                if (alpha > 0.05) {
                    this.ctx.globalAlpha = alpha;
                    
                    // Main Dot
                    this.ctx.beginPath();
                    this.ctx.arc(x + jX, y + jY, this.dotSize, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Symbols for "ASCII" feel in highlighted areas
                    if (alpha > 0.8 && (i + j) % 8 === 0) {
                         this.ctx.font = '7px monospace';
                         this.ctx.fillText((i % 2 === 0 ? '+' : 'x'), x + jX + 6, y + jY + 6);
                    }
                }
            }
        }
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PatternEngine();
});
