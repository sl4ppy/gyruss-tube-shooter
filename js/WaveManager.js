/**
 * Wave Manager with Scripting System
 * Manages enemy waves and formations for Gyruss-style tube effect
 */

class WaveScriptingSystem {
    constructor() {
        this.waveScripts = {
            wave1: {
                formation: 'circle',
                enemyCount: 6,
                spawnDelay: 500,
                orbitDuration: 3000,
                attackChance: 0.3
            },
            wave2: {
                formation: 'v',
                enemyCount: 5,
                spawnDelay: 400,
                orbitDuration: 2500,
                attackChance: 0.5
            },
            wave3: {
                formation: 'line',
                enemyCount: 8,
                spawnDelay: 300,
                orbitDuration: 2000,
                attackChance: 0.7
            },
            wave4: {
                formation: 'diamond',
                enemyCount: 4,
                spawnDelay: 600,
                orbitDuration: 3500,
                attackChance: 0.4
            },
            wave5: {
                formation: 'cross',
                enemyCount: 4,
                spawnDelay: 450,
                orbitDuration: 2800,
                attackChance: 0.6
            }
        };
        
        this.currentWave = 1;
        this.waveTimer = 0;
        this.spawnTimer = 0;
        this.enemiesSpawned = 0;
        this.currentScript = null;
        
        console.log('WaveScriptingSystem: Initialized with wave scripts');
    }
    
    /**
     * Execute a specific wave
     * @param {string} waveName - Name of wave to execute
     * @param {Object} enemyManager - Enemy manager reference
     */
    executeWave(waveName, enemyManager) {
        const script = this.waveScripts[waveName];
        if (!script) {
            console.warn(`Wave script '${waveName}' not found`);
            return;
        }
        
        this.currentScript = script;
        this.enemiesSpawned = 0;
        this.spawnTimer = 0;
        
        console.log(`Executing wave: ${waveName} with ${script.enemyCount} enemies`);
        
        // Spawn first enemy immediately
        this.spawnEnemy(enemyManager);
    }
    
    /**
     * Update wave spawning
     * @param {number} deltaTime - Time since last frame
     * @param {Object} enemyManager - Enemy manager reference
     */
    update(deltaTime, enemyManager) {
        if (!this.currentScript) return;
        
        this.spawnTimer += deltaTime;
        
        // Spawn enemies with delay
        if (this.enemiesSpawned < this.currentScript.enemyCount && 
            this.spawnTimer >= this.currentScript.spawnDelay) {
            this.spawnEnemy(enemyManager);
            this.spawnTimer = 0;
        }
        
        // Check if wave is complete
        if (this.enemiesSpawned >= this.currentScript.enemyCount) {
            this.currentScript = null;
        }
    }
    
    /**
     * Spawn a single enemy for current wave
     * @param {Object} enemyManager - Enemy manager reference
     */
    spawnEnemy(enemyManager) {
        if (!this.currentScript) return;
        
        const enemyTypes = ['redEnemy', 'greenEnemy', 'yellowEnemy', 'purpleEnemy'];
        const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        
        const enemy = enemyManager.spawnEnemy(enemyType);
        if (enemy) {
            // Initialize with enhanced movement system
            const enemyState = enemyManager.enhancedMovement.initializeEnemyState(
                enemy, 
                this.currentScript.formation, 
                this.enemiesSpawned
            );
            
            // Store enemy state
            enemy.enemyState = enemyState;
            enemyManager.enemyStates.push(enemyState);
            
            this.enemiesSpawned++;
            console.log(`Spawned enemy ${this.enemiesSpawned}/${this.currentScript.enemyCount}`);
        }
    }
    
    /**
     * Get next wave script
     * @returns {Object} Next wave script or null
     */
    getNextWave() {
        const waveName = `wave${this.currentWave}`;
        return this.waveScripts[waveName] || null;
    }
    
    /**
     * Advance to next wave
     */
    advanceWave() {
        this.currentWave++;
        console.log(`Advanced to wave ${this.currentWave}`);
    }
    
    /**
     * Reset wave progression
     */
    resetWaves() {
        this.currentWave = 1;
        this.currentScript = null;
        this.enemiesSpawned = 0;
        this.spawnTimer = 0;
    }
    
    /**
     * Add custom wave script
     * @param {string} name - Wave name
     * @param {Object} script - Wave script configuration
     */
    addWaveScript(name, script) {
        this.waveScripts[name] = script;
        console.log(`Added custom wave script: ${name}`);
    }
    
    /**
     * Get wave statistics
     * @returns {Object} Wave statistics
     */
    getStats() {
        return {
            currentWave: this.currentWave,
            totalWaves: Object.keys(this.waveScripts).length,
            currentScript: this.currentScript ? this.currentScript.formation : null,
            enemiesSpawned: this.enemiesSpawned
        };
    }
}

class WaveManager {
    constructor(scene) {
        this.scene = scene;
        this.waveScripting = new WaveScriptingSystem();
        this.currentPhase = 1;
        this.currentWave = 1;
        this.wavesPerPhase = 3;
        this.phaseTimer = 0;
        this.phaseDelay = 5000; // 5 seconds between phases
        
        // Wave progression
        this.waveProgression = [
            'wave1', 'wave2', 'wave3', 'wave4', 'wave5'
        ];
        
        this.currentWaveIndex = 0;
        this.isWaveActive = false;
        
        console.log('WaveManager: Initialized with scripting system');
    }
    
    /**
     * Start the wave system
     */
    startGame() {
        this.currentPhase = 1;
        this.currentWave = 1;
        this.currentWaveIndex = 0;
        this.isWaveActive = false;
        this.phaseTimer = 0;
        
        console.log('WaveManager: Game started');
        this.startNextWave();
    }
    
    /**
     * Update wave management
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        // Update current wave spawning
        if (this.isWaveActive) {
            this.waveScripting.update(deltaTime, this.scene.enemyManager);
        }
        
        // Check for phase transitions
        this.phaseTimer += deltaTime;
        if (this.phaseTimer > this.phaseDelay && !this.isWaveActive) {
            this.nextPhase();
        }
    }
    
    /**
     * Check if current wave is complete
     */
    checkWaveComplete() {
        // Get current enemy count
        const enemyCount = this.scene.enemyManager.getEnemyCount();
        
        // Debug logging
        if (this.isWaveActive && enemyCount === 0) {
            console.log(`Wave completion detected! Enemy count: ${enemyCount}, Wave active: ${this.isWaveActive}`);
        }
        
        // Check if wave is active and all enemies are eliminated
        if (this.isWaveActive && enemyCount === 0) {
            this.isWaveActive = false;
            this.phaseTimer = 0;
            
            console.log(`Wave ${this.currentWave} completed!`);
            
            // Add a small delay before advancing to allow for cleanup
            this.scene.time.delayedCall(500, () => {
                this.advanceWaveOrPhase();
            });
        }
    }
    
    /**
     * Advance to next wave or phase
     */
    advanceWaveOrPhase() {
        console.log(`Advancing wave/phase. Current wave: ${this.currentWave}, Waves per phase: ${this.wavesPerPhase}`);
        
        // Check if we've completed all waves in current phase
        if (this.currentWave >= this.wavesPerPhase) {
            // Move to next phase
            console.log('Moving to next phase');
            this.nextPhase();
        } else {
            // Move to next wave in current phase
            console.log('Moving to next wave in current phase');
            this.startNextWave();
        }
    }
    
    /**
     * Start the next wave
     */
    startNextWave() {
        if (this.currentWaveIndex >= this.waveProgression.length) {
            // All waves completed, restart from beginning with increased difficulty
            this.currentWaveIndex = 0;
            this.currentPhase++;
            console.log(`Completed all waves, advancing to Phase ${this.currentPhase}`);
        }
        
        const waveName = this.waveProgression[this.currentWaveIndex];
        this.waveScripting.executeWave(waveName, this.scene.enemyManager);
        
        this.isWaveActive = true;
        this.currentWave++;
        this.currentWaveIndex++;
        
        console.log(`Starting wave: ${waveName} (Phase ${this.currentPhase}, Wave ${this.currentWave})`);
        
        // Update UI display
        if (this.scene.updatePhaseDisplay) {
            this.scene.updatePhaseDisplay();
        }
    }
    
    /**
     * Move to next phase
     */
    nextPhase() {
        this.currentPhase++;
        this.currentWave = 1;
        this.phaseTimer = 0;
        
        // Increase difficulty
        this.increaseDifficulty();
        
        console.log(`Phase ${this.currentPhase} started with increased difficulty`);
        
        // Show phase transition message
        this.showPhaseTransition();
        
        // Start first wave of new phase
        this.startNextWave();
    }
    
    /**
     * Show phase transition message
     */
    showPhaseTransition() {
        if (this.scene.add) {
            const phaseText = this.scene.add.text(GameConfig.centerX, GameConfig.centerY, 
                `PHASE ${this.currentPhase}`, {
                fontSize: '36px',
                fill: '#ffff00',
                fontFamily: 'Courier New',
                fontWeight: 'bold'
            }).setOrigin(0.5);
            
            // Animate and remove
            this.scene.tweens.add({
                targets: phaseText,
                scaleX: 1.5,
                scaleY: 1.5,
                alpha: 0,
                duration: 2000,
                onComplete: () => phaseText.destroy()
            });
        }
    }
    
    /**
     * Increase difficulty for new phase
     */
    increaseDifficulty() {
        // Increase enemy speed
        this.scene.enemyManager.increaseSpeed();
        
        // Increase fire rate
        const newFireRate = Math.min(
            GameConfig.enemyFireChance + 5, 
            GameConfig.enemyScaling.maxFireRate
        );
        this.scene.enemyManager.updateFireRate(newFireRate);
        
        // Update wave scripts for increased difficulty
        if (this.waveScripting && this.waveScripting.waveScripts) {
            Object.keys(this.waveScripting.waveScripts).forEach(waveName => {
                const script = this.waveScripting.waveScripts[waveName];
                if (script) {
                    script.orbitDuration = Math.max(script.orbitDuration - 200, 1000);
                    script.attackChance = Math.min(script.attackChance + 0.1, 0.9);
                }
            });
        }
        
        console.log(`Difficulty increased for Phase ${this.currentPhase}`);
    }
    
    /**
     * Get current phase
     * @returns {number} Current phase number
     */
    getCurrentPhase() {
        return this.currentPhase;
    }
    
    /**
     * Get current wave
     * @returns {number} Current wave number
     */
    getCurrentWave() {
        return this.currentWave;
    }
    
    /**
     * Reset wave system
     */
    reset() {
        this.currentPhase = 1;
        this.currentWave = 1;
        this.currentWaveIndex = 0;
        this.isWaveActive = false;
        this.phaseTimer = 0;
        this.waveScripting.resetWaves();
    }
    
    /**
     * Get wave statistics
     * @returns {Object} Wave statistics
     */
    getStats() {
        return {
            phase: this.currentPhase,
            wave: this.currentWave,
            isActive: this.isWaveActive,
            phaseTimer: this.phaseTimer,
            ...this.waveScripting.getStats()
        };
    }
}

window.WaveManager = WaveManager; 