/**
 * Touch Controller Class
 * Handles mobile touch controls with gesture recognition and virtual buttons
 */

class TouchController {
    constructor(scene) {
        this.scene = scene;
        this.enabled = false;
        this.touchZones = new Map();
        this.activeTouches = new Map();
        this.virtualButtons = new Map();
        
        this.setupTouchDetection();
    }
    
    setupTouchDetection() {
        // Check if touch is supported
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            this.enabled = true;
            this.createTouchZones();
            this.setupEventListeners();
            console.log('TouchController: Touch controls enabled');
        } else {
            console.log('TouchController: Touch not supported, using keyboard only');
        }
    }
    
    createTouchZones() {
        const gameWidth = GameConfig.width;
        const gameHeight = GameConfig.height;
        
        // Left movement zone (left half of screen)
        this.touchZones.set('left', {
            x: 0,
            y: 0,
            width: gameWidth / 2,
            height: gameHeight,
            active: false
        });
        
        // Right movement zone (right half of screen)
        this.touchZones.set('right', {
            x: gameWidth / 2,
            y: 0,
            width: gameWidth / 2,
            height: gameHeight,
            active: false
        });
        
        // Fire button (bottom right corner)
        this.createVirtualButton('fire', {
            x: gameWidth - 80,
            y: gameHeight - 80,
            width: 60,
            height: 60,
            text: 'FIRE',
            color: 0xff0000
        });
        
        // Pause button (top right corner)
        this.createVirtualButton('pause', {
            x: gameWidth - 50,
            y: 20,
            width: 40,
            height: 40,
            text: 'II',
            color: 0xffff00
        });
        
        // Restart button (top left corner)
        this.createVirtualButton('restart', {
            x: 20,
            y: 20,
            width: 40,
            height: 40,
            text: 'R',
            color: 0x00ff00
        });
    }
    
    createVirtualButton(key, config) {
        const button = this.scene.add.rectangle(
            config.x, 
            config.y, 
            config.width, 
            config.height, 
            config.color
        ).setOrigin(0.5);
        
        button.setInteractive();
        button.setAlpha(0.7);
        
        // Add text
        const text = this.scene.add.text(
            config.x, 
            config.y, 
            config.text, 
            {
                fontSize: '16px',
                fill: '#ffffff',
                fontFamily: 'Courier New',
                fontWeight: 'bold'
            }
        ).setOrigin(0.5);
        
        // Store button reference
        this.virtualButtons.set(key, { button, text, config });
        
        // Add hover effects
        button.on('pointerover', () => {
            button.setAlpha(1.0);
        });
        
        button.on('pointerout', () => {
            button.setAlpha(0.7);
        });
        
        // Add press effects
        button.on('pointerdown', () => {
            button.setScale(0.9);
            this.handleButtonPress(key);
        });
        
        button.on('pointerup', () => {
            button.setScale(1.0);
        });
    }
    
    setupEventListeners() {
        const gameCanvas = this.scene.game.canvas;
        
        // Touch start
        gameCanvas.addEventListener('touchstart', (event) => {
            event.preventDefault();
            this.handleTouchStart(event);
        }, { passive: false });
        
        // Touch move
        gameCanvas.addEventListener('touchmove', (event) => {
            event.preventDefault();
            this.handleTouchMove(event);
        }, { passive: false });
        
        // Touch end
        gameCanvas.addEventListener('touchend', (event) => {
            event.preventDefault();
            this.handleTouchEnd(event);
        }, { passive: false });
        
        // Touch cancel
        gameCanvas.addEventListener('touchcancel', (event) => {
            event.preventDefault();
            this.handleTouchEnd(event);
        }, { passive: false });
    }
    
    handleTouchStart(event) {
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const touchPoint = this.getTouchPoint(touch);
            
            this.activeTouches.set(touch.identifier, touchPoint);
            this.updateTouchZones(touchPoint, true);
        }
    }
    
    handleTouchMove(event) {
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            const touchPoint = this.getTouchPoint(touch);
            
            if (this.activeTouches.has(touch.identifier)) {
                this.activeTouches.set(touch.identifier, touchPoint);
                this.updateTouchZones(touchPoint, true);
            }
        }
    }
    
    handleTouchEnd(event) {
        for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            this.activeTouches.delete(touch.identifier);
        }
        
        // If no active touches, clear all zones
        if (this.activeTouches.size === 0) {
            this.clearTouchZones();
        }
    }
    
    getTouchPoint(touch) {
        const rect = this.scene.game.canvas.getBoundingClientRect();
        const scaleX = this.scene.game.canvas.width / rect.width;
        const scaleY = this.scene.game.canvas.height / rect.height;
        
        return {
            x: (touch.clientX - rect.left) * scaleX,
            y: (touch.clientY - rect.top) * scaleY,
            identifier: touch.identifier
        };
    }
    
    updateTouchZones(touchPoint, active) {
        // Check left zone
        const leftZone = this.touchZones.get('left');
        if (this.isPointInZone(touchPoint, leftZone)) {
            leftZone.active = active;
        }
        
        // Check right zone
        const rightZone = this.touchZones.get('right');
        if (this.isPointInZone(touchPoint, rightZone)) {
            rightZone.active = active;
        }
    }
    
    isPointInZone(point, zone) {
        return point.x >= zone.x && 
               point.x <= zone.x + zone.width && 
               point.y >= zone.y && 
               point.y <= zone.y + zone.height;
    }
    
    clearTouchZones() {
        this.touchZones.forEach(zone => {
            zone.active = false;
        });
    }
    
    handleButtonPress(buttonKey) {
        switch (buttonKey) {
            case 'fire':
                this.scene.player.fire();
                break;
            case 'pause':
                this.scene.scene.pause();
                break;
            case 'restart':
                this.scene.restartGame();
                break;
        }
    }
    
    update() {
        if (!this.enabled) return;
        
        // Update player movement based on touch zones
        const leftZone = this.touchZones.get('left');
        const rightZone = this.touchZones.get('right');
        
        if (leftZone && leftZone.active) {
            this.scene.player.angle -= this.scene.player.speed;
        }
        
        if (rightZone && rightZone.active) {
            this.scene.player.angle += this.scene.player.speed;
        }
        
        // Update player position
        if (leftZone.active || rightZone.active) {
            this.scene.player.updatePosition();
        }
    }
    
    // Auto-fire functionality
    startAutoFire() {
        if (this.autoFireTimer) return;
        
        this.autoFireTimer = this.scene.time.addEvent({
            delay: 200, // Fire every 200ms
            callback: () => {
                if (this.scene.player && this.scene.player.sprite.active) {
                    this.scene.player.fire();
                }
            },
            loop: true
        });
    }
    
    stopAutoFire() {
        if (this.autoFireTimer) {
            this.autoFireTimer.destroy();
            this.autoFireTimer = null;
        }
    }
    
    // Show/hide virtual buttons
    showVirtualButtons() {
        this.virtualButtons.forEach(({ button, text }) => {
            button.setVisible(true);
            text.setVisible(true);
        });
    }
    
    hideVirtualButtons() {
        this.virtualButtons.forEach(({ button, text }) => {
            button.setVisible(false);
            text.setVisible(false);
        });
    }
    
    // Enable/disable touch controls
    enable() {
        this.enabled = true;
        this.showVirtualButtons();
        console.log('TouchController: Touch controls enabled');
    }
    
    disable() {
        this.enabled = false;
        this.hideVirtualButtons();
        this.clearTouchZones();
        console.log('TouchController: Touch controls disabled');
    }
    
    isEnabled() {
        return this.enabled;
    }
} 