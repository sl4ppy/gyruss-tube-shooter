/**
 * Player Ship Class
 * Handles player movement, firing, and collision detection
 */

class Player {
    constructor(scene) {
        this.scene = scene;
        this.sprite = null;
        this.angle = 0;
        this.radius = GameConfig.playerRadius;
        this.speed = GameConfig.playerSpeed;
        this.lives = GameConfig.initialLives;
        this.isInvulnerable = false;
        
        this.createSprite();
        this.setupControls();
    }
    
    createSprite() {
        console.log('Player: Creating sprite...');
        // Try to load player ship image, fallback to generated graphics
        try {
            console.log('Player: Attempting to load player ship image...');
            this.sprite = this.scene.physics.add.sprite(
                GameConfig.centerX + Math.cos(this.angle) * this.radius,
                GameConfig.centerY + Math.sin(this.angle) * this.radius,
                'playerShip'
            );
            this.sprite.setScale(2.0); // Double size
            console.log('Player: ✓ Player ship image loaded successfully');
            console.log('Player: Sprite created at:', this.sprite.x, this.sprite.y);
            console.log('Player: Sprite active:', this.sprite.active);
            console.log('Player: Sprite visible:', this.sprite.visible);
        } catch (error) {
            console.warn('Player: Player ship image not found, using fallback graphics');
            console.warn('Player: Error:', error);
            this.createFallbackSprite();
        }
    }
    
    createFallbackSprite() {
        console.log('Player: Creating fallback sprite...');
        // Create a simple fallback player ship
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0x00ff00);
        
        // Ship body (triangle)
        graphics.beginPath();
        graphics.moveTo(0, -12);
        graphics.lineTo(-8, 8);
        graphics.lineTo(8, 8);
        graphics.closePath();
        graphics.fillPath();
        
        // Ship engines
        graphics.fillStyle(0x0088ff);
        graphics.fillRect(-6, 6, 3, 4);
        graphics.fillRect(3, 6, 3, 4);
        
        // Generate texture from graphics
        console.log('Player: Generating fallback texture...');
        graphics.generateTexture('fallbackPlayerShip', 32, 32);
        graphics.destroy();
        console.log('Player: Fallback texture generated');
        
        this.sprite = this.scene.physics.add.sprite(
            GameConfig.centerX + Math.cos(this.angle) * this.radius,
            GameConfig.centerY + Math.sin(this.angle) * this.radius,
            'fallbackPlayerShip'
        );
        this.sprite.setScale(2.0);
        console.log('Player: ✓ Fallback sprite created successfully');
        console.log('Player: Fallback sprite at:', this.sprite.x, this.sprite.y);
        console.log('Player: Fallback sprite active:', this.sprite.active);
        console.log('Player: Fallback sprite visible:', this.sprite.visible);
    }
    
    setupControls() {
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.fireKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    
    update() {
        // Handle rotation around the circle
        if (this.cursors.left.isDown) {
            this.angle -= this.speed;
        } else if (this.cursors.right.isDown) {
            this.angle += this.speed;
        }
        
        this.updatePosition();
    }
    
    updatePosition() {
        // Calculate position on the circle
        this.sprite.x = GameConfig.centerX + Math.cos(this.angle) * this.radius;
        this.sprite.y = GameConfig.centerY + Math.sin(this.angle) * this.radius;
        
        // Rotate the ship to face the direction of movement AND point toward center
        this.sprite.rotation = this.angle + Math.PI / 2 + Math.PI; // Added Math.PI for 180 degree rotation
    }
    
    fire() {
        if (!this.sprite.active) return;
        
        const bullet = this.scene.bulletManager.getPlayerBullets().create(this.sprite.x, this.sprite.y, 'playerBullet');
        
        // Set player bullet scale
        bullet.setScale(GameConfig.playerBulletScale);
        
        // Calculate direction toward center (tube axis)
        const angleToCenter = Math.atan2(
            GameConfig.centerY - this.sprite.y,
            GameConfig.centerX - this.sprite.x
        );
        
        // Move bullet along tube axis (straight line toward center)
        bullet.setVelocity(
            Math.cos(angleToCenter) * GameConfig.playerBulletSpeed,
            Math.sin(angleToCenter) * GameConfig.playerBulletSpeed
        );
        
        // Rotate bullet to match tube direction
        bullet.rotation = angleToCenter;
        
        // Add tube movement data
        bullet.tubeMovement = true;
        bullet.startX = this.sprite.x;
        bullet.startY = this.sprite.y;
        bullet.targetX = GameConfig.centerX;
        bullet.targetY = GameConfig.centerY;
    }
    
    takeDamage() {
        if (this.isInvulnerable) return false;
        
        this.lives--;
        this.isInvulnerable = true;
        
        // Visual feedback
        this.sprite.setTint(0xff0000);
        this.scene.time.delayedCall(1000, () => {
            this.sprite.clearTint();
            this.isInvulnerable = false;
        });
        
        return this.lives <= 0;
    }
    
    reset() {
        this.lives = GameConfig.initialLives;
        this.angle = 0;
        this.isInvulnerable = false;
        this.sprite.clearTint();
        this.updatePosition();
    }
    
    getSprite() {
        return this.sprite;
    }
    
    getLives() {
        return this.lives;
    }
    
    isDead() {
        return this.lives <= 0;
    }
} 