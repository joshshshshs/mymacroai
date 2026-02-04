/**
 * Supabase Storage Service
 * 
 * Handles image uploads for recipes and avatars.
 * Uses Supabase Storage buckets.
 */

import { getSupabase, supabase } from '@/src/lib/supabase';
import * as FileSystem from 'expo-file-system';
// @ts-ignore - base64-arraybuffer may not have types
import { decode } from 'base64-arraybuffer';

// Storage bucket names
const BUCKET_RECIPE_IMAGES = 'recipe-images';
const BUCKET_AVATARS = 'avatars';

export interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

/**
 * Upload an image to Supabase Storage
 */
async function uploadImage(
    bucketName: string,
    uri: string,
    folder: string = ''
): Promise<UploadResult> {
    try {
        // Read the file as base64
        const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const extension = uri.split('.').pop() || 'jpg';
        const fileName = `${folder ? folder + '/' : ''}${timestamp}_${randomId}.${extension}`;

        // Determine content type
        const contentType = extension === 'png' ? 'image/png' : 'image/jpeg';

        // Upload to Supabase
        const { data, error } = await getSupabase().storage
            .from(bucketName)
            .upload(fileName, decode(base64), {
                contentType,
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('[Storage] Upload error:', error);
            return { success: false, error: error.message };
        }

        // Get public URL
        const { data: urlData } = getSupabase().storage
            .from(bucketName)
            .getPublicUrl(data.path);

        return {
            success: true,
            url: urlData.publicUrl,
        };
    } catch (error) {
        console.error('[Storage] Upload exception:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed',
        };
    }
}

/**
 * Upload a recipe image
 */
export async function uploadRecipeImage(uri: string, userId: string): Promise<UploadResult> {
    return uploadImage(BUCKET_RECIPE_IMAGES, uri, userId);
}

/**
 * Upload an avatar image
 */
export async function uploadAvatar(uri: string, userId: string): Promise<UploadResult> {
    return uploadImage(BUCKET_AVATARS, uri, userId);
}

/**
 * Delete an image from storage
 */
export async function deleteImage(bucketName: string, path: string): Promise<boolean> {
    try {
        const { error } = await getSupabase().storage
            .from(bucketName)
            .remove([path]);

        if (error) {
            console.error('[Storage] Delete error:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('[Storage] Delete exception:', error);
        return false;
    }
}

export const StorageService = {
    uploadRecipeImage,
    uploadAvatar,
    deleteImage,
};

export default StorageService;
