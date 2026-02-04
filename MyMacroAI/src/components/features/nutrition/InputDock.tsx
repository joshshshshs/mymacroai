/**
 * InputDock - "Command Island" Floating Action Bar
 *
 * State of the Art Features:
 * - Dark glass capsule (rgba(20,20,20,0.8) with Blur)
 * - Protruding Camera ORB (72px) above the dock
 * - Pulse animation on the orb (Scale 1.0 -> 1.05)
 * - Navigation links to all input screens
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withSpring,
    Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { SPACING, RADIUS } from '@/src/design-system/tokens';

// Glass & Light Color Palette
const COLORS = {
    vitaminOrange: '#FF5C00',
    neonOrange: '#FF9E00',
    orangeGlow: 'rgba(255, 92, 0, 0.5)',
    searchGray: '#64748B',
    voiceGreen: '#10B981',
    barcodeBlue: '#3B82F6',
};

interface Props {
    onScanPress: () => void;
    onVoicePress: () => void;
    onQuickAddPress: () => void;
    onManualPress: () => void;
}

// Small Dock Button
interface DockButtonProps {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    color?: string;
}

const DockButton: React.FC<DockButtonProps> = ({ icon, onPress, color = '#FFFFFF' }) => {
    const scale = useSharedValue(1);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        scale.value = withSequence(
            withSpring(0.9, { damping: 15 }),
            withSpring(1, { damping: 12 })
        );
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={animatedStyle}>
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.8}
                style={styles.dockButton}
            >
                <Ionicons name={icon} size={22} color={color} />
            </TouchableOpacity>
        </Animated.View>
    );
};

// The Protruding ORB - Camera Button
const CameraOrb: React.FC<{ onPress: () => void }> = ({ onPress }) => {
    const pulseScale = useSharedValue(1);
    const glowOpacity = useSharedValue(0.4);

    useEffect(() => {
        // Pulse animation
        pulseScale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );

        // Glow breathing
        glowOpacity.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            false
        );
    }, []);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        shadowOpacity: glowOpacity.value,
    }));

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
    };

    return (
        <View style={styles.orbContainer}>
            {/* Glow Shadow Layer */}
            <Animated.View style={[styles.orbGlow, glowStyle]} />

            {/* Main Orb */}
            <Animated.View style={[styles.orbWrapper, pulseStyle]}>
                <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
                    <LinearGradient
                        colors={[COLORS.vitaminOrange, COLORS.neonOrange]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.orb}
                    >
                        <Ionicons name="camera" size={32} color="#FFFFFF" />
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

export const InputDock: React.FC<Props> = ({
    onScanPress,
    onVoicePress,
    onQuickAddPress,
    onManualPress,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={styles.container}>
            {/* The Protruding Camera Orb */}
            <CameraOrb onPress={onScanPress} />

            {/* Dark Glass Capsule */}
            <BlurView
                intensity={isDark ? 60 : 40}
                tint="dark"
                style={styles.dock}
            >
                <View style={styles.dockInner}>
                    <View style={styles.dockContent}>
                        {/* Left Side: Search & Barcode */}
                        <View style={styles.buttonGroup}>
                            {/* Search / Manual */}
                            <DockButton
                                icon="search"
                                onPress={onManualPress}
                                color="rgba(255,255,255,0.9)"
                            />

                            {/* Barcode */}
                            <DockButton
                                icon="barcode-outline"
                                onPress={onQuickAddPress}
                                color="rgba(255,255,255,0.9)"
                            />
                        </View>

                        {/* Center Spacer for Orb */}
                        <View style={styles.orbSpacer} />

                        {/* Right Side: Voice */}
                        <View style={styles.buttonGroup}>
                            {/* Voice */}
                            <DockButton
                                icon="mic"
                                onPress={onVoicePress}
                                color={COLORS.voiceGreen}
                            />
                        </View>
                    </View>
                </View>
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        position: 'relative',
    },
    // The Orb
    orbContainer: {
        position: 'absolute',
        top: -36, // Protrude above the dock
        zIndex: 10,
        alignItems: 'center',
    },
    orbGlow: {
        position: 'absolute',
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: COLORS.orangeGlow,
        shadowColor: COLORS.vitaminOrange,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 30,
        elevation: 0,
    },
    orbWrapper: {
        shadowColor: COLORS.vitaminOrange,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 12,
    },
    orb: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    // The Dock
    dock: {
        borderRadius: RADIUS.glass,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    dockInner: {
        backgroundColor: 'rgba(20, 20, 20, 0.8)',
    },
    dockContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        minWidth: 280,
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: SPACING.lg,
    },
    orbSpacer: {
        width: 80, // Space for the protruding orb
    },
    dockButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default InputDock;
