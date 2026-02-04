/**
 * useConnectedDevices - Track connected hardware sources
 */

import { useState, useCallback } from 'react';
import { DeviceSource } from '@/src/config/widgetRegistry';

// Mock connected devices - in production, this would check Apple HealthKit, etc.
const MOCK_CONNECTED: DeviceSource[] = ['apple_health'];

export function useConnectedDevices() {
    const [connectedDevices, setConnectedDevices] = useState<DeviceSource[]>(MOCK_CONNECTED);

    const isDeviceConnected = useCallback((device: DeviceSource) => {
        return connectedDevices.includes(device);
    }, [connectedDevices]);

    const connectDevice = useCallback((device: DeviceSource) => {
        if (!connectedDevices.includes(device)) {
            setConnectedDevices(prev => [...prev, device]);
        }
    }, [connectedDevices]);

    const disconnectDevice = useCallback((device: DeviceSource) => {
        setConnectedDevices(prev => prev.filter(d => d !== device));
    }, []);

    return {
        connectedDevices,
        isDeviceConnected,
        connectDevice,
        disconnectDevice,
    };
}
