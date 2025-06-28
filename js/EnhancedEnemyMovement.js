/**
 * Enhanced Enemy Movement System
 * Complete enemy movement system for Gyruss-style tube effect
 */

class EnemyState {
    constructor(enemy, formationType, index) {
        this.enemy = enemy;
        this.formationType = formationType;
        this.index = index;
        
        // Position data
        this.radius = 0;
        this.angle = 0;
        this.x = GameConfig.centerX;
        this.y = GameConfig.centerY;
        
        // Phase management
        this.phase = 'SPIRAL';
        this.phaseTimer = 0;
        this.pathIndex = 0;
        
        // Movement data
        this.spiralPath = null;
        this.orbitRadius = 200;
        this.orbitSpeed = 0.02;
        this.attackTarget = null;
        
        // Visual data
        this.sprite = enemy;
        this.scale = 1.0;
        this.alpha = 1.0;
        
        // Attack data
        this.attackConfig = {
            approachSpeed: 80,
            curveIntensity: 0.5,
            targetRadius: 50
        };
        
        // Phase timing configuration
        this.phaseTiming = {
            spiralDuration: 3000,    // 3 seconds for spiral entry
            orbitDuration: 5000,     // 5 seconds in orbit
            attackDuration: 4000,    // 4 seconds for attack
            returnDuration: 2000     // 2 seconds to return
        };
    }
}

class EnhancedEnemyMovement {
    constructor(scene) {
        this.scene = scene;
        this.tunnelSystem = new TunnelCoordinateSystem();
        this.spiralGenerator = new SpiralPathGenerator();
        
        // Movement phases
        this.phases = {
            SPIRAL: 'SPIRAL',
            ORBIT: 'ORBIT',
            ATTACK: 'ATTACK',
            RETURN: 'RETURN',
            DESTROY: 'DESTROY'
        };
        
        // Orbit phase configuration
        this.orbitConfig = {
            radius: 200,
            angularSpeed: 0.02, // radians per frame
            orbitDuration: 5000 // milliseconds - increased from 3000
        };
        
        // Attack phase configuration
        this.attackConfig = {
            approachSpeed: 80, // pixels per frame
            curveIntensity: 0.5, // How much the path curves
            targetRadius: 50 // How close to center to get
        };
        
        console.log('EnhancedEnemyMovement: Initialized for Gyruss-style movement');
    }
    
    /**
     * Initialize enemy state for movement
     * @param {Object} enemy - Enemy sprite
     * @param {string} formationType - Formation type
     * @param {number} index - Enemy index in formation
     * @returns {EnemyState} Initialized enemy state
     */
    initializeEnemyState(enemy, formationType, index) {
        const enemyState = new EnemyState(enemy, formationType, index);
        
        // Generate spiral path with longer duration
        const startAngle = (index / 8) * Math.PI * 2;
        enemyState.spiralPath = this.spiralGenerator.generateSpiralPath(startAngle);
        
        // Set initial position at center
        enemy.x = GameConfig.centerX;
        enemy.y = GameConfig.centerY;
        
        // Initialize phase timer
        enemyState.phaseTimer = 0;
        
        console.log(`Enemy ${index} initialized with ${formationType} formation, starting spiral phase`);
        
        return enemyState;
    }
    
    /**
     * Update enemy movement
     * @param {EnemyState} enemyState - Enemy state data
     * @param {number} deltaTime - Time since last frame (ms)
     */
    updateEnemyMovement(enemyState, deltaTime) {
        // Store previous position for bounds checking
        const prevX = enemyState.x;
        const prevY = enemyState.y;
        
        // Use deltaTime directly (already in ms)
        enemyState.phaseTimer += deltaTime;
        
        // Debug logging for phase transitions (less frequent)
        if (enemyState.phaseTimer % 2000 < deltaTime) { // Log every 2 seconds
            console.log(`Enemy ${enemyState.index} in ${enemyState.phase} phase, timer: ${Math.round(enemyState.phaseTimer)}ms`);
        }
        
        switch (enemyState.phase) {
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
        }
        
        // Apply bounds checking to prevent enemies from going off-screen
        this.applyBoundsChecking(enemyState, prevX, prevY);
        
        // Update visual effects
        this.updateEnemyVisuals(enemyState);
    }
    
