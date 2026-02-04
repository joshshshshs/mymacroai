/**
 * useGyroLock - Gyroscope alignment detection hook
 * Used for Ghost Camera to ensure consistent photo angles
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Gyroscope, DeviceMotion } from 'expo-sensors';
import * as Haptics from 'expo-haptics';

interface GyroLockState {
    isAligned: boolean;
    deviation: { pitch: number; roll: number };
    isCalibrated: boolean;
}

interface UseGyroLockOptions {
    /** Tolerance in degrees for alignment (default: 5) */
    tolerance?: number;
    /** Reference pitch angle in degrees (default: 0 = vertical) */
    referencePitch?: number;
    /** Reference roll angle in degrees (default: 0 = no tilt) */
    referenceRoll?: number;
    /** Enable haptic feedback on alignment (default: true) */
    hapticFeedback?: boolean;
}

export const useGyroLock = (options: UseGyroLockOptions = {}) => {
    const {
        tolerance = 5,
        referencePitch = 0,
        referenceRoll = 0,
        hapticFeedback = true,
    } = options;

    const [state, setState] = useState<GyroLockState>({
        isAligned: false,
        deviation: { pitch: 0, roll: 0 },
        isCalibrated: false,
    });

    const wasAligned = useRef(false);
    const subscriptionRef = useRef<{ remove: () => void } | null>(null);

    // Calibrate to current position
    const calibrate = useCallback(() => {
        setState(prev => ({ ...prev, isCalibrated: true }));
    }, []);

    // Start listening to device motion
    const startListening = useCallback(async () => {
        const isAvailable = await DeviceMotion.isAvailableAsync();

        if (!isAvailable) {
            console.warn('DeviceMotion not available on this device');
            return;
        }

        DeviceMotion.setUpdateInterval(100); // 10 updates per second

        subscriptionRef.current = DeviceMotion.addListener((data) => {
            if (!data.rotation) return;

            // Beta = pitch (front-back tilt), Gamma = roll (left-right tilt)
            const pitchDegrees = (data.rotation.beta || 0) * (180 / Math.PI);
            const rollDegrees = (data.rotation.gamma || 0) * (180 / Math.PI);

            const pitchDeviation = Math.abs(pitchDegrees - referencePitch);
            const rollDeviation = Math.abs(rollDegrees - referenceRoll);

            const isNowAligned = pitchDeviation <= tolerance && rollDeviation <= tolerance;

            // Trigger haptic on alignment change
            if (isNowAligned && !wasAligned.current && hapticFeedback) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }

            wasAligned.current = isNowAligned;

            setState({
                isAligned: isNowAligned,
                deviation: { pitch: pitchDeviation, roll: rollDeviation },
                isCalibrated: true,
            });
        });
    }, [tolerance, referencePitch, referenceRoll, hapticFeedback]);

    // Stop listening
    const stopListening = useCallback(() => {
        if (subscriptionRef.current) {
            subscriptionRef.current.remove();
            subscriptionRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopListening();
        };
    }, [stopListening]);

    return {
        ...state,
        startListening,
        stopListening,
        calibrate,
    };
};
