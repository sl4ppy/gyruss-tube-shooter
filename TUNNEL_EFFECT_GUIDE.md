# Gyruss-Style Tube Effect Implementation Guide

This guide explains how to create the classic arcade "tube" effect of Gyruss using 2D coordinates and polar transformations, without requiring a 3D engine.

## 1. Coordinate System

### Polar to Screen Conversion

The core of the tube effect is converting between polar coordinates (radius, angle) and screen coordinates (X, Y).

```javascript
// Screen center coordinates
const CENTER_X = 400;
const CENTER_Y = 300;

// Convert polar coordinates to screen coordinates
function polarToScreen(radius, angle) {
    return {
        x: CENTER_X + radius * Math.cos(angle),
        y: CENTER_Y + radius * Math.sin(angle)
    };
}

// Convert screen coordinates to polar coordinates
function screenToPolar(x, y) {
    const dx = x - CENTER_X;
    const dy = y - CENTER_Y;
    return {
        radius: Math.sqrt(dx * dx + dy * dy),
        angle: Math.atan2(dy, dx)
    };
}
```

### Depth Factor Calculation

To simulate depth, we calculate how "close" an object is to the viewer:

```javascript
function calculateDepthFactor(radius) {
    // Normalize radius to 0-1 range (0 = center, 1 = edge)
    const normalizedRadius = Math.min(radius / MAX_RADIUS, 1);
    
    // Invert so that center = 1 (close), edge = 0 (far)
    return 1 - normalizedRadius;
}

function calculateSpriteScale(radius) {
    const depthFactor = calculateDepthFactor(radius);
    const minScale = 0.3;
    const maxScale = 2.0;
    
    return minScale + (maxScale - minScale) * depthFactor;
}
```

## 2. Spiral Entry Paths

### Spiral Path Generation

```javascript
class SpiralPathGenerator {
    constructor() {
        this.spiralConfig = {
            startRadius: 0,
            endRadius: 200,
            startAngle: 0,
            rotations: 2, // Number of full rotations
            duration: 180 // Frames to complete spiral
        };
    }
    
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
    
    // Generate formation paths (multiple enemies with different start angles)
    generateFormationPaths(formationType, enemyCount, targetRadius, duration) {
        const paths = [];
        
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
        }
        
        return paths;
    }
}
```

## 3. Orbit Phase

### Circular Orbit Movement

```javascript
class OrbitPhase {
    constructor(radius, speed) {
        this.radius = radius;
        this.angularSpeed = speed; // radians per frame
    }
    
    update(enemyState, deltaTime) {
        // Update angle for circular movement
        enemyState.angle += this.angularSpeed * deltaTime;
        
        // Keep angle in 0-2π range
        enemyState.angle = enemyState.angle % (Math.PI * 2);
        if (enemyState.angle < 0) enemyState.angle += Math.PI * 2;
        
        // Convert to screen coordinates
        const screenPos = polarToScreen(this.radius, enemyState.angle);
        enemyState.x = screenPos.x;
        enemyState.y = screenPos.y;
        
        // Update sprite scale for depth effect
        const scale = calculateSpriteScale(this.radius);
        enemyState.sprite.setScale(scale);
    }
}
```

## 4. Attack Phase

### Inward-Curving Attack Paths

```javascript
class AttackPhase {
    constructor() {
        this.attackConfig = {
            approachSpeed: 80, // pixels per frame
            curveIntensity: 0.5, // How much the path curves
            targetRadius: 50 // How close to center to get
        };
    }
    
    update(enemyState, deltaTime) {
        const currentRadius = Math.sqrt(
            Math.pow(enemyState.x - CENTER_X, 2) + 
            Math.pow(enemyState.y - CENTER_Y, 2)
        );
        
        if (currentRadius <= this.attackConfig.targetRadius) {
            // Attack completed, transition to return phase
            enemyState.phase = 'RETURN';
            return;
        }
        
        // Calculate direction toward center
        const dx = CENTER_X - enemyState.x;
        const dy = CENTER_Y - enemyState.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Add curve by calculating perpendicular direction
        const perpX = -dy / distance;
        const perpY = dx / distance;
        
        // Combine straight movement with curve
        const moveX = (dx / distance) * this.attackConfig.approachSpeed;
        const moveY = (dy / distance) * this.attackConfig.approachSpeed;
        
        const curveX = perpX * this.attackConfig.curveIntensity * 20;
        const curveY = perpY * this.attackConfig.curveIntensity * 20;
        
        // Update position
        enemyState.x += (moveX + curveX) * deltaTime;
        enemyState.y += (moveY + curveY) * deltaTime;
        
        // Update sprite scale
        const newRadius = Math.sqrt(
            Math.pow(enemyState.x - CENTER_X, 2) + 
            Math.pow(enemyState.y - CENTER_Y, 2)
        );
        const scale = calculateSpriteScale(newRadius);
        enemyState.sprite.setScale(scale);
    }
}
```

