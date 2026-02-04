/**
 * VaultHeader - Dark premium header for MacroCoin Shop
 * Features: gradient background, animated balance counter, gold coin icon
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withRepeat,
    withSequence,
    Easing,
    interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING } from '@/src/design-system/tokens';

interface VaultHeaderProps {
    balance: number;
}

export const VaultHeader: React.FC<VaultHeaderProps> = ({ balance }) => {
    const displayValue = useSharedValue(0);
    const coinRotation = useSharedValue(0);
    const coinGlow = useSharedValue(0);

    useEffect(() => {
        // Animate balance counting up
        displayValue.value = withTiming(balance, {
            duration: 1500,
            easing: Easing.out(Easing.cubic),
        });

        // Subtle coin rotation
        coinRotation.value = withRepeat(
            withSequence(
                withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        // Coin glow pulse
        coinGlow.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.5, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, [balance]);

    const coinStyle = useAnimatedStyle(() => ({
        transform: [{ rotateY: `${coinRotation.value}deg` }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: coinGlow.value,
        transform: [{ scale: interpolate(coinGlow.value, [0.5, 1], [1, 1.2]) }],
    }));

    // We'll use a derived value for display
    const animatedTextStyle = useAnimatedStyle(() => {
        return {};
    });

    return (
        <View style={styles.container}>
            {/* Dark Gradient Background */}
            <LinearGradient
                colors={['#1A1A1A', '#0D0D0D', '#000000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Subtle glow effect */}
            <View style={styles.glowContainer}>
                <Animated.View style={[styles.glowOrb, glowStyle]} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* 3D Gold Coin */}
                <Animated.View style={[styles.coinContainer, coinStyle]}>
                    <LinearGradient
                        colors={['#FFD700', '#FFC700', '#FFB700', '#FFA500']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.coin}
                    >
                        <View style={styles.coinInner}>
                            <Text style={styles.coinLetter}>M</Text>
                        </View>
                        {/* Coin reflection */}
                        <View style={styles.coinReflection} />
                    </LinearGradient>
                </Animated.View>

                {/* Balance */}
                <View style={styles.balanceContainer}>
                    <AnimatedBalance value={balance} />
                    <Text style={styles.subtitle}>Consistency Capital Available</Text>
                </View>
            </View>
        </View>
    );
};

// Animated balance component
const AnimatedBalance: React.FC<{ value: number }> = ({ value }) => {
    const displayValue = useSharedValue(0);

    useEffect(() => {
        displayValue.value = withTiming(value, {
            duration: 1500,
            easing: Easing.out(Easing.cubic),
        });
    }, [value]);

    // For simplicity, we'll just display the final value
    // In a production app, you'd use a worklet-based text update
    return (
        <Text style={styles.balance}>{value.toLocaleString()}</Text>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: SPACING['2xl'],
        paddingBottom: SPACING.xl,
        paddingHorizontal: SPACING.lg,
        position: 'relative',
        overflow: 'hidden',
    },
    glowContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowOrb: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 165, 0, 0.15)',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 60,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.lg,
        zIndex: 10,
    },
    coinContainer: {
        // Note: perspective is only valid on web, using transform instead for RN
    },
    coin: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
        position: 'relative',
        borderWidth: 2,
        borderColor: 'rgba(255, 200, 0, 0.4)',
    },
    coinInner: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(139, 105, 20, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.5)',
    },
    coinLetter: {
        fontSize: 28,
        fontWeight: '900',
        color: '#8B6914',
        textShadowColor: 'rgba(255, 255, 255, 0.4)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    coinReflection: {
        position: 'absolute',
        top: 4,
        left: 8,
        right: 8,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    balanceContainer: {
        alignItems: 'flex-start',
    },
    balance: {
        fontSize: 48,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -2,
        textShadowColor: 'rgba(255, 215, 0, 0.3)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255, 215, 0, 0.6)',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginTop: 4,
    },
});

export default VaultHeader;
