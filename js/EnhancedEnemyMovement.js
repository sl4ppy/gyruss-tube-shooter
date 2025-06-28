/**
 * Enhanced Enemy Movement System
 * Comprehensive enemy movement system for Gyruss-style tunnel effect
 */

class EnhancedEnemyMovement {
    constructor(scene, tunnelSystem, spiralGenerator) {
        this.scene = scene;
        this.tunnelSystem = tunnelSystem;
        this.spiralGenerator = spiralGenerator;
        
        // Movement phases
        this.phases = {
            SPAWN: 'spawn',
            SPIRAL: 'spiral',
            ORBIT: 'orbit',
            ATTACK: 'attack',
            RETURN: 'return',
            DESTROY: 'destroy'
        };
        
        // Attack patterns
        this.attackPatterns = {
            direct: {
                name: 'Direct Attack',
                radiusFunction: (t) => 1 - t, // Linear radius decrease
                angleFunction: (t) => 0        // No angle change
            },
            spiral: {
                name: 'Spiral Attack',
                radiusFunction: (t) => 1 - t,
                angleFunction: (t) => t * Math.PI * 2 // Full rotation
            },
            swoop: {
                name: 'Swoop Attack',
                radiusFunction: (t) => 1 - Math.sin(t * Math.PI) * 0.3,
                angleFunction: (t) => Math.sin(t * Math.PI * 2) * 0.5
            },
            zigzag: {
                name: 'Zigzag Attack',
                radiusFunction: (t) => 1 - t,
                angleFunction: (t) => Math.sin(t * Math.PI * 8) * 0.3
            }
        };
        
        console.log('EnhancedEnemyMovement: Initialized for Gyruss-style movement');
    }
    
    /**
     * Initialize enemy state with comprehensive movement data
     * @param {Object} enemy - Enemy sprite
     * @param {string} formationType - Formation type
     * @param {number} index - Enemy index in formation
     * @returns {Object} Enemy state data
     */
    initializeEnemyState(enemy, formationType, index) {
        const state = {
            // Basic properties
            enemy: enemy,
            formationType: formationType,
            formationIndex: index,
            
            // Current phase
            phase: this.phases.SPAWN,
            
            // Polar coordinates
            radius: 0,
            angle: 0,
            
            // Movement parameters
            radiusSpeed: 0,
            angleSpeed: 0,
            
            // Phase-specific data
            spiral: {
                path: null,
                currentFrame: 0,
                duration: 180, // 3 seconds at 60fps
                completed: false
            },
            
            orbit: {
                targetRadius: 200,
                orbitSpeed: 0.02,
                duration: 300, // 5 seconds
                startTime: 0,
                completed: false
            },
            
            attack: {
                pattern: 'direct',
                startRadius: 0,
                startAngle: 0,
                currentFrame: 0,
                duration: 120, // 2 seconds
                completed: false
            },
            
            return: {
                targetRadius: 800,
                returnSpeed: 3,
                completed: false
            },
            
            // Visual properties
            scale: 1.0,
            rotation: 0,
            
            // Timing
            phaseStartTime: 0,
            totalTime: 0
        };
        
        return state;
    }
    
    /**
     * Update enemy movement for current frame
     * @param {Object} enemyState - Enemy state data
     * @param {number} deltaTime - Time since last frame
     */
    updateEnemyMovement(enemyState, deltaTime) {
        const enemy = enemyState.enemy;
        
        // Update total time
        enemyState.totalTime += deltaTime;
        
        // Update based on current phase
        switch (enemyState.phase) {
            case this.phases.SPAWN:
                this.updateSpawnPhase(enemyState, deltaTime);
                break;
                
            case this.phases.SPIRAL:
                this.updateSpiralPhase(enemyState, deltaTime);
                break;
                
            case this.phases.ORBIT:
                this.updateOrbitPhase(enemyState, deltaTime);
                break;
                
            case this.phases.ATTACK:
                this.updateAttackPhase(enemyState, deltaTime);
                break;
                
            case this.phases.RETURN:
                this.updateReturnPhase(enemyState, deltaTime);
                break;
                
            case this.phases.DESTROY:
                this.destroyEnemy(enemyState);
                break;
        }
        
        // Update visual properties
        this.updateEnemyVisuals(enemyState);
    }
    
