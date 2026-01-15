/**
 * Premium Paywall Modal - Upgrade to Pro
 * Soft commitment design with slide-to-start
 */

import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    Linking,
    Animated,
    PanResponder,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { SPACING } from '@/src/design-system/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 48;
const THUMB_SIZE = 56;
const SLIDE_THRESHOLD = SLIDER_WIDTH - THUMB_SIZE - 20;

const FEATURES = [
    {
        icon: 'mic',
        title: 'Unlimited AI Logging',
        description: 'Voice or photo. Zero friction.',
    },
    {
        icon: 'fitness',
        title: 'Cycle Tracking',
        description: 'Hormone-adaptive insights.',
    },
    {
        icon: 'trophy',
        title: 'Squad Leaderboards',
        description: 'Compete on recovery scores.',
    },
];

const LANDING_URL = 'https://mymacro.app';

export default function PremiumModal() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const slideX = useRef(new Animated.Value(0)).current;
    const [isSliding, setIsSliding] = useState(false);

    const colors = {
        bg: isDark ? '#0F0F0F' : '#FAF9F6',
        card: isDark ? 'rgba(30, 30, 32, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        text: isDark ? '#FFFFFF' : '#121212',
        textSecondary: isDark ? '#9CA3AF' : '#8E8E93',
        accent: '#FF4500',
        cardBorder: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                setIsSliding(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            },
            onPanResponderMove: (_, gestureState) => {
                const newX = Math.max(0, Math.min(gestureState.dx, SLIDE_THRESHOLD));
                slideX.setValue(newX);
            },
            onPanResponderRelease: async (_, gestureState) => {
                setIsSliding(false);
                if (gestureState.dx >= SLIDE_THRESHOLD * 0.8) {
                    // Slide complete - open landing page
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    Animated.timing(slideX, {
                        toValue: SLIDE_THRESHOLD,
                        duration: 200,
                        useNativeDriver: true,
                    }).start(() => {
                        Linking.openURL(LANDING_URL);
                    });
                } else {
                    // Slide incomplete - reset
                    Animated.spring(slideX, {
                        toValue: 0,
                        useNativeDriver: true,
                        tension: 100,
                        friction: 10,
                    }).start();
                }
            },
        })
    ).current;

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Background blobs */}
            <View style={styles.blobContainer}>
                <LinearGradient
                    colors={['rgba(255, 165, 0, 0.15)', 'transparent']}
                    style={styles.blobTop}
                />
                <LinearGradient
                    colors={['rgba(200, 200, 200, 0.1)', 'transparent']}
                    style={styles.blobBottom}
                />
            </View>

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.brandLabel, { color: colors.textSecondary }]}>MYMACRO AI</Text>
                    <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="close" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    {/* Hero */}
                    <View style={styles.hero}>
                        <Text style={[styles.heroTitle, { color: colors.text }]}>
                            Go{'\n'}
                            <Text style={{ color: colors.accent }}>Pro.</Text>
                        </Text>
                        <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                            Unlock the complete Health OS. Experience total biological clarity.
                        </Text>
                    </View>

                    {/* Features Card */}
                    <View style={[styles.featuresCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <LinearGradient
                            colors={['rgba(255, 165, 0, 0.08)', 'transparent']}
                            start={{ x: 1, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={[StyleSheet.absoluteFill, { borderRadius: 36 }]}
                        />

                        {FEATURES.map((feature, index) => (
                            <View key={index} style={styles.featureRow}>
                                <View style={[styles.featureIcon, { backgroundColor: isDark ? 'rgba(255,165,0,0.15)' : 'rgba(255,165,0,0.08)' }]}>
                                    <Ionicons name={feature.icon as any} size={18} color={colors.accent} />
                                </View>
                                <View style={styles.featureContent}>
                                    <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
                                    <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{feature.description}</Text>
                                </View>
                            </View>
                        ))}

                        {/* Price */}
                        <View style={[styles.priceRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                            <Text style={[styles.priceAmount, { color: colors.text }]}>$12.99</Text>
                            <Text style={[styles.pricePeriod, { color: colors.textSecondary }]}>/ mo</Text>
                        </View>
                    </View>
                </View>

                {/* Bottom CTA */}
                <View style={styles.ctaContainer}>
                    {/* Slide to Start */}
                    <View style={[styles.sliderContainer, { backgroundColor: isDark ? '#1E1E20' : '#FFFFFF' }]}>
                        <Text style={[styles.sliderText, { color: colors.accent, opacity: isSliding ? 0.5 : 1 }]}>
                            Slide to Start
                        </Text>
                        <View style={styles.sliderChevrons}>
                            <Ionicons name="chevron-forward" size={18} color={colors.accent} style={{ opacity: 0.3 }} />
                            <Ionicons name="chevron-forward" size={18} color={colors.accent} style={{ opacity: 0.3, marginLeft: -8 }} />
                        </View>
                        <Animated.View
                            style={[
                                styles.sliderThumb,
                                { transform: [{ translateX: slideX }] },
                            ]}
                            {...panResponder.panHandlers}
                        >
                            <LinearGradient
                                colors={['#FF6B35', '#FF4500']}
                                style={styles.thumbGradient}
                            >
                                <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
                            </LinearGradient>
                        </Animated.View>
                    </View>

                    {/* Fine Print */}
                    <Text style={[styles.finePrint, { color: colors.textSecondary }]}>
                        No charge today. Reminders sent 2 days before trial ends.
                    </Text>

                    <View style={styles.linksRow}>
                        <TouchableOpacity>
                            <Text style={[styles.linkText, { color: colors.textSecondary }]}>Restore</Text>
                        </TouchableOpacity>
                        <Text style={[styles.linkDot, { color: colors.textSecondary }]}>•</Text>
                        <TouchableOpacity onPress={() => Linking.openURL('https://mymacro.app/terms')}>
                            <Text style={[styles.linkText, { color: colors.textSecondary }]}>Terms</Text>
                        </TouchableOpacity>
                        <Text style={[styles.linkDot, { color: colors.textSecondary }]}>•</Text>
                        <TouchableOpacity onPress={() => Linking.openURL('https://mymacro.app/privacy')}>
                            <Text style={[styles.linkText, { color: colors.textSecondary }]}>Privacy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    blobContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    blobTop: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        borderRadius: 200,
    },
    blobBottom: {
        position: 'absolute',
        bottom: -100,
        left: -100,
        width: 350,
        height: 350,
        borderRadius: 175,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    brandLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
    },
    hero: {
        marginBottom: SPACING.xl,
    },
    heroTitle: {
        fontSize: 48,
        fontWeight: '800',
        lineHeight: 50,
        letterSpacing: -1,
    },
    heroSubtitle: {
        fontSize: 18,
        fontWeight: '500',
        lineHeight: 26,
        marginTop: 16,
        maxWidth: '80%',
    },
    featuresCard: {
        borderRadius: 36,
        padding: 28,
        borderWidth: 1,
        overflow: 'hidden',
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 24,
        gap: 14,
    },
    featureIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    featureDesc: {
        fontSize: 14,
        marginTop: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        paddingTop: 24,
        borderTopWidth: 1,
        marginTop: 8,
    },
    priceAmount: {
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: -1,
    },
    pricePeriod: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    ctaContainer: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.lg,
    },
    sliderContainer: {
        height: 72,
        borderRadius: 36,
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 30,
        elevation: 4,
        marginBottom: 16,
    },
    sliderText: {
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    sliderChevrons: {
        position: 'absolute',
        right: 24,
        flexDirection: 'row',
    },
    sliderThumb: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        zIndex: 10,
    },
    thumbGradient: {
        flex: 1,
        borderRadius: THUMB_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FF4500',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    finePrint: {
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 12,
    },
    linksRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    linkText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    linkDot: {
        fontSize: 10,
    },
});
