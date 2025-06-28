/**
 * Enemy Movement Manager Class
 * Handles Gyruss-style enemy movement with spiral entry, orbit, and attack phases
 */

class EnemyMovementManager {
    constructor(scene) {
        this.scene = scene;
        this.behavior = GameConfig.enemyBehavior;
        this.attackGroups = []; // Groups of enemies that attack together
        this.attackTimer = 0;
        this.formationEnemies = []; // Enemies currently in formation
        
        // Wave scripting system
        this.waveScripts = this.initializeWaveScripts();
        this.currentWaveIndex = 0;
        this.spawnTimer = 0;
        
        // 3D tube effect parameters
        this.tubeEffect = {
            minScale: 0.3, // Smallest scale (far away in tube)
            maxScale: 1.5, // Largest scale (close to player)
            minDistance: 0, // Distance from center for minimum scale
            maxDistance: this.behavior.spawnDistance // Distance from center for maximum scale
        };
        
        console.log('EnemyMovementManager: Initialized for Gyruss-style gameplay');
    }
    
    // Data structure for enemy state
    initializeEnemyState(enemy, formationType, index) {
        return {
            // Basic properties
            enemy: enemy,
            formationType: formationType,
            formationIndex: index,
            
            // Movement phase
            phase: 'spiral', // 'spiral', 'orbit', 'attack', 'return'
            
            // Spiral phase data
            spiral: {
                startTime: Date.now(),
                duration: 3000, // 3 seconds for spiral entry
                radius: 0,
                angle: 0,
                spiralSpeed: 0.02,
                radiusSpeed: 2,
                targetRadius: this.behavior.formationRadius
            },
            
            // Orbit phase data
            orbit: {
                radius: this.behavior.formationRadius,
                angle: 0,
                orbitSpeed: 0.01,
                startTime: 0,
                duration: this.behavior.formationTime
            },
            
            // Attack phase data
            attack: {
                startTime: 0,
                duration: 2000,
                targetAngle: 0,
                diveSpeed: this.behavior.diveSpeed,
                path: []
            },
            
            // Return phase data
            return: {
                startTime: 0,
                targetRadius: this.behavior.spawnDistance,
                returnSpeed: this.behavior.approachSpeed
            }
        };
    }
    
    // Wave scripting system
    initializeWaveScripts() {
        return {
            wave1: {
                spawnPattern: 'v',
                enemyCount: 5,
                spawnInterval: 500, // ms between spawns
                spiralDuration: 3000,
                orbitDuration: 4000,
                attackGroupSize: 3
            },
            wave2: {
                spawnPattern: 'line',
                enemyCount: 6,
                spawnInterval: 400,
                spiralDuration: 2500,
                orbitDuration: 3500,
                attackGroupSize: 3
            },
            wave3: {
                spawnPattern: 'circle',
                enemyCount: 8,
                spawnInterval: 300,
                spiralDuration: 2000,
                orbitDuration: 3000,
                attackGroupSize: 4
            }
        };
    }
    
    spawnEnemyOffScreen(enemy, formationType, index) {
        // Initialize enemy state
        const enemyState = this.initializeEnemyState(enemy, formationType, index);
        enemy.enemyState = enemyState;
        
        // Start at center for spiral entry (Gyruss-style)
        enemy.x = GameConfig.centerX;
        enemy.y = GameConfig.centerY;
        
        // Set initial spiral parameters
        enemyState.spiral.angle = this.getSpawnAngle(formationType, index);
        enemyState.spiral.radius = 0;
        
        // Set rotation to face spiral direction
        const spiralAngle = enemyState.spiral.angle;
        enemy.rotation = spiralAngle + Math.PI / 2;
        
        console.log(`Enemy ${index} spawned at center, starting spiral entry`);
    }
    
    getSpawnAngle(formationType, index) {
        switch (formationType) {
            case 'v':
                return (index / 4) * Math.PI * 0.6 - Math.PI * 0.3;
            case 'line':
                return (index / 5) * Math.PI * 0.8 - Math.PI * 0.4;
            case 'circle':
                return (index / 7) * Math.PI * 2;
            default:
                return (index / 5) * Math.PI * 0.8 - Math.PI * 0.4;
        }
    }
    
