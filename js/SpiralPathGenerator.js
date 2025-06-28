/**
 * Spiral Path Generator
 * Generates spiral entry paths for Gyruss-style tube effect
 */

class SpiralPathGenerator {
    constructor() {
        this.spiralConfig = {
            startRadius: 0,
            endRadius: 200,
            startAngle: 0,
            rotations: 2, // Number of full rotations
            duration: 180 // Frames to complete spiral
        };
        
        console.log('SpiralPathGenerator: Initialized for Gyruss-style spiral paths');
    }
    
    /**
     * Generate a single spiral path
     * @param {number} startAngle - Starting angle in radians
     * @returns {Array} Array of path points
     */
    generateSpiralPath(startAngle = 0) {
        const path = [];
        const angleStep = (this.spiralConfig.rotations * Math.PI * 2) / this.spiralConfig.duration;
        const radiusStep = (this.spiralConfig.endRadius - this.spiralConfig.startRadius) / this.spiralConfig.duration;
        
        for (let frame = 0; frame < this.spiralConfig.duration; frame++) {
            const angle = startAngle + frame * angleStep;
            const radius = this.spiralConfig.startRadius + frame * radiusStep;
            
            path.push({
                frame: frame,
                radius: radius,
                angle: angle,
                phase: 'SPIRAL'
            });
        }
        
        return path;
    }
    
    /**
     * Generate formation paths for multiple enemies
     * @param {string} formationType - Type of formation ('circle', 'line', 'v')
     * @param {number} enemyCount - Number of enemies in formation
     * @param {number} targetRadius - Target radius for formation
     * @param {number} duration - Duration in frames
     * @returns {Array} Array of path arrays for each enemy
     */
    generateFormationPaths(formationType, enemyCount, targetRadius, duration) {
        const paths = [];
        
        // Update config for this formation
        this.spiralConfig.endRadius = targetRadius;
        this.spiralConfig.duration = duration;
        
        switch (formationType) {
            case 'circle':
                // Enemies start at different angles around a circle
                for (let i = 0; i < enemyCount; i++) {
                    const startAngle = (i / enemyCount) * Math.PI * 2;
                    paths.push(this.generateSpiralPath(startAngle));
                }
                break;
                
            case 'line':
                // Enemies start in a line formation
                const angleSpread = Math.PI / 4; // 45 degrees
                const angleStep = angleSpread / (enemyCount - 1);
                
                for (let i = 0; i < enemyCount; i++) {
                    const startAngle = -angleSpread / 2 + i * angleStep;
                    paths.push(this.generateSpiralPath(startAngle));
                }
                break;
                
            case 'v':
                // V formation
                for (let i = 0; i < enemyCount; i++) {
                    const startAngle = (i % 2 === 0 ? 1 : -1) * (Math.PI / 6) * Math.floor(i / 2);
                    paths.push(this.generateSpiralPath(startAngle));
                }
                break;
                
            case 'diamond':
                // Diamond formation
                const positions = [
                    { angle: 0, radius: 0 },           // Top
                    { angle: Math.PI / 2, radius: 0 }, // Right
                    { angle: Math.PI, radius: 0 },     // Bottom
                    { angle: -Math.PI / 2, radius: 0 } // Left
                ];
                
                for (let i = 0; i < enemyCount; i++) {
                    const pos = positions[i % positions.length];
                    paths.push(this.generateSpiralPath(pos.angle));
                }
                break;
                
            case 'cross':
                // Cross formation
                const crossAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
                
                for (let i = 0; i < enemyCount; i++) {
                    const startAngle = crossAngles[i % crossAngles.length];
                    paths.push(this.generateSpiralPath(startAngle));
                }
                break;
                
            default:
                // Default to circle formation
                for (let i = 0; i < enemyCount; i++) {
                    const startAngle = (i / enemyCount) * Math.PI * 2;
                    paths.push(this.generateSpiralPath(startAngle));
                }
                break;
        }
        
        return paths;
    }
    
    /**
     * Generate a custom spiral path with specific parameters
     * @param {Object} config - Spiral configuration
     * @returns {Array} Array of path points
     */
    generateCustomSpiral(config) {
        const {
            startRadius = 0,
            endRadius = 200,
            startAngle = 0,
            rotations = 2,
            duration = 180,
            easing = 'linear'
        } = config;
        
        const path = [];
        const angleStep = (rotations * Math.PI * 2) / duration;
        const radiusStep = (endRadius - startRadius) / duration;
        
        for (let frame = 0; frame < duration; frame++) {
            let progress = frame / duration;
            
            // Apply easing if specified
            if (easing === 'easeIn') {
                progress = progress * progress;
            } else if (easing === 'easeOut') {
                progress = 1 - (1 - progress) * (1 - progress);
            } else if (easing === 'easeInOut') {
                progress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            }
            
            const angle = startAngle + frame * angleStep;
            const radius = startRadius + progress * (endRadius - startRadius);
            
            path.push({
                frame: frame,
                radius: radius,
                angle: angle,
                phase: 'SPIRAL',
                progress: progress
            });
        }
        
        return path;
    }
    
    /**
     * Generate a wave pattern spiral
     * @param {number} startAngle - Starting angle
     * @param {number} amplitude - Wave amplitude
     * @param {number} frequency - Wave frequency
     * @returns {Array} Array of path points
     */
    generateWaveSpiral(startAngle, amplitude = 20, frequency = 3) {
        const path = [];
        const angleStep = (this.spiralConfig.rotations * Math.PI * 2) / this.spiralConfig.duration;
        const radiusStep = (this.spiralConfig.endRadius - this.spiralConfig.startRadius) / this.spiralConfig.duration;
        
        for (let frame = 0; frame < this.spiralConfig.duration; frame++) {
            const baseAngle = startAngle + frame * angleStep;
            const waveOffset = Math.sin(frame * frequency * 0.1) * amplitude;
            const angle = baseAngle + waveOffset * 0.01; // Small angle offset
            
            const radius = this.spiralConfig.startRadius + frame * radiusStep;
            
            path.push({
                frame: frame,
                radius: radius,
                angle: angle,
                phase: 'SPIRAL',
                waveOffset: waveOffset
            });
        }
        
        return path;
    }
    
    /**
     * Get path point at specific frame
     * @param {Array} path - Path array
     * @param {number} frame - Frame number
     * @returns {Object} Path point or null if out of bounds
     */
    getPathPoint(path, frame) {
        if (frame < 0 || frame >= path.length) {
            return null;
        }
        return path[frame];
    }
    
    /**
     * Interpolate between path points for smooth movement
     * @param {Array} path - Path array
     * @param {number} frame - Frame number (can be fractional)
     * @returns {Object} Interpolated path point
     */
    interpolatePathPoint(path, frame) {
        const frame1 = Math.floor(frame);
        const frame2 = Math.min(frame1 + 1, path.length - 1);
        const fraction = frame - frame1;
        
        if (frame1 >= path.length) {
            return path[path.length - 1];
        }
        
        const point1 = path[frame1];
        const point2 = path[frame2];
        
        // Linear interpolation
        const radius = point1.radius + (point2.radius - point1.radius) * fraction;
        const angle = point1.angle + (point2.angle - point1.angle) * fraction;
        
        return {
            frame: frame,
            radius: radius,
            angle: angle,
            phase: 'SPIRAL'
        };
    }
}

window.SpiralPathGenerator = SpiralPathGenerator; 