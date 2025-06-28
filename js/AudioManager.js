/**
 * Audio Manager Class
 * Handles all audio functionality with fallback support and volume control
 */

class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = new Map();
        this.music = null;
        this.volume = 0.7;
        this.musicVolume = 0.5;
        this.enabled = true;
        this.audioContext = null;
        
        this.initializeAudio();
    }
    
    initializeAudio() {
        // Check if Web Audio API is supported
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            try {
                this.audioContext = new (AudioContext || webkitAudioContext)();
                console.log('AudioManager: Web Audio API initialized');
            } catch (error) {
                console.warn('AudioManager: Web Audio API not available, using fallback');
                this.enabled = false;
            }
        } else {
            console.warn('AudioManager: Web Audio API not supported');
            this.enabled = false;
        }
    }
    
    preload() {
        if (!this.enabled) return;
        
        console.log('AudioManager: Preloading audio assets...');
        
        // Load sound effects
        Object.entries(GameConfig.assets.audio).forEach(([key, path]) => {
            try {
                const sound = this.scene.sound.add(key, {
                    volume: this.volume,
                    loop: false
                });
                this.sounds.set(key, sound);
                console.log(`AudioManager: Loaded sound: ${key}`);
            } catch (error) {
                console.warn(`AudioManager: Failed to load sound: ${key}`, error);
            }
        });
    }
    
    play(soundKey, config = {}) {
        if (!this.enabled) return;
        
        const sound = this.sounds.get(soundKey);
        if (sound) {
            try {
                // Resume audio context if suspended (required for autoplay policies)
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                
                const playConfig = {
                    volume: config.volume || this.volume,
                    rate: config.rate || 1.0,
                    ...config
                };
                
                sound.play(playConfig);
                console.log(`AudioManager: Playing sound: ${soundKey}`);
            } catch (error) {
                console.warn(`AudioManager: Failed to play sound: ${soundKey}`, error);
            }
        } else {
            console.warn(`AudioManager: Sound not found: ${soundKey}`);
        }
    }
    
    playShoot() {
        this.play('shoot', { volume: 0.6 });
    }
    
    playExplosion() {
        this.play('explosion', { volume: 0.8 });
    }
    
    playEnemyDeath() {
        this.play('enemyDeath', { volume: 0.7 });
    }
    
    playPlayerHit() {
        this.play('playerHit', { volume: 0.9 });
    }
    
    playLevelUp() {
        this.play('levelUp', { volume: 0.8 });
    }
    
    playPowerUp() {
        this.play('powerup', { volume: 0.7 });
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Update all loaded sounds
        this.sounds.forEach(sound => {
            sound.setVolume(this.volume);
        });
        
        console.log(`AudioManager: Volume set to ${this.volume}`);
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.music) {
            this.music.setVolume(this.musicVolume);
        }
        
        console.log(`AudioManager: Music volume set to ${this.musicVolume}`);
    }
    
    enable() {
        this.enabled = true;
        console.log('AudioManager: Audio enabled');
    }
    
    disable() {
        this.enabled = false;
        console.log('AudioManager: Audio disabled');
    }
    
    isEnabled() {
        return this.enabled;
    }
    
    // Create procedural audio for fallback
    createProceduralAudio() {
        if (!this.enabled || !this.audioContext) return;
        
        console.log('AudioManager: Creating procedural audio fallbacks...');
        
        // Create shoot sound
        this.createShootSound();
        
        // Create explosion sound
        this.createExplosionSound();
        
        // Create powerup sound
        this.createPowerUpSound();
    }
    
    createShootSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    createExplosionSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    createPowerUpSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
} 