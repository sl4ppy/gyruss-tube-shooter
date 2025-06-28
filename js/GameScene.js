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
        this.audioManager = null;
        this.touchController = null;
        
        // UI elements
        this.scoreText = null;
        this.livesText = null;
        this.levelText = null;
        
        // Input
        this.restartKey = null;
        this.menuKey = null;
    }
    
    create() {
        console.log('=== GameScene create() started ===');
        
        try {
            // Initialize audio manager first
            console.log('1. Creating AudioManager...');
            this.audioManager = new AudioManager(this);
            this.audioManager.preload();
            console.log('✓ AudioManager created successfully');
            
            // Initialize managers one by one with detailed error checking
            console.log('=== Initializing managers ===');
            
            console.log('2. Creating BulletManager...');
            this.bulletManager = new BulletManager(this);
            console.log('✓ BulletManager created successfully');
            
            console.log('3. Creating EffectsManager...');
            this.effectsManager = new EffectsManager(this);
            console.log('✓ EffectsManager created successfully');
            
            console.log('4. Creating Player...');
            this.player = new Player(this);
            console.log('✓ Player created successfully');
            
            console.log('5. Creating EnemyManager...');
            this.enemyManager = new EnemyManager(this);
            console.log('✓ EnemyManager created successfully');
            
            console.log('6. Creating CollisionManager...');
            this.collisionManager = new CollisionManager(this, this.player, this.bulletManager);
            console.log('✓ CollisionManager created successfully');
            
            console.log('7. Creating TouchController...');
            this.touchController = new TouchController(this);
            console.log('✓ TouchController created successfully');
            
        } catch (error) {
            console.error('❌ Error initializing managers:', error);
            window.gameErrorHandler.handleSystemError('GameScene', error, { phase: 'manager_initialization' });
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
            
            console.log('Adding enemy visual effects...');
            this.effectsManager.addEnemyVisualEffects(this.enemyManager.getEnemies());
            console.log('✓ Enemy visual effects added');
            
            // Play level start sound
            this.audioManager.playLevelUp();
            
        } catch (error) {
            console.error('❌ Error starting game:', error);
            window.gameErrorHandler.handleSystemError('GameScene', error, { phase: 'game_start' });
        }
        
        console.log('=== GameScene create() completed ===');
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
        
        // Add audio controls
        this.addAudioControls();
    }
    
    addAudioControls() {
        // Audio toggle button
        const audioButton = this.add.rectangle(GameConfig.width - 100, 30, 80, 30, 0x00ff00)
            .setInteractive();
        
        const audioText = this.add.text(GameConfig.width - 100, 30, 'AUDIO ON', {
            fontSize: '12px',
            fill: '#000',
            fontFamily: 'Courier New',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        audioButton.on('pointerdown', () => {
            if (this.audioManager.isEnabled()) {
                this.audioManager.disable();
                audioText.setText('AUDIO OFF');
                audioButton.setFillStyle(0xff0000);
            } else {
                this.audioManager.enable();
                audioText.setText('AUDIO ON');
                audioButton.setFillStyle(0x00ff00);
            }
        });
    }
    
    setupInput() {
        this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.menuKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        
        // Add click handler for restart
        this.input.on('pointerdown', () => {
            if (this.player.isDead()) {
                this.restartGame();
            }
        });
    }
    
    update() {
        try {
            // Update player
            if (this.player && this.player.sprite.active) {
                this.player.update();
            }
            
            // Update touch controller
            if (this.touchController) {
                this.touchController.update();
            }
            
            // Update enemy movement
            if (this.enemyManager) {
                this.enemyManager.updateEnemyMovement();
            }
            
            // Update bullet cleanup
            if (this.bulletManager) {
                this.bulletManager.update();
            }
            
            // Update effects
            if (this.effectsManager) {
                this.effectsManager.update();
            }
            
            // Handle input
            if (this.restartKey.isDown) {
                this.restartGame();
            }
            
            if (this.menuKey.isDown) {
                this.scene.start('MenuScene');
            }
            
        } catch (error) {
            console.error('Error in update loop:', error);
            window.gameErrorHandler.handleSystemError('GameScene', error, { phase: 'update' });
        }
    }
    
    updateScore() {
        this.scoreText.setText('Score: ' + this.score);
    }
    
    updateLives() {
        this.livesText.setText('Lives: ' + this.player.getLives());
    }
    
    nextLevel() {
        this.level++;
        this.levelText.setText('Level: ' + this.level);
        
        // Play level up sound
        this.audioManager.playLevelUp();
        
        // Increase enemy speed
        this.enemyManager.increaseSpeed();
        
        // Spawn new enemy formation
        this.enemyManager.spawnEnemyFormation();
        this.effectsManager.addEnemyVisualEffects(this.enemyManager.getEnemies());
    }
    
    gameOver() {
        console.log('Game Over!');
        
        // Play game over sound
        this.audioManager.playPlayerHit();
        
        // Show game over text
        const gameOverText = this.add.text(GameConfig.centerX, GameConfig.centerY - 50, 'GAME OVER', {
            fontSize: '48px',
            fill: '#ff0000',
            fontFamily: 'Courier New',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        const restartText = this.add.text(GameConfig.centerX, GameConfig.centerY + 50, 'Click or press R to restart', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        
        // Add restart instructions
        this.add.text(GameConfig.centerX, GameConfig.centerY + 100, 'Final Score: ' + this.score, {
            fontSize: '20px',
            fill: '#ffff00',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
    }
    
    restartGame() {
        console.log('Restarting game...');
        
        // Reset game state
        this.score = GameConfig.initialScore;
        this.level = GameConfig.initialLevel;
        
        // Reset managers
        this.player.reset();
        this.enemyManager.reset();
        this.bulletManager.reset();
        
        // Update UI
        this.updateScore();
        this.updateLives();
        this.levelText.setText('Level: ' + this.level);
        
        // Spawn new enemies
        this.enemyManager.spawnEnemyFormation();
        this.effectsManager.addEnemyVisualEffects(this.enemyManager.getEnemies());
        
        // Play restart sound
        this.audioManager.playLevelUp();
    }
}

// Create a centralized GameState class
class GameState {
    constructor() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gamePhase = 'menu'; // menu, playing, paused, gameOver
        this.observers = [];
    }
    
    subscribe(observer) {
        this.observers.push(observer);
    }
    
    notify(event, data) {
        this.observers.forEach(observer => observer(event, data));
    }
}

class PowerUpManager {
    constructor(scene) {
        this.powerUps = ['rapidFire', 'shield', 'multiShot', 'bomb'];
        this.activePowerUps = new Map();
    }
    
    spawnPowerUp(x, y) {
        const powerUpType = Phaser.Utils.Array.GetRandom(this.powerUps);
        const powerUp = new PowerUp(this.scene, x, y, powerUpType);
        return powerUp;
    }
}

class BossManager {
    constructor(scene) {
        this.bosses = [
            new CircleBoss(scene),
            new SpiralBoss(scene),
            new WaveBoss(scene)
        ];
    }
    
    spawnBoss(level) {
        const bossIndex = Math.floor((level - 1) / 5) % this.bosses.length;
        return this.bosses[bossIndex];
    }
}

class AudioManager {
    constructor(scene) {
        this.sounds = new Map();
        this.music = null;
        this.volume = 0.7;
    }
    
    preload() {
        this.scene.load.audio('shoot', 'assets/sounds/shoot.wav');
        this.scene.load.audio('explosion', 'assets/sounds/explosion.wav');
        this.scene.load.audio('powerup', 'assets/sounds/powerup.wav');
    }
    
    play(soundKey, config = {}) {
        const sound = this.sounds.get(soundKey);
        if (sound) {
            sound.play(config);
        }
    }
}

class TouchController {
    constructor(scene) {
        this.scene = scene;
        this.touchArea = null;
        this.setupTouchControls();
    }
    
    setupTouchControls() {
        // Create touch zones for movement and firing
        this.createTouchZones();
        this.setupGestureRecognition();
    }
} 