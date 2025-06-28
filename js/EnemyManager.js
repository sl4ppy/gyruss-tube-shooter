/**
 * Enemy Manager Class
 * Handles enemy spawning, movement patterns, and firing
 */

class EnemyManager {
    constructor(scene) {
        console.log('EnemyManager: Constructor started');
        this.scene = scene;
        this.enemies = scene.physics.add.group();
        console.log('EnemyManager: Physics group created');
        this.enemySpeed = GameConfig.enemySpeed;
        this.enemyFireTimer = null;
        
        // Initialize movement manager
        this.movementManager = new EnemyMovementManager(scene);
        
        // Get reference to enhanced movement system from scene
        this.enhancedMovement = null;
        this.tunnelSystem = null;
        this.spiralGenerator = null;
        
        console.log('EnemyManager: Setting up enemy firing...');
        this.setupEnemyFiring();
        console.log('EnemyManager: Constructor completed');
    }
    
    // Set references to tunnel systems (called from GameScene)
    setTunnelSystems(enhancedMovement, tunnelSystem, spiralGenerator) {
        this.enhancedMovement = enhancedMovement;
        this.tunnelSystem = tunnelSystem;
        this.spiralGenerator = spiralGenerator;
        console.log('EnemyManager: Tunnel systems connected');
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
        console.log('Spawning V formation with tunnel system...');
        
        // Use new tunnel system if available
        if (this.enhancedMovement && this.spiralGenerator) {
            this.spawnFormationWithTunnelSystem('v', 5);
        } else {
            // Fallback to old system
            this.spawnVFormationOld();
        }
    }
    
    spawnLineFormation() {
        console.log('Spawning Line formation with tunnel system...');
        
        // Use new tunnel system if available
        if (this.enhancedMovement && this.spiralGenerator) {
            this.spawnFormationWithTunnelSystem('line', 6);
        } else {
            // Fallback to old system
            this.spawnLineFormationOld();
        }
    }
    
    spawnCircleFormation() {
        console.log('Spawning Circle formation with tunnel system...');
        
        // Use new tunnel system if available
        if (this.enhancedMovement && this.spiralGenerator) {
            this.spawnFormationWithTunnelSystem('circle', 8);
        } else {
            // Fallback to old system
            this.spawnCircleFormationOld();
        }
    }
    
    // New tunnel system spawning
    spawnFormationWithTunnelSystem(formationType, enemyCount) {
        console.log(`Spawning ${formationType} formation with ${enemyCount} enemies using tunnel system`);
        
        // Generate formation paths
        const formationPaths = this.spiralGenerator.generateFormationPaths(
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
                
                // Set initial position and scale
                const initialScale = this.tunnelSystem.calculateSpriteScale(0);
                enemy.setScale(initialScale);
                
                console.log(`Enemy ${index} created successfully with tunnel system`);
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
            this.movementManager.spawnEnemyOffScreen(enemy, 'v', i);
        }
    }
    
    spawnLineFormationOld() {
        for (let i = 0; i < 6; i++) {
            const enemyTypeNum = Phaser.Math.Between(1, 4);
            const enemyTypes = ['redEnemy', 'greenEnemy', 'yellowEnemy', 'purpleEnemy'];
            const enemyType = enemyTypes[enemyTypeNum - 1];
            
            const enemy = this.enemies.create(GameConfig.centerX, GameConfig.centerY, enemyType);
            this.movementManager.spawnEnemyOffScreen(enemy, 'line', i);
        }
    }
    
    spawnCircleFormationOld() {
        for (let i = 0; i < 8; i++) {
            const enemyTypeNum = Phaser.Math.Between(1, 4);
            const enemyTypes = ['redEnemy', 'greenEnemy', 'yellowEnemy', 'purpleEnemy'];
            const enemyType = enemyTypes[enemyTypeNum - 1];
            
            const enemy = this.enemies.create(GameConfig.centerX, GameConfig.centerY, enemyType);
            this.movementManager.spawnEnemyOffScreen(enemy, 'circle', i);
        }
    }
    
    updateEnemyMovement() {
        // Update wave spawning
        this.movementManager.updateWaveSpawning();
        
        // Update all enemy movements
        this.enemies.children.entries.forEach((enemy) => {
            if (!enemy.active) return;
            
            // Use the new Gyruss-style movement system
            this.movementManager.updateEnemyMovement(enemy);
        });
    }
    
    enemiesFire() {
        this.enemies.children.entries.forEach((enemy) => {
            if (Phaser.Math.Between(0, 100) < GameConfig.enemyFireChance) { // 20% chance to fire
                // Create bullet at enemy's position
                const bullet = this.scene.bulletManager.getEnemyBullets().create(enemy.x, enemy.y, 'enemyBullet');
                
                // Set enemy bullet scale
                bullet.setScale(GameConfig.enemyBulletScale);
                
                // Calculate direction from center toward the enemy's position (tube axis)
                const angleFromCenter = Math.atan2(enemy.y - GameConfig.centerY, enemy.x - GameConfig.centerX);
                
                // Move bullet along tube axis (from center outward, but starting from enemy position)
                bullet.setVelocity(
                    Math.cos(angleFromCenter) * GameConfig.enemyBulletSpeed,
                    Math.sin(angleFromCenter) * GameConfig.enemyBulletSpeed
                );
                
                // Rotate bullet to match tube direction
                bullet.rotation = angleFromCenter;
                
                // Add tube movement data
                bullet.tubeMovement = true;
                bullet.startX = enemy.x;
                bullet.startY = enemy.y;
                bullet.targetX = GameConfig.centerX + Math.cos(angleFromCenter) * (GameConfig.playerRadius + 100);
                bullet.targetY = GameConfig.centerY + Math.sin(angleFromCenter) * (GameConfig.playerRadius + 100);
            }
        });
    }
    
    getEnemies() {
        return this.enemies;
    }
    
    getEnemyCount() {
        return this.enemies.children.entries.length;
    }
    
    increaseSpeed() {
        this.enemySpeed += 20;
    }
    
    reset() {
        this.enemies.clear(true, true);
        this.enemySpeed = GameConfig.enemySpeed;
    }
}

window.EnemyManager = EnemyManager; 