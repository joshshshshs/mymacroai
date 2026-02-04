/**
 * useWearableConnections Hook
 * Manages wearable device connection state and sync operations
 */

import { useState, useEffect, useCallback } from 'react';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import {
    wearableAuthService,
    WearableProviderId,
    ConnectionStatus
} from '@/services/wearables/WearableAuthService';
import { wearableAdapter } from '@/src/services/wearables/WearableAdapter';
import { healthSyncService } from '@/services/health/HealthSync';
import { logger } from '@/utils/logger';

// ============================================================================
// Types
// ============================================================================

export interface WearableDevice {
    id: WearableProviderId;
    name: string;
    icon: string;
    color: string;
    description: string;
    connectionStatus: ConnectionStatus;
    supportsOAuth: boolean;
    /** Whether this device is currently being connected/synced */
    isLoading: boolean;
}

// ============================================================================
// Device Definitions
// ============================================================================

const DEVICE_METADATA: Record<WearableProviderId, Omit<WearableDevice, 'connectionStatus' | 'isLoading'>> = {
    apple_health: {
        id: 'apple_health',
        name: 'Apple Health',
        icon: '❤️',
        color: '#FF2D55',
        description: 'Steps, heart rate, sleep, workouts',
        supportsOAuth: false,
    },
    oura: {
        id: 'oura',
        name: 'Oura Ring',
        icon: '💍',
        color: '#A3A3A3',
        description: 'Sleep, HRV, readiness tracking',
        supportsOAuth: true,
    },
    whoop: {
        id: 'whoop',
        name: 'WHOOP',
        icon: '💪',
        color: '#000000',
        description: 'Recovery, strain, sleep performance',
        supportsOAuth: true,
    },
    garmin: {
        id: 'garmin',
        name: 'Garmin',
        icon: '⌚',
        color: '#007DC3',
        description: 'Activity, body battery, stress',
        supportsOAuth: true,
    },
    samsung_health: {
        id: 'samsung_health',
        name: 'Samsung Health',
        icon: '🏃',
        color: '#1428A0',
        description: 'Steps, heart rate, sleep (Android only)',
        supportsOAuth: false, // Uses SDK
    },
    fitbit: {
        id: 'fitbit',
        name: 'Fitbit',
        icon: '⌚',
        color: '#00B0B9',
        description: 'Activity, sleep, heart rate tracking',
        supportsOAuth: true,
    },
    google_fit: {
        id: 'google_fit',
        name: 'Google Fit',
        icon: '🏋️',
        color: '#4285F4',
        description: 'Activity, heart rate, sleep (Android)',
        supportsOAuth: true,
    },
};

// ============================================================================
// Hook Implementation
// ============================================================================