## 5. Sprite Scaling for Depth

### Depth-Based Visual Effects

```javascript
class DepthVisualSystem {
    constructor() {
        this.depthConfig = {
            minScale: 0.2,
            maxScale: 2.5,
            minAlpha: 0.3,
            maxAlpha: 1.0,
            minBlur: 0,
            maxBlur: 3
        };
    }
    
    updateEnemyVisuals(enemyState) {
        const radius = Math.sqrt(
            Math.pow(enemyState.x - CENTER_X, 2) + 
            Math.pow(enemyState.y - CENTER_Y, 2)
        );
        
        const depthFactor = calculateDepthFactor(radius);
        
        // Scale sprite
        const scale = this.depthConfig.minScale + 
                     (this.depthConfig.maxScale - this.depthConfig.minScale) * depthFactor;
        enemyState.sprite.setScale(scale);
        
        // Adjust alpha
        const alpha = this.depthConfig.minAlpha + 
                     (this.depthConfig.maxAlpha - this.depthConfig.minAlpha) * depthFactor;
        enemyState.sprite.setAlpha(alpha);
        
        // Optional: Add blur effect for distant objects
        if (enemyState.sprite.setBlur) {
            const blur = this.depthConfig.minBlur + 
                        (this.depthConfig.maxBlur - this.depthConfig.minBlur) * (1 - depthFactor);
            enemyState.sprite.setBlur(blur);
        }
    }
}
```

## 6. Starfield Background

### Rotating Starfield System

```javascript
class StarfieldSystem {
    constructor() {
        this.stars = [];
        this.starConfig = {
            totalStars: 200,
            layers: 3,
            rotationSpeed: 0.001
        };
        this.currentRotation = 0;
        this.initializeStars();
    }
    
    initializeStars() {
        for (let i = 0; i < this.starConfig.totalStars; i++) {
            const star = {
                radius: Math.random() * 300,
                angle: Math.random() * Math.PI * 2,
                layer: Math.floor(Math.random() * this.starConfig.layers),
                sprite: null // Will be created by the game engine
            };
            this.stars.push(star);
        }
    }
    
    update(playerAngle, deltaTime) {
        // Update rotation based on player movement
        this.currentRotation += this.starConfig.rotationSpeed * deltaTime;
        
        this.stars.forEach(star => {
            // Calculate new angle with rotation
            const newAngle = star.angle + this.currentRotation + playerAngle * 0.1;
            
            // Convert to screen coordinates
            const screenPos = polarToScreen(star.radius, newAngle);
            
            // Update star position
            star.sprite.x = screenPos.x;
            star.sprite.y = screenPos.y;
            
            // Calculate depth effect
            const depthFactor = calculateDepthFactor(star.radius);
            const scale = 0.5 + depthFactor * 1.5;
            const alpha = 0.3 + depthFactor * 0.7;
            
            star.sprite.setScale(scale);
            star.sprite.setAlpha(alpha);
        });
    }
}
```

## 7. Full Frame Update Loop

### Enemy State Management

