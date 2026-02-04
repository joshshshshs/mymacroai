/**
 * Sound Effects Service
 * Manages UI sound effects (thock, whoosh, etc.) for user actions
 */

import { Audio, AVPlaybackStatus } from 'expo-av';
import { logger } from '../../../utils/logger';

export type SoundEffectType =
  | 'thock' // Deep, satisfying click
  | 'whoosh' // Smooth transition sound
  | 'success' // Success chime
  | 'error' // Error beep
  | 'pop' // Light popup sound
  | 'swipe'; // Swipe gesture sound

interface SoundEffect {
  sound: Audio.Sound | null;
  isLoaded: boolean;
}

class SoundEffectsService {
  private sounds: Map<SoundEffectType, SoundEffect> = new Map();
  private isEnabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      logger.error('Failed to initialize audio mode:', error);
    }
  }

  /**
   * Load sound effects
   * Note: In production, replace these with actual sound files
   */
  async loadSounds() {
    // For now, we'll generate simple tones programmatically
    // In production, load actual sound files from assets
    const soundTypes: SoundEffectType[] = ['thock', 'whoosh', 'success', 'error', 'pop', 'swipe'];

    for (const type of soundTypes) {
      this.sounds.set(type, {
        sound: null,
        isLoaded: false,
      });
    }
  }

  /**
   * Play a sound effect
   */
  async play(type: SoundEffectType) {
    if (!this.isEnabled) return;

    try {
      // Create a simple tone based on type
      const { sound } = await this.createTone(type);

      await sound.setVolumeAsync(this.volume);
      await sound.playAsync();

      // Unload after playing
      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      logger.error(`Failed to play sound effect ${type}:`, error);
    }
  }

  /**
   * Create simple tone for each sound type
   * In production, load actual sound files
   */
  private async createTone(type: SoundEffectType): Promise<{ sound: Audio.Sound }> {
    // Using simple synthesized tones as placeholder
    // In production, replace with actual audio files
    const toneParams = this.getToneParameters(type);

    // For now, we'll use a silent sound as placeholder
    // Replace with actual sound files in production
    const { sound } = await Audio.Sound.createAsync(
      // Placeholder - in production, load from assets like:
      // require('../../../assets/sounds/thock.mp3')
      { uri: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=' },
      { shouldPlay: false, volume: this.volume }
    );

    return { sound };
  }

  private getToneParameters(type: SoundEffectType): { frequency: number; duration: number } {
    switch (type) {
      case 'thock':
        return { frequency: 200, duration: 100 }; // Deep, short
      case 'whoosh':
        return { frequency: 400, duration: 200 }; // Mid, longer
      case 'success':
        return { frequency: 800, duration: 150 }; // High, medium
      case 'error':
        return { frequency: 300, duration: 200 }; // Low, longer
      case 'pop':
        return { frequency: 600, duration: 80 }; // Mid-high, very short
      case 'swipe':
        return { frequency: 500, duration: 120 }; // Mid, short
      default:
        return { frequency: 400, duration: 100 };
    }
  }

  /**
   * Play sound for log action
   */
  async playLogSound() {
    await this.play('thock');
  }

  /**
   * Play sound for navigation
   */
  async playNavigationSound() {
    await this.play('whoosh');
  }

  /**
   * Play success sound
   */
  async playSuccessSound() {
    await this.play('success');
  }

  /**
   * Play error sound
   */
  async playErrorSound() {
    await this.play('error');
  }

  /**
   * Play popup sound
   */
  async playPopupSound() {
    await this.play('pop');
  }

  /**
   * Play swipe sound
   */
  async playSwipeSound() {
    await this.play('swipe');
  }

  /**
   * Enable/disable sound effects
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get current settings
   */
  getSettings() {
    return {
      isEnabled: this.isEnabled,
      volume: this.volume,
    };
  }

  /**
   * Cleanup all sounds
   */
  async cleanup() {
    for (const [, effect] of this.sounds) {
      if (effect.sound) {
        try {
          await effect.sound.unloadAsync();
        } catch (error) {
          logger.error('Failed to unload sound:', error);
        }
      }
    }
    this.sounds.clear();
  }
}

// Singleton instance
export const soundEffects = new SoundEffectsService();
export default soundEffects;