export function useWearableConnections() {
    const [devices, setDevices] = useState<WearableDevice[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Load connection statuses for all devices
     */
    const loadConnectionStatuses = useCallback(async () => {
        try {
            const deviceList: WearableDevice[] = await Promise.all(
                Object.values(DEVICE_METADATA).map(async (metadata) => {
                    const connectionStatus = await wearableAuthService.getConnectionStatus(metadata.id);
                    return {
                        ...metadata,
                        connectionStatus,
                        isLoading: false,
                    };
                })
            );

            setDevices(deviceList);
            setIsInitialized(true);
        } catch (err) {
            logger.error('Failed to load connection statuses:', err);
            setError('Failed to load device connections');
        }
    }, []);

    /**
     * Initialize on mount
     */
    useEffect(() => {
        loadConnectionStatuses();
    }, [loadConnectionStatuses]);

    /**
     * Handle deep link callback from OAuth
     */
    useEffect(() => {
        const handleDeepLink = async (event: { url: string }) => {
            const { url } = event;

            // Check if this is a wearable callback
            if (!url.includes('wearable-callback')) {
                return;
            }

            try {
                // Parse the URL to get query params
                const { queryParams } = Linking.parse(url);

                if (!queryParams) return;

                const code = queryParams.code as string;
                const state = queryParams.state as string;
                const error = queryParams.error as string;

                if (error) {
                    logger.error('OAuth error:', error);
                    setError(`Authentication failed: ${error}`);
                    return;
                }

                if (!code || !state) {
                    return;
                }

                // Determine which provider this callback is for based on state
                // In production, you'd encode the provider in the state
                const connectedProviders = await wearableAuthService.getConnectedProviders();

                // Try each OAuth provider to find which one this callback belongs to
                for (const providerId of ['oura', 'whoop', 'google_fit'] as WearableProviderId[]) {
                    if (connectedProviders.includes(providerId)) continue;

                    // Reconstruct URL from code and state for the handler
                    const callbackUrl = `myapp://oauth?code=${code}&state=${state}`;
                    const result = await wearableAuthService.handleCallback(providerId, callbackUrl);

                    if (result.success) {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        await loadConnectionStatuses();
                        break;
                    }
                }
            } catch (err) {
                logger.error('Error handling OAuth callback:', err);
                setError('Failed to complete authentication');
            }
        };

        // Subscribe to deep links
        const subscription = Linking.addEventListener('url', handleDeepLink);

        // Check if app was opened via deep link
        Linking.getInitialURL().then((url) => {
            if (url) {
                handleDeepLink({ url });
            }
        });

        return () => {
            subscription.remove();
        };
    }, [loadConnectionStatuses]);

    /**
     * Set loading state for a device
     */
    const setDeviceLoading = useCallback((deviceId: WearableProviderId, isLoading: boolean) => {
        setDevices(prev => prev.map(d =>
            d.id === deviceId ? { ...d, isLoading } : d
        ));
    }, []);

    /**
     * Connect to a wearable device
     */
    const connect = useCallback(async (deviceId: WearableProviderId): Promise<boolean> => {
        setDeviceLoading(deviceId, true);
        setError(null);

        try {
            // Handle Apple Health separately (uses HealthKit, not OAuth)
            if (deviceId === 'apple_health') {
                const initialized = await healthSyncService.initialize();
                if (initialized) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    await loadConnectionStatuses();
                    return true;
                }
                // Get more specific error message from the service
                const lastError = healthSyncService.getLastError();
                throw new Error(lastError?.message || 'Failed to connect to Apple Health. Please check your permissions in Settings > Privacy > Health.');
            }

            // Handle Samsung Health separately (uses SDK)
            if (deviceId === 'samsung_health') {
                // Samsung Health SDK integration would go here
                logger.warn('Samsung Health SDK integration not yet implemented');
                throw new Error('Samsung Health not yet supported');
            }

            // OAuth-based providers
            const authResult = await wearableAuthService.startAuthFlow(deviceId);

            if (!authResult.success) {
                throw new Error(authResult.error || 'Failed to start authorization flow');
            }

            // Update the connection status
            await loadConnectionStatuses();
            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Connection failed';
            logger.error(`Failed to connect to ${deviceId}:`, err);
            setError(message);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return false;
        } finally {
            setDeviceLoading(deviceId, false);
        }
    }, [loadConnectionStatuses, setDeviceLoading]);

    /**
     * Disconnect from a wearable device
     */
    const disconnect = useCallback(async (deviceId: WearableProviderId): Promise<boolean> => {
        setDeviceLoading(deviceId, true);

        try {
            await wearableAuthService.disconnect(deviceId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await loadConnectionStatuses();
            return true;
        } catch (err) {
            logger.error(`Failed to disconnect from ${deviceId}:`, err);
            setError('Failed to disconnect');
            return false;
        } finally {
            setDeviceLoading(deviceId, false);
        }
    }, [loadConnectionStatuses, setDeviceLoading]);

    /**
     * Sync data from a connected device
     */
    const syncDevice = useCallback(async (deviceId: WearableProviderId): Promise<boolean> => {
        setDeviceLoading(deviceId, true);
        setError(null);

        try {
            if (deviceId === 'apple_health') {
                // Use HealthSync for Apple Health
                const endDate = new Date();
                const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
                const result = await healthSyncService.syncHealthData(startDate, endDate);

                if (result.success) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    await loadConnectionStatuses();
                    return true;
                }
                throw new Error('Sync failed');
            }

            // For OAuth providers, get access token and fetch data
            const accessToken = await wearableAuthService.getValidAccessToken(deviceId);

            if (!accessToken) {
                throw new Error('Not authenticated');
            }

            // Use wearableAdapter to fetch and normalize data
            // Map our provider IDs to the adapter's provider types
            const adapterProvider = deviceId === 'google_fit' ? 'manual' : deviceId;
            const recoveryData = await wearableAdapter.fetchRecoveryData(
                adapterProvider as 'oura' | 'whoop' | 'garmin' | 'manual',
                'current-user'
            );

            if (recoveryData) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                await loadConnectionStatuses();
                return true;
            }

            throw new Error('No data received');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Sync failed';
            logger.error(`Failed to sync ${deviceId}:`, err);
            setError(message);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return false;
        } finally {
            setDeviceLoading(deviceId, false);
        }
    }, [loadConnectionStatuses, setDeviceLoading]);

    /**
     * Sync all connected devices
     */
    const syncAll = useCallback(async (): Promise<void> => {
        const connectedDevices = devices.filter(d => d.connectionStatus === 'connected');

        for (const device of connectedDevices) {
            await syncDevice(device.id);
        }
    }, [devices, syncDevice]);

    /**
     * Get connected device count
     */
    const connectedCount = devices.filter(d => d.connectionStatus === 'connected').length;

    return {
        devices,
        isInitialized,
        error,
        connectedCount,
        connect,
        disconnect,
        syncDevice,
        syncAll,
        refresh: loadConnectionStatuses,
    };
}

export default useWearableConnections;
