import * as FileSystem from 'expo-file-system';
import { logger } from '../../../utils/logger';

export type PhysiqueGoal = 'cut' | 'bulk';

export interface PhysiqueAnalysisResult {
  est_body_fat: number;
  muscle_maturity: number;
  symmetry_score: number;
  strengths: string[];
  weaknesses: string[];
  actionable_feedback: string;
}

export interface PhysiqueAnalysisRecord {
  userId?: string;
  goal: PhysiqueGoal;
  result: PhysiqueAnalysisResult;
  imageLocalUri: string;
  createdAt: string;
}

export interface PreparedImage {
  base64: string;
  localUri: string;
  mimeType: string;
}

class ImageObfuscator {
  private readonly directory = `${FileSystem.documentDirectory}physique/`;

  private async ensureDirectory(): Promise<void> {
    const info = await FileSystem.getInfoAsync(this.directory);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(this.directory, { intermediates: true });
    }
  }

  private getExtension(uri: string): string {
    const match = uri.split('.').pop();
    return match ? match.toLowerCase() : 'jpg';
  }

  private getMimeType(extension: string): string {
    switch (extension) {
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      case 'heic':
      case 'heif':
        return 'image/heic';
      default:
        return 'image/jpeg';
    }
  }

  async persistImage(imageUri: string): Promise<string> {
    await this.ensureDirectory();

    if (imageUri.startsWith(this.directory)) {
      return imageUri;
    }

    const extension = this.getExtension(imageUri);
    const filename = `physique_${Date.now()}.${extension}`;
    const destination = `${this.directory}${filename}`;

    await FileSystem.copyAsync({ from: imageUri, to: destination });
    return destination;
  }

  async toBase64(imageUri: string): Promise<string> {
    return FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  async prepareForAnalysis(imageUri: string): Promise<PreparedImage> {
    const localUri = await this.persistImage(imageUri);
    const base64 = await this.toBase64(localUri);
    const mimeType = this.getMimeType(this.getExtension(localUri));

    return { base64, localUri, mimeType };
  }

  async saveAnalysisResult(record: PhysiqueAnalysisRecord): Promise<void> {
    const supabaseUrl =
      process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseAnonKey =
      process.env.EXPO_PUBLIC_SUPABASE_KEY ||
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      logger.warn('Supabase credentials missing; physique result not persisted.');
      return;
    }

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/physique_reports`, {
        method: 'POST',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          user_id: record.userId,
          goal: record.goal,
          result: record.result,
          image_local_uri: record.imageLocalUri,
          created_at: record.createdAt,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.warn('Physique result save failed:', response.status, errorBody);
      }
    } catch (error) {
      logger.warn('Physique result save failed:', error);
    }
  }
}

export const imageObfuscator = new ImageObfuscator();
export default imageObfuscator;
