/**
 * Three-Photo Protocol Scanner
 * Captures front, side, and back photos for comprehensive physique analysis
 * Fallback for when direct food scanning doesn't work
 */

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { geminiService } from '../ai/GeminiService';
import type { PhysiqueAnalysisResult, PhysiqueGoal } from '../privacy/ImageObfuscator';
import { logger } from '../../../utils/logger';

export type PhotoAngle = 'front' | 'side' | 'back';

export interface PhotoCapture {
  angle: PhotoAngle;
  uri: string;
  timestamp: string;
  base64?: string;
}

export interface ThreePhotoSet {
  front: PhotoCapture;
  side: PhotoCapture;
  back: PhotoCapture;
  captureDate: string;
}

export interface ComprehensiveAnalysis {
  physique: PhysiqueAnalysisResult;
  measurements?: {
    shoulders?: number; // cm
    chest?: number;
    waist?: number;
    hips?: number;
    estimatedLeanMass?: number; // kg
  };
  progressComparison?: {
    previousSet?: ThreePhotoSet;
    changeNotes: string[];
  };
}

class ThreePhotoProtocolService {
  private currentSet: Partial<ThreePhotoSet> = {};

  /**
   * Request camera permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      return cameraPermission.granted && mediaPermission.granted;
    } catch (error) {
      logger.error('Failed to request permissions:', error);
      return false;
    }
  }

  /**
   * Capture a single photo for specific angle
   */
  async capturePhoto(angle: PhotoAngle): Promise<PhotoCapture | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Camera permission not granted');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4], // Portrait aspect ratio
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      const photo: PhotoCapture = {
        angle,
        uri: result.assets[0].uri,
        timestamp: new Date().toISOString(),
      };

      // Add to current set
      this.currentSet[angle] = photo;

