/**
 * Main Game Initialization
 * Creates the Phaser game instance and starts the game
 */

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: GameConfig.width,
    height: GameConfig.height,
    backgroundColor: GameConfig.backgroundColor,
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [LoadingScene, MenuScene, GameScene]
};

// Create and start the game
const game = new Phaser.Game(config); 