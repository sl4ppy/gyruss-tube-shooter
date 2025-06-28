/**
 * Bullet Manager Class
 * Handles bullet creation, movement, and cleanup for both player and enemy bullets
 */

class BulletManager {
    constructor(scene) {
        this.scene = scene;
        this.playerBullets = scene.physics.add.group();
        this.enemyBullets = scene.physics.add.group();
        
        this.createBullets();
    }
    
    createBullets() {
        console.log('Creating bullet textures...');
        try {
            // Create player bullet texture
            const playerBulletGraphics = this.scene.add.graphics();
            playerBulletGraphics.fillStyle(0x00ff00);
            playerBulletGraphics.fillCircle(0, 0, 3);
            playerBulletGraphics.generateTexture('playerBullet', 8, 8);
            playerBulletGraphics.destroy();
            console.log('Player bullet texture created');
            
            // Create enemy bullet texture
            const enemyBulletGraphics = this.scene.add.graphics();
            enemyBulletGraphics.fillStyle(0xff0000);
            enemyBulletGraphics.fillCircle(0, 0, 3);
            enemyBulletGraphics.generateTexture('enemyBullet', 8, 8);
            enemyBulletGraphics.destroy();
            console.log('Enemy bullet texture created');
        } catch (error) {
            console.error('Error creating bullet textures:', error);
        }
    }
    
    update() {
        this.cleanupPlayerBullets();
        this.cleanupEnemyBullets();
    }
    
    cleanupPlayerBullets() {
        this.playerBullets.children.entries.forEach((bullet) => {
            // Check if bullet has traveled too far from center (tube boundary)
            const distanceFromCenter = Math.sqrt(
                Math.pow(bullet.x - GameConfig.centerX, 2) + 
                Math.pow(bullet.y - GameConfig.centerY, 2)
            );
            
            if (distanceFromCenter < GameConfig.playerBulletCleanupDistance) { // Bullet reached center
                bullet.destroy();
            }
        });
    }
    
    cleanupEnemyBullets() {
        this.enemyBullets.children.entries.forEach((bullet) => {
            // Check if bullet has traveled too far along tube axis (from center outward)
            const distanceFromCenter = Math.sqrt(
                Math.pow(bullet.x - GameConfig.centerX, 2) + 
                Math.pow(bullet.y - GameConfig.centerY, 2)
            );
            
            // Destroy bullet if it goes beyond the player's circle radius
            if (distanceFromCenter > GameConfig.playerRadius + GameConfig.enemyBulletCleanupDistance) {
                bullet.destroy();
            }
        });
    }
    
    getPlayerBullets() {
        return this.playerBullets;
    }
    
    getEnemyBullets() {
        return this.enemyBullets;
    }
    
    reset() {
        this.playerBullets.clear(true, true);
        this.enemyBullets.clear(true, true);
    }
}

window.BulletManager = BulletManager; 