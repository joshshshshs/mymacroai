/**
 * WearableAuthService - Handles OAuth for wearable device connections
 */

export type WearableProviderId = 'oura' | 'whoop' | 'garmin' | 'fitbit' | 'apple_health' | 'google_fit' | 'samsung_health';

export type ConnectionStatus = 'connected' | 'disconnected' | 'pending' | 'error';

// Also export as object for compatibility with code checking ConnectionStatus.connected
export const ConnectionStatusEnum = {
  connected: 'connected' as const,
  disconnected: 'disconnected' as const,
  pending: 'pending' as const,
  error: 'error' as const,
};

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  provider: WearableProviderId;
}

export interface WearableAuthConfig {
  provider: WearableProviderId;
  clientId?: string;
  redirectUri?: string;
}

export interface WearableAuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  error?: string;
}

class WearableAuthService {
  private tokens: Map<WearableProviderId, TokenData> = new Map();
  private connectionStatuses: Map<WearableProviderId, ConnectionStatus> = new Map();

  async authenticate(provider: WearableProviderId): Promise<WearableAuthResult> {
    console.log(`[WearableAuth] Authenticating with ${provider}...`);
    return {
      success: false,
      error: 'Wearable authentication not yet implemented',
    };
  }

  async startAuthFlow(provider: WearableProviderId): Promise<WearableAuthResult> {
    console.log(`[WearableAuth] Starting auth flow for ${provider}...`);
    this.connectionStatuses.set(provider, 'pending');
    return this.authenticate(provider);
  }

  async handleCallback(provider: WearableProviderId, code: string): Promise<WearableAuthResult> {
    console.log(`[WearableAuth] Handling callback for ${provider}...`);
    return {
      success: false,
      error: 'OAuth callback not yet implemented',
    };
  }

  async refreshToken(provider: WearableProviderId): Promise<WearableAuthResult> {
    console.log(`[WearableAuth] Refreshing token for ${provider}...`);
    return {
      success: false,
      error: 'Token refresh not yet implemented',
    };
  }

  async refreshAccessToken(provider: WearableProviderId): Promise<string | null> {
    const result = await this.refreshToken(provider);
    return result.success ? result.accessToken || null : null;
  }

  async getValidAccessToken(provider: WearableProviderId): Promise<string | null> {
    const tokenData = this.tokens.get(provider);
    if (!tokenData) return null;
    
    // Check if token is expired
    if (Date.now() >= tokenData.expiresAt) {
      const refreshed = await this.refreshAccessToken(provider);
      return refreshed;
    }
    
    return tokenData.accessToken;
  }

  async disconnect(provider: WearableProviderId): Promise<boolean> {
    console.log(`[WearableAuth] Disconnecting ${provider}...`);
    this.tokens.delete(provider);
    this.connectionStatuses.set(provider, 'disconnected');
    return true;
  }

  isConnected(provider: WearableProviderId): boolean {
    return this.connectionStatuses.get(provider) === 'connected';
  }

  getConnectionStatus(provider: WearableProviderId): ConnectionStatus {
    return this.connectionStatuses.get(provider) || 'disconnected';
  }

  getConnectedProviders(): WearableProviderId[] {
    const connected: WearableProviderId[] = [];
    this.connectionStatuses.forEach((status, provider) => {
      if (status === 'connected') {
        connected.push(provider);
      }
    });
    return connected;
  }
}

export const wearableAuthService = new WearableAuthService();
export type { WearableAuthService };
export default wearableAuthService;
