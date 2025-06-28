/**
 * Loading Scene Class
 * Handles asset preloading with progress indication and fallback handling
 */

class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadingScene' });
        this.loadStartTime = 0;
        this.assetsLoaded = 0;
        this.totalAssets = 0;
        this.loadFailed = false;
    }
    
    preload() {
        this.loadStartTime = Date.now();
        this.createLoadingUI();
        
        // Load images with error handling
        this.loadImages();
        
        // Set up load event handlers
        this.setupLoadEvents();
    }
    
    createLoadingUI() {
        // Background
        this.add.rectangle(0, 0, GameConfig.width, GameConfig.height, 0x000011)
            .setOrigin(0, 0);
        
        // Title
        this.add.text(GameConfig.centerX, GameConfig.centerY - 100, 'GYRUSS-STYLE TUBE SHOOTER', {
            fontSize: '32px',
            fill: '#00ffff',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        
        // Loading text
        this.loadingText = this.add.text(GameConfig.centerX, GameConfig.centerY - 20, 'Loading...', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        
        // Progress bar background
        this.progressBarBg = this.add.rectangle(
            GameConfig.centerX, 
            GameConfig.centerY + 20, 
            GameConfig.loading.progressBarWidth, 
            GameConfig.loading.progressBarHeight, 
            0x333333
        ).setOrigin(0.5);
        
        // Progress bar fill
        this.progressBarFill = this.add.rectangle(
            GameConfig.centerX - GameConfig.loading.progressBarWidth / 2, 
            GameConfig.centerY + 20, 
            0, 
            GameConfig.loading.progressBarHeight, 
            0x00ff00
        ).setOrigin(0, 0.5);
        
        // Progress text
        this.progressText = this.add.text(GameConfig.centerX, GameConfig.centerY + 50, '0%', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        
        // Status text
        this.statusText = this.add.text(GameConfig.centerX, GameConfig.centerY + 80, 'Initializing...', {
            fontSize: '16px',
            fill: '#cccccc',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
    }
    
    loadImages() {
        this.statusText.setText('Loading images...');
        
        // Load image assets with error handling
        Object.entries(GameConfig.assets.images).forEach(([key, path]) => {
            this.totalAssets++;
            
            this.load.on('filecomplete-' + key, () => {
                this.assetsLoaded++;
                this.updateProgress();
            });
            
            this.load.on('loaderror', (file) => {
                console.warn(`Failed to load image: ${file.key}`);
                this.assetsLoaded++; // Count as loaded to continue
                this.updateProgress();
            });
            
            this.load.image(key, path);
        });
    }
    
    setupLoadEvents() {
        this.load.on('progress', (value) => {
            this.updateProgress(value);
        });
        
        this.load.on('complete', () => {
            this.onLoadComplete();
        });
    }
    
    updateProgress(progress = null) {
        const percent = progress !== null ? progress : (this.assetsLoaded / this.totalAssets);
        const percentText = Math.round(percent * 100) + '%';
        
        this.progressText.setText(percentText);
        
        const fillWidth = GameConfig.loading.progressBarWidth * percent;
        this.progressBarFill.width = fillWidth;
        
        this.statusText.setText(`Loaded ${this.assetsLoaded}/${this.totalAssets} assets`);
    }
    
    onLoadComplete() {
        this.statusText.setText('Loading complete!');
        
        // Ensure minimum loading time
        const loadTime = Date.now() - this.loadStartTime;
        const remainingTime = Math.max(0, GameConfig.loading.minLoadTime - loadTime);
        
        setTimeout(() => {
            this.scene.start('MenuScene');
        }, remainingTime);
    }
}

window.LoadingScene = LoadingScene; 