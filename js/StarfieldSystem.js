/**
 * Starfield System
 * Creates linear warping starfield background for space travel effect
 */

class StarfieldSystem {
    constructor(scene, tunnelSystem) {
        this.scene = scene;
        this.tunnelSystem = tunnelSystem;
        this.stars = [];
        this.starLayers = [];
        
        // Starfield configuration for linear warp effect
        this.starConfig = {
            totalStars: 300,
            layers: 4,
            layerConfig: [
                { count: 100, speed: 0.8, size: 1, color: 0xFFFFFF, alpha: 0.6 },   // Far layer (slow)
                { count: 80, speed: 1.2, size: 2, color: 0xCCCCFF, alpha: 0.8 },    // Mid-far layer
                { count: 60, speed: 1.8, size: 3, color: 0x9999FF, alpha: 0.9 },    // Mid-near layer
                { count: 40, speed: 2.5, size: 4, color: 0x6666FF, alpha: 1.0 }     // Near layer (fast)
            ],
            warpSpeed: 1.0, // Base warp speed multiplier
            depthEffect: {
                minScale: 0.2,
                maxScale: 3.0,
                minAlpha: 0.2,
                maxAlpha: 1.0
            },
            spawnRadius: 50, // Radius around center where stars spawn
            maxDistance: 800 // Maximum distance stars can travel before respawning
        };
        
        this.warpTime = 0;
        this.playerAngle = 0;
        
        this.initializeStarfield();
        console.log('StarfieldSystem: Initialized for linear warp effect');
    }
    
    /**
     * Initialize the starfield with linear warp layers
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
     * Create a single star for linear warp effect
     * @param {Object} layerConfig - Layer configuration
     * @param {number} layerIndex - Layer index
     * @returns {Object} Star data
     */
    createStar(layerConfig, layerIndex) {
        // Generate random position within spawn radius around center
        const spawnAngle = Math.random() * Math.PI * 2;
        const spawnDistance = Math.random() * this.starConfig.spawnRadius;
        
        const startX = GameConfig.centerX + Math.cos(spawnAngle) * spawnDistance;
        const startY = GameConfig.centerY + Math.sin(spawnAngle) * spawnDistance;
        
        // Calculate direction vector from center (linear warp direction)
        const directionX = startX - GameConfig.centerX;
        const directionY = startY - GameConfig.centerY;
        const directionLength = Math.sqrt(directionX * directionX + directionY * directionY);
        
        // Normalize direction vector
        const normalizedDirX = directionX / directionLength;
        const normalizedDirY = directionY / directionLength;
        
        // Create star sprite
        const star = this.scene.add.circle(
            startX, 
            startY, 
            layerConfig.size, 
            layerConfig.color, 
            layerConfig.alpha
        );
        
        // Store star data for linear movement
        const starData = {
            sprite: star,
            layerIndex: layerIndex,
            x: startX,
            y: startY,
            directionX: normalizedDirX,
            directionY: normalizedDirY,
            speed: layerConfig.speed,
            size: layerConfig.size,
            color: layerConfig.color,
            alpha: layerConfig.alpha,
            distance: 0, // Distance traveled from center
            maxDistance: this.starConfig.maxDistance
        };
        
        return starData;
    }
    
    /**
     * Update starfield for linear warp effect
     * @param {number} playerAngle - Current player angle (not used for linear warp)
     * @param {number} deltaTime - Time since last frame
     */
    updateStarfield(playerAngle, deltaTime) {
        this.playerAngle = playerAngle;
        this.warpTime += deltaTime * this.starConfig.warpSpeed;
        
        // Update each star layer
        this.starLayers.forEach(layer => {
            this.updateStarLayer(layer, deltaTime);
        });
    }
    
    /**
     * Update a specific star layer for linear movement
     * @param {Object} layer - Star layer data
     * @param {number} deltaTime - Time since last frame
     */
    updateStarLayer(layer, deltaTime) {
        const layerSpeed = layer.config.speed;
        
        layer.stars.forEach(star => {
            // Move star outward in straight line from center
            const moveDistance = layerSpeed * deltaTime * 60; // Convert to pixels per frame
            
            star.x += star.directionX * moveDistance;
            star.y += star.directionY * moveDistance;
            star.distance += moveDistance;
            
            // Update sprite position
            star.sprite.x = star.x;
            star.sprite.y = star.y;
            
            // Calculate depth effect based on distance from center
            const distanceFromCenter = Math.sqrt(
                Math.pow(star.x - GameConfig.centerX, 2) + 
                Math.pow(star.y - GameConfig.centerY, 2)
            );
            
            // Calculate depth factor (0 = near, 1 = far)
            const depthFactor = Math.min(distanceFromCenter / this.starConfig.maxDistance, 1);
            
            // Update scale based on depth (stars get bigger as they get closer)
            const scale = this.starConfig.depthEffect.maxScale - 
                         (this.starConfig.depthEffect.maxScale - this.starConfig.depthEffect.minScale) * depthFactor;
            star.sprite.setScale(scale);
            
            // Update alpha based on depth (stars get more visible as they get closer)
            const alpha = this.starConfig.depthEffect.minAlpha + 
                         (this.starConfig.depthEffect.maxAlpha - this.starConfig.depthEffect.minAlpha) * (1 - depthFactor);
            star.sprite.setAlpha(alpha);
            
            // Respawn star if it goes too far
            if (star.distance > star.maxDistance) {
                this.respawnStar(star);
            }
        });
    }
    
    /**
     * Respawn a star at the center with new random direction
     * @param {Object} star - Star data to respawn
     */
    respawnStar(star) {
        // Generate new random position within spawn radius
        const spawnAngle = Math.random() * Math.PI * 2;
        const spawnDistance = Math.random() * this.starConfig.spawnRadius;
        
        const startX = GameConfig.centerX + Math.cos(spawnAngle) * spawnDistance;
        const startY = GameConfig.centerY + Math.sin(spawnAngle) * spawnDistance;
        
        // Calculate new direction vector from center
        const directionX = startX - GameConfig.centerX;
        const directionY = startY - GameConfig.centerY;
        const directionLength = Math.sqrt(directionX * directionX + directionY * directionY);
        
        // Normalize direction vector
        const normalizedDirX = directionX / directionLength;
        const normalizedDirY = directionY / directionLength;
        
        // Update star data
        star.x = startX;
        star.y = startY;
        star.directionX = normalizedDirX;
        star.directionY = normalizedDirY;
        star.distance = 0;
        
        // Update sprite position and reset scale/alpha
        star.sprite.x = startX;
        star.sprite.y = startY;
        star.sprite.setScale(this.starConfig.depthEffect.minScale);
        star.sprite.setAlpha(this.starConfig.depthEffect.minAlpha);
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
                star.x - star.directionX * (i * 5), 
                star.y - star.directionY * (i * 5), 
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
     * Set warp speed
     * @param {number} speed - Warp speed multiplier
     */
    setWarpSpeed(speed) {
        this.starConfig.warpSpeed = speed;
    }
    
    /**
     * Get starfield statistics
     * @returns {Object} Starfield statistics
     */
    getStats() {
        return {
            totalStars: this.stars.length,
            layers: this.starLayers.length,
            warpTime: this.warpTime,
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