    /**
     * Update spiral entry phase
     * @param {EnemyState} enemyState - Enemy state data
     * @param {number} deltaTime - Time since last frame in ms
     */
    updateSpiralPhase(enemyState, deltaTime) {
        if (!enemyState.spiralPath) {
            // Generate spiral path if not exists
            const startAngle = (enemyState.index / 8) * Math.PI * 2;
            enemyState.spiralPath = this.spiralGenerator.generateSpiralPath(startAngle);
        }
        
        // Check if spiral phase should complete based on timer
        if (enemyState.phaseTimer >= enemyState.phaseTiming.spiralDuration) {
            // Spiral complete, transition to orbit
            enemyState.phase = this.phases.ORBIT;
            enemyState.orbitRadius = enemyState.radius || 200;
            enemyState.phaseTimer = 0; // Reset timer for new phase
            console.log(`Enemy ${enemyState.index} completed spiral, entering orbit phase`);
            return;
        }
        
        // Continue spiral movement
        if (enemyState.pathIndex < enemyState.spiralPath.length) {
            const idx = Math.floor(enemyState.pathIndex);
            const pathPoint = enemyState.spiralPath[idx];
            
            if (pathPoint) {
                // Update position
                const screenPos = this.tunnelSystem.polarToScreen(pathPoint.radius, pathPoint.angle);
                enemyState.x = screenPos.x;
                enemyState.y = screenPos.y;
                enemyState.radius = pathPoint.radius;
                enemyState.angle = pathPoint.angle;
                
                // Update sprite position
                enemyState.sprite.x = screenPos.x;
                enemyState.sprite.y = screenPos.y;
            }
            // Progress through path based on time elapsed
            const progressRate = (enemyState.spiralPath.length / enemyState.phaseTiming.spiralDuration) * deltaTime;
            enemyState.pathIndex += progressRate;
        }
    }
    
    /**
     * Update orbit phase
     * @param {EnemyState} enemyState - Enemy state data
     * @param {number} deltaTime - Time since last frame in ms
     */
    updateOrbitPhase(enemyState, deltaTime) {
        // Check if orbit phase should complete
        if (enemyState.phaseTimer >= enemyState.phaseTiming.orbitDuration) {
            enemyState.phase = this.phases.ATTACK;
            enemyState.phaseTimer = 0; // Reset timer for new phase
            console.log(`Enemy ${enemyState.index} completed orbit, starting attack phase`);
            return;
        }
        
        // Update angle for circular movement
        enemyState.angle += this.orbitConfig.angularSpeed * deltaTime * 0.06; // 0.06 = 60/1000
        
        // Keep angle in 0-2π range
        enemyState.angle = this.tunnelSystem.normalizeAngle(enemyState.angle);
        
        // Convert to screen coordinates
        const screenPos = this.tunnelSystem.polarToScreen(enemyState.orbitRadius, enemyState.angle);
        enemyState.x = screenPos.x;
        enemyState.y = screenPos.y;
        
        // Update sprite position
        enemyState.sprite.x = screenPos.x;
        enemyState.sprite.y = screenPos.y;
    }
    
    /**
     * Update attack phase
     * @param {EnemyState} enemyState - Enemy state data
     * @param {number} deltaTime - Time since last frame in ms
     */
    updateAttackPhase(enemyState, deltaTime) {
        const currentRadius = Math.sqrt(
            Math.pow(enemyState.x - GameConfig.centerX, 2) + 
            Math.pow(enemyState.y - GameConfig.centerY, 2)
        );
        
        // Check if attack phase should complete based on timer or proximity
        if (enemyState.phaseTimer >= enemyState.phaseTiming.attackDuration || 
            currentRadius <= this.attackConfig.targetRadius) {
            // Attack completed, transition to return phase
            enemyState.phase = this.phases.RETURN;
            enemyState.phaseTimer = 0; // Reset timer for new phase
            console.log(`Enemy ${enemyState.index} completed attack, returning to edge`);
            return;
        }
        
        // Calculate direction toward center
        const dx = GameConfig.centerX - enemyState.x;
        const dy = GameConfig.centerY - enemyState.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Prevent division by zero and ensure minimum distance
        if (distance > 0 && distance > this.attackConfig.targetRadius) {
            // Add curve by calculating perpendicular direction
            const perpX = -dy / distance;
            const perpY = dx / distance;
            
            // Combine straight movement with curve
            const moveX = (dx / distance) * this.attackConfig.approachSpeed;
            const moveY = (dy / distance) * this.attackConfig.approachSpeed;
            
            const curveX = perpX * this.attackConfig.curveIntensity * 20;
            const curveY = perpY * this.attackConfig.curveIntensity * 20;
            
            // Update position
            enemyState.x += (moveX + curveX) * (deltaTime / 1000);
            enemyState.y += (moveY + curveY) * (deltaTime / 1000);
            
            // Update sprite position
            enemyState.sprite.x = enemyState.x;
            enemyState.sprite.y = enemyState.y;
        } else {
            // If somehow stuck, force return phase
            enemyState.phase = this.phases.RETURN;
            enemyState.phaseTimer = 0; // Reset timer for new phase
        }
    }
    