    /**
     * Update spawn phase - enemy appears at center
     * @param {Object} enemyState - Enemy state data
     * @param {number} deltaTime - Time since last frame
     */
    updateSpawnPhase(enemyState, deltaTime) {
        const enemy = enemyState.enemy;
        
        // Position at center
        const centerPos = this.tunnelSystem.getCenterPosition();
        enemy.x = centerPos.x;
        enemy.y = centerPos.y;
        
        // Initialize spiral path
        const startAngle = this.getFormationAngle(enemyState.formationType, enemyState.formationIndex);
        enemyState.angle = startAngle;
        
        // Generate spiral path
        enemyState.spiral.path = this.spiralGenerator.generateSpiralPath(
            'gyruss',
            0,
            enemyState.orbit.targetRadius,
            startAngle,
            enemyState.spiral.duration
        );
        
        // Transition to spiral phase
        enemyState.phase = this.phases.SPIRAL;
        enemyState.phaseStartTime = enemyState.totalTime;
        
        console.log(`Enemy ${enemyState.formationIndex} spawned, starting spiral entry`);
    }
    
    /**
     * Update spiral phase - enemy follows spiral path to formation
     * @param {Object} enemyState - Enemy state data
     * @param {number} deltaTime - Time since last frame
     */
    updateSpiralPhase(enemyState, deltaTime) {
        const enemy = enemyState.enemy;
        const spiral = enemyState.spiral;
        
        // Update frame counter
        spiral.currentFrame += deltaTime * 60; // Convert to frames
        
        if (spiral.currentFrame >= spiral.duration) {
            // Spiral complete, transition to orbit
            this.transitionToOrbit(enemyState);
            return;
        }
        
        // Get current path point
        const pathPoint = this.spiralGenerator.interpolatePathPoint(
            spiral.path, 
            spiral.currentFrame
        );
        
        // Update enemy position and properties
        enemy.x = pathPoint.x;
        enemy.y = pathPoint.y;
        enemyState.radius = pathPoint.radius;
        enemyState.angle = pathPoint.angle;
        enemyState.scale = pathPoint.scale;
        
        // Calculate velocity for smooth movement
        const nextFrame = Math.min(spiral.currentFrame + 1, spiral.duration);
        const nextPoint = this.spiralGenerator.interpolatePathPoint(spiral.path, nextFrame);
        
        const velocityX = (nextPoint.x - pathPoint.x) * 60; // Convert to per-second
        const velocityY = (nextPoint.y - pathPoint.y) * 60;
        
        enemy.setVelocity(velocityX, velocityY);
        enemyState.radiusSpeed = (nextPoint.radius - pathPoint.radius) * 60;
        enemyState.angleSpeed = (nextPoint.angle - pathPoint.angle) * 60;
    }
    
