/**
 * Menu Scene Class
 * Handles the opening menu and game start
 */

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    
    preload() {
        // Load any menu-specific assets here
        console.log('MenuScene preload started');
    }
    
    create() {
        console.log('MenuScene create started');
        
        // Set background
        this.add.rectangle(0, 0, GameConfig.width, GameConfig.height, 0x000011).setOrigin(0, 0);
        
        // Add title
        this.add.text(GameConfig.centerX, GameConfig.centerY - 100, 'GYRUSS-STYLE TUBE SHOOTER', {
            fontSize: '32px',
            fill: '#00ffff',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        
        // Add subtitle
        this.add.text(GameConfig.centerX, GameConfig.centerY - 50, 'A Retro Arcade Experience', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        
        // Add start button
        const startButton = this.add.rectangle(GameConfig.centerX, GameConfig.centerY + 50, 200, 60, 0x00ff00)
            .setInteractive();
        
        const startText = this.add.text(GameConfig.centerX, GameConfig.centerY + 50, 'CLICK TO START', {
            fontSize: '20px',
            fill: '#000000',
            fontFamily: 'Courier New',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // Add hover effects
        startButton.on('pointerover', () => {
            startButton.setFillStyle(0x00dd00);
        });
        
        startButton.on('pointerout', () => {
            startButton.setFillStyle(0x00ff00);
        });
        
        // Add click handler
        startButton.on('pointerdown', () => {
            console.log('Start button clicked - transitioning to game');
            this.scene.start('GameScene');
        });
        
        // Add instructions
        this.add.text(GameConfig.centerX, GameConfig.centerY + 150, 'CONTROLS:', {
            fontSize: '16px',
            fill: '#ffff00',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        
        this.add.text(GameConfig.centerX, GameConfig.centerY + 180, 'Arrow Keys: Move Ship', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        
        this.add.text(GameConfig.centerX, GameConfig.centerY + 200, 'Spacebar: Fire', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        
        this.add.text(GameConfig.centerX, GameConfig.centerY + 220, 'R Key: Restart', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        
        console.log('MenuScene create completed');
    }
} 