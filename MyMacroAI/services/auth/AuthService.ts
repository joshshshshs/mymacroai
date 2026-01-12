import { supabase } from '../../src/lib/supabase';
import type { User, Session, AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import { logger } from '../../utils/logger';
import {
  AuthError,
  ErrorCode,
  ValidationError,
  withRetry,
  type Result,
  success,
  failure,
} from '../../utils/errors';

export interface AuthResult {
  success: boolean;
  user: User | null;
  session: Session | null;
  error: string | null;
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Authentication Service
 * Handles all authentication operations with Supabase
 */
class AuthService {
  /**
   * Sign up a new user
   */
  async signUp(data: SignUpData): Promise<AuthResult> {
    try {
      const { email, password, name } = data;

      // Validate input
      if (!this.isValidEmail(email)) {
        return {
          success: false,
          user: null,
          session: null,
          error: 'Please enter a valid email address',
        };
      }

      if (!this.isValidPassword(password)) {
        return {
          success: false,
          user: null,
          session: null,
          error: 'Password must be at least 8 characters with a number and letter',
        };
      }

      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0],
          },
        },
      });

      if (error) {
        logger.error('Sign up error:', error);
        return {
          success: false,
          user: null,
          session: null,
          error: this.getReadableError(error),
        };
      }

      logger.log('User signed up successfully:', authData.user?.id);
      return {
        success: true,
        user: authData.user,
        session: authData.session,
        error: null,
      };
    } catch (error) {
      logger.error('Sign up exception:', error);
      return {
        success: false,
        user: null,
        session: null,
        error: 'An unexpected error occurred. Please try again.',
      };
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn(data: SignInData): Promise<AuthResult> {
    try {
      const { email, password } = data;

      if (!email || !password) {
        return {
          success: false,
          user: null,
          session: null,
          error: 'Please enter your email and password',
        };
      }

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Sign in error:', error);
        return {
          success: false,
          user: null,
          session: null,
          error: this.getReadableError(error),
        };
      }

      logger.log('User signed in successfully:', authData.user?.id);
      return {
        success: true,
        user: authData.user,
        session: authData.session,
        error: null,
      };
    } catch (error) {
      logger.error('Sign in exception:', error);
      return {
        success: false,
        user: null,
        session: null,
        error: 'An unexpected error occurred. Please try again.',
      };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error('Sign out error:', error);
        return {
          success: false,
          error: this.getReadableError(error),
        };
      }

      logger.log('User signed out successfully');
      return { success: true, error: null };
    } catch (error) {
      logger.error('Sign out exception:', error);
      return {
        success: false,
        error: 'Failed to sign out. Please try again.',
      };
    }
  }

  /**
   * Get the current session
   */
  async getSession(): Promise<{ session: Session | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        logger.error('Get session error:', error);
        return { session: null, error: this.getReadableError(error) };
      }

      return { session: data.session, error: null };
    } catch (error) {
      logger.error('Get session exception:', error);
      return { session: null, error: 'Failed to get session' };
    }
  }

  /**
   * Get the current user
   */
  async getUser(): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        logger.error('Get user error:', error);
        return { user: null, error: this.getReadableError(error) };
      }

      return { user: data.user, error: null };
    } catch (error) {
      logger.error('Get user exception:', error);
      return { user: null, error: 'Failed to get user' };
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    try {
      if (!this.isValidEmail(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'mymacroai://reset-password',
      });

      if (error) {
        logger.error('Reset password error:', error);
        return { success: false, error: this.getReadableError(error) };
      }

      logger.log('Password reset email sent to:', email);
      return { success: true, error: null };
    } catch (error) {
      logger.error('Reset password exception:', error);
      return { success: false, error: 'Failed to send reset email' };
    }
  }

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; error: string | null }> {
    try {
      if (!this.isValidPassword(newPassword)) {
        return {
          success: false,
          error: 'Password must be at least 8 characters with a number and letter',
        };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        logger.error('Update password error:', error);
        return { success: false, error: this.getReadableError(error) };
      }

      logger.log('Password updated successfully');
      return { success: true, error: null };
    } catch (error) {
      logger.error('Update password exception:', error);
      return { success: false, error: 'Failed to update password' };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: {
    name?: string;
    avatar_url?: string;
  }): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        logger.error('Update profile error:', error);
        return { success: false, error: this.getReadableError(error) };
      }

      logger.log('Profile updated successfully');
      return { success: true, error: null };
    } catch (error) {
      logger.error('Update profile exception:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ): { unsubscribe: () => void } {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      logger.log('Auth state changed:', event);
      callback(event, session);
    });

    return { unsubscribe: data.subscription.unsubscribe };
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  private isValidPassword(password: string): boolean {
    // At least 8 characters, one letter, one number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Convert Supabase errors to typed AuthError
   */
  private mapSupabaseError(error: SupabaseAuthError): AuthError {
    const message = error.message?.toLowerCase() || '';

    if (message.includes('invalid login credentials') || message.includes('invalid password')) {
      return new AuthError({
        code: ErrorCode.AUTH_INVALID_CREDENTIALS,
        cause: error,
      });
    }

    if (message.includes('email not confirmed')) {
      return new AuthError({
        code: ErrorCode.AUTH_EMAIL_NOT_CONFIRMED,
        cause: error,
      });
    }

    if (message.includes('already registered') || message.includes('already exists')) {
      return new AuthError({
        code: ErrorCode.AUTH_EMAIL_IN_USE,
        cause: error,
      });
    }

    if (message.includes('rate limit') || message.includes('too many')) {
      return new AuthError({
        code: ErrorCode.AUTH_RATE_LIMITED,
        cause: error,
        recoverable: true,
      });
    }

    if (message.includes('user not found')) {
      return new AuthError({
        code: ErrorCode.AUTH_USER_NOT_FOUND,
        cause: error,
      });
    }

    if (message.includes('weak password') || message.includes('password should be')) {
      return new AuthError({
        code: ErrorCode.AUTH_WEAK_PASSWORD,
        cause: error,
      });
    }

    // Default auth error
    return new AuthError({
      code: ErrorCode.AUTH_INVALID_CREDENTIALS,
      message: error.message,
      cause: error,
    });
  }

  /**
   * Convert Supabase errors to user-friendly messages
   */
  private getReadableError(error: SupabaseAuthError): string {
    return this.mapSupabaseError(error).userMessage;
  }
}

// Singleton instance
export const authService = new AuthService();
export default authService;