    /**
     * Update return phase
     * @param {EnemyState} enemyState - Enemy state data
     * @param {number} deltaTime - Time since last frame in ms
     */
    updateReturnPhase(enemyState, deltaTime) {
        // Check if return phase should complete based on timer
        if (enemyState.phaseTimer >= enemyState.phaseTiming.returnDuration) {
            // Destroy enemy after return phase
            enemyState.phase = this.phases.DESTROY;
            enemyState.sprite.destroy();
            console.log(`Enemy ${enemyState.index} completed return phase, destroyed`);
            return;
        }
        
        // Calculate current distance from center
        const currentRadius = Math.sqrt(
            Math.pow(enemyState.x - GameConfig.centerX, 2) + 
            Math.pow(enemyState.y - GameConfig.centerY, 2)
        );
        
        // If enemy is far enough from center, destroy it
        if (currentRadius > 450) {
            // Destroy enemy
            enemyState.phase = this.phases.DESTROY;
            enemyState.sprite.destroy();
            console.log(`Enemy ${enemyState.index} reached edge, destroyed`);
            return;
        }
        
        // Move outward in a controlled manner
        const speed = 80; // Reduced speed for smoother movement
        
        // Calculate direction away from center
        const dx = enemyState.x - GameConfig.centerX;
        const dy = enemyState.y - GameConfig.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Prevent division by zero
        if (distance > 0) {
            // Move outward
            enemyState.x += (dx / distance) * speed * (deltaTime / 1000);
            enemyState.y += (dy / distance) * speed * (deltaTime / 1000);
            
            // Update sprite position
            enemyState.sprite.x = enemyState.x;
            enemyState.sprite.y = enemyState.y;
        }
    }
    
    /**
     * Update enemy visual properties based on depth
     * @param {EnemyState} enemyState - Enemy state data
     */
    updateEnemyVisuals(enemyState) {
        const radius = Math.sqrt(
            Math.pow(enemyState.x - GameConfig.centerX, 2) + 
            Math.pow(enemyState.y - GameConfig.centerY, 2)
        );
        
        // Update sprite visual properties
        this.tunnelSystem.updateSpriteVisuals(enemyState.sprite, radius);
        
        // Update rotation based on phase and movement direction
        this.updateEnemyRotation(enemyState);
    }
    
