/**
 * WearableAuthService
 * Manages OAuth authentication flows for wearable device integrations
 * Supports Oura, Whoop, Garmin, Samsung Health, and Google Fit
 */

import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { logger } from '@/utils/logger';

// ============================================================================
// Types
// ============================================================================

export type WearableProviderId =
  | 'oura'
  | 'whoop'
  | 'garmin'
  | 'samsung_health'
  | 'google_fit'
  | 'apple_health';

export interface OAuthConfig {
  clientId: string;
  clientSecret?: string;
  authorizationUrl: string;
  tokenUrl: string;
  scopes: string[];
  /** OAuth 1.0a uses different flow (Garmin) */
  oauthVersion: '1.0a' | '2.0';
  /** Use PKCE for enhanced security */
  usePKCE?: boolean;
}

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  tokenType: string;
  scope?: string;
}

export interface ConnectionStatus {
  connected: boolean;
  lastSync?: Date;
  userId?: string;
  expiresAt?: Date;
}

// ============================================================================
// Provider Configurations
// ============================================================================

/**
 * OAuth configurations for each wearable provider
 * NOTE: You must replace placeholder values with your actual API credentials
 */
export const PROVIDER_CONFIGS: Record<WearableProviderId, OAuthConfig | null> = {
  oura: {
    clientId: process.env.EXPO_PUBLIC_OURA_CLIENT_ID || '',
    clientSecret: process.env.EXPO_PUBLIC_OURA_CLIENT_SECRET,
    authorizationUrl: 'https://cloud.ouraring.com/oauth/authorize',
    tokenUrl: 'https://api.ouraring.com/oauth/token',
    scopes: ['daily', 'heartrate', 'workout', 'sleep', 'personal'],
    oauthVersion: '2.0',
    usePKCE: true,
  },
  whoop: {
    clientId: process.env.EXPO_PUBLIC_WHOOP_CLIENT_ID || '',
    clientSecret: process.env.EXPO_PUBLIC_WHOOP_CLIENT_SECRET,
    authorizationUrl: 'https://api.prod.whoop.com/oauth/oauth2/auth',
    tokenUrl: 'https://api.prod.whoop.com/oauth/oauth2/token',
    scopes: ['read:recovery', 'read:cycles', 'read:sleep', 'read:workout', 'read:profile', 'read:body_measurement'],
    oauthVersion: '2.0',
    usePKCE: false,
  },
  garmin: {
    clientId: process.env.EXPO_PUBLIC_GARMIN_CONSUMER_KEY || '',
    clientSecret: process.env.EXPO_PUBLIC_GARMIN_CONSUMER_SECRET,
    authorizationUrl: 'https://connect.garmin.com/oauthConfirm',
    tokenUrl: 'https://connect.garmin.com/oauthConfirm',
    scopes: [],
    oauthVersion: '1.0a', // Garmin uses OAuth 1.0a
  },
  samsung_health: null, // Samsung Health uses SDK, not OAuth web flow
  google_fit: {
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.heart_rate.read',
      'https://www.googleapis.com/auth/fitness.sleep.read',
      'https://www.googleapis.com/auth/fitness.body.read',
    ],
    oauthVersion: '2.0',
    usePKCE: true,
  },
  apple_health: null, // Apple Health uses HealthKit, not OAuth
};

// ============================================================================
// Secure Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  TOKEN_PREFIX: 'wearable_token_',
  STATE_PREFIX: 'wearable_state_',
  PKCE_PREFIX: 'wearable_pkce_',
  CONNECTION_PREFIX: 'wearable_connection_',
} as const;

// ============================================================================
// WearableAuthService Class
// ============================================================================

class WearableAuthServiceClass {
  private redirectUri: string;

  constructor() {
    // Generate redirect URI using Expo Linking
    this.redirectUri = Linking.createURL('wearable-callback');
  }

