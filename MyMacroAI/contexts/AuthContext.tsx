import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { authService, type SignUpData, type SignInData } from '../services/auth/AuthService';
import { useUserStore } from '@/src/store/UserStore';
import { logger } from '../utils/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  signUp: (data: SignUpData) => Promise<boolean>;
  signIn: (data: SignInData) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user store actions
  const { setUser: setStoreUser, setAuthenticated, clearUserData } = useUserStore();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        const { session: currentSession } = await authService.getSession();

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setAuthenticated(true);

          // Sync user to store
          setStoreUser({
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            name: currentSession.user.user_metadata?.name || '',
            createdAt: currentSession.user.created_at,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        logger.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth changes
    const { unsubscribe } = authService.onAuthStateChange((event, newSession) => {
      logger.log('Auth event:', event);

      if (event === 'SIGNED_IN' && newSession) {
        setSession(newSession);
        setUser(newSession.user);
        setAuthenticated(true);

        setStoreUser({
          id: newSession.user.id,
          email: newSession.user.email || '',
          name: newSession.user.user_metadata?.name || '',
          createdAt: newSession.user.created_at,
          updatedAt: new Date().toISOString(),
        });
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setAuthenticated(false);
        clearUserData();
      } else if (event === 'TOKEN_REFRESHED' && newSession) {
        setSession(newSession);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [setStoreUser, setAuthenticated, clearUserData]);

  // Sign up handler
  const signUp = useCallback(async (data: SignUpData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.signUp(data);

      if (!result.success) {
        setError(result.error);
        return false;
      }

      // If email confirmation is not required, user will be signed in automatically
      if (result.session) {
        setSession(result.session);
        setUser(result.user);
      }

      return true;
    } catch (err) {
      logger.error('Sign up error:', err);
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign in handler
  const signIn = useCallback(async (data: SignInData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.signIn(data);

      if (!result.success) {
        setError(result.error);
        return false;
      }

      setSession(result.session);
      setUser(result.user);
      return true;
    } catch (err) {
      logger.error('Sign in error:', err);
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign out handler
  const signOut = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.signOut();

      if (!result.success) {
        setError(result.error);
        return false;
      }

      setSession(null);
      setUser(null);
      return true;
    } catch (err) {
      logger.error('Sign out error:', err);
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset password handler
  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await authService.resetPassword(email);

      if (!result.success) {
        setError(result.error);
        return false;
      }

      return true;
    } catch (err) {
      logger.error('Reset password error:', err);
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!session && !!user,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
