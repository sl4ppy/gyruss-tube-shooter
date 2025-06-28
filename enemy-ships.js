/**
 * Base Enemy Ship class for Gyruss-inspired tube shooter
 * Extends Phaser.Physics.Arcade.Sprite to integrate with physics system
 */
class EnemyShip extends Phaser.Physics.Arcade.Sprite {
    /**
     * Create a new enemy ship
     * @param {Phaser.Scene} scene - The scene this ship belongs to
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {string} texture - Texture key for this ship
     */
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        
        // Add to scene and physics system
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Base properties
        this.health = 1;
        this.pointsInMotion = 100;
        this.pointsInFormation = 50;
        
        // State management
        this.currentState = 'spawning'; // spawning, entering, inFormation, attacking, destroyed
        this.formationPosition = null;
        this.attackTarget = null;
        
        // Movement properties
        this.enterSpeed = 200;
        this.attackSpeed = 300;
        this.formationRadius = 250;
        
        // Animation properties
        this.pulseTween = null;
        this.enterTween = null;
        this.attackTween = null;
        
        // Initialize visual effects
        this.initializeVisualEffects();
    }
    
    /**
     * Initialize visual effects for the ship
     */
    initializeVisualEffects() {
        // Add subtle pulsing animation
        this.pulseTween = this.scene.tweens.add({
            targets: this,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    /**
     * Set the formation position for this ship
     * @param {number} angle - Angle around the formation circle
     * @param {number} radius - Distance from center
     */
    setFormationPosition(angle, radius = this.formationRadius) {
        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY;
        
        this.formationPosition = {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            angle: angle
        };
    }
    
    /**
     * Enter formation with a specific movement pattern
     * @param {number} duration - Duration of the entrance animation in milliseconds
     */
    enterFormation(duration = 2000) {
        if (!this.formationPosition) {
            console.warn('Formation position not set for ship');
            return;
        }
        
        this.currentState = 'entering';
        
        // Stop any existing tweens
        if (this.enterTween) {
            this.enterTween.stop();
        }
        
        // Create entrance animation (to be overridden by subclasses)
        this.createEnterAnimation(duration);
    }
    
    /**
     * Create the entrance animation - to be overridden by subclasses
     * @param {number} duration - Duration of the animation
     */
    createEnterAnimation(duration) {
        // Default straight-line entrance
        this.enterTween = this.scene.tweens.add({
            targets: this,
            x: this.formationPosition.x,
            y: this.formationPosition.y,
            duration: duration,
            ease: 'Power2',
            onComplete: () => {
                this.currentState = 'inFormation';
                this.onFormationReached();
            }
        });
    }
    
    /**
     * Called when the ship reaches its formation position
     */
    onFormationReached() {
        // Start formation behavior
        this.startFormationBehavior();
    }
    
    /**
     * Start formation behavior - to be overridden by subclasses
     */
    startFormationBehavior() {
        // Default: just stay in position
    }
    
    /**
     * Start an attack run toward a target
     * @param {Phaser.GameObjects.GameObject} target - The target to attack
     * @param {number} duration - Duration of the attack animation
     */
    startAttackRun(target, duration = 1500) {
        this.currentState = 'attacking';
        this.attackTarget = target;
        
        // Stop formation behavior
        if (this.enterTween) {
            this.enterTween.stop();
        }
        
        // Create attack animation (to be overridden by subclasses)
        this.createAttackAnimation(target, duration);
    }
    
    /**
     * Create the attack animation - to be overridden by subclasses
     * @param {Phaser.GameObjects.GameObject} target - The target to attack
     * @param {number} duration - Duration of the animation
     */
    createAttackAnimation(target, duration) {
        // Default straight-line attack
        this.attackTween = this.scene.tweens.add({
            targets: this,
            x: target.x,
            y: target.y,
            duration: duration,
            ease: 'Sine.easeIn',
            onComplete: () => {
                this.onAttackComplete();
            }
        });
    }
    
    /**
     * Called when the attack animation completes
     */
    onAttackComplete() {
        this.currentState = 'destroyed';
        this.despawn();
    }
    
    /**
     * Take damage and handle destruction
     * @param {number} damage - Amount of damage to take
     */
    takeDamage(damage = 1) {
        this.health -= damage;
        
        if (this.health <= 0) {
            this.destroy();
        } else {
            // Visual feedback for taking damage
            this.scene.tweens.add({
                targets: this,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: 1
            });
        }
    }
    
    /**
     * Handle ship destruction and cleanup
     */
    destroy() {
        this.currentState = 'destroyed';
        
        // Stop all tweens
        if (this.pulseTween) this.pulseTween.stop();
        if (this.enterTween) this.enterTween.stop();
        if (this.attackTween) this.attackTween.stop();
        
        // Call parent destroy method
        super.destroy();
    }
    
    /**
     * Simple despawn method for cleanup
     */
    despawn() {
        this.destroy();
    }
    
    /**
     * Get the current score value based on ship state
     * @returns {number} The score value
     */
    getScoreValue() {
        return this.currentState === 'inFormation' ? this.pointsInFormation : this.pointsInMotion;
    }
}

/**
 * Red Fighter - The iconic "Spiral Squadron" from Gyruss
 * Spawns from center and flies in corkscrew pattern to formation
 */
class RedFighter extends EnemyShip {
    /**
     * Create a new Red Fighter
     * @param {Phaser.Scene} scene - The scene this ship belongs to
     * @param {number} x - Initial x position (should be center)
     * @param {number} y - Initial y position (should be center)
     */
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy1');
        
        // Red Fighter specific properties (matching Gyruss blueprint)
        this.health = 1;
        this.pointsInMotion = 100;  // Awarded during entry tween
        this.pointsInFormation = 50; // Awarded when stationary in formation
        this.enterSpeed = 200;
        this.attackSpeed = 300;
        
        // Set visual properties
        this.setTint(0xff4444);
        
        // Start at scale 0 to simulate flying from distant center
        this.setScale(0);
    }
    
    /**
     * Create corkscrew/spiral entrance animation from center
     * @param {number} duration - Duration of the animation
     */
    createEnterAnimation(duration) {
        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY;
        const targetX = this.formationPosition.x;
        const targetY = this.formationPosition.y;
        
        // Calculate logarithmic spiral parameters
        const startRadius = 0;
        const endRadius = Math.sqrt(Math.pow(targetX - centerX, 2) + Math.pow(targetY - centerY, 2));
        const startAngle = Math.atan2(targetY - centerY, targetX - centerX);
        const spiralTurns = 3; // Number of complete rotations
        
        this.enterTween = this.scene.tweens.add({
            targets: this,
            t: 0,
            scaleX: 1,
            scaleY: 1,
            duration: duration,
            ease: 'Power2',
            onUpdate: (tween) => {
                const t = tween.getValue();
                
                // Calculate spiral position
                const currentRadius = startRadius + (endRadius - startRadius) * t;
                const currentAngle = startAngle + (spiralTurns * 2 * Math.PI * t);
                
                this.x = centerX + Math.cos(currentAngle) * currentRadius;
                this.y = centerY + Math.sin(currentAngle) * currentRadius;
                
                // Rotate ship to face movement direction
                const angle = currentAngle + Math.PI / 2;
                this.rotation = angle;
            },
            onComplete: () => {
                this.currentState = 'inFormation';
                this.onFormationReached();
            }
        });
    }
    
    /**
     * Create aggressive direct attack animation
     * @param {Phaser.GameObjects.GameObject} target - The target to attack
     * @param {number} duration - Duration of the animation
     */
    createAttackAnimation(target, duration) {
        // Red Fighter peels off and dives directly at target
        const startX = this.x;
        const startY = this.y;
        
        this.attackTween = this.scene.tweens.add({
            targets: this,
            x: target.x,
            y: target.y,
            duration: duration,
            ease: 'Sine.easeIn',
            onStart: () => {
                // Fire projectile at start of attack
                this.fireProjectile(target);
            },
            onComplete: () => {
                this.onAttackComplete();
            }
        });
    }
    
    /**
     * Fire a projectile at the target
     * @param {Phaser.GameObjects.GameObject} target - The target to fire at
     */
    fireProjectile(target) {
        // This would integrate with your bullet system
        // For now, just log the action
        console.log('Red Fighter firing at target');
    }
    
    /**
     * Start formation behavior - Red Fighters form the main circular formation
     */
    startFormationBehavior() {
        // Red Fighters stay in their assigned formation position
        // They maintain the main circular enemy formation
    }
}

/**
 * Yellow Scout - The "Flanking Wave" from Gyruss
 * Spawns from screen edges and converges on formation
 */
class YellowScout extends EnemyShip {
    /**
     * Create a new Yellow Scout
     * @param {Phaser.Scene} scene - The scene this ship belongs to
     * @param {number} x - Initial x position (should be off-screen edge)
     * @param {number} y - Initial y position
     * @param {boolean} fromLeft - Whether spawning from left or right edge
     */
    constructor(scene, x, y, fromLeft = true) {
        super(scene, x, y, 'enemy2');
        
        // Yellow Scout specific properties (matching Gyruss blueprint)
        this.health = 1;
        this.pointsInMotion = 150;  // Higher reward for hitting faster target
        this.pointsInFormation = 50; // Same as Red Fighter once stationary
        this.enterSpeed = 300; // Faster than Red Fighters
        this.attackSpeed = 400;
        
        // Set visual properties
        this.setTint(0xffff44);
        
        // Store spawn direction
        this.fromLeft = fromLeft;
    }
    
    /**
     * Create direct converging entrance from screen edge
     * @param {number} duration - Duration of the animation
     */
    createEnterAnimation(duration) {
        const targetX = this.formationPosition.x;
        const targetY = this.formationPosition.y;
        
        // Direct line to formation position
        this.enterTween = this.scene.tweens.add({
            targets: this,
            x: targetX,
            y: targetY,
            duration: duration,
            ease: 'Quad.easeOut',
            onUpdate: (tween) => {
                // Rotate ship to face movement direction
                const dx = targetX - this.x;
                const dy = targetY - this.y;
                const angle = Math.atan2(dy, dx);
                this.rotation = angle;
            },
            onComplete: () => {
                this.currentState = 'inFormation';
                this.onFormationReached();
            }
        });
    }
    
    /**
     * Create elaborate attack with center loop before diving
     * @param {Phaser.GameObjects.GameObject} target - The target to attack
     * @param {number} duration - Duration of the animation
     */
    createAttackAnimation(target, duration) {
        const startX = this.x;
        const startY = this.y;
        const centerX = this.scene.cameras.main.centerX;
        const centerY = this.scene.cameras.main.centerY;
        const endX = target.x;
        const endY = target.y;
        
        // Chain of three tweens: peel off -> loop -> dive
        
        // Tween 1: Move to center to begin loop
        this.scene.tweens.add({
            targets: this,
            x: centerX,
            y: centerY,
            duration: duration * 0.3,
            ease: 'Power2',
            onComplete: () => {
                // Tween 2: Perform 360-degree loop
                this.scene.tweens.add({
                    targets: this,
                    angle: this.rotation + Math.PI * 2,
                    duration: duration * 0.4,
                    ease: 'Linear',
                    onComplete: () => {
                        // Tween 3: Final dive at player
                        this.scene.tweens.add({
                            targets: this,
                            x: endX,
                            y: endY,
                            duration: duration * 0.3,
                            ease: 'Sine.easeIn',
                            onStart: () => {
                                // Fire projectile at start of final dive
                                this.fireProjectile(target);
                            },
                            onComplete: () => {
                                this.onAttackComplete();
                            }
                        });
                    }
                });
            }
        });
    }
    
    /**
     * Fire a projectile at the target
     * @param {Phaser.GameObjects.GameObject} target - The target to fire at
     */
    fireProjectile(target) {
        // This would integrate with your bullet system
        console.log('Yellow Scout firing at target');
    }
    
    /**
     * Start formation behavior - Yellow Scouts join the main formation
     */
    startFormationBehavior() {
        // Yellow Scouts integrate into the main formation
        // They maintain their position alongside Red Fighters
    }
}

/**
 * Satellite Group - Power-up carriers that appear in groups of three
 * High-value targets that award power-ups when destroyed
 */
class Satellite extends EnemyShip {
    /**
     * Create a new Satellite
     * @param {Phaser.Scene} scene - The scene this ship belongs to
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {boolean} isCentral - Whether this is the central satellite (awards power-up)
     */
    constructor(scene, x, y, isCentral = false) {
        super(scene, x, y, 'enemy3');
        
        // Satellite specific properties
        this.health = 2;
        this.pointsInMotion = 1000;  // High value target
        this.pointsInFormation = 1000;
        this.enterSpeed = 150;
        this.attackSpeed = 200;
        
        // Set visual properties
        this.setTint(0x00ffff);
        
        // Power-up properties
        this.isCentral = isCentral;
        this.carriesPowerUp = isCentral; // Only central satellite carries power-up
        
        // Satellite group properties
        this.groupRadius = 30;
        this.groupAngle = 0;
        this.groupCenter = { x: x, y: y };
    }
    
    /**
     * Create materialization entrance animation
     * @param {number} duration - Duration of the animation
     */
    createEnterAnimation(duration) {
        // Satellites materialize in center with fade-in effect
        this.setAlpha(0);
        this.setScale(0);
        
        this.enterTween = this.scene.tweens.add({
            targets: this,
            alpha: 1,
            scaleX: 1,
            scaleY: 1,
            duration: duration,
            ease: 'Power2',
            onComplete: () => {
                this.currentState = 'inFormation';
                this.onFormationReached();
            }
        });
    }
    
    /**
     * Create continuous circular motion (not a tween to static position)
     */
    startFormationBehavior() {
        // Satellites move in continuous circular pattern
        // This is handled in the update method, not with tweens
        this.groupCenter.x = this.scene.cameras.main.centerX;
        this.groupCenter.y = this.scene.cameras.main.centerY;
    }
    
    /**
     * Update method for continuous circular motion
     * This should be called from the scene's update method
     */
    update() {
        if (this.currentState === 'inFormation') {
            // Update circular motion
            this.groupAngle += 0.02; // Rotation speed
            
            // Calculate position in circle
            const offsetX = Math.cos(this.groupAngle) * this.groupRadius;
            const offsetY = Math.sin(this.groupAngle) * this.groupRadius;
            
            this.x = this.groupCenter.x + offsetX;
            this.y = this.groupCenter.y + offsetY;
            
            // Rotate satellite to face movement direction
            this.rotation = this.groupAngle + Math.PI / 2;
        }
    }
    
    /**
     * Handle destruction - award power-up if central satellite
     */
    destroy() {
        if (this.isCentral && this.carriesPowerUp) {
            // Award double-shot power-up
            this.awardPowerUp();
        }
        
        super.destroy();
    }
    
    /**
     * Award power-up to player
     */
    awardPowerUp() {
        // This would integrate with your power-up system
        console.log('Double-shot power-up awarded!');
    }
}

/**
 * Satellite Group Manager - Manages groups of three satellites
 */
class SatelliteGroup {
    /**
     * Create a new satellite group
     * @param {Phaser.Scene} scene - The scene this group belongs to
     * @param {number} x - Center x position
     * @param {number} y - Center y position
     */
    constructor(scene, x, y) {
        this.scene = scene;
        this.centerX = x;
        this.centerY = y;
        this.satellites = [];
        
        this.createSatellites();
    }
    
    /**
     * Create the three satellites in the group
     */
    createSatellites() {
        const angles = [0, Math.PI * 2 / 3, Math.PI * 4 / 3]; // 120 degrees apart
        
        for (let i = 0; i < 3; i++) {
            const angle = angles[i];
            const radius = 30;
            const x = this.centerX + Math.cos(angle) * radius;
            const y = this.centerY + Math.sin(angle) * radius;
            
            const isCentral = (i === 0); // First satellite is central
            const satellite = new Satellite(this.scene, x, y, isCentral);
            
            // Set group properties
            satellite.groupAngle = angle;
            satellite.groupRadius = radius;
            
            this.satellites.push(satellite);
        }
    }
    
    /**
     * Start the satellite group behavior
     */
    start() {
        this.satellites.forEach(satellite => {
            satellite.enterFormation(1500);
        });
    }
    
    /**
     * Update all satellites in the group
     */
    update() {
        this.satellites.forEach(satellite => {
            if (satellite.active) {
                satellite.update();
            }
        });
    }
    
    /**
     * Destroy all satellites in the group
     */
    destroy() {
        this.satellites.forEach(satellite => {
            if (satellite.active) {
                satellite.destroy();
            }
        });
        this.satellites = [];
    }
}

// Export classes for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EnemyShip,
        RedFighter,
        YellowScout,
        Satellite,
        SatelliteGroup
    };
} 