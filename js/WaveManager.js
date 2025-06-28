/**
 * Wave Manager Class
 * Handles wave-based game progression with phases and difficulty scaling
 */

class WaveManager {
    constructor(scene) {
        this.scene = scene;
        this.currentPhase = 1;
        this.currentWave = 1;
        this.wavesInPhase = 0;
        this.isWaveActive = false;
        this.isPhaseTransition = false;
        this.waveTimer = null;
        this.phaseTimer = null;
        
        // Difficulty tracking
        this.enemySpeed = GameConfig.enemySpeed;
        this.enemyFireRate = GameConfig.enemyFireChance;
        
        console.log('WaveManager: Initialized');
    }
    
    startGame() {
        console.log('WaveManager: Starting game loop');
        this.currentPhase = 1;
        this.currentWave = 1;
        this.wavesInPhase = 0;
        this.isWaveActive = false;
        this.isPhaseTransition = false;
        
        // Start first wave
        this.startNextWave();
    }
    
    startNextWave() {
        if (this.isPhaseTransition) return;
        
        this.wavesInPhase++;
        this.isWaveActive = true;
        
        console.log(`WaveManager: Starting Phase ${this.currentPhase}, Wave ${this.wavesInPhase}`);
        
        // Determine enemy count for this wave
        const enemyCount = this.getEnemyCountForWave();
        
        // Spawn wave with specific enemy count
        this.spawnWave(enemyCount);
        
        // Set up wave completion check
        this.checkWaveCompletion();
    }
    
    getEnemyCountForWave() {
        const phaseKey = `phase${this.currentPhase}`;
        const enemyCounts = GameConfig.waves.enemiesPerWave[phaseKey] || GameConfig.waves.enemiesPerWave.phase1;
        
        // Get enemy count for current wave (1-indexed)
        const waveIndex = Math.min(this.wavesInPhase - 1, enemyCounts.length - 1);
        return enemyCounts[waveIndex] || enemyCounts[enemyCounts.length - 1];
    }
    
    spawnWave(enemyCount) {
        console.log(`WaveManager: Spawning wave with ${enemyCount} enemies`);
        
        // Choose formation based on wave number and enemy count
        const formation = this.chooseFormation(enemyCount);
        
        // Spawn enemies with the chosen formation
        this.spawnFormation(formation, enemyCount);
        
        // Add visual effects to new enemies
        this.scene.effectsManager.addEnemyVisualEffects(this.scene.enemyManager.getEnemies());
    }
    
    chooseFormation(enemyCount) {
        const formations = ['v', 'line', 'circle'];
        
        if (enemyCount <= 4) {
            return 'v';
        } else if (enemyCount <= 6) {
            return 'line';
        } else {
            return 'circle';
        }
    }
    
    spawnFormation(formationType, enemyCount) {
        switch (formationType) {
            case 'v':
                this.spawnVFormation(enemyCount);
                break;
            case 'line':
                this.spawnLineFormation(enemyCount);
                break;
            case 'circle':
                this.spawnCircleFormation(enemyCount);
                break;
        }
    }
    
    spawnVFormation(enemyCount) {
        for (let i = 0; i < enemyCount; i++) {
            const angle = (i / (enemyCount - 1)) * Math.PI * 0.6 - Math.PI * 0.3;
            this.spawnEnemy(angle, 'v', i);
        }
    }
    
    spawnLineFormation(enemyCount) {
        for (let i = 0; i < enemyCount; i++) {
            const angle = (i / (enemyCount - 1)) * Math.PI * 0.8 - Math.PI * 0.4;
            this.spawnEnemy(angle, 'line', i);
        }
    }
    
    spawnCircleFormation(enemyCount) {
        for (let i = 0; i < enemyCount; i++) {
            const angle = (i / enemyCount) * Math.PI * 2;
            this.spawnEnemy(angle, 'circle', i);
        }
    }
    
    spawnEnemy(angle, formationType, index) {
        const enemyTypes = ['redEnemy', 'greenEnemy', 'yellowEnemy', 'purpleEnemy'];
        const enemyType = enemyTypes[Phaser.Math.Between(0, enemyTypes.length - 1)];
        
        const enemy = this.scene.enemyManager.enemies.create(
            GameConfig.centerX, 
            GameConfig.centerY, 
            enemyType
        );
        
        if (!enemy) return;
        
        // Set enemy properties
        enemy.setScale(GameConfig.enemyBulletScale);
        
        // Use the new off-screen spawning system
        this.scene.enemyManager.movementManager.spawnEnemyOffScreen(enemy, formationType, index);
        
        console.log(`Enemy ${index} spawned off-screen with ${formationType} formation`);
    }
    
