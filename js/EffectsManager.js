/**
 * Effects Manager Class
 * Handles visual effects like explosions, star field, and other visual enhancements
 */

class EffectsManager {
    constructor(scene) {
        this.scene = scene;
        this.stars = scene.physics.add.group();
        
        this.createStarField();
        this.createExplosionTexture();
    }
    
    createStarField() {
        console.log('Creating star field...');
        try {
            for (let i = 0; i < GameConfig.starCount; i++) {
                let x = Phaser.Math.Between(0, GameConfig.width);
                let y = Phaser.Math.Between(0, GameConfig.height);
                let star = this.stars.create(x, y, 'star');
                star.setVelocityY(Phaser.Math.Between(20, 100));
            }
            console.log(`Created ${GameConfig.starCount} stars`);
        } catch (error) {
            console.error('Error creating star field:', error);
        }
    }
    
    createExplosionTexture() {
        // Create explosion texture
        const explosionGraphics = this.scene.add.graphics();
        explosionGraphics.fillStyle(0xffff00);
        explosionGraphics.fillCircle(0, 0, 4);
        explosionGraphics.generateTexture('explosion', 12, 12);
        explosionGraphics.destroy();
    }
    
    update() {
        // Move stars
        this.stars.children.entries.forEach((star) => {
            if (star.y > GameConfig.height) {
                star.y = 0;
                star.x = Phaser.Math.Between(0, GameConfig.width);
            }
        });
    }
    
    createExplosionEffect(x, y) {
        // Create particle explosion
        for (let i = 0; i < GameConfig.explosionParticleCount; i++) {
            const particle = this.scene.add.sprite(x, y, 'explosion');
            const angle = (i / GameConfig.explosionParticleCount) * Math.PI * 2;
            const speed = Phaser.Math.Between(50, 150);
            
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                duration: 500,
                onComplete: () => particle.destroy()
            });
        }
    }
    
    addEnemyVisualEffects(enemies) {
        // Add subtle pulsing effect to all enemies
        enemies.children.entries.forEach((enemy) => {
            this.scene.tweens.add({
                targets: enemy,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });
    }
} 