    /**
     * Update enemy rotation based on phase
     * @param {EnemyState} enemyState - Enemy state data
     */
    updateEnemyRotation(enemyState) {
        switch (enemyState.phase) {
            case this.phases.SPIRAL:
                // Face the direction of spiral movement
                if (enemyState.spiralPath && enemyState.pathIndex < enemyState.spiralPath.length) {
                    const idx = Math.floor(enemyState.pathIndex);
                    const pathPoint = enemyState.spiralPath[idx];
                    const nextPoint = enemyState.spiralPath[Math.min(idx + 1, enemyState.spiralPath.length - 1)];
                    
                    if (pathPoint && nextPoint) {
                        const moveAngle = Math.atan2(
                            nextPoint.radius * Math.sin(nextPoint.angle) - pathPoint.radius * Math.sin(pathPoint.angle),
                            nextPoint.radius * Math.cos(nextPoint.angle) - pathPoint.radius * Math.cos(pathPoint.angle)
                        );
                        enemyState.sprite.rotation = moveAngle + Math.PI / 2;
                    }
                }
                break;
                
            case this.phases.ORBIT:
                // Face tangent to orbit (perpendicular to radius)
                enemyState.sprite.rotation = enemyState.angle + Math.PI / 2;
                break;
                
            case this.phases.ATTACK:
                // Face toward center
                const attackAngle = Math.atan2(
                    GameConfig.centerY - enemyState.y,
                    GameConfig.centerX - enemyState.x
                );
                enemyState.sprite.rotation = attackAngle + Math.PI / 2 + Math.PI;
                break;
                
            case this.phases.RETURN:
                // Face away from center (outward)
                const returnAngle = Math.atan2(
                    enemyState.y - GameConfig.centerY,
                    enemyState.x - GameConfig.centerX
                );
                enemyState.sprite.rotation = returnAngle + Math.PI / 2;
                break;
                
            default:
                // Keep current rotation for other phases
                break;
        }
    }
    
    /**
     * Set orbit configuration
     * @param {Object} config - Orbit configuration
     */
    setOrbitConfig(config) {
        this.orbitConfig = { ...this.orbitConfig, ...config };
    }
    
    /**
     * Set attack configuration
     * @param {Object} config - Attack configuration
     */
    setAttackConfig(config) {
        this.attackConfig = { ...this.attackConfig, ...config };
    }
    
    /**
     * Force enemy to attack
     * @param {EnemyState} enemyState - Enemy state data
     */
    forceAttack(enemyState) {
        if (enemyState.phase === this.phases.ORBIT) {
            enemyState.phase = this.phases.ATTACK;
            enemyState.phaseTimer = 0;
        }
    }
    
    /**
     * Get enemy phase
     * @param {EnemyState} enemyState - Enemy state data
     * @returns {string} Current phase
     */
    getEnemyPhase(enemyState) {
        return enemyState.phase;
    }
    
    /**
     * Check if enemy is in specific phase
     * @param {EnemyState} enemyState - Enemy state data
     * @param {string} phase - Phase to check
     * @returns {boolean} True if in specified phase
     */
    isInPhase(enemyState, phase) {
        return enemyState.phase === phase;
    }
    
    /**
     * Apply bounds checking to keep enemies within screen bounds
     * @param {EnemyState} enemyState - Enemy state data
     * @param {number} prevX - Previous X position
     * @param {number} prevY - Previous Y position
     */
    applyBoundsChecking(enemyState, prevX, prevY) {
        const maxDistance = 500; // Maximum distance from center
        const currentRadius = Math.sqrt(
            Math.pow(enemyState.x - GameConfig.centerX, 2) + 
            Math.pow(enemyState.y - GameConfig.centerY, 2)
        );
        
        // If enemy goes too far from center, clamp position
        if (currentRadius > maxDistance) {
            const angle = Math.atan2(enemyState.y - GameConfig.centerY, enemyState.x - GameConfig.centerX);
            enemyState.x = GameConfig.centerX + Math.cos(angle) * maxDistance;
            enemyState.y = GameConfig.centerY + Math.sin(angle) * maxDistance;
            
            // Update sprite position
            enemyState.sprite.x = enemyState.x;
            enemyState.sprite.y = enemyState.y;
            
            // If in return phase and at max distance, destroy
            if (enemyState.phase === this.phases.RETURN) {
                enemyState.phase = this.phases.DESTROY;
                enemyState.sprite.destroy();
            }
        }
        
        // Screen bounds checking
        const margin = 50;
        if (enemyState.x < -margin || enemyState.x > GameConfig.width + margin || 
            enemyState.y < -margin || enemyState.y > GameConfig.height + margin) {
            // Reset to previous position if went off-screen
            enemyState.x = prevX;
            enemyState.y = prevY;
            enemyState.sprite.x = prevX;
            enemyState.sprite.y = prevY;
            
            // Force return phase if somehow off-screen
            if (enemyState.phase !== this.phases.RETURN) {
                enemyState.phase = this.phases.RETURN;
            }
        }
    }
}

window.EnhancedEnemyMovement = EnhancedEnemyMovement; 