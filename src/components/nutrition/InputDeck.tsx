/**
 * InputDeck - 4-icon horizontal input bar
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useHaptics } from '@/src/hooks/useHaptics';

interface Props {
    onCameraPress?: () => void;
    onBarcodePress?: () => void;
    onVoicePress?: () => void;
    onManualPress?: () => void;
}

export const InputDeck: React.FC<Props> = ({
    onCameraPress,
    onBarcodePress,
    onVoicePress,
    onManualPress,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { light, medium } = useHaptics();

    const colors = {
        bg: isDark ? '#2C2C2E' : '#FFFFFF',
        iconBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
        accent: '#FF5C00',
        accentBg: 'rgba(255,92,0,0.12)',
        icon: isDark ? '#FFFFFF' : '#1A1A1A',
    };

    const handleCamera = () => {
        medium();
        onCameraPress?.();
    };

    const handleBarcode = () => {
        light();
        onBarcodePress?.();
    };

    const handleVoice = () => {
        medium();
        onVoicePress?.();
        router.push('/(modals)/voice-log' as any);
    };

    const handleManual = () => {
        light();
        onManualPress?.();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            {/* Camera - Primary */}
            <TouchableOpacity
                style={[styles.button, styles.primaryButton, { backgroundColor: colors.accentBg }]}
                onPress={handleCamera}
                activeOpacity={0.7}
            >
                <Ionicons name="camera" size={26} color={colors.accent} />
            </TouchableOpacity>

            {/* Barcode */}
            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.iconBg }]}
                onPress={handleBarcode}
                activeOpacity={0.7}
            >
                <Ionicons name="barcode-outline" size={24} color={colors.icon} />
            </TouchableOpacity>

            {/* Voice */}
            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.iconBg }]}
                onPress={handleVoice}
                activeOpacity={0.7}
            >
                <Ionicons name="mic" size={24} color={colors.icon} />
            </TouchableOpacity>

            {/* Manual */}
            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.iconBg }]}
                onPress={handleManual}
                activeOpacity={0.7}
            >
                <Ionicons name="add" size={26} color={colors.icon} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderRadius: 20,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
    },
    button: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        width: 60,
        height: 60,
        borderRadius: 18,
    },
});
