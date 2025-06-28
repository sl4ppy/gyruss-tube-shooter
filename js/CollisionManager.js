/**
 * Collision Manager Class
 * Handles collision detection and response between game objects
 */

class CollisionManager {
    constructor(scene, player, bulletManager) {
        this.scene = scene;
        this.player = player;
        this.bulletManager = bulletManager;
        
        this.setupCollisions();
    }
    
    setupCollisions() {
        // Player bullets hitting enemies
        this.scene.physics.add.overlap(
            this.bulletManager.getPlayerBullets(),
            this.scene.enemyManager.getEnemies(),
            this.hitEnemy.bind(this),
            null,
            this
        );
        
        // Enemy bullets hitting player
        this.scene.physics.add.overlap(
            this.bulletManager.getEnemyBullets(),
            this.player.getSprite(),
            this.hitPlayer.bind(this),
            null,
            this
        );
    }
    
    hitEnemy(bullet, enemy) {
        // Create explosion effect
        this.scene.effectsManager.createExplosionEffect(enemy.x, enemy.y);
        
        bullet.destroy();
        enemy.destroy();
        
        this.scene.score += 100;
        this.scene.updateScore();
        
        // Check for level progression
        if (this.scene.enemyManager.getEnemyCount() === 0) {
            this.scene.nextLevel();
        }
    }
    
    hitPlayer(player, projectile) {
        // Check for pixel-perfect collision
        if (this.checkPixelCollision(player, projectile)) {
            this.scene.effectsManager.createExplosionEffect(player.x, player.y);
            
            if (projectile.destroy) {
                projectile.destroy();
            }
            
            const isDead = this.player.takeDamage();
            this.scene.updateLives();
            
            if (isDead) {
                this.scene.gameOver();
            }
        }
    }
    
    checkPixelCollision(player, projectile) {
        // Get the player's world position and bounds
        const playerBounds = player.getBounds();
        
        // Get the projectile's position
        const projX = Math.floor(projectile.x);
        const projY = Math.floor(projectile.y);
        
        // Check if projectile is within player bounds
        if (projX < playerBounds.x || projX >= playerBounds.x + playerBounds.width ||
            projY < playerBounds.y || projY >= playerBounds.y + playerBounds.height) {
            return false;
        }
        
        // Calculate distance from projectile to player center
        const distanceToCenter = Math.sqrt(
            Math.pow(projX - player.x, 2) + Math.pow(projY - player.y, 2)
        );
        
        // Use a smaller collision radius for more precise collision
        // This creates a circular collision area instead of rectangular
        const collisionRadius = Math.min(playerBounds.width, playerBounds.height) * 0.4;
        
        return distanceToCenter <= collisionRadius;
    }
} 