      return photo;
    } catch (error) {
      logger.error(`Failed to capture ${angle} photo:`, error);
      return null;
    }
  }

  /**
   * Pick existing photo from gallery
   */
  async pickPhoto(angle: PhotoAngle): Promise<PhotoCapture | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Media library permission not granted');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (result.canceled) {
        return null;
      }

      const photo: PhotoCapture = {
        angle,
        uri: result.assets[0].uri,
        timestamp: new Date().toISOString(),
      };

      this.currentSet[angle] = photo;

      return photo;
    } catch (error) {
      logger.error(`Failed to pick ${angle} photo:`, error);
      return null;
    }
  }

  /**
   * Check if current set is complete
   */
  isSetComplete(): boolean {
    return !!(this.currentSet.front && this.currentSet.side && this.currentSet.back);
  }

  /**
   * Get current photo set
   */
  getCurrentSet(): Partial<ThreePhotoSet> {
    return this.currentSet;
  }

  /**
   * Get missing angles
   */
  getMissingAngles(): PhotoAngle[] {
    const missing: PhotoAngle[] = [];
    if (!this.currentSet.front) missing.push('front');
    if (!this.currentSet.side) missing.push('side');
    if (!this.currentSet.back) missing.push('back');
    return missing;
  }

  /**
   * Clear current set
   */
  clearCurrentSet() {
    this.currentSet = {};
  }

  /**
   * Convert photo to base64
   */
  private async photoToBase64(uri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      logger.error('Failed to convert photo to base64:', error);
      throw error;
    }
  }

  /**
   * Analyze complete 3-photo set
   */
  async analyzePhotoSet(
    goal: PhysiqueGoal = 'cut',
    userId?: string
  ): Promise<ComprehensiveAnalysis | null> {
    try {
      if (!this.isSetComplete()) {
        throw new Error('Photo set incomplete. Need front, side, and back photos.');
      }

      const { front, side, back } = this.currentSet as ThreePhotoSet;

      // Convert all photos to base64
      const frontBase64 = await this.photoToBase64(front.uri);
      const sideBase64 = await this.photoToBase64(side.uri);
      const backBase64 = await this.photoToBase64(back.uri);

      // Analyze each angle with Gemini
      logger.info('Analyzing front photo...');
      const frontAnalysis = await geminiService.analyzePhysique(front.uri, goal, userId);

      logger.info('Analyzing side photo...');
      const sideAnalysis = await geminiService.analyzePhysique(side.uri, goal, userId);

      logger.info('Analyzing back photo...');
      const backAnalysis = await geminiService.analyzePhysique(back.uri, goal, userId);

      // Combine analyses
      const comprehensive = this.combineAnalyses(frontAnalysis, sideAnalysis, backAnalysis);

      return comprehensive;
    } catch (error) {
      logger.error('Failed to analyze photo set:', error);
      return null;
    }
  }

  /**
   * Combine analyses from multiple angles
   */
  private combineAnalyses(
    front: PhysiqueAnalysisResult,
    side: PhysiqueAnalysisResult,
    back: PhysiqueAnalysisResult
  ): ComprehensiveAnalysis {
    // Average body fat estimates
    const avgBodyFat = (front.est_body_fat + side.est_body_fat + back.est_body_fat) / 3;

    // Average scores
    const avgSymmetry = (front.symmetry_score + side.symmetry_score + back.symmetry_score) / 3;
    const avgMaturity = (front.muscle_maturity + side.muscle_maturity + back.muscle_maturity) / 3;

    // Combine strengths and weaknesses
    const allStrengths = [...front.strengths, ...side.strengths, ...back.strengths];
    const allWeaknesses = [...front.weaknesses, ...side.weaknesses, ...back.weaknesses];

    // Deduplicate
    const uniqueStrengths = Array.from(new Set(allStrengths));
    const uniqueWeaknesses = Array.from(new Set(allWeaknesses));

    // Combine feedback
    const combinedFeedback = `
FRONT VIEW: ${front.actionable_feedback}

SIDE VIEW: ${side.actionable_feedback}

BACK VIEW: ${back.actionable_feedback}

OVERALL: Based on 3-angle analysis, focus on the weaknesses identified across all views.
`.trim();

    return {
      physique: {
        est_body_fat: Math.round(avgBodyFat * 10) / 10,
        symmetry_score: Math.round(avgSymmetry),
        muscle_maturity: Math.round(avgMaturity),
        strengths: uniqueStrengths,
        weaknesses: uniqueWeaknesses,
        actionable_feedback: combinedFeedback,
      },
      measurements: this.estimateMeasurements(front, side, back),
    };
  }

  /**
   * Estimate body measurements from analysis
   * (Rough estimates based on visual analysis)
   */
  private estimateMeasurements(
    front: PhysiqueAnalysisResult,
    side: PhysiqueAnalysisResult,
    back: PhysiqueAnalysisResult
  ): ComprehensiveAnalysis['measurements'] {
    // This is a placeholder - in production, use more sophisticated estimation
    // based on visual landmarks and known body proportions
    return {
      // These would be calculated from image analysis
      // For now, return undefined - implement proper measurement extraction
      shoulders: undefined,
      chest: undefined,
      waist: undefined,
      hips: undefined,
      estimatedLeanMass: undefined,
    };
  }

  /**
   * Use 3-photo protocol for food scanning fallback
   * When barcode/receipt scan fails, guide user through 3-angle food photos
   */
  async analyzeFoodFromPhotos(
    photos: PhotoCapture[],
    userId?: string
  ): Promise<{
    foodItems: string[];
    estimatedCalories: number;
    macros: { protein: number; carbs: number; fat: number };
    confidence: number;
  } | null> {
    try {
      if (photos.length === 0) {
        throw new Error('No photos provided');
      }

      // Combine all photo analyses
      const analyses: string[] = [];

      for (const photo of photos) {
        const prompt = `Analyze this food photo in detail. Return ONLY a JSON object with:
{
  "foods": ["food1", "food2"],
  "calories": estimated_total_calories,
  "protein": grams,
  "carbs": grams,
  "fat": grams,
  "confidence": 0-100
}`;

        // Use Gemini vision to analyze food
        const base64 = await this.photoToBase64(photo.uri);

        // This would call Gemini with the food photo
        // For now, return placeholder
        analyses.push('food_analysis_pending');
      }

      // In production, combine all food analyses
      // For now, return null to implement later
      return null;
    } catch (error) {
      logger.error('Failed to analyze food from photos:', error);
      return null;
    }
  }

  /**
   * Save photo set to local storage
   */
  async savePhotoSet(set: ThreePhotoSet, userId: string): Promise<boolean> {
    try {
      const directory = `${FileSystem.documentDirectory}physique/${userId}/`;

      // Ensure directory exists
      const dirInfo = await FileSystem.getInfoAsync(directory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      }

      // Save each photo
      const timestamp = Date.now();
      const frontPath = `${directory}front_${timestamp}.jpg`;
      const sidePath = `${directory}side_${timestamp}.jpg`;
      const backPath = `${directory}back_${timestamp}.jpg`;

      await FileSystem.copyAsync({ from: set.front.uri, to: frontPath });
      await FileSystem.copyAsync({ from: set.side.uri, to: sidePath });
      await FileSystem.copyAsync({ from: set.back.uri, to: backPath });

      // Save metadata
      const metadataPath = `${directory}metadata_${timestamp}.json`;
      await FileSystem.writeAsStringAsync(
        metadataPath,
        JSON.stringify({
          captureDate: set.captureDate,
          front: frontPath,
          side: sidePath,
          back: backPath,
        })
      );

      logger.info('Photo set saved successfully');
      return true;
    } catch (error) {
      logger.error('Failed to save photo set:', error);
      return false;
    }
  }

  /**
   * Get guidance for photo capture
   */
  getGuidanceForAngle(angle: PhotoAngle): {
    title: string;
    instructions: string[];
    tips: string[];
  } {
    const commonTips = [
      'Use good lighting (natural light preferred)',
      'Stand 6-8 feet from camera',
      'Wear form-fitting clothing',
      'Keep same pose across all angles',
      'Take photos at same time of day',
    ];

    switch (angle) {
      case 'front':
        return {
          title: 'Front View',
          instructions: [
            'Face the camera directly',
            'Arms at sides, relaxed',
            'Feet shoulder-width apart',
            'Look straight ahead',
            'Keep shoulders back, chest up',
          ],
          tips: commonTips,
        };

      case 'side':
        return {
          title: 'Side View',
          instructions: [
            'Turn 90° to your right',
            'Arms at sides, relaxed',
            'Stand naturally, don\'t suck in',
            'Profile should be visible',
            'Keep same posture as front',
          ],
          tips: commonTips,
        };

      case 'back':
        return {
          title: 'Back View',
          instructions: [
            'Turn your back to camera',
            'Arms at sides, relaxed',
            'Feet shoulder-width apart',
            'Keep shoulders back',
            'Show full back and legs',
          ],
          tips: commonTips,
        };
    }
  }
}

// Singleton instance
export const threePhotoProtocol = new ThreePhotoProtocolService();
export default threePhotoProtocol;