    checkWaveCompletion() {
        // Check if all enemies are destroyed or have returned off-screen
        const activeEnemies = this.scene.enemyManager.getEnemyCount();
        const formationEnemies = this.scene.enemyManager.movementManager.getFormationEnemies().length;
        const attackingEnemies = this.scene.enemyManager.movementManager.getAttackGroups().flat().length;
        
        // Wave is complete when no enemies are active, in formation, or attacking
        if (activeEnemies === 0 && formationEnemies === 0 && attackingEnemies === 0 && this.isWaveActive) {
            this.completeWave();
        } else {
            // Check again in 500ms
            this.scene.time.delayedCall(500, () => this.checkWaveCompletion());
        }
    }
    
    completeWave() {
        console.log(`WaveManager: Wave ${this.wavesInPhase} completed`);
        this.isWaveActive = false;
        
        // Award points for wave completion
        const wavePoints = this.wavesInPhase * 100;
        this.scene.addScore(wavePoints);
        
        // Check if phase is complete
        if (this.wavesInPhase >= GameConfig.waves.wavesPerPhase) {
            this.completePhase();
        } else {
            // Start next wave after delay
            this.scene.time.delayedCall(GameConfig.waves.waveDelay, () => {
                this.startNextWave();
            });
        }
    }
    
    completePhase() {
        console.log(`WaveManager: Phase ${this.currentPhase} completed`);
        this.isPhaseTransition = true;
        
        // Award bonus points for phase completion
        const phaseBonus = this.currentPhase * 500;
        this.scene.addScore(phaseBonus);
        
        // Show phase completion message
        this.showPhaseCompleteMessage();
        
        // Increase difficulty
        this.increaseDifficulty();
        
        // Move to next phase after delay
        this.scene.time.delayedCall(GameConfig.waves.phaseDelay, () => {
            this.startNextPhase();
        });
    }
    
    startNextPhase() {
        this.currentPhase++;
        this.wavesInPhase = 0;
        this.isPhaseTransition = false;
        
        console.log(`WaveManager: Starting Phase ${this.currentPhase}`);
        
        // Update UI
        this.scene.updatePhaseDisplay();
        
        // Check for boss wave
        if (this.currentPhase % GameConfig.waves.bossWaveInterval === 0) {
            this.startBossWave();
        } else {
            this.startNextWave();
        }
    }
    
    startBossWave() {
        console.log(`WaveManager: Starting Boss Wave for Phase ${this.currentPhase}`);
        
        // For now, just spawn a larger wave
        // TODO: Implement actual boss enemies
        this.spawnWave(10); // Boss wave with 10 enemies
        this.scene.effectsManager.addEnemyVisualEffects(this.scene.enemyManager.getEnemies());
        this.checkWaveCompletion();
    }
    
    increaseDifficulty() {
        // Increase enemy speed
        this.enemySpeed = Math.min(
            this.enemySpeed + GameConfig.enemyScaling.speedIncrease,
            GameConfig.enemyScaling.maxSpeed
        );
        
        // Increase fire rate
        this.enemyFireRate = Math.min(
            this.enemyFireRate + GameConfig.enemyScaling.fireRateIncrease,
            GameConfig.enemyScaling.maxFireRate
        );
        
        console.log(`WaveManager: Difficulty increased - Speed: ${this.enemySpeed}, Fire Rate: ${this.enemyFireRate}`);
        
        // Update enemy manager with new values
        this.scene.enemyManager.enemySpeed = this.enemySpeed;
        this.scene.enemyManager.updateFireRate(this.enemyFireRate);
    }
    
    showPhaseCompleteMessage() {
        const phaseText = this.scene.add.text(GameConfig.centerX, GameConfig.centerY - 100, 
            `PHASE ${this.currentPhase} COMPLETE!`, {
            fontSize: '32px',
            fill: '#00ff00',
            fontFamily: 'Courier New',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        const bonusText = this.scene.add.text(GameConfig.centerX, GameConfig.centerY - 50,
            `BONUS: ${this.currentPhase * 500} POINTS`, {
            fontSize: '24px',
            fill: '#ffff00',
            fontFamily: 'Courier New'
        }).setOrigin(0.5);
        
        // Animate and remove after 3 seconds
        this.scene.tweens.add({
            targets: [phaseText, bonusText],
            alpha: 0,
            duration: 3000,
            onComplete: () => {
                phaseText.destroy();
                bonusText.destroy();
            }
        });
        
        // Play phase complete sound
        this.scene.audioManager.playLevelUp();
    }
    
    getCurrentPhase() {
        return this.currentPhase;
    }
    
    getCurrentWave() {
        return this.wavesInPhase;
    }
    
    isWaveInProgress() {
        return this.isWaveActive;
    }
    
    reset() {
        this.currentPhase = 1;
        this.currentWave = 1;
        this.wavesInPhase = 0;
        this.isWaveActive = false;
        this.isPhaseTransition = false;
        this.enemySpeed = GameConfig.enemySpeed;
        this.enemyFireRate = GameConfig.enemyFireChance;
        
        if (this.waveTimer) {
            this.waveTimer.destroy();
        }
        if (this.phaseTimer) {
            this.phaseTimer.destroy();
        }
    }
}

window.WaveManager = WaveManager; 