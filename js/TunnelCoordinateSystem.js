/**
 * Tunnel Coordinate System
 * Core coordinate transformations for Gyruss-style tube effect
 */

class TunnelCoordinateSystem {
    constructor() {
        // Screen center coordinates
        this.centerX = GameConfig.centerX;
        this.centerY = GameConfig.centerY;
        this.maxRadius = 400; // Maximum radius for depth calculations
        
        // Depth effect configuration
        this.depthConfig = {
            minScale: 0.2,
            maxScale: 2.5,
            minAlpha: 0.3,
            maxAlpha: 1.0,
            minBlur: 0,
            maxBlur: 3
        };
        
        console.log('TunnelCoordinateSystem: Initialized with center at', this.centerX, this.centerY);
    }
    
    /**
     * Convert polar coordinates to screen coordinates
     * @param {number} radius - Distance from center
     * @param {number} angle - Angle in radians
     * @returns {Object} Screen coordinates {x, y}
     */
    polarToScreen(radius, angle) {
        return {
            x: this.centerX + radius * Math.cos(angle),
            y: this.centerY + radius * Math.sin(angle)
        };
    }
    
    /**
     * Convert screen coordinates to polar coordinates
     * @param {number} x - Screen X coordinate
     * @param {number} y - Screen Y coordinate
     * @returns {Object} Polar coordinates {radius, angle}
     */
    screenToPolar(x, y) {
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        return {
            radius: Math.sqrt(dx * dx + dy * dy),
            angle: Math.atan2(dy, dx)
        };
    }
    
    /**
     * Calculate depth factor for 3D illusion
     * @param {number} radius - Distance from center
     * @returns {number} Depth factor (0 = far, 1 = close)
     */
    calculateDepthFactor(radius) {
        // Normalize radius to 0-1 range (0 = center, 1 = edge)
        const normalizedRadius = Math.min(radius / this.maxRadius, 1);
        
        // Invert so that center = 1 (close), edge = 0 (far)
        return 1 - normalizedRadius;
    }
    
    /**
     * Calculate sprite scale based on depth
     * @param {number} radius - Distance from center
     * @returns {number} Scale factor
     */
    calculateSpriteScale(radius) {
        const depthFactor = this.calculateDepthFactor(radius);
        return this.depthConfig.minScale + 
               (this.depthConfig.maxScale - this.depthConfig.minScale) * depthFactor;
    }
    
    /**
     * Calculate alpha based on depth
     * @param {number} radius - Distance from center
     * @returns {number} Alpha value
     */
    calculateAlpha(radius) {
        const depthFactor = this.calculateDepthFactor(radius);
        return this.depthConfig.minAlpha + 
               (this.depthConfig.maxAlpha - this.depthConfig.minAlpha) * depthFactor;
    }
    
    /**
     * Calculate blur based on depth
     * @param {number} radius - Distance from center
     * @returns {number} Blur value
     */
    calculateBlur(radius) {
        const depthFactor = this.calculateDepthFactor(radius);
        return this.depthConfig.minBlur + 
               (this.depthConfig.maxBlur - this.depthConfig.minBlur) * (1 - depthFactor);
    }
    
    /**
     * Update sprite visual properties based on depth
     * @param {Phaser.GameObjects.GameObject} sprite - Sprite to update
     * @param {number} radius - Distance from center
     */
    updateSpriteVisuals(sprite, radius) {
        const depthFactor = this.calculateDepthFactor(radius);
        
        // Scale sprite
        const scale = this.calculateSpriteScale(radius);
        sprite.setScale(scale);
        
        // Adjust alpha
        const alpha = this.calculateAlpha(radius);
        sprite.setAlpha(alpha);
        
        // Optional: Add blur effect for distant objects
        if (sprite.setBlur) {
            const blur = this.calculateBlur(radius);
            sprite.setBlur(blur);
        }
    }
    
    /**
     * Get distance between two points
     * @param {number} x1 - First point X
     * @param {number} y1 - First point Y
     * @param {number} x2 - Second point X
     * @param {number} y2 - Second point Y
     * @returns {number} Distance
     */
    getDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Get angle between two points
     * @param {number} x1 - First point X
     * @param {number} y1 - First point Y
     * @param {number} x2 - Second point X
     * @param {number} y2 - Second point Y
     * @returns {number} Angle in radians
     */
    getAngle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
    
    /**
     * Normalize angle to 0-2π range
     * @param {number} angle - Angle in radians
     * @returns {number} Normalized angle
     */
    normalizeAngle(angle) {
        angle = angle % (Math.PI * 2);
        if (angle < 0) angle += Math.PI * 2;
        return angle;
    }
}

window.TunnelCoordinateSystem = TunnelCoordinateSystem; 