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
        
        // Systems
        this.player = null;
        this.enemyManager = null;
        this.bulletManager = null;
        this.collisionManager = null;
        this.effectsManager = null;
        this.audioManager = null;
        this.touchController = null;
        this.starfieldSystem = null;
        this.waveManager = null;
        
        // Enhanced systems from guide
        this.tunnelSystem = null;
        this.spiralGenerator = null;
        this.enhancedEnemyMovement = null;
        
        // UI elements
        this.scoreText = null;
        this.livesText = null;
        this.levelText = null;
        this.phaseText = null;
        this.waveText = null;
        
        // Input
        this.restartKey = null;
        this.menuKey = null;
        
        console.log('GameScene: Constructor completed');
    }
    
    create() {
        console.log('GameScene: Create started');
        
        try {
            // Initialize enhanced systems
            this.initializeEnhancedSystems();
            
            // Initialize core systems
            this.initializeCoreSystems();
            
            // Setup UI
            this.setupUI();
            
            // Setup input
            this.setupInput();
            
            // Start game
            this.startGame();
            
            console.log('GameScene: Create completed successfully');
            
        } catch (error) {
            console.error('GameScene: Error in create:', error);
            window.gameErrorHandler.handleSystemError('GameScene', error, { phase: 'create' });
        }
    }
    
    /**
     * Initialize enhanced systems from the guide
     */
    initializeEnhancedSystems() {
        console.log('GameScene: Initializing enhanced systems...');
        
        // Initialize tunnel coordinate system
        this.tunnelSystem = new TunnelCoordinateSystem();
        
        // Initialize spiral path generator
        this.spiralGenerator = new SpiralPathGenerator();
        
        // Initialize enhanced enemy movement
        this.enhancedEnemyMovement = new EnhancedEnemyMovement(this);
        
        // Initialize starfield system with linear warp effect
        this.starfieldSystem = new StarfieldSystem(this, this.tunnelSystem);
        
        console.log('GameScene: Enhanced systems initialized');
    }
    
    /**
     * Initialize core game systems
     */
    initializeCoreSystems() {
        console.log('GameScene: Initializing core systems...');
        
        // Initialize player
        this.player = new Player(this);
        
        // Initialize managers
        this.bulletManager = new BulletManager(this);
        this.effectsManager = new EffectsManager(this);
        this.audioManager = new AudioManager(this);
        this.touchController = new TouchController(this);
        
        // Initialize enemy manager with enhanced movement
        this.enemyManager = new EnemyManager(this);
        this.enemyManager.setTunnelSystems(
            this.enhancedEnemyMovement,
            this.tunnelSystem,
            this.spiralGenerator
        );
        
        // Initialize collision manager
        this.collisionManager = new CollisionManager(this, this.player, this.bulletManager);
        this.collisionManager.setupCollisions();
        
        // Initialize wave manager
        this.waveManager = new WaveManager(this);
        
        console.log('GameScene: Core systems initialized');
    }
    
    setupUI() {
        // Score display
        this.scoreText = this.add.text(10, 10, 'Score: ' + this.score, {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Courier New',
            fontWeight: 'bold'
        });
        
        // Lives display
        this.livesText = this.add.text(10, 35, 'Lives: ' + this.player.getLives(), {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Courier New',
            fontWeight: 'bold'
        });
        
        // Level display
        this.levelText = this.add.text(10, 60, 'Level: ' + this.level, {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Courier New',
            fontWeight: 'bold'
        });
        
        // Phase and wave display
        this.phaseText = this.add.text(10, 85, 'Phase: 1', {
            fontSize: '16px',
            fill: '#ffff00',
            fontFamily: 'Courier New'
        });
        
        this.waveText = this.add.text(10, 105, 'Wave: 1', {
            fontSize: '16px',
            fill: '#ffff00',
            fontFamily: 'Courier New'
        });
        
        // Audio controls
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
    
    startGame() {
        console.log('GameScene: Starting game...');
        
        // Start wave system
        this.waveManager.startGame();
        
        // Play background music
        if (this.audioManager) {
            this.audioManager.playBackgroundMusic();
        }
        
        console.log('GameScene: Game started successfully');
    }
    
    update() {
        try {
            // Update starfield system with linear warp effect
            if (this.starfieldSystem && this.player) {
                const playerAngle = this.player.getAngle();
                this.starfieldSystem.updateStarfield(playerAngle, this.game.loop.delta);
            }
            
            // Update player
            if (this.player && this.player.sprite.active) {
                this.player.update();
            }
            
            // Update touch controller
            if (this.touchController) {
                this.touchController.update();
            }
            
            // Update enemy movement using enhanced system
            if (this.enemyManager) {
                this.enemyManager.updateEnemyMovement();
            }
            
            // Update wave manager and check for wave completion
            if (this.waveManager) {
                this.waveManager.update(this.game.loop.delta);
                this.waveManager.checkWaveComplete();
                
                // Update phase display
                this.updatePhaseDisplay();
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
    
    addScore(points) {
        this.score += points;
        this.updateScore();
        
        // Show score popup
        const scorePopup = this.add.text(GameConfig.centerX, GameConfig.centerY - 150, 
            `+${points}`, {
            fontSize: '28px',
            fill: '#ffff00',
            fontFamily: 'Courier New',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // Animate and remove
        this.tweens.add({
            targets: scorePopup,
            y: scorePopup.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => scorePopup.destroy()
        });
    }
    
    updateLives() {
        this.livesText.setText('Lives: ' + this.player.getLives());
    }
    
    nextLevel() {
        this.level++;
        this.levelText.setText('Level: ' + this.level);
        
        // Play level up sound
        if (this.audioManager) {
            this.audioManager.playLevelUp();
        }
        
        // Increase enemy speed
        this.enemyManager.increaseSpeed();
        
        // Spawn new enemy formation
        this.enemyManager.spawnEnemyFormation();
        this.effectsManager.addEnemyVisualEffects(this.enemyManager.getEnemies());
    }
    
    gameOver() {
        console.log('Game Over!');
        
        // Play game over sound
        if (this.audioManager) {
            this.audioManager.playPlayerHit();
        }
        
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
        this.waveManager.reset();
        
        // Update UI
        this.updateScore();
        this.updateLives();
        this.levelText.setText('Level: ' + this.level);
        this.updatePhaseDisplay();
        
        // Start new game
        this.waveManager.startGame();
    }
    
    updatePhaseDisplay() {
        if (this.phaseText && this.waveText && this.waveManager) {
            this.phaseText.setText('Phase: ' + this.waveManager.getCurrentPhase());
            this.waveText.setText('Wave: ' + this.waveManager.getCurrentWave());
        }
    }
}

window.GameScene = GameScene; 