```javascript
class EnemyState {
    constructor(enemy, formationType, index) {
        this.enemy = enemy;
        this.formationType = formationType;
        this.index = index;
        
        // Position data
        this.radius = 0;
        this.angle = 0;
        this.x = CENTER_X;
        this.y = CENTER_Y;
        
        // Phase management
        this.phase = 'SPIRAL';
        this.phaseTimer = 0;
        this.pathIndex = 0;
        
        // Movement data
        this.spiralPath = null;
        this.orbitRadius = 200;
        this.orbitSpeed = 0.02;
        this.attackTarget = null;
        
        // Visual data
        this.sprite = enemy;
        this.scale = 1.0;
        this.alpha = 1.0;
    }
}

class EnemyUpdateSystem {
    constructor() {
        this.spiralGenerator = new SpiralPathGenerator();
        this.orbitPhase = new OrbitPhase(200, 0.02);
        this.attackPhase = new AttackPhase();
        this.depthVisuals = new DepthVisualSystem();
    }
    
    updateEnemy(enemyState, deltaTime) {
        switch (enemyState.phase) {
            case 'SPIRAL':
                this.updateSpiralPhase(enemyState, deltaTime);
                break;
                
            case 'ORBIT':
                this.updateOrbitPhase(enemyState, deltaTime);
                break;
                
            case 'ATTACK':
                this.updateAttackPhase(enemyState, deltaTime);
                break;
                
            case 'RETURN':
                this.updateReturnPhase(enemyState, deltaTime);
                break;
        }
        
        // Update visual effects
        this.depthVisuals.updateEnemyVisuals(enemyState);
    }
    
    updateSpiralPhase(enemyState, deltaTime) {
        if (!enemyState.spiralPath) {
            // Generate spiral path if not exists
            const startAngle = (enemyState.index / 8) * Math.PI * 2;
            enemyState.spiralPath = this.spiralGenerator.generateSpiralPath(startAngle);
        }
        
        if (enemyState.pathIndex < enemyState.spiralPath.length) {
            const pathPoint = enemyState.spiralPath[enemyState.pathIndex];
            
            // Update position
            const screenPos = polarToScreen(pathPoint.radius, pathPoint.angle);
            enemyState.x = screenPos.x;
            enemyState.y = screenPos.y;
            enemyState.radius = pathPoint.radius;
            enemyState.angle = pathPoint.angle;
            
            enemyState.pathIndex++;
        } else {
            // Spiral complete, transition to orbit
            enemyState.phase = 'ORBIT';
            enemyState.orbitRadius = enemyState.radius;
        }
    }
    
    updateOrbitPhase(enemyState, deltaTime) {
        this.orbitPhase.radius = enemyState.orbitRadius;
        this.orbitPhase.update(enemyState, deltaTime);
        
        // Check for attack trigger
        enemyState.phaseTimer += deltaTime;
        if (enemyState.phaseTimer > 3000) { // 3 seconds in orbit
            enemyState.phase = 'ATTACK';
            enemyState.phaseTimer = 0;
        }
    }
    
    updateAttackPhase(enemyState, deltaTime) {
        this.attackPhase.update(enemyState, deltaTime);
    }
    
    updateReturnPhase(enemyState, deltaTime) {
        // Move back to edge and destroy
        const dx = CENTER_X - enemyState.x;
        const dy = CENTER_Y - enemyState.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 400) {
            // Destroy enemy
            enemyState.enemy.destroy();
        } else {
            // Move outward
            const speed = 100;
            enemyState.x -= (dx / distance) * speed * deltaTime;
            enemyState.y -= (dy / distance) * speed * deltaTime;
        }
    }
}
```

## 8. Wave Scripting System

### Precomputed Wave Patterns

```javascript
class WaveScriptingSystem {
    constructor() {
        this.waveScripts = {
            wave1: {
                formation: 'circle',
                enemyCount: 6,
                spawnDelay: 500,
                orbitDuration: 3000,
                attackChance: 0.3
            },
            wave2: {
                formation: 'v',
                enemyCount: 5,
                spawnDelay: 400,
                orbitDuration: 2500,
                attackChance: 0.5
            },
            wave3: {
                formation: 'line',
                enemyCount: 8,
                spawnDelay: 300,
                orbitDuration: 2000,
                attackChance: 0.7
            }
        };
    }
    
    executeWave(waveName, enemyManager) {
        const script = this.waveScripts[waveName];
        if (!script) return;
        
        // Spawn enemies with delay
        for (let i = 0; i < script.enemyCount; i++) {
            setTimeout(() => {
                const enemy = enemyManager.spawnEnemy();
                const enemyState = new EnemyState(enemy, script.formation, i);
                enemyManager.addEnemyState(enemyState);
            }, i * script.spawnDelay);
        }
    }
}
```

## 9. Complete Implementation Example

```javascript
class GyrussTubeEffect {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];
        this.starfield = new StarfieldSystem();
        this.updateSystem = new EnemyUpdateSystem();
        this.waveSystem = new WaveScriptingSystem();
        
        this.playerAngle = 0;
        this.gameTime = 0;
    }
    
    update(deltaTime) {
        this.gameTime += deltaTime;
        
        // Update starfield
        this.starfield.update(this.playerAngle, deltaTime);
        
        // Update all enemies
        this.enemies.forEach(enemyState => {
            this.updateSystem.updateEnemy(enemyState, deltaTime);
        });
        
        // Remove destroyed enemies
        this.enemies = this.enemies.filter(enemyState => 
            enemyState.enemy.active
        );
    }
    
    spawnEnemyWave(waveName) {
        this.waveSystem.executeWave(waveName, this);
    }
    
    setPlayerAngle(angle) {
        this.playerAngle = angle;
    }
}
```

## Key Implementation Notes:

1. **Performance**: Precompute spiral paths and use lookup tables for complex calculations
2. **Smooth Movement**: Use deltaTime for frame-rate independent movement
3. **Depth Consistency**: Always calculate depth factor from radius, not screen position
4. **Memory Management**: Clean up destroyed enemies and unused path data
5. **Visual Polish**: Add particle effects, screen shake, and sound effects for attacks

This implementation provides the complete foundation for a Gyruss-style tube shooter with authentic depth perception and smooth enemy movement patterns. 