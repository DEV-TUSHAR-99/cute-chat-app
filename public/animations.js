// Animation System for Cute Chat App
// Supports: stars, hearts, bubbles, particles, waves, mixed

class AnimationSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.currentAnimation = 'stars';
        this.animationId = null;
        this.mouse = { x: null, y: null };
        this.isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark';
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
        
        // Watch for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark';
                    if (this.isDarkTheme !== newTheme) {
                        this.isDarkTheme = newTheme;
                        this.initAnimation(); // Re-init with new colors
                    }
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
        
        // Load saved animation preference
        const savedAnim = localStorage.getItem('animation');
        if (savedAnim) {
            this.currentAnimation = savedAnim;
        }
        
        this.initAnimation();
        this.animate();
    }
    
    // Get colors based on theme
    getStarColors() {
        if (this.isDarkTheme) {
            return ['#ffffff', '#50E6FF', '#0078D4', '#60CDFF', '#9CDCFE'];
        } else {
            return ['#0078D4', '#106EBE', '#005A9E', '#004578', '#003966'];
        }
    }
    
    getHeartColors() {
        if (this.isDarkTheme) {
            return ['#50E6FF', '#60CDFF', '#9CDCFE', '#0078D4', '#ffffff'];
        } else {
            return ['#0078D4', '#106EBE', '#005A9E', '#004578', '#003966'];
        }
    }
    
    getParticleColors() {
        if (this.isDarkTheme) {
            return ['#ffffff', '#50E6FF', '#0078D4', '#60CDFF', '#9CDCFE'];
        } else {
            return ['#0078D4', '#106EBE', '#005A9E', '#004578', '#003966'];
        }
    }
    
    getBubbleColors() {
        if (this.isDarkTheme) {
            return { sent: '#0078D4', received: '#2D2D2D' };
        } else {
            return { sent: '#0078D4', received: '#E8E8E8' };
        }
    }
    
    getWaveColors() {
        if (this.isDarkTheme) {
            return [
                'rgba(80, 230, 255, 0.4)',
                'rgba(0, 120, 212, 0.3)',
                'rgba(96, 205, 255, 0.25)',
                'rgba(156, 220, 254, 0.2)'
            ];
        } else {
            return [
                'rgba(0, 120, 212, 0.25)',
                'rgba(16, 110, 190, 0.2)',
                'rgba(0, 90, 158, 0.15)',
                'rgba(0, 69, 120, 0.1)'
            ];
        }
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setAnimation(type) {
        this.currentAnimation = type;
        localStorage.setItem('animation', type);
        this.initAnimation();
        this.updateMenuUI();
    }
    
    updateMenuUI() {
        document.querySelectorAll('.anim-option').forEach(opt => {
            opt.classList.remove('active');
        });
        const activeOption = document.querySelector(`.anim-option[onclick="setAnimation('${this.currentAnimation}')"]`);
        if (activeOption) {
            activeOption.classList.add('active');
        }
    }
    
    initAnimation() {
        this.stars = [];
        this.hearts = [];
        this.bubbles = [];
        this.particles = [];
        this.waves = [];
        this.shootingStars = [];
        
        switch(this.currentAnimation) {
            case 'stars':
                this.initStars();
                break;
            case 'hearts':
                this.initHearts();
                break;
            case 'bubbles':
                this.initBubbles();
                break;
            case 'particles':
                this.initParticles();
                break;
            case 'waves':
                this.initWaves();
                break;
            case 'mixed':
                this.initMixed();
                break;
        }
    }
    
    // ========== STARS ANIMATION ==========
    initStars() {
        const colors = this.getStarColors();
        for (let i = 0; i < 150; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: Math.random() * 0.5 - 0.25,
                speedY: Math.random() * 0.5 - 0.25,
                brightness: Math.random(),
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }
    
    drawStars() {
        this.stars.forEach(star => {
            star.x += star.speedX;
            star.y += star.speedY;
            
            if (star.x < 0) star.x = this.canvas.width;
            if (star.x > this.canvas.width) star.x = 0;
            if (star.y < 0) star.y = this.canvas.height;
            if (star.y > this.canvas.height) star.y = 0;
            
            star.brightness += star.twinkleSpeed;
            if (star.brightness > 1 || star.brightness < 0.3) {
                star.twinkleSpeed = -star.twinkleSpeed;
            }
            
            // Mouse interaction
            if (this.mouse.x != null) {
                const dx = this.mouse.x - star.x;
                const dy = this.mouse.y - star.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 100) {
                    star.x -= dx * 0.01;
                    star.y -= dy * 0.01;
                }
            }
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = star.brightness;
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        });
        
        // Shooting stars
        if (Math.random() < 0.02) {
            this.shootingStars.push({
                x: Math.random() * this.canvas.width,
                y: 0,
                length: Math.random() * 80 + 20,
                speed: Math.random() * 10 + 5,
                angle: Math.random() * Math.PI / 4 + Math.PI / 4,
                opacity: 1,
                active: true
            });
        }
        
        this.shootingStars = this.shootingStars.filter(star => star.active);
        this.shootingStars.forEach(star => {
            star.x += Math.cos(star.angle) * star.speed;
            star.y += Math.sin(star.angle) * star.speed;
            star.opacity -= 0.02;
            
            if (star.opacity <= 0 || star.x > this.canvas.width || star.y > this.canvas.height) {
                star.active = false;
            }
            
            const endX = star.x - Math.cos(star.angle) * star.length;
            const endY = star.y - Math.sin(star.angle) * star.length;
            
            const gradient = this.ctx.createLinearGradient(star.x, star.y, endX, endY);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
            
            this.ctx.beginPath();
            this.ctx.moveTo(star.x, star.y);
            this.ctx.lineTo(endX, endY);
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }
    
    // ========== FLOATING HEARTS ==========
    initHearts() {
        for (let i = 0; i < 50; i++) {
            this.hearts.push(this.createHeart());
        }
    }
    
    createHeart() {
        const colors = this.getHeartColors();
        return {
            x: Math.random() * this.canvas.width,
            y: this.canvas.height + Math.random() * 100,
            size: Math.random() * 20 + 10,
            speedY: Math.random() * 1 + 0.5,
            speedX: Math.random() * 0.5 - 0.25,
            opacity: Math.random() * 0.5 + 0.3,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: Math.random() * 0.02 - 0.01
        };
    }
    
    drawHearts() {
        this.hearts.forEach((heart, index) => {
            heart.y -= heart.speedY;
            heart.x += Math.sin(heart.y * 0.01) * 0.5;
            heart.rotation += heart.rotationSpeed;
            
            if (heart.y < -50) {
                this.hearts[index] = this.createHeart();
            }
            
            this.ctx.save();
            this.ctx.translate(heart.x, heart.y);
            this.ctx.rotate(heart.rotation);
            this.ctx.globalAlpha = heart.opacity;
            this.ctx.fillStyle = heart.color;
            
            // Draw heart shape
            this.ctx.beginPath();
            const s = heart.size;
            this.ctx.moveTo(0, -s/4);
            this.ctx.bezierCurveTo(-s/2, -s/2, -s/2, s/4, 0, s/2);
            this.ctx.bezierCurveTo(s/2, s/4, s/2, -s/2, 0, -s/4);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }
    
    // ========== CHAT BUBBLES ==========
    initBubbles() {
        for (let i = 0; i < 30; i++) {
            this.bubbles.push(this.createBubble());
        }
    }
    
    createBubble() {
        const isSent = Math.random() > 0.5;
        const colors = this.getBubbleColors();
        return {
            x: isSent ? this.canvas.width - 100 - Math.random() * 200 : 50 + Math.random() * 200,
            y: this.canvas.height + Math.random() * 200,
            width: Math.random() * 100 + 60,
            height: Math.random() * 40 + 30,
            speedY: Math.random() * 0.8 + 0.3,
            opacity: Math.random() * 0.3 + 0.1,
            isSent: isSent,
            color: isSent ? colors.sent : colors.received
        };
    }
    
    drawBubbles() {
        this.bubbles.forEach((bubble, index) => {
            bubble.y -= bubble.speedY;
            
            if (bubble.y < -100) {
                this.bubbles[index] = this.createBubble();
            }
            
            this.ctx.globalAlpha = bubble.opacity;
            this.ctx.fillStyle = bubble.color;
            
            // Draw rounded rectangle (chat bubble)
            const r = 15;
            const x = bubble.x;
            const y = bubble.y;
            const w = bubble.width;
            const h = bubble.height;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x + r, y);
            this.ctx.lineTo(x + w - r, y);
            this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            this.ctx.lineTo(x + w, y + h - r);
            this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            
            // Tail for chat bubble
            if (bubble.isSent) {
                this.ctx.lineTo(x + w - 20, y + h);
                this.ctx.lineTo(x + w - 15, y + h + 10);
                this.ctx.lineTo(x + w - 30, y + h);
            } else {
                this.ctx.lineTo(x + 30, y + h);
                this.ctx.lineTo(x + 15, y + h + 10);
                this.ctx.lineTo(x + 20, y + h);
            }
            
            this.ctx.lineTo(x + r, y + h);
            this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            this.ctx.lineTo(x, y + r);
            this.ctx.quadraticCurveTo(x, y, x + r, y);
            this.ctx.fill();
            
            // Add shine effect
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.beginPath();
            this.ctx.ellipse(x + w/2, y + h/3, w/3, h/4, 0, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }
    
    // ========== LIGHT PARTICLES ==========
    initParticles() {
        for (let i = 0; i < 100; i++) {
            this.particles.push(this.createParticle());
        }
    }
    
    createParticle() {
        const colors = this.getParticleColors();
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 3 + 1,
            speedX: Math.random() * 0.5 - 0.25,
            speedY: Math.random() * 0.5 - 0.25,
            opacity: Math.random(),
            pulseSpeed: Math.random() * 0.03 + 0.01,
            color: colors[Math.floor(Math.random() * colors.length)]
        };
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.opacity += particle.pulseSpeed;
            
            if (particle.opacity > 1 || particle.opacity < 0.2) {
                particle.pulseSpeed = -particle.pulseSpeed;
            }
            
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Glow effect
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 3
            );
            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(0.5, `rgba(255, 255, 255, ${particle.opacity * 0.5})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Core
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        });
    }
    
    // ========== GRADIENT WAVES ==========
    initWaves() {
        this.waveOffset = 0;
    }
    
    drawWaves() {
        this.waveOffset += 0.005;
        
        const colors = this.getWaveColors();
        
        colors.forEach((color, index) => {
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            
            const amplitude = 30 + index * 10;
            const frequency = 0.003 + index * 0.001;
            const phase = this.waveOffset + index * 0.5;
            
            this.ctx.moveTo(0, this.canvas.height);
            
            for (let x = 0; x <= this.canvas.width; x += 5) {
                const y = this.canvas.height / 2 + 
                         Math.sin(x * frequency + phase) * amplitude +
                         Math.sin(x * frequency * 2 + phase * 1.5) * (amplitude / 2);
                this.ctx.lineTo(x, y);
            }
            
            this.ctx.lineTo(this.canvas.width, this.canvas.height);
            this.ctx.lineTo(0, this.canvas.height);
            this.ctx.fill();
        });
        
        // Add floating sparkles on waves
        const sparkleColor = this.isDarkTheme ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 120, 212, 0.6)';
        for (let i = 0; i < 20; i++) {
            const x = (this.waveOffset * 50 + i * 100) % this.canvas.width;
            const y = this.canvas.height / 2 + Math.sin(x * 0.003 + this.waveOffset) * 30;
            
            this.ctx.fillStyle = sparkleColor;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    // ========== MIXED ANIMATION ==========
    initMixed() {
        this.initStars();
        this.initHearts();
        this.initParticles();
    }
    
    drawMixed() {
        // Draw fewer of each for performance
        this.stars.slice(0, 50).forEach(star => {
            star.x += star.speedX * 0.5;
            star.y += star.speedY * 0.5;
            
            if (star.x < 0) star.x = this.canvas.width;
            if (star.x > this.canvas.width) star.x = 0;
            if (star.y < 0) star.y = this.canvas.height;
            if (star.y > this.canvas.height) star.y = 0;
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = 0.6;
            this.ctx.fill();
        });
        
        this.hearts.slice(0, 15).forEach(heart => {
            heart.y -= heart.speedY * 0.5;
            heart.x += Math.sin(heart.y * 0.01) * 0.3;
            heart.rotation += heart.rotationSpeed;
            
            if (heart.y < -50) {
                heart.y = this.canvas.height + 50;
                heart.x = Math.random() * this.canvas.width;
            }
            
            this.ctx.save();
            this.ctx.translate(heart.x, heart.y);
            this.ctx.rotate(heart.rotation);
            this.ctx.globalAlpha = heart.opacity * 0.7;
            this.ctx.fillStyle = heart.color;
            
            const s = heart.size;
            this.ctx.beginPath();
            this.ctx.moveTo(0, -s/4);
            this.ctx.bezierCurveTo(-s/2, -s/2, -s/2, s/4, 0, s/2);
            this.ctx.bezierCurveTo(s/2, s/4, s/2, -s/2, 0, -s/4);
            this.ctx.fill();
            
            this.ctx.restore();
        });
        
        this.particles.slice(0, 30).forEach(particle => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.opacity += particle.pulseSpeed;
            
            if (particle.opacity > 0.8 || particle.opacity < 0.2) {
                particle.pulseSpeed = -particle.pulseSpeed;
            }
            
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.opacity * 0.5;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    // ========== MAIN ANIMATION LOOP ==========
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        switch(this.currentAnimation) {
            case 'stars':
                this.drawStars();
                break;
            case 'hearts':
                this.drawHearts();
                break;
            case 'bubbles':
                this.drawBubbles();
                break;
            case 'particles':
                this.drawParticles();
                break;
            case 'waves':
                this.drawWaves();
                break;
            case 'mixed':
                this.drawMixed();
                break;
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// Global animation instance
let animSystem = null;

// Initialize animation system
function initAnimations(canvasId) {
    animSystem = new AnimationSystem(canvasId);
    window.animSystem = animSystem; // Make it globally accessible
    animSystem.updateMenuUI();
}

// Set animation type
function setAnimation(type) {
    if (animSystem) {
        animSystem.setAnimation(type);
    }
}

// Toggle animation menu
function toggleAnimMenu() {
    const menu = document.getElementById('animMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const selector = document.getElementById('animationSelector');
    const menu = document.getElementById('animMenu');
    if (selector && menu && !selector.contains(e.target)) {
        menu.classList.add('hidden');
    }
});
