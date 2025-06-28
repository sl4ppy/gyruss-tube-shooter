/**
 * Audio Manager Class
 * Handles all audio functionality with procedural sound generation
 */

class AudioManager {
    constructor(scene) {
        this.scene = scene;
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
    
    play(soundKey, config = {}) {
        if (!this.enabled || !this.audioContext) return;
        
        try {
            // Resume audio context if suspended (required for autoplay policies)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const volume = (config.volume || this.volume) * this.volume;
            
            switch (soundKey) {
                case 'shoot':
                    this.createShootSound(volume);
                    break;
                case 'explosion':
                    this.createExplosionSound(volume);
                    break;
                case 'enemyDeath':
                    this.createEnemyDeathSound(volume);
                    break;
                case 'playerHit':
                    this.createPlayerHitSound(volume);
                    break;
                case 'levelUp':
                    this.createLevelUpSound(volume);
                    break;
                case 'powerup':
                    this.createPowerUpSound(volume);
                    break;
                default:
                    console.warn(`AudioManager: Unknown sound: ${soundKey}`);
            }
            
            console.log(`AudioManager: Playing procedural sound: ${soundKey}`);
        } catch (error) {
            console.warn(`AudioManager: Failed to play sound: ${soundKey}`, error);
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
        console.log(`AudioManager: Volume set to ${this.volume}`);
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
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
    
    // Procedural sound generation methods
    createShootSound(volume = 0.6) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    createExplosionSound(volume = 0.8) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
    
    createEnemyDeathSound(volume = 0.7) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    createPlayerHitSound(volume = 0.9) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.4);
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.4);
    }
    
    createLevelUpSound(volume = 0.8) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(800, this.audioContext.currentTime + 0.3);
        oscillator.frequency.linearRampToValueAtTime(1200, this.audioContext.currentTime + 0.6);
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.6);
    }
    
    createPowerUpSound(volume = 0.7) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
}

window.AudioManager = AudioManager; 