    updateEnemyMovement(enemy) {
        if (!enemy.active || !enemy.enemyState) return;
        
        const state = enemy.enemyState;
        
        // Update based on current phase
        switch (state.phase) {
            case 'spiral':
                this.updateSpiralPhase(enemy);
                break;
            case 'orbit':
                this.updateOrbitPhase(enemy);
                break;
            case 'attack':
                this.updateAttackPhase(enemy);
                break;
            case 'return':
                this.updateReturnPhase(enemy);
                break;
        }
    }
    
    updateSpiralPhase(enemy) {
        const state = enemy.enemyState;
        const spiral = state.spiral;
        
        // Update spiral parameters
        const timeElapsed = Date.now() - spiral.startTime;
        const progress = Math.min(timeElapsed / spiral.duration, 1);
        
        // Parametric spiral equations
        // r(t) = r_max * t (linear radius increase)
        // θ(t) = θ_start + ω * t (angular rotation)
        spiral.radius = spiral.targetRadius * progress;
        spiral.angle += spiral.spiralSpeed;
        
        // Convert polar to Cartesian coordinates
        const x = GameConfig.centerX + Math.cos(spiral.angle) * spiral.radius;
        const y = GameConfig.centerY + Math.sin(spiral.angle) * spiral.radius;
        
        // Update enemy position
        enemy.x = x;
        enemy.y = y;
        
        // Calculate velocity for smooth movement
        const nextRadius = spiral.targetRadius * Math.min((timeElapsed + 16) / spiral.duration, 1);
        const nextAngle = spiral.angle + spiral.spiralSpeed;
        const nextX = GameConfig.centerX + Math.cos(nextAngle) * nextRadius;
        const nextY = GameConfig.centerY + Math.sin(nextAngle) * nextRadius;
        
        const dx = nextX - x;
        const dy = nextY - y;
        const speed = this.behavior.approachSpeed;
        
        const velocityX = dx * speed;
        const velocityY = dy * speed;
        enemy.setVelocity(velocityX, velocityY);
        
        // Update visuals (scale and rotation) using the new system
        this.updateEnemyVisuals(enemy, velocityX, velocityY);
        
        // Check if spiral phase is complete
        if (progress >= 1) {
            this.transitionToOrbitPhase(enemy);
        }
    }
    
    transitionToOrbitPhase(enemy) {
        const state = enemy.enemyState;
        state.phase = 'orbit';
        state.orbit.startTime = Date.now();
        state.orbit.angle = state.spiral.angle;
        state.orbit.radius = state.spiral.targetRadius;
        
        // Stop movement and position at orbit radius
        enemy.setVelocity(0, 0);
        
        // Add to formation enemies
        this.formationEnemies.push(enemy);
        
        console.log(`Enemy ${state.formationIndex} completed spiral, entering orbit`);
    }
    
    // Orbit Phase Implementation
    updateOrbitPhase(enemy) {
        const state = enemy.enemyState;
        const orbit = state.orbit;
        
        // Update orbit angle (polar coordinate)
        orbit.angle += orbit.orbitSpeed;
        
        // Convert polar coordinates to Cartesian (X, Y)
        // x = r * cos(θ)
        // y = r * sin(θ)
        const x = GameConfig.centerX + Math.cos(orbit.angle) * orbit.radius;
        const y = GameConfig.centerY + Math.sin(orbit.angle) * orbit.radius;
        
        // Update enemy position
        enemy.x = x;
        enemy.y = y;
        
        // Calculate velocity for smooth orbital movement
        const nextAngle = orbit.angle + orbit.orbitSpeed;
        const nextX = GameConfig.centerX + Math.cos(nextAngle) * orbit.radius;
        const nextY = GameConfig.centerY + Math.sin(nextAngle) * orbit.radius;
        
        const dx = nextX - x;
        const dy = nextY - y;
        const speed = this.behavior.approachSpeed * 0.5; // Slower for orbit
        
        const velocityX = dx * speed;
        const velocityY = dy * speed;
        enemy.setVelocity(velocityX, velocityY);
        
        // Update visuals (scale and rotation) using the new system
        this.updateEnemyVisuals(enemy, velocityX, velocityY);
        
        // Check orbit duration
        const timeElapsed = Date.now() - orbit.startTime;
        if (timeElapsed > orbit.duration) {
            this.queueEnemyForAttack(enemy);
        }
    }
    