    /**
     * Update orbit phase - enemy orbits at formation radius
     * @param {Object} enemyState - Enemy state data
     * @param {number} deltaTime - Time since last frame
     */
    updateOrbitPhase(enemyState, deltaTime) {
        const enemy = enemyState.enemy;
        const orbit = enemyState.orbit;
        
        // Update orbit angle
        enemyState.angle += orbit.orbitSpeed * deltaTime * 60;
        
        // Keep angle in range [0, 2π]
        enemyState.angle = (enemyState.angle + Math.PI * 2) % (Math.PI * 2);
        
        // Update position
        const screenPos = this.tunnelSystem.polarToScreen(enemyState.radius, enemyState.angle);
        enemy.x = screenPos.x;
        enemy.y = screenPos.y;
        
        // Calculate velocity for smooth movement
        const nextAngle = enemyState.angle + orbit.orbitSpeed;
        const nextPos = this.tunnelSystem.polarToScreen(enemyState.radius, nextAngle);
        
        const velocityX = (nextPos.x - screenPos.x) * 60;
        const velocityY = (nextPos.y - screenPos.y) * 60;
        
        enemy.setVelocity(velocityX, velocityY);
        enemyState.angleSpeed = orbit.orbitSpeed * 60;
        enemyState.radiusSpeed = 0;
        
        // Check orbit duration
        if (enemyState.totalTime - enemyState.phaseStartTime > orbit.duration / 60) {
            orbit.completed = true;
            // Ready for attack phase
        }
    }
    
    /**
     * Update attack phase - enemy attacks toward center
     * @param {Object} enemyState - Enemy state data
     * @param {number} deltaTime - Time since last frame
     */
    updateAttackPhase(enemyState, deltaTime) {
        const enemy = enemyState.enemy;
        const attack = enemyState.attack;
        
        // Initialize attack if not started
        if (!attack.completed && attack.currentFrame === 0) {
            attack.startRadius = enemyState.radius;
            attack.startAngle = enemyState.angle;
            attack.currentFrame = 0;
        }
        
        // Update attack frame
        attack.currentFrame += deltaTime * 60;
        
        if (attack.currentFrame >= attack.duration) {
            // Attack complete, transition to return
            this.transitionToReturn(enemyState);
            return;
        }
        
        // Calculate attack progress
        const t = attack.currentFrame / attack.duration;
        const pattern = this.attackPatterns[attack.pattern];
        
        // Calculate new radius and angle
        const newRadius = attack.startRadius * pattern.radiusFunction(t);
        const newAngle = attack.startAngle + pattern.angleFunction(t);
        
        // Update enemy position
        const screenPos = this.tunnelSystem.polarToScreen(newRadius, newAngle);
        enemy.x = screenPos.x;
        enemy.y = screenPos.y;
        
        enemyState.radius = newRadius;
        enemyState.angle = newAngle;
        
        // Calculate velocity
        const nextT = Math.min(t + 1 / attack.duration, 1);
        const nextRadius = attack.startRadius * pattern.radiusFunction(nextT);
        const nextAngle = attack.startAngle + pattern.angleFunction(nextT);
        const nextPos = this.tunnelSystem.polarToScreen(nextRadius, nextAngle);
        
        const velocityX = (nextPos.x - screenPos.x) * 60;
        const velocityY = (nextPos.y - screenPos.y) * 60;
        
        enemy.setVelocity(velocityX, velocityY);
        enemyState.radiusSpeed = (nextRadius - newRadius) * 60;
        enemyState.angleSpeed = (nextAngle - newAngle) * 60;
    }
    
    /**
     * Update return phase - enemy returns to edge
     * @param {Object} enemyState - Enemy state data
     * @param {number} deltaTime - Time since last frame
     */
    updateReturnPhase(enemyState, deltaTime) {
        const enemy = enemyState.enemy;
        const returnData = enemyState.return;
        
        // Move toward edge
        const returnAngle = Math.atan2(enemy.y - this.tunnelSystem.centerY, enemy.x - this.tunnelSystem.centerX);
        const targetPos = this.tunnelSystem.polarToScreen(returnData.targetRadius, returnAngle);
        
        const dx = targetPos.x - enemy.x;
        const dy = targetPos.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 10) {
            // Reached edge, destroy enemy
            enemyState.phase = this.phases.DESTROY;
            return;
        }
        
        // Move toward target
        const velocityX = (dx / distance) * returnData.returnSpeed * 60;
        const velocityY = (dy / distance) * returnData.returnSpeed * 60;
        
        enemy.setVelocity(velocityX, velocityY);
        
