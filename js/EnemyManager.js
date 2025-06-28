/**
 * Enemy Manager Class
 * Handles enemy spawning, movement patterns, and firing with enhanced movement system
 */

class EnemyManager {
    constructor(scene) {
        console.log('EnemyManager: Constructor started');
        this.scene = scene;
        this.enemies = scene.physics.add.group();
        console.log('EnemyManager: Physics group created');
        this.enemySpeed = GameConfig.enemySpeed;
        this.enemyFireTimer = null;
        
        // Initialize enhanced movement system
        this.enhancedMovement = new EnhancedEnemyMovement(scene);
        
        // Store enemy states for enhanced movement
        this.enemyStates = [];
        
        console.log('EnemyManager: Setting up enemy firing...');
        this.setupEnemyFiring();
        console.log('EnemyManager: Constructor completed');
    }
    
    /**
     * Set tunnel systems for enhanced movement
     * @param {Object} enhancedMovement - Enhanced movement system
     * @param {Object} tunnelSystem - Tunnel coordinate system
     * @param {Object} spiralGenerator - Spiral path generator
     */
    setTunnelSystems(enhancedMovement, tunnelSystem, spiralGenerator) {
        this.enhancedMovement = enhancedMovement;
        this.tunnelSystem = tunnelSystem;
        this.spiralGenerator = spiralGenerator;
        console.log('EnemyManager: Tunnel systems configured');
    }
    
    setupEnemyFiring() {
        this.enemyFireTimer = this.scene.time.addEvent({
            delay: 1500,
            callback: () => this.enemiesFire(),
            callbackScope: this,
            loop: true
        });
    }
    
    updateFireRate(newFireRate) {
        // Update the fire chance for enemies
        GameConfig.enemyFireChance = newFireRate;
        console.log(`EnemyManager: Fire rate updated to ${newFireRate}%`);
    }
    
    /**
     * Spawn a single enemy
     * @param {string} enemyType - Type of enemy to spawn
     * @returns {Object} Spawned enemy or null
     */
    spawnEnemy(enemyType = null) {
        if (!enemyType) {
            const enemyTypes = ['redEnemy', 'greenEnemy', 'yellowEnemy', 'purpleEnemy'];
            enemyType = enemyTypes[Phaser.Math.Between(0, enemyTypes.length - 1)];
        }
        
        try {
            const enemy = this.enemies.create(GameConfig.centerX, GameConfig.centerY, enemyType);
            if (enemy) {
                enemy.setScale(GameConfig.enemyBulletScale);
                console.log(`Enemy spawned: ${enemyType}`);
                return enemy;
            }
        } catch (error) {
            console.error('EnemyManager: Error spawning enemy:', error);
            window.gameErrorHandler.handleSystemError('EnemyManager', error, { phase: 'spawn_enemy' });
        }
        
        return null;
    }
    
    spawnEnemyFormation() {
        const formations = [
            this.spawnVFormation.bind(this),
            this.spawnLineFormation.bind(this),
            this.spawnCircleFormation.bind(this)
        ];

        const formation = Phaser.Utils.Array.GetRandom(formations);
        formation();
    }
    
    spawnVFormation() {
        console.log('Spawning V formation with enhanced movement system...');
        this.spawnFormationWithEnhancedSystem('v', 5);
    }
    
    spawnLineFormation() {
        console.log('Spawning Line formation with enhanced movement system...');
        this.spawnFormationWithEnhancedSystem('line', 6);
    }
    
    spawnCircleFormation() {
        console.log('Spawning Circle formation with enhanced movement system...');
        this.spawnFormationWithEnhancedSystem('circle', 8);
    }
    
    // Enhanced formation spawning
    spawnFormationWithEnhancedSystem(formationType, enemyCount) {
        console.log(`Spawning ${formationType} formation with ${enemyCount} enemies using enhanced system`);
        
        // Generate formation paths
        const formationPaths = this.enhancedMovement.spiralGenerator.generateFormationPaths(
            formationType,
            enemyCount,
            200, // target radius
            180  // duration in frames (3 seconds at 60fps)
        );
        
        formationPaths.forEach((pathData, index) => {
            const enemyTypeNum = Phaser.Math.Between(1, 4);
            const enemyTypes = ['redEnemy', 'greenEnemy', 'yellowEnemy', 'purpleEnemy'];
            const enemyType = enemyTypes[enemyTypeNum - 1];
            
            console.log(`Creating enemy ${index} with type: ${enemyType}`);
            
            try {
                // Create enemy at center
                const enemy = this.enemies.create(GameConfig.centerX, GameConfig.centerY, enemyType);
                
                if (!enemy) {
                    console.error(`Failed to create enemy with type: ${enemyType}`);
                    return;
                }
                
                // Initialize with enhanced movement system
                const enemyState = this.enhancedMovement.initializeEnemyState(enemy, formationType, index);
                enemy.enemyState = enemyState;
                
                // Store enemy state
                this.enemyStates.push(enemyState);
                
                console.log(`Enemy ${index} created successfully with enhanced movement system`);
            } catch (error) {
                console.error(`Error creating enemy ${index}:`, error);
            }
        });
        
        console.log(`${formationType} formation complete. Total enemies: ${this.enemies.children.entries.length}`);
    }
    