    // Attack Phase Implementation
    updateAttackPhase(enemy) {
        const state = enemy.enemyState;
        const attack = state.attack;
        
        // Calculate attack trajectory toward player
        const playerAngle = this.scene.player.getAngle();
        const attackAngle = this.calculateAttackAngle(enemy, playerAngle);
        
        // Attack path: move toward player's position
        const targetX = GameConfig.centerX + Math.cos(attackAngle) * GameConfig.playerRadius;
        const targetY = GameConfig.centerY + Math.sin(attackAngle) * GameConfig.playerRadius;
        
        // Calculate velocity toward target
        const dx = targetX - enemy.x;
        const dy = targetY - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            // Move toward attack target
            const velocityX = (dx / distance) * attack.diveSpeed;
            const velocityY = (dy / distance) * attack.diveSpeed;
            enemy.setVelocity(velocityX, velocityY);
            
            // Update visuals (scale and rotation) using the new system
            this.updateEnemyVisuals(enemy, velocityX, velocityY);
        } else {
            // Attack completed, transition to return phase
            this.transitionToReturnPhase(enemy);
        }
    }
    
    calculateAttackAngle(enemy, playerAngle) {
        // Calculate attack angle based on enemy position and player angle
        const enemyAngle = Math.atan2(enemy.y - GameConfig.centerY, enemy.x - GameConfig.centerX);
        
        // Add some randomness to make attacks less predictable
        const randomOffset = (Math.random() - 0.5) * Math.PI * 0.3; // ±15 degrees
        
        return enemyAngle + randomOffset;
    }
    
    transitionToReturnPhase(enemy) {
        const state = enemy.enemyState;
        state.phase = 'return';
        state.return.startTime = Date.now();
        
        // Calculate return trajectory (away from center)
        const returnAngle = Math.atan2(enemy.y - GameConfig.centerY, enemy.x - GameConfig.centerX);
        const returnDistance = this.behavior.spawnDistance;
        
        const targetX = GameConfig.centerX + Math.cos(returnAngle) * returnDistance;
        const targetY = GameConfig.centerY + Math.sin(returnAngle) * returnDistance;
        
        const dx = targetX - enemy.x;
        const dy = targetY - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const velocityX = (dx / distance) * state.return.returnSpeed;
        const velocityY = (dy / distance) * state.return.returnSpeed;
        enemy.setVelocity(velocityX, velocityY);
        
        // Update visuals (scale and rotation) using the new system
        this.updateEnemyVisuals(enemy, velocityX, velocityY);
        
        console.log(`Enemy ${state.formationIndex} attacking, transitioning to return`);
    }
    
    // Return Phase Implementation
    updateReturnPhase(enemy) {
        const state = enemy.enemyState;
        const returnData = state.return;
        
        // Check if enemy has reached off-screen distance
        const distanceFromCenter = Math.sqrt(
            Math.pow(enemy.x - GameConfig.centerX, 2) + 
            Math.pow(enemy.y - GameConfig.centerY, 2)
        );
        
        if (distanceFromCenter >= returnData.targetRadius - 50) {
            // Destroy enemy when it reaches off-screen
            enemy.destroy();
            console.log(`Enemy ${state.formationIndex} destroyed after return phase`);
        } else {
            // Update visuals (scale and rotation) using current velocity
            this.updateEnemyVisuals(enemy, enemy.body.velocity.x, enemy.body.velocity.y);
        }
    }
    
    queueEnemyForAttack(enemy) {
        // Find or create attack group
        let attackGroup = this.attackGroups.find(group => group.length < this.behavior.attackFormationSize);
        
        if (!attackGroup) {
            attackGroup = [];
            this.attackGroups.push(attackGroup);
        }
        
        attackGroup.push(enemy);
        enemy.movementState = 'attacking';
        enemy.attackStartTime = Date.now();
        
        // Remove from formation enemies
        const index = this.formationEnemies.indexOf(enemy);
        if (index > -1) {
            this.formationEnemies.splice(index, 1);
        }
        
        console.log(`Enemy ${enemy.formationIndex} queued for attack, group size: ${attackGroup.length}`);
        
        // If group is full, start attack
        if (attackGroup.length >= this.behavior.attackFormationSize) {
            this.startAttackGroup(attackGroup);
        }
    }
    
    startAttackGroup(attackGroup) {
        console.log(`Starting attack group with ${attackGroup.length} enemies`);
        
        attackGroup.forEach((enemy, index) => {
            // Calculate attack trajectory
            const attackAngle = this.calculateAttackAngle(enemy, index, attackGroup.length);
            this.initiateAttack(enemy, attackAngle);
        });
    }
    
    initiateAttack(enemy, attackAngle) {
        // Calculate attack trajectory (dive-bomb toward player)
        const attackDistance = this.behavior.tubeDepth;
        const targetX = GameConfig.centerX + Math.cos(attackAngle) * attackDistance;
        const targetY = GameConfig.centerY + Math.sin(attackAngle) * attackDistance;
        
        const dx = targetX - enemy.x;
        const dy = targetY - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        enemy.setVelocity(
            (dx / distance) * this.behavior.diveSpeed,
            (dy / distance) * this.behavior.diveSpeed
        );
        
        // Set rotation to face attack direction
        enemy.rotation = attackAngle + Math.PI / 2;
        
        console.log(`Enemy ${enemy.formationIndex} attacking at angle ${attackAngle}`);
    }
    
    getFormationEnemies() {
        return this.formationEnemies;
    }
    
    getAttackGroups() {
        return this.attackGroups;
    }
    
    reset() {
        this.attackGroups = [];
        this.formationEnemies = [];
        this.attackTimer = 0;
    }
    
    // Wave scripting system
    updateWaveSpawning() {
        this.spawnTimer += 16; // Assuming 60fps
        
        const currentWave = this.waveScripts[`wave${this.currentWaveIndex + 1}`];
        if (!currentWave) return;
        
        if (this.spawnTimer >= currentWave.spawnInterval) {
            this.spawnTimer = 0;
            
            // Spawn enemy based on wave script
            const enemyCount = this.scene.enemyManager.getEnemyCount();
            if (enemyCount < currentWave.enemyCount) {
                this.spawnEnemyFromWave(currentWave);
            }
        }
    }
    
    spawnEnemyFromWave(waveScript) {
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
        
        // Spawn with wave script parameters
        const spawnIndex = this.scene.enemyManager.getEnemyCount() - 1;
        this.spawnEnemyOffScreen(enemy, waveScript.spawnPattern, spawnIndex);
        
        // Update wave script parameters
        const state = enemy.enemyState;
        state.spiral.duration = waveScript.spiralDuration;
        state.orbit.duration = waveScript.orbitDuration;
        
        console.log(`Enemy spawned from wave script: ${waveScript.spawnPattern} formation`);
    }
    
    // Calculate 3D tube effect scale based on distance from center
    calculateTubeScale(enemy) {
        const distanceFromCenter = Math.sqrt(
            Math.pow(enemy.x - GameConfig.centerX, 2) + 
            Math.pow(enemy.y - GameConfig.centerY, 2)
        );
        
        // Normalize distance (0 = center, 1 = max distance)
        const normalizedDistance = Math.min(distanceFromCenter / this.tubeEffect.maxDistance, 1);
        
        // Invert the scale so enemies are smaller when closer to center (further in tube)
        const invertedDistance = 1 - normalizedDistance;
        
        // Calculate scale using linear interpolation
        const scale = this.tubeEffect.minScale + 
                     (this.tubeEffect.maxScale - this.tubeEffect.minScale) * invertedDistance;
        
        return Math.max(this.tubeEffect.minScale, Math.min(this.tubeEffect.maxScale, scale));
    }
    
    // Update enemy scale and rotation based on movement
    updateEnemyVisuals(enemy, velocityX, velocityY) {
        // Calculate and apply 3D tube scaling
        const tubeScale = this.calculateTubeScale(enemy);
        enemy.setScale(tubeScale);
        
        // Calculate movement direction and rotate enemy to face it
        if (velocityX !== 0 || velocityY !== 0) {
            const moveAngle = Math.atan2(velocityY, velocityX);
            // Add 90 degrees (π/2) to make the sprite face the movement direction
            // Add 180 degrees (π) to correct the ship orientation
            enemy.rotation = moveAngle + Math.PI / 2 + Math.PI;
        }
    }
}

window.EnemyMovementManager = EnemyMovementManager; 