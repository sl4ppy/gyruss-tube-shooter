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
    
    // Wave and Phase settings
    waves: {
        wavesPerPhase: 3,
        enemiesPerWave: {
            phase1: [3, 4, 5],
            phase2: [4, 5, 6],
            phase3: [5, 6, 7],
            phase4: [6, 7, 8],
            phase5: [7, 8, 9]
        },
        waveDelay: 3000, // 3 seconds between waves
        phaseDelay: 5000, // 5 seconds between phases
        bossWaveInterval: 5 // Every 5 phases, spawn a boss wave
    },
    
    // Enemy difficulty scaling
    enemyScaling: {
        speedIncrease: 10, // Speed increase per phase
        fireRateIncrease: 5, // Fire rate increase per phase
        maxSpeed: 150,
        maxFireRate: 50
    },
    
    // Enemy movement patterns
    enemyMovement: {
        patterns: {
            circle: {
                radius: 120,
                speed: 0.02,
                direction: 1 // 1 for clockwise, -1 for counter-clockwise
            },
            spiral: {
                radius: 100,
                speed: 0.03,
                spiralTightness: 0.1
            },
            weave: {
                amplitude: 50,
                frequency: 0.05,
                speed: 0.02
            },
            swoop: {
                approachSpeed: 80,
                swoopRadius: 150,
                lingerTime: 2000
            },
            figure8: {
                radius: 80,
                speed: 0.025
            },
            zigzag: {
                amplitude: 60,
                frequency: 0.04,
                speed: 0.015
            }
        },
        patternChangeInterval: 3000, // How often enemies change patterns
        edgeLingerChance: 0.3 // Chance to linger at screen edges
    },
    
    // Gyruss-style enemy behavior
    enemyBehavior: {
        spawnDistance: 800, // Distance from center to spawn enemies
        approachSpeed: 60, // Speed when approaching formation
        formationRadius: 200, // Radius where enemies form up
        formationTime: 3000, // Time to stay in formation before attacking
        diveSpeed: 120, // Speed when dive-bombing player
        attackFormationSize: 3, // Number of enemies that attack together
        attackCooldown: 2000, // Time between attack waves
        tubeDepth: 400 // How far "into" the tube enemies can go
    },
    
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
    },
    
    // Asset configuration
    assets: {
        images: {
            playerShip: 'assets/player_ship.png',
            redEnemy: 'assets/red_enemy_ship.png',
            greenEnemy: 'assets/green_enemy_ship.png',
            yellowEnemy: 'assets/yellow_enemy_ship.png',
            purpleEnemy: 'assets/purple_enemy_ship.png'
        }
    },
    
    // Loading screen settings
    loading: {
        minLoadTime: 2000, // Minimum time to show loading screen (ms)
        progressBarWidth: 300,
        progressBarHeight: 20
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
} 