/**
 * Spiral Path Generator
 * Generates and manages spiral entry paths for Gyruss-style tunnel effect
 */

class SpiralPathGenerator {
    constructor(tunnelSystem) {
        this.tunnelSystem = tunnelSystem;
        this.pathCache = new Map(); // Cache for precomputed paths
        
        // Spiral configuration
        this.spiralConfig = {
            types: {
                archimedean: {
                    name: 'Archimedean',
                    radiusFunction: (t) => t * 2, // Linear radius increase
                    angleFunction: (t) => t * 3   // Constant angular velocity
                },
                logarithmic: {
                    name: 'Logarithmic',
                    radiusFunction: (t) => Math.exp(t * 0.5) * 10,
                    angleFunction: (t) => t * 2
                },
                hyperbolic: {
                    name: 'Hyperbolic',
                    radiusFunction: (t) => 100 / (1 - t * 0.8),
                    angleFunction: (t) => t * 4
                },
                gyruss: {
                    name: 'Gyruss Classic',
                    radiusFunction: (t) => t * t * 300, // Quadratic radius increase
                    angleFunction: (t) => t * 2.5       // Moderate angular velocity
                }
            }
        };
        
        console.log('SpiralPathGenerator: Initialized for Gyruss-style spiral paths');
    }
    
    /**
     * Generate a spiral path from center to target radius
     * @param {string} spiralType - Type of spiral ('archimedean', 'logarithmic', 'hyperbolic', 'gyruss')
     * @param {number} startRadius - Starting radius (usually 0 for center)
     * @param {number} targetRadius - Target radius for formation
     * @param {number} startAngle - Starting angle in radians
     * @param {number} duration - Duration in frames
     * @returns {Array} Array of path points
     */
    generateSpiralPath(spiralType, startRadius, targetRadius, startAngle, duration) {
        const cacheKey = `${spiralType}_${startRadius}_${targetRadius}_${startAngle}_${duration}`;
        
        // Check cache first
        if (this.pathCache.has(cacheKey)) {
            return this.pathCache.get(cacheKey);
        }
        
        const spiralTypeConfig = this.spiralConfig.types[spiralType] || this.spiralConfig.types.gyruss;
        const path = [];
        
        for (let frame = 0; frame <= duration; frame++) {
            const t = frame / duration; // Normalized time (0 to 1)
            
            // Calculate radius and angle using spiral functions
            const radius = startRadius + (targetRadius - startRadius) * spiralTypeConfig.radiusFunction(t);
            const angle = startAngle + spiralTypeConfig.angleFunction(t) * Math.PI * 2;
            
            // Convert to screen coordinates
            const screenPos = this.tunnelSystem.polarToScreen(radius, angle);
            
            // Calculate depth and scale
            const depthFactor = this.tunnelSystem.calculateDepthFactor(radius);
            const scale = this.tunnelSystem.calculateSpriteScale(radius);
            
            path.push({
                frame: frame,
                radius: radius,
                angle: angle,
                x: screenPos.x,
                y: screenPos.y,
                depthFactor: depthFactor,
                scale: scale,
                t: t
            });
        }
        
        // Cache the path
        this.pathCache.set(cacheKey, path);
        return path;
    }
    
    /**
     * Generate multiple spiral paths for formation entry
     * @param {string} formationType - Type of formation ('v', 'line', 'circle', 'diamond')
     * @param {number} enemyCount - Number of enemies in formation
     * @param {number} targetRadius - Formation radius
     * @param {number} duration - Entry duration in frames
     * @returns {Array} Array of spiral paths for each enemy
     */
    generateFormationPaths(formationType, enemyCount, targetRadius, duration) {
        const paths = [];
        
        for (let i = 0; i < enemyCount; i++) {
            let startAngle;
            
            switch (formationType) {
                case 'v':
                    // V-formation: spread in a V shape
                    startAngle = (i / (enemyCount - 1)) * Math.PI * 0.6 - Math.PI * 0.3;
                    break;
                    
                case 'line':
                    // Line formation: spread in a line
                    startAngle = (i / (enemyCount - 1)) * Math.PI * 0.8 - Math.PI * 0.4;
                    break;
                    
                case 'circle':
                    // Circle formation: evenly spaced around circle
                    startAngle = (i / enemyCount) * Math.PI * 2;
                    break;
                    
                case 'diamond':
                    // Diamond formation: diamond pattern
                    if (i === 0) startAngle = 0;                    // Top
                    else if (i === 1) startAngle = Math.PI / 2;     // Right
                    else if (i === 2) startAngle = Math.PI;         // Bottom
                    else if (i === 3) startAngle = Math.PI * 1.5;   // Left
                    else startAngle = (i / enemyCount) * Math.PI * 2; // Fallback
                    break;
                    
                default:
                    startAngle = (i / enemyCount) * Math.PI * 2;
            }
            
            // Add slight randomization to make paths more natural
            const randomOffset = (Math.random() - 0.5) * 0.2;
            startAngle += randomOffset;
            
            const path = this.generateSpiralPath('gyruss', 0, targetRadius, startAngle, duration);
            paths.push({
                enemyIndex: i,
                formationType: formationType,
                startAngle: startAngle,
                path: path
            });
        }
        
        return paths;
    }
    
    /**
     * Get path point at specific frame
     * @param {Array} path - Precomputed path
     * @param {number} frame - Current frame
     * @returns {Object} Path point data
     */
    getPathPoint(path, frame) {
        const frameIndex = Math.min(frame, path.length - 1);
        return path[frameIndex];
    }
    
    /**
     * Interpolate between path points for smooth movement
     * @param {Array} path - Precomputed path
     * @param {number} frame - Current frame (can be fractional)
     * @returns {Object} Interpolated path point
     */
    interpolatePathPoint(path, frame) {
        const frameIndex = Math.floor(frame);
        const nextFrameIndex = Math.min(frameIndex + 1, path.length - 1);
        const fraction = frame - frameIndex;
        
        if (frameIndex >= path.length - 1) {
            return path[path.length - 1];
        }
        
        const current = path[frameIndex];
        const next = path[nextFrameIndex];
        
        // Linear interpolation
        return {
            frame: frame,
            radius: current.radius + (next.radius - current.radius) * fraction,
            angle: current.angle + (next.angle - current.angle) * fraction,
            x: current.x + (next.x - current.x) * fraction,
            y: current.y + (next.y - current.y) * fraction,
            depthFactor: current.depthFactor + (next.depthFactor - current.depthFactor) * fraction,
            scale: current.scale + (next.scale - current.scale) * fraction,
            t: current.t + (next.t - current.t) * fraction
        };
    }
    
    /**
     * Clear path cache to free memory
     */
    clearCache() {
        this.pathCache.clear();
        console.log('SpiralPathGenerator: Cache cleared');
    }
    
    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getCacheStats() {
        return {
            cachedPaths: this.pathCache.size,
            memoryUsage: this.pathCache.size * 1000 // Rough estimate in bytes
        };
    }
}

// Export for use in other modules
window.SpiralPathGenerator = SpiralPathGenerator; 