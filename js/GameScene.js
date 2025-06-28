/**
 * Main Game Scene Class
 * Orchestrates all game systems using modular managers
 */

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // Game state
        this.score = GameConfig.initialScore;
        this.level = GameConfig.initialLevel;
        
        // Managers (will be initialized in create())
        this.player = null;
        this.enemyManager = null;
        this.bulletManager = null;
        this.effectsManager = null;
        this.collisionManager = null;
        
        // UI elements
        this.scoreText = null;
        this.livesText = null;
        this.levelText = null;
        
        // Input
        this.restartKey = null;
        this.menuKey = null;
    }
    
    preload() {
        console.log('Preload skipped - creating all assets procedurally - ' + new Date().toLocaleTimeString());
        // Skip preload entirely to avoid asset loading issues
    }
    
    create() {
        console.log('=== GameScene create() started ===');
        
        // Add a simple indicator that the game is running
        this.add.text(10, 10, 'GAME RUNNING', {
            fontSize: '16px',
            fill: '#00ff00',
            fontFamily: 'Courier New'
        });
        
        // Add development version indicator if on development branch
        // Check if this is a development deployment by looking at the commit message or URL
        const isDevelopment = window.location.href.includes('dev') || 
                             document.title.includes('dev') ||
                             window.location.search.includes('dev');
        
        if (isDevelopment) {
            this.add.text(10, 30, 'DEVELOPMENT VERSION - ' + new Date().toLocaleTimeString(), {
                fontSize: '14px',
                fill: '#ffaa00',
                fontFamily: 'Courier New'
            });
        }
        
        // Test basic Phaser functionality
        console.log('Testing basic Phaser functionality...');
        const testRect = this.add.rectangle(100, 100, 50, 50, 0xff0000);
        console.log('Test rectangle created:', testRect);
        
        // Create ALL assets procedurally since we skipped preload
        console.log('Creating all assets procedurally...');
        this.createAllAssets();
        
        // Initialize managers one by one with detailed error checking
        console.log('=== Initializing managers ===');
        
        try {
            console.log('1. Creating BulletManager...');
            this.bulletManager = new BulletManager(this);
            console.log('✓ BulletManager created successfully');
            
            console.log('2. Creating EffectsManager...');
            this.effectsManager = new EffectsManager(this);
            console.log('✓ EffectsManager created successfully');
            
            console.log('3. Creating Player...');
            this.player = new Player(this);
            console.log('✓ Player created successfully');
            console.log('Player sprite:', this.player.getSprite());
            console.log('Player sprite active:', this.player.getSprite().active);
            
            console.log('4. Creating EnemyManager...');
            this.enemyManager = new EnemyManager(this);
            console.log('✓ EnemyManager created successfully');
            
            console.log('5. Creating CollisionManager...');
            this.collisionManager = new CollisionManager(this, this.player, this.bulletManager);
            console.log('✓ CollisionManager created successfully');
            
        } catch (error) {
            console.error('❌ Error initializing managers:', error);
            console.error('Error stack:', error.stack);
        }
        
        // Setup UI
        console.log('Setting up UI...');
        this.setupUI();
        
        // Setup input
        console.log('Setting up input...');
        this.setupInput();
        
        // Start game
        console.log('=== Starting game ===');
        try {
            console.log('Spawning enemy formation...');
            this.enemyManager.spawnEnemyFormation();
            console.log('✓ Enemy formation spawned');
            console.log('Enemy count after spawn:', this.enemyManager.getEnemyCount());
            
            console.log('Adding enemy visual effects...');
            this.effectsManager.addEnemyVisualEffects(this.enemyManager.getEnemies());
            console.log('✓ Enemy visual effects added');
            
        } catch (error) {
            console.error('❌ Error starting game:', error);
            console.error('Error stack:', error.stack);
        }
        
        console.log('=== GameScene create() completed ===');
        console.log('Final state:');
        console.log('- Player sprite active:', this.player.getSprite().active);
        console.log('- Player sprite visible:', this.player.getSprite().visible);
        console.log('- Player sprite x,y:', this.player.getSprite().x, this.player.getSprite().y);
        console.log('- Enemy count:', this.enemyManager.getEnemyCount());
        console.log('- BulletManager player bullets:', this.bulletManager.getPlayerBullets().children.entries.length);
        console.log('- BulletManager enemy bullets:', this.bulletManager.getEnemyBullets().children.entries.length);
    }
    
    createAllAssets() {
        console.log('Creating all game assets procedurally...');
        
        // Create player ship texture
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(0x00ff00);
        playerGraphics.beginPath();
        playerGraphics.moveTo(0, -12);
        playerGraphics.lineTo(-8, 8);
        playerGraphics.lineTo(8, 8);
        playerGraphics.closePath();
        playerGraphics.fillPath();
        playerGraphics.fillStyle(0x0088ff);
        playerGraphics.fillRect(-6, 6, 3, 4);
        playerGraphics.fillRect(3, 6, 3, 4);
        playerGraphics.generateTexture('playerShip', 32, 32);
        playerGraphics.destroy();
        console.log('✓ Player ship texture created');
        
        // Create enemy textures
        const colors = [0xff0000, 0x00ff00, 0xffff00, 0xff00ff]; // red, green, yellow, purple
        const enemyTypes = ['redEnemy', 'greenEnemy', 'yellowEnemy', 'purpleEnemy'];
        
        for (let i = 0; i < 4; i++) {
            const graphics = this.add.graphics();
            graphics.fillStyle(colors[i]);
            
            // Create ship shape
            graphics.beginPath();
            graphics.moveTo(0, -8);
            graphics.lineTo(-6, 6);
            graphics.lineTo(6, 6);
            graphics.closePath();
            graphics.fillPath();
            
            // Add details
            graphics.fillStyle(0xffffff);
            graphics.fillRect(-2, 2, 4, 2);
            
            graphics.generateTexture(enemyTypes[i], 16, 16);
            graphics.destroy();
            console.log(`✓ ${enemyTypes[i]} texture created`);
        }
        
        // Create star texture
        const starGraphics = this.add.graphics();
        starGraphics.fillStyle(0xffffff);
        starGraphics.fillCircle(0, 0, 1);
        starGraphics.generateTexture('star', 4, 4);
        starGraphics.destroy();
        console.log('✓ Star texture created');
        
        console.log('All assets created successfully');
    }
    
    setupUI() {
        this.scoreText = this.add.text(16, 16, 'Score: ' + this.score, {
            fontSize: '24px',
            fill: '#fff'
        });
        
        this.livesText = this.add.text(16, 50, 'Lives: ' + this.player.getLives(), {
            fontSize: '24px',
            fill: '#fff'
        });
        
        this.levelText = this.add.text(16, 84, 'Level: ' + this.level, {
            fontSize: '24px',
            fill: '#fff'
        });
        
        // Update external UI
        document.getElementById('score').innerText = 'Score: ' + this.score;
        document.getElementById('lives').innerText = 'Lives: ' + this.player.getLives();
        document.getElementById('level').innerText = 'Level: ' + this.level;
    }
    
    setupInput() {
        this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.menuKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        
        // Add menu button
        const menuButton = this.add.rectangle(GameConfig.width - 50, 30, 80, 30, 0x666666)
            .setInteractive();
        
        const menuText = this.add.text(GameConfig.width - 50, 30, 'MENU', {
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        
        menuButton.on('pointerdown', () => {
            console.log('Menu button clicked - returning to menu');
            this.scene.start('MenuScene');
        });
    }
    
    update() {
        // Update player
        this.player.update();
        
        // Handle player firing
        if (Phaser.Input.Keyboard.JustDown(this.player.fireKey)) {
            this.player.fire();
        }
        
        // Restart game with R key
        if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
            this.restartGame();
        }
        
        // Return to menu with ESC key
        if (Phaser.Input.Keyboard.JustDown(this.menuKey)) {
            this.scene.start('MenuScene');
        }
        
        // Update effects
        this.effectsManager.update();
        
        // Update bullet cleanup
        this.bulletManager.update();
        
        // Update enemy movement
        this.enemyManager.updateEnemyMovement();
        
        // Debug info (only log every 60 frames to avoid spam)
        if (this.time.now % 1000 < 16) { // roughly every second
            console.log('Game running - Player active:', this.player.getSprite().active, 
                       'Enemies:', this.enemyManager.getEnemyCount(),
                       'Player bullets:', this.bulletManager.getPlayerBullets().children.entries.length,
                       'Enemy bullets:', this.bulletManager.getEnemyBullets().children.entries.length);
        }
    }
    
    updateScore() {
        this.scoreText.setText('Score: ' + this.score);
        document.getElementById('score').innerText = 'Score: ' + this.score;
    }
    
    updateLives() {
        this.livesText.setText('Lives: ' + this.player.getLives());
        document.getElementById('lives').innerText = 'Lives: ' + this.player.getLives();
    }
    
    nextLevel() {
        this.level++;
        this.enemyManager.increaseSpeed();
        this.levelText.setText('Level: ' + this.level);
        document.getElementById('level').innerText = 'Level: ' + this.level;
        
        // Spawn new formation immediately
        this.time.delayedCall(1000, () => {
            this.enemyManager.spawnEnemyFormation();
            this.effectsManager.addEnemyVisualEffects(this.enemyManager.getEnemies());
        });
    }
    
    gameOver() {
        this.physics.pause();
        
        this.add.rectangle(GameConfig.centerX, GameConfig.centerY, 400, 200, 0x000000, 0.8);
        this.add.text(GameConfig.centerX, GameConfig.centerY - 20, 'GAME OVER', {
            fontSize: '48px',
            fill: '#ff0000'
        }).setOrigin(0.5);
        
        this.add.text(GameConfig.centerX, GameConfig.centerY + 20, `Final Score: ${this.score}`, {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5);
        
        this.add.text(GameConfig.centerX, GameConfig.centerY + 50, 'Click or press R to restart', {
            fontSize: '20px',
            fill: '#fff'
        }).setOrigin(0.5);
        
        this.input.once('pointerdown', () => {
            this.restartGame();
        });
    }
    
    restartGame() {
        this.scene.restart();
        this.score = GameConfig.initialScore;
        this.level = GameConfig.initialLevel;
    }
} 