  /**
   * Generate a random state parameter for CSRF protection
   */
  private async generateState(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return Array.from(new Uint8Array(randomBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Generate PKCE code verifier and challenge
   */
  private async generatePKCE(): Promise<{ verifier: string; challenge: string }> {
    const verifier = await this.generateState();
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      verifier,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );
    // URL-safe base64 encoding
    const challenge = digest
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    return { verifier, challenge };
  }

  /**
   * Start OAuth authorization flow for a provider
   */
  async startAuthFlow(providerId: WearableProviderId): Promise<string | null> {
    const config = PROVIDER_CONFIGS[providerId];

    if (!config) {
      logger.warn(`Provider ${providerId} does not support OAuth web flow`);
      return null;
    }

    if (config.oauthVersion === '1.0a') {
      // OAuth 1.0a requires different handling (request token first)
      logger.warn('OAuth 1.0a flow not yet implemented for:', providerId);
      return null;
    }

    try {
      // Generate state for CSRF protection
      const state = await this.generateState();
      await SecureStore.setItemAsync(`${STORAGE_KEYS.STATE_PREFIX}${providerId}`, state);

      // Build authorization URL
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: this.redirectUri,
        response_type: 'code',
        scope: config.scopes.join(' '),
        state,
      });

      // Add PKCE if supported
      if (config.usePKCE) {
        const pkce = await this.generatePKCE();
        await SecureStore.setItemAsync(
          `${STORAGE_KEYS.PKCE_PREFIX}${providerId}`,
          pkce.verifier
        );
        params.append('code_challenge', pkce.challenge);
        params.append('code_challenge_method', 'S256');
      }

      const authUrl = `${config.authorizationUrl}?${params.toString()}`;

      logger.log(`Starting OAuth flow for ${providerId}`, { authUrl });

      return authUrl;
    } catch (error) {
      logger.error(`Failed to start OAuth flow for ${providerId}:`, error);
      return null;
    }
  }