        // Update polar coordinates
        const polar = this.tunnelSystem.screenToPolar(enemy.x, enemy.y);
        enemyState.radius = polar.radius;
        enemyState.angle = polar.angle;
        
        enemyState.radiusSpeed = (returnData.targetRadius - polar.radius) * returnData.returnSpeed;
        enemyState.angleSpeed = 0;
    }
    
    /**
     * Update enemy visual properties (scale, rotation)
     * @param {Object} enemyState - Enemy state data
     */
    updateEnemyVisuals(enemyState) {
        const enemy = enemyState.enemy;
        
        // Update scale based on depth
        const scale = this.tunnelSystem.calculateSpriteScale(enemyState.radius);
        enemy.setScale(scale);
        enemyState.scale = scale;
        
        // Update rotation to face movement direction
        if (enemyState.radiusSpeed !== 0 || enemyState.angleSpeed !== 0) {
            const moveAngle = Math.atan2(enemyState.angleSpeed, enemyState.radiusSpeed);
            enemy.rotation = moveAngle + Math.PI / 2 + Math.PI; // Correct ship orientation
            enemyState.rotation = enemy.rotation;
        }
    }
    
    /**
     * Transition enemy to orbit phase
     * @param {Object} enemyState - Enemy state data
     */
    transitionToOrbit(enemyState) {
        enemyState.phase = this.phases.ORBIT;
        enemyState.phaseStartTime = enemyState.totalTime;
        enemyState.spiral.completed = true;
        
        console.log(`Enemy ${enemyState.formationIndex} completed spiral, entering orbit`);
    }
    
    /**
     * Transition enemy to attack phase
     * @param {Object} enemyState - Enemy state data
     * @param {string} attackPattern - Attack pattern type
     */
    transitionToAttack(enemyState, attackPattern = 'direct') {
        enemyState.phase = this.phases.ATTACK;
        enemyState.phaseStartTime = enemyState.totalTime;
        enemyState.attack.pattern = attackPattern;
        enemyState.attack.currentFrame = 0;
        enemyState.orbit.completed = true;
        
        console.log(`Enemy ${enemyState.formationIndex} attacking with ${attackPattern} pattern`);
    }
    
    /**
     * Transition enemy to return phase
     * @param {Object} enemyState - Enemy state data
     */
    transitionToReturn(enemyState) {
        enemyState.phase = this.phases.RETURN;
        enemyState.phaseStartTime = enemyState.totalTime;
        enemyState.attack.completed = true;
        
        console.log(`Enemy ${enemyState.formationIndex} returning to edge`);
    }
    
    /**
     * Destroy enemy
     * @param {Object} enemyState - Enemy state data
     */
    destroyEnemy(enemyState) {
        const enemy = enemyState.enemy;
        enemy.destroy();
        console.log(`Enemy ${enemyState.formationIndex} destroyed`);
    }
    
    /**
     * Get formation angle based on formation type and index
     * @param {string} formationType - Formation type
     * @param {number} index - Enemy index
     * @returns {number} Angle in radians
     */
    getFormationAngle(formationType, index) {
        switch (formationType) {
            case 'v':
                return (index / 4) * Math.PI * 0.6 - Math.PI * 0.3;
            case 'line':
                return (index / 5) * Math.PI * 0.8 - Math.PI * 0.4;
            case 'circle':
                return (index / 7) * Math.PI * 2;
            case 'diamond':
                return (index / 4) * Math.PI / 2;
            default:
                return (index / 5) * Math.PI * 0.8 - Math.PI * 0.4;
        }
    }
    
    /**
     * Get random attack pattern
     * @returns {string} Attack pattern name
     */
    getRandomAttackPattern() {
        const patterns = Object.keys(this.attackPatterns);
        return patterns[Math.floor(Math.random() * patterns.length)];
    }
}

// Export for use in other modules
window.EnhancedEnemyMovement = EnhancedEnemyMovement; 