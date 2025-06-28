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
        
        console.log('EnemyManager: Setting up enemy firing...');
        this.setupEnemyFiring();
        console.log('EnemyManager: Constructor completed');
    }
    
    setupEnemyFiring() {
        this.enemyFireTimer = this.scene.time.addEvent({
            delay: 1500,
            callback: () => this.enemiesFire(),
            callbackScope: this,
            loop: true
        });
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
        console.log('Spawning V formation...');
        // V-shaped formation that flies in pattern and circles back
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 0.6 - Math.PI * 0.3; // Spread in a V shape
            const enemyTypeNum = Phaser.Math.Between(1, 4);
            const enemyTypes = ['redEnemy', 'greenEnemy', 'yellowEnemy', 'purpleEnemy'];
            const enemyType = enemyTypes[enemyTypeNum - 1];
            
            console.log(`Creating enemy ${i} with type: ${enemyType}`);
            
            try {
                const enemy = this.enemies.create(GameConfig.centerX, GameConfig.centerY, enemyType);
                
                if (!enemy) {
                    console.error(`Failed to create enemy with type: ${enemyType}`);
                    continue;
                }
                
                // Set enemy scale
                enemy.setScale(GameConfig.enemyBulletScale);
                
                // Set formation data
                enemy.formationType = 'v';
                enemy.formationIndex = i;
                enemy.angle = angle;
                enemy.formationPhase = 'approach'; // approach, circle, return
                enemy.formationTimer = 0;
                enemy.originalAngle = angle;
                
                // Start moving outward
                const targetX = GameConfig.centerX + Math.cos(angle) * GameConfig.playerRadius;
                const targetY = GameConfig.centerY + Math.sin(angle) * GameConfig.playerRadius;
                
                const dx = targetX - GameConfig.centerX;
                const dy = targetY - GameConfig.centerY;
                const distanceToTarget = Math.sqrt(dx * dx + dy * dy);
                
                enemy.setVelocity(
                    (dx / distanceToTarget) * this.enemySpeed,
                    (dy / distanceToTarget) * this.enemySpeed
                );
                
                console.log(`Enemy ${i} created successfully at (${enemy.x}, ${enemy.y})`);
            } catch (error) {
                console.error(`Error creating enemy ${i}:`, error);
            }
        }
        console.log(`V formation complete. Total enemies: ${this.enemies.children.entries.length}`);
    }
    
    spawnLineFormation() {
        // Line formation that flies in pattern and circles back
        for (let i = 0; i < 6; i++) {
            const angle = (i / 5) * Math.PI * 0.8 - Math.PI * 0.4; // Spread in a line
            const enemyTypeNum = Phaser.Math.Between(1, 4);
            const enemyTypes = ['redEnemy', 'greenEnemy', 'yellowEnemy', 'purpleEnemy'];
            const enemyType = enemyTypes[enemyTypeNum - 1];
            
            const enemy = this.enemies.create(GameConfig.centerX, GameConfig.centerY, enemyType);
            
            // Set enemy scale
            enemy.setScale(GameConfig.enemyBulletScale);
            
            // Set formation data
            enemy.formationType = 'line';
            enemy.formationIndex = i;
            enemy.angle = angle;
            enemy.formationPhase = 'approach';
            enemy.formationTimer = 0;
            enemy.originalAngle = angle;
            
            // Start moving outward
            const targetX = GameConfig.centerX + Math.cos(angle) * GameConfig.playerRadius;
            const targetY = GameConfig.centerY + Math.sin(angle) * GameConfig.playerRadius;
            
            const dx = targetX - GameConfig.centerX;
            const dy = targetY - GameConfig.centerY;
            const distanceToTarget = Math.sqrt(dx * dx + dy * dy);
            
            enemy.setVelocity(
                (dx / distanceToTarget) * this.enemySpeed,
                (dy / distanceToTarget) * this.enemySpeed
            );
        }
    }
    
    spawnCircleFormation() {
        // Circle formation that flies in pattern and circles back
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2; // Full circle
            const enemyTypeNum = Phaser.Math.Between(1, 4);
            const enemyTypes = ['redEnemy', 'greenEnemy', 'yellowEnemy', 'purpleEnemy'];
            const enemyType = enemyTypes[enemyTypeNum - 1];
            
            const enemy = this.enemies.create(GameConfig.centerX, GameConfig.centerY, enemyType);
            
            // Set enemy scale
            enemy.setScale(GameConfig.enemyBulletScale);
            
            // Set formation data
            enemy.formationType = 'circle';
            enemy.formationIndex = i;
            enemy.angle = angle;
            enemy.formationPhase = 'approach';
            enemy.formationTimer = 0;
            enemy.originalAngle = angle;
            
            // Start moving outward
            const targetX = GameConfig.centerX + Math.cos(angle) * GameConfig.playerRadius;
            const targetY = GameConfig.centerY + Math.sin(angle) * GameConfig.playerRadius;
            
            const dx = targetX - GameConfig.centerX;
            const dy = targetY - GameConfig.centerY;
            const distanceToTarget = Math.sqrt(dx * dx + dy * dy);
            
            enemy.setVelocity(
                (dx / distanceToTarget) * this.enemySpeed,
                (dy / distanceToTarget) * this.enemySpeed
            );
        }
    }
    
    updateEnemyMovement() {
        this.enemies.children.entries.forEach((enemy) => {
            if (!enemy.active) return;
            
            enemy.formationTimer += 16; // Assuming 60fps
            
            if (enemy.formationPhase === 'approach') {
                // Check if enemy has reached the circle
                const distanceFromCenter = Math.sqrt(
                    Math.pow(enemy.x - GameConfig.centerX, 2) + 
                    Math.pow(enemy.y - GameConfig.centerY, 2)
                );
                
                if (distanceFromCenter >= GameConfig.playerRadius - 10) {
                    // Start circling
                    enemy.formationPhase = 'circle';
                    enemy.circleAngle = enemy.originalAngle;
                    enemy.setVelocity(0, 0);
                    
                    // Simple rotation to face movement direction during approach
                    const moveAngle = Math.atan2(enemy.y - GameConfig.centerY, enemy.x - GameConfig.centerX);
                    enemy.rotation = moveAngle + Math.PI / 2 + Math.PI; // Add 90 degrees + 180 degrees to point top toward center
                }
            } else if (enemy.formationPhase === 'circle') {
                // Circle around the player's circle
                enemy.circleAngle += 0.02;
                
                const circleRadius = GameConfig.playerRadius;
                enemy.x = GameConfig.centerX + Math.cos(enemy.circleAngle) * circleRadius;
                enemy.y = GameConfig.centerY + Math.sin(enemy.circleAngle) * circleRadius;
                
                // Simple rotation to face movement direction while circling
                enemy.rotation = enemy.circleAngle + Math.PI / 2 + Math.PI; // Add 90 degrees + 180 degrees to point top toward center
                
                // After circling for a while, return to center
                if (enemy.formationTimer > 5000) { // 5 seconds
                    enemy.formationPhase = 'return';
                    enemy.formationTimer = 0;
                }
            } else if (enemy.formationPhase === 'return') {
                // Return to center
                const dx = GameConfig.centerX - enemy.x;
                const dy = GameConfig.centerY - enemy.y;
                const distanceToCenter = Math.sqrt(dx * dx + dy * dy);
                
                if (distanceToCenter < 10) {
                    // Reached center, destroy enemy
                    enemy.destroy();
                } else {
                    // Move toward center
                    enemy.setVelocity(
                        (dx / distanceToCenter) * this.enemySpeed,
                        (dy / distanceToCenter) * this.enemySpeed
                    );
                    
                    // Simple rotation to face center during return
                    const returnAngle = Math.atan2(dy, dx);
                    enemy.rotation = returnAngle + Math.PI / 2 + Math.PI; // Add 90 degrees + 180 degrees to point top toward center
                }
            }
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