  /**
   * Handle OAuth callback with authorization code
   */
  async handleCallback(
    providerId: WearableProviderId,
    code: string,
    returnedState: string
  ): Promise<TokenData | null> {
    const config = PROVIDER_CONFIGS[providerId];

    if (!config || config.oauthVersion === '1.0a') {
      return null;
    }

    try {
      // Verify state to prevent CSRF
      const savedState = await SecureStore.getItemAsync(
        `${STORAGE_KEYS.STATE_PREFIX}${providerId}`
      );

      if (savedState !== returnedState) {
        logger.error('OAuth state mismatch - possible CSRF attack');
        return null;
      }

      // Build token request
      const tokenParams: Record<string, string> = {
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        client_id: config.clientId,
      };

      // Add client secret if provided
      if (config.clientSecret) {
        tokenParams.client_secret = config.clientSecret;
      }

      // Add PKCE verifier if used
      if (config.usePKCE) {
        const verifier = await SecureStore.getItemAsync(
          `${STORAGE_KEYS.PKCE_PREFIX}${providerId}`
        );
        if (verifier) {
          tokenParams.code_verifier = verifier;
        }
      }

      // Exchange code for tokens
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(tokenParams).toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Token exchange failed for ${providerId}:`, errorText);
        return null;
      }

      const tokenResponse = await response.json();

      const tokenData: TokenData = {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: Date.now() + (tokenResponse.expires_in * 1000),
        tokenType: tokenResponse.token_type || 'Bearer',
        scope: tokenResponse.scope,
      };

      // Save tokens securely
      await this.saveTokens(providerId, tokenData);

      // Clean up temporary state
      await SecureStore.deleteItemAsync(`${STORAGE_KEYS.STATE_PREFIX}${providerId}`);
      await SecureStore.deleteItemAsync(`${STORAGE_KEYS.PKCE_PREFIX}${providerId}`);

      logger.log(`Successfully authenticated with ${providerId}`);

      return tokenData;
    } catch (error) {
      logger.error(`OAuth callback failed for ${providerId}:`, error);
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(providerId: WearableProviderId): Promise<TokenData | null> {
    const config = PROVIDER_CONFIGS[providerId];
    const currentTokens = await this.getTokens(providerId);

    if (!config || !currentTokens?.refreshToken) {
      return null;
    }

    try {
      const tokenParams: Record<string, string> = {
        grant_type: 'refresh_token',
        refresh_token: currentTokens.refreshToken,
        client_id: config.clientId,
      };

      if (config.clientSecret) {
        tokenParams.client_secret = config.clientSecret;
      }

      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(tokenParams).toString(),
      });

      if (!response.ok) {
        logger.error(`Token refresh failed for ${providerId}`);
        return null;
      }

      const tokenResponse = await response.json();

      const tokenData: TokenData = {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token || currentTokens.refreshToken,
        expiresAt: Date.now() + (tokenResponse.expires_in * 1000),
        tokenType: tokenResponse.token_type || 'Bearer',
        scope: tokenResponse.scope,
      };

      await this.saveTokens(providerId, tokenData);

      return tokenData;
    } catch (error) {
      logger.error(`Token refresh failed for ${providerId}:`, error);
      return null;
    }
  }

  /**
   * Get valid access token, refreshing if needed
   */
  async getValidAccessToken(providerId: WearableProviderId): Promise<string | null> {
    let tokens = await this.getTokens(providerId);

    if (!tokens) {
      return null;
    }

    // Check if token is expired (with 5 min buffer)
    if (tokens.expiresAt < Date.now() + 5 * 60 * 1000) {
      logger.log(`Token expired for ${providerId}, refreshing...`);
      tokens = await this.refreshAccessToken(providerId);
    }

    return tokens?.accessToken ?? null;
  }

  /**
   * Save tokens to secure storage
   */
  private async saveTokens(providerId: WearableProviderId, tokens: TokenData): Promise<void> {
    await SecureStore.setItemAsync(
      `${STORAGE_KEYS.TOKEN_PREFIX}${providerId}`,
      JSON.stringify(tokens)
    );

    // Update connection status
    await this.setConnectionStatus(providerId, {
      connected: true,
      lastSync: new Date(),
      expiresAt: new Date(tokens.expiresAt),
    });
  }

  /**
   * Get stored tokens
   */
  async getTokens(providerId: WearableProviderId): Promise<TokenData | null> {
    try {
      const stored = await SecureStore.getItemAsync(
        `${STORAGE_KEYS.TOKEN_PREFIX}${providerId}`
      );
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Disconnect a provider (revoke tokens)
   */
  async disconnect(providerId: WearableProviderId): Promise<void> {
    try {
      // Delete stored tokens
      await SecureStore.deleteItemAsync(`${STORAGE_KEYS.TOKEN_PREFIX}${providerId}`);

      // Update connection status
      await this.setConnectionStatus(providerId, { connected: false });

      logger.log(`Disconnected from ${providerId}`);
    } catch (error) {
      logger.error(`Failed to disconnect from ${providerId}:`, error);
    }
  }

  /**
   * Get connection status for a provider
   */
  async getConnectionStatus(providerId: WearableProviderId): Promise<ConnectionStatus> {
    try {
      const stored = await SecureStore.getItemAsync(
        `${STORAGE_KEYS.CONNECTION_PREFIX}${providerId}`
      );

      if (!stored) {
        return { connected: false };
      }

      const status = JSON.parse(stored);
      return {
        ...status,
        lastSync: status.lastSync ? new Date(status.lastSync) : undefined,
        expiresAt: status.expiresAt ? new Date(status.expiresAt) : undefined,
      };
    } catch {
      return { connected: false };
    }
  }

  /**
   * Set connection status for a provider
   */
  private async setConnectionStatus(
    providerId: WearableProviderId,
    status: ConnectionStatus
  ): Promise<void> {
    await SecureStore.setItemAsync(
      `${STORAGE_KEYS.CONNECTION_PREFIX}${providerId}`,
      JSON.stringify(status)
    );
  }

  /**
   * Get all connected providers
   */
  async getConnectedProviders(): Promise<WearableProviderId[]> {
    const providers: WearableProviderId[] = [
      'oura', 'whoop', 'garmin', 'samsung_health', 'google_fit', 'apple_health'
    ];

    const connectedProviders: WearableProviderId[] = [];

    for (const provider of providers) {
      const status = await this.getConnectionStatus(provider);
      if (status.connected) {
        connectedProviders.push(provider);
      }
    }

    return connectedProviders;
  }

  /**
   * Check if provider requires OAuth web flow
   */
  isOAuthProvider(providerId: WearableProviderId): boolean {
    return PROVIDER_CONFIGS[providerId] !== null;
  }

  /**
   * Get redirect URI for OAuth configuration
   */
  getRedirectUri(): string {
    return this.redirectUri;
  }
}

// Singleton export
export const wearableAuthService = new WearableAuthServiceClass();
export default wearableAuthService;
