/**
 * Starfield System
 * Creates rotating starfield background for Gyruss-style 3D tunnel effect
 */

class StarfieldSystem {
    constructor(scene, tunnelSystem) {
        this.scene = scene;
        this.tunnelSystem = tunnelSystem;
        this.stars = [];
        this.starLayers = [];
        
        // Starfield configuration
        this.starConfig = {
            totalStars: 200,
            layers: 3,
            layerConfig: [
                { count: 80, speed: 0.5, size: 1, color: 0xFFFFFF, alpha: 0.8 },   // Far layer
                { count: 60, speed: 1.0, size: 2, color: 0xCCCCFF, alpha: 0.9 },   // Mid layer
                { count: 40, speed: 1.5, size: 3, color: 0x9999FF, alpha: 1.0 }    // Near layer
            ],
            rotationSpeed: 0.001, // Base rotation speed
            depthEffect: {
                minScale: 0.3,
                maxScale: 2.0,
                minAlpha: 0.3,
                maxAlpha: 1.0
            }
        };
        
        this.currentRotation = 0;
        this.playerAngle = 0;
        
        this.initializeStarfield();
        console.log('StarfieldSystem: Initialized for Gyruss-style tunnel effect');
    }
    
    /**
     * Initialize the starfield with multiple depth layers
     */
    initializeStarfield() {
        // Create star layers
        for (let layerIndex = 0; layerIndex < this.starConfig.layers; layerIndex++) {
            const layerConfig = this.starConfig.layerConfig[layerIndex];
            const layerStars = [];
            
            for (let i = 0; i < layerConfig.count; i++) {
                const star = this.createStar(layerConfig, layerIndex);
                layerStars.push(star);
                this.stars.push(star);
            }
            
            this.starLayers.push({
                index: layerIndex,
                config: layerConfig,
                stars: layerStars
            });
        }
    }
    
    /**
     * Create a single star
     * @param {Object} layerConfig - Layer configuration
     * @param {number} layerIndex - Layer index
     * @returns {Object} Star data
     */
    createStar(layerConfig, layerIndex) {
        // Generate random polar coordinates
        const radius = Math.random() * this.tunnelSystem.maxRadius * 0.8;
        const angle = Math.random() * Math.PI * 2;
        
        // Convert to screen coordinates
        const screenPos = this.tunnelSystem.polarToScreen(radius, angle);
        
        // Create star sprite
        const star = this.scene.add.circle(
            screenPos.x, 
            screenPos.y, 
            layerConfig.size, 
            layerConfig.color, 
            layerConfig.alpha
        );
        
        // Store star data
        const starData = {
            sprite: star,
            layerIndex: layerIndex,
            radius: radius,
            angle: angle,
            originalRadius: radius,
            originalAngle: angle,
            speed: layerConfig.speed,
            size: layerConfig.size,
            color: layerConfig.color,
            alpha: layerConfig.alpha
        };
        
        return starData;
    }
    
    /**
     * Update starfield rotation based on player movement
     * @param {number} playerAngle - Current player angle
     * @param {number} deltaTime - Time since last frame
     */
    updateStarfield(playerAngle, deltaTime) {
        this.playerAngle = playerAngle;
        
        // Update rotation
        this.currentRotation += this.starConfig.rotationSpeed * deltaTime;
        
        // Update each star layer
        this.starLayers.forEach(layer => {
            this.updateStarLayer(layer, deltaTime);
        });
    }
    
    /**
     * Update a specific star layer
     * @param {Object} layer - Star layer data
     * @param {number} deltaTime - Time since last frame
     */
    updateStarLayer(layer, deltaTime) {
        const layerSpeed = layer.config.speed;
        
        layer.stars.forEach(star => {
            // Calculate new angle with rotation
            const rotationOffset = this.currentRotation * layerSpeed;
            const newAngle = star.originalAngle + rotationOffset + this.playerAngle * 0.1;
            
            // Calculate depth-based radius (stars closer to center appear further away)
            const depthRadius = star.originalRadius * (1 + Math.sin(this.currentRotation * 2) * 0.1);
            
            // Convert to screen coordinates
            const screenPos = this.tunnelSystem.polarToScreen(depthRadius, newAngle);
            
            // Update star position
            star.sprite.x = screenPos.x;
            star.sprite.y = screenPos.y;
            
            // Calculate depth effect
            const depthFactor = this.tunnelSystem.calculateDepthFactor(depthRadius);
            
            // Update scale based on depth
            const scale = this.starConfig.depthEffect.minScale + 
                         (this.starConfig.depthEffect.maxScale - this.starConfig.depthEffect.minScale) * depthFactor;
            star.sprite.setScale(scale);
            
            // Update alpha based on depth
            const alpha = this.starConfig.depthEffect.minAlpha + 
                         (this.starConfig.depthEffect.maxAlpha - this.starConfig.depthEffect.minAlpha) * depthFactor;
            star.sprite.setAlpha(alpha);
            
            // Update stored data
            star.radius = depthRadius;
            star.angle = newAngle;
        });
    }
    
    /**
     * Create star trail effect for fast-moving stars
     * @param {Object} star - Star data
     * @param {number} trailLength - Length of trail
     */
    createStarTrail(star, trailLength = 3) {
        const trail = [];
        
        for (let i = 0; i < trailLength; i++) {
            const trailStar = this.scene.add.circle(
                star.sprite.x, 
                star.sprite.y, 
                star.size * 0.5, 
                star.color, 
                star.alpha * (1 - i / trailLength) * 0.5
            );
            
            trail.push(trailStar);
        }
        
        return trail;
    }
    
    /**
     * Add explosion effect at specific position
     * @param {number} x - Screen X coordinate
     * @param {number} y - Screen Y coordinate
     * @param {number} intensity - Explosion intensity
     */
    createStarExplosion(x, y, intensity = 1) {
        const particleCount = Math.floor(10 * intensity);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = Math.random() * 50 * intensity;
            
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            
            const particle = this.scene.add.circle(
                particleX, 
                particleY, 
                Math.random() * 3 + 1, 
                0xFFFF00, 
                1
            );
            
            // Animate particle
            this.scene.tweens.add({
                targets: particle,
                x: particleX + (Math.random() - 0.5) * 100,
                y: particleY + (Math.random() - 0.5) * 100,
                alpha: 0,
                scale: 0,
                duration: 1000 + Math.random() * 500,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }
    
    /**
     * Set starfield rotation speed
     * @param {number} speed - Rotation speed multiplier
     */
    setRotationSpeed(speed) {
        this.starConfig.rotationSpeed = speed;
    }
    
    /**
     * Get starfield statistics
     * @returns {Object} Starfield statistics
     */
    getStats() {
        return {
            totalStars: this.stars.length,
            layers: this.starLayers.length,
            currentRotation: this.currentRotation,
            playerAngle: this.playerAngle
        };
    }
    
    /**
     * Clear all stars
     */
    clear() {
        this.stars.forEach(star => {
            if (star.sprite && star.sprite.destroy) {
                star.sprite.destroy();
            }
        });
        
        this.stars = [];
        this.starLayers = [];
    }
}

// Export for use in other modules
window.StarfieldSystem = StarfieldSystem; 