    // Old system fallbacks
    spawnVFormationOld() {
        console.log('Spawning V formation with old system...');
        for (let i = 0; i < 5; i++) {
            const enemyTypeNum = Phaser.Math.Between(1, 4);
            const enemyTypes = ['redEnemy', 'greenEnemy', 'yellowEnemy', 'purpleEnemy'];
            const enemyType = enemyTypes[enemyTypeNum - 1];
            
            const enemy = this.enemies.create(GameConfig.centerX, GameConfig.centerY, enemyType);
            this.enhancedMovement.spawnEnemyOffScreen(enemy, 'v', i);
        }
    }
    
    spawnLineFormationOld() {
        for (let i = 0; i < 6; i++) {
            const enemyTypeNum = Phaser.Math.Between(1, 4);
            const enemyTypes = ['redEnemy', 'greenEnemy', 'yellowEnemy', 'purpleEnemy'];
            const enemyType = enemyTypes[enemyTypeNum - 1];
            
            const enemy = this.enemies.create(GameConfig.centerX, GameConfig.centerY, enemyType);
            this.enhancedMovement.spawnEnemyOffScreen(enemy, 'line', i);
        }
    }
    
    spawnCircleFormationOld() {
        for (let i = 0; i < 8; i++) {
            const enemyTypeNum = Phaser.Math.Between(1, 4);
            const enemyTypes = ['redEnemy', 'greenEnemy', 'yellowEnemy', 'purpleEnemy'];
            const enemyType = enemyTypes[enemyTypeNum - 1];
            
            const enemy = this.enemies.create(GameConfig.centerX, GameConfig.centerY, enemyType);
            this.enhancedMovement.spawnEnemyOffScreen(enemy, 'circle', i);
        }
    }
    
    updateEnemyMovement() {
        // Get deltaTime from Phaser (in seconds)
        const deltaTime = this.scene.game.loop.delta;
        
        // Debug deltaTime more frequently to understand the issue
        if (Math.random() < 0.1) { // 10% chance to log
            console.log(`DeltaTime: ${deltaTime}s (${deltaTime * 1000}ms) - Expected: ~0.016s`);
        }
        
        // Update all enemy movements using enhanced system
        this.enemyStates.forEach(enemyState => {
            if (enemyState.enemy.active) {
                this.enhancedMovement.updateEnemyMovement(enemyState, deltaTime);
            }
        });
        
        // Clean up destroyed enemies
        this.enemyStates = this.enemyStates.filter(enemyState => 
            enemyState.enemy.active && enemyState.phase !== 'DESTROY'
        );
    }
    
    enemiesFire() {
        this.enemies.children.entries.forEach((enemy) => {
            if (Phaser.Math.Between(0, 100) < GameConfig.enemyFireChance) { // 20% chance to fire
                // Create bullet at enemy's position
                const bullet = this.scene.bulletManager.getEnemyBullets().create(enemy.x, enemy.y, 'enemyBullet');
                
                // Set enemy bullet scale
                bullet.setScale(GameConfig.enemyBulletScale);
                
                // Get player position
                const playerX = this.scene.player.getSprite().x;
                const playerY = this.scene.player.getSprite().y;
                
                // Calculate direction from enemy toward player
                const angleToPlayer = Math.atan2(playerY - enemy.y, playerX - enemy.x);
                
                // Move bullet toward player
                bullet.setVelocity(
                    Math.cos(angleToPlayer) * GameConfig.enemyBulletSpeed,
                    Math.sin(angleToPlayer) * GameConfig.enemyBulletSpeed
                );
                
                // Rotate bullet to match direction
                bullet.rotation = angleToPlayer;
                
                // Add tube movement data
                bullet.tubeMovement = true;
                bullet.startX = enemy.x;
                bullet.startY = enemy.y;
                bullet.targetX = playerX;
                bullet.targetY = playerY;
            }
        });
    }
    
    getEnemies() {
        return this.enemies;
    }
    
    getEnemyCount() {
        // Count active enemies in physics group
        const physicsGroupCount = this.enemies.children.entries.length;
        
        // Count active enemies in enhanced movement system
        const enhancedSystemCount = this.enemyStates.filter(enemyState => 
            enemyState.enemy.active && enemyState.phase !== 'DESTROY'
        ).length;
        
        // Return the higher count to ensure we don't miss any enemies
        const totalCount = Math.max(physicsGroupCount, enhancedSystemCount);
        
        // Debug logging if counts don't match
        if (physicsGroupCount !== enhancedSystemCount) {
            console.log(`Enemy count mismatch - Physics group: ${physicsGroupCount}, Enhanced system: ${enhancedSystemCount}`);
        }
        
        return totalCount;
    }
    
    increaseSpeed() {
        this.enemySpeed += 20;
        console.log(`EnemyManager: Speed increased to ${this.enemySpeed}`);
    }
    
    reset() {
        this.enemies.clear(true, true);
        this.enemyStates = [];
        this.enemySpeed = GameConfig.enemySpeed;
        console.log('EnemyManager: Reset completed');
    }
}

window.EnemyManager = EnemyManager; 