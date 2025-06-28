# Gyruss-Style Tube Shooter

A retro arcade "tube shooter" game inspired by Gyruss, built with Phaser.js. The player controls a ship that rotates around the screen edges in a circular path, shooting inward toward enemies that spawn from the center and move outward in formations.

## 🎮 Live Demo

**[Play the Game Online](https://sl4ppy.github.io/gyruss-tube-shooter/)**

## Features

- **Tube-based gameplay**: Ships and projectiles move along a virtual tube axis
- **Procedurally generated graphics**: Dynamic enemy ships and effects
- **Multiple enemy formations**: V-formation, line formation, and circle formation
- **Pixel-perfect collision detection**: Precise hit detection for the player ship
- **Progressive difficulty**: Enemy speed increases with each level
- **Visual effects**: Explosions, star field, and enemy animations
- **Cross-platform**: Works on desktop and mobile browsers
- **Menu system**: Start screen with instructions and controls

## 🚀 Quick Start

### Option 1: Play Online
Simply visit the live demo link above to play immediately!

### Option 2: Local Development
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Start local server** (required for asset loading):
   ```bash
   python -m http.server 8000
   ```

3. **Open in browser**:
   Navigate to `http://localhost:8000`

## 🎯 Controls

- **Arrow Keys**: Rotate player ship around the circle
- **Spacebar**: Fire projectiles toward center
- **R Key**: Restart game
- **ESC Key**: Return to menu
- **Mouse Click**: Restart game (when game over)

## 🏗️ Architecture

The game uses a modular architecture for maintainability:

### File Structure
```
├── index.html              # Main HTML file
├── style.css               # Game styling
├── game.js                 # Game initialization
├── js/
│   ├── config.js           # Game configuration and constants
│   ├── Player.js           # Player ship logic and controls
│   ├── EnemyManager.js     # Enemy spawning and movement
│   ├── BulletManager.js    # Bullet creation and cleanup
│   ├── EffectsManager.js   # Visual effects and star field
│   ├── CollisionManager.js # Collision detection and response
│   ├── GameScene.js        # Main game scene orchestration
│   └── MenuScene.js        # Menu and start screen
├── assets/
│   ├── player_ship.png     # Player ship sprite
│   └── red_enemy_ship.png  # Red enemy ship sprite
└── README.md               # This file
```

### Module Responsibilities
- **Config**: Centralized game settings and constants
- **Player**: Player ship movement, firing, and damage handling
- **EnemyManager**: Enemy spawning, formation patterns, and movement
- **BulletManager**: Bullet creation, tube-axis movement, and cleanup
- **EffectsManager**: Visual effects, explosions, and star field
- **CollisionManager**: Collision detection and game state updates
- **GameScene**: Main scene that orchestrates all systems
- **MenuScene**: Menu system and game start

## 🌐 GitHub Pages Deployment

This game is designed to work perfectly with GitHub Pages. To deploy:

### 1. Create GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit: Gyruss-style tube shooter game"
git branch -M main
git remote add origin https://github.com/your-username/your-repo-name.git
git push -u origin main
```

### 2. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **Deploy from a branch**
5. Choose **main** branch and **/(root)** folder
6. Click **Save**

### 3. Access Your Game
Your game will be available at:
`https://your-username.github.io/your-repo-name/`

## 🎮 Game Mechanics

### Tube Movement
- Player moves in a circular path around the screen edges
- Enemies spawn from center and move outward in formations
- Projectiles travel along the tube axis (center ↔ edges)
- All movement respects the virtual tube geometry

### Enemy Patterns
- **V-Formation**: 5 enemies in a V-shape
- **Line Formation**: 6 enemies in a straight line
- **Circle Formation**: 8 enemies in a full circle
- Enemies circle around the player's path before returning to center

### Collision System
- Player bullets destroy enemies on contact
- Enemy bullets use pixel-perfect collision with player ship
- Circular collision radius for precise hit detection
- Visual feedback for damage and explosions

## 🛠️ Technical Details

- **Framework**: Phaser 3.60.0
- **Physics**: Arcade physics system
- **Graphics**: Procedurally generated + PNG assets
- **Audio**: Web Audio API (with fallback)
- **Browser Support**: Modern browsers with ES6 support
- **Hosting**: GitHub Pages compatible

## 🔧 Development Notes

- The modular structure makes it easy to add new features
- Each manager class has a single responsibility
- Configuration is centralized for easy tweaking
- All game constants are in `config.js` for easy balancing
- Assets are created procedurally to avoid loading issues

## 🚀 Future Enhancements

- Power-ups and special weapons
- Boss battles
- Multiple player ships
- Sound effects and music
- High score system
- Mobile touch controls
- Additional enemy types and formations
- Online multiplayer

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Enjoy the game!** 🎮✨ 