/**
 * Tunnel Coordinate System
 * Handles Gyruss-style 3D tunnel effect using polar coordinates
 */

class TunnelCoordinateSystem {
    constructor(screenWidth, screenHeight) {
        this.centerX = screenWidth / 2;
        this.centerY = screenHeight / 2;
        this.maxRadius = Math.sqrt(this.centerX * this.centerX + this.centerY * this.centerY);
        
        // Depth parameters for 3D effect
        this.depthConfig = {
            minDepth: 0.1,      // Closest to player (edge of screen)
            maxDepth: 1.0,      // Furthest from player (center)
            depthFalloff: 0.8,  // How quickly depth changes with radius
            scaleRange: {
                min: 0.2,       // Smallest sprite scale
                max: 1.5        // Largest sprite scale
            }
        };
        
        console.log('TunnelCoordinateSystem: Initialized for Gyruss-style tunnel effect');
    }
    
    /**
     * Convert polar coordinates (radius, angle) to screen coordinates (x, y)
     * @param {number} radius - Distance from center (0 to maxRadius)
     * @param {number} angle - Angle in radians (0 to 2π)
     * @returns {Object} {x, y} screen coordinates
     */
    polarToScreen(radius, angle) {
        const x = this.centerX + Math.cos(angle) * radius;
        const y = this.centerY + Math.sin(angle) * radius;
        return { x, y };
    }
    
    /**
     * Convert screen coordinates (x, y) to polar coordinates (radius, angle)
     * @param {number} x - Screen X coordinate
     * @param {number} y - Screen Y coordinate
     * @returns {Object} {radius, angle} polar coordinates
     */
    screenToPolar(x, y) {
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        const radius = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        return { radius, angle };
    }
    
    /**
     * Calculate depth factor based on radius (0 = center, 1 = edge)
     * @param {number} radius - Distance from center
     * @returns {number} Depth factor (0 to 1)
     */
    calculateDepthFactor(radius) {
        const normalizedRadius = Math.min(radius / this.maxRadius, 1);
        return Math.pow(normalizedRadius, this.depthConfig.depthFalloff);
    }
    
    /**
     * Calculate sprite scale based on depth for 3D effect
     * @param {number} radius - Distance from center
     * @returns {number} Scale factor for sprite
     */
    calculateSpriteScale(radius) {
        const depthFactor = this.calculateDepthFactor(radius);
        const scale = this.depthConfig.scaleRange.min + 
                     (this.depthConfig.scaleRange.max - this.depthConfig.scaleRange.min) * depthFactor;
        return Math.max(this.depthConfig.scaleRange.min, 
                       Math.min(this.depthConfig.scaleRange.max, scale));
    }
    
    /**
     * Calculate velocity components for smooth movement
     * @param {number} radius - Current radius
     * @param {number} angle - Current angle
     * @param {number} radiusSpeed - Speed of radius change
     * @param {number} angleSpeed - Speed of angle change
     * @returns {Object} {velocityX, velocityY} velocity components
     */
    calculateVelocity(radius, angle, radiusSpeed, angleSpeed) {
        // Calculate next position
        const nextRadius = radius + radiusSpeed;
        const nextAngle = angle + angleSpeed;
        
        const currentPos = this.polarToScreen(radius, angle);
        const nextPos = this.polarToScreen(nextRadius, nextAngle);
        
        return {
            velocityX: nextPos.x - currentPos.x,
            velocityY: nextPos.y - currentPos.y
        };
    }
    
    /**
     * Check if a position is within the playable area
     * @param {number} x - Screen X coordinate
     * @param {number} y - Screen Y coordinate
     * @returns {boolean} True if within bounds
     */
    isWithinBounds(x, y) {
        const { radius } = this.screenToPolar(x, y);
        return radius <= this.maxRadius;
    }
    
    /**
     * Get spawn position at edge of screen
     * @param {number} angle - Spawn angle
     * @returns {Object} {x, y} spawn coordinates
     */
    getSpawnPosition(angle) {
        return this.polarToScreen(this.maxRadius, angle);
    }
    
    /**
     * Get center position
     * @returns {Object} {x, y} center coordinates
     */
    getCenterPosition() {
        return { x: this.centerX, y: this.centerY };
    }
}

// Export for use in other modules
window.TunnelCoordinateSystem = TunnelCoordinateSystem; 