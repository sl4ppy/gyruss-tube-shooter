/**
 * Game Configuration
 * Centralized settings for the Gyruss-inspired tube shooter
 */

const GameConfig = {
    // Display settings
    width: 800,
    height: 600,
    backgroundColor: '#000011',
    
    // Player settings
    playerRadius: 250,
    playerSpeed: 0.03,
    playerBulletSpeed: 400,
    playerBulletScale: 2.0,
    
    // Enemy settings
    enemySpeed: 50,
    enemyBulletSpeed: 300,
    enemyBulletScale: 2.0,
    enemyFireChance: 20, // percentage
    
    // Game settings
    initialLives: 3,
    initialScore: 0,
    initialLevel: 1,
    
    // Center coordinates
    centerX: 400,
    centerY: 300,
    
    // Bullet cleanup distances
    playerBulletCleanupDistance: 50, // from center
    enemyBulletCleanupDistance: 50, // beyond player radius
    
    // Visual effects
    starCount: 50,
    explosionParticleCount: 8,
    
    // Controls
    keys: {
        left: 'LEFT',
        right: 'RIGHT',
        fire: 'SPACE',
        restart: 'R'
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
} 