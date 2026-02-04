/**
 * AI Hub Modal - Central AI interaction hub
 * Chat, Body Scan, and Voice Log options
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// AI logo asset

import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
    FadeInDown,
} from 'react-native-reanimated';

import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { SPACING } from '@/src/design-system/tokens';
import { useUserStore } from '@/src/store/UserStore';
import { useHaptics } from '@/hooks/useHaptics';

type ActionOption = {
    icon: string;
    title: string;
    description: string;
    route: string;
    color: string;
    bgColor: string;
};

export default function AIHubModal() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { light, medium } = useHaptics();
    const { user } = useUserStore();
    const userName = user?.name?.split(' ')[0] || 'there';

    const colors = {
        bg: isDark ? '#1C1C1E' : '#FAF9F6',
        surface: isDark ? '#2C2C2E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
        primary: '#FF4500',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    };

    // Pulse animation for the glow with breathing effect
    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.3);

    React.useEffect(() => {
        pulseScale.value = withRepeat(
            withTiming(1.3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
        pulseOpacity.value = withRepeat(
            withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        opacity: pulseOpacity.value,
    }));

    const options: ActionOption[] = [
        {
            icon: 'chatbubbles',
            title: 'Chat with AI',
            description: 'Ask anything about nutrition, fitness, or health',
            route: '/(modals)/ai-chat',
            color: '#3B82F6',
            bgColor: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)',
        },
        {
            icon: 'body',
            title: 'AI Body Scan',
            description: 'Analyze physique from photos',
            route: '/(modals)/body-scan-briefing',
            color: '#8B5CF6',
            bgColor: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)',
        },
        {
            icon: 'camera',
            title: '3-Photo Protocol',
            description: 'Comprehensive physique analysis from 3 angles',
            route: '/(modals)/three-photo',
            color: '#F59E0B',
            bgColor: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)',
        },
        {
            icon: 'mic',
            title: 'Voice Log',
            description: 'Log meals and activities by voice',
            route: '/(modals)/voice-log',
            color: '#FF6F61',
            bgColor: isDark ? 'rgba(255,111,97,0.15)' : 'rgba(255,111,97,0.1)',
        },
        {
            icon: 'book',
            title: 'Journal',
            description: 'Reflect on your day and track mood',
            route: '/(modals)/journaling',
            color: '#10B981',
            bgColor: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)',
        },
    ];

    const handleOptionPress = (option: ActionOption) => {
        medium();
        router.push(option.route as any);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <SoftDreamyBackground />

            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => { light(); router.back(); }}
                        style={[styles.closeButton, { backgroundColor: colors.surface }]}
                    >
                        <Ionicons name="close" size={20} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>MyMacro AI</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Main Content */}
                <View style={styles.content}>
                    {/* AI Orb */}
                    <Animated.View entering={FadeInDown.duration(400)} style={styles.orbSection}>
                        <Animated.View style={[styles.orbGlow, pulseStyle, { backgroundColor: `${colors.primary}20` }]} />
                        <View style={styles.orb}>
                            <Image
                                source={isDark ? require('../../assets/black bkg.png') : require('../../assets/white bkg.png')}
                                style={styles.orbImage}
                                resizeMode="cover"
                            />
                        </View>
                    </Animated.View>

                    {/* Greeting */}
                    <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.greetingSection}>
                        <Text style={[styles.greeting, { color: colors.text }]}>
                            Hey {userName}, let's crush it!
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Choose an option below to get started
                        </Text>
                    </Animated.View>

                    {/* Options */}
                    <View style={styles.optionsSection}>
                        {options.map((option, index) => (
                            <Animated.View
                                key={option.title}
                                entering={FadeInDown.delay(150 + index * 50).duration(400)}
                            >
                                <TouchableOpacity
                                    style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                    onPress={() => handleOptionPress(option)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.optionIcon, { backgroundColor: option.bgColor }]}>
                                        <Ionicons name={option.icon as any} size={24} color={option.color} />
                                    </View>
                                    <View style={styles.optionText}>
                                        <Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text>
                                        <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                                            {option.description}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
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
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
    },
    // Orb
    orbSection: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        marginBottom: 32,
    },
    orbGlow: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    orb: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        shadowColor: '#FF4500',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 10,
    },
    orbImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    // Greeting
    greetingSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
    },
    // Options
    optionsSection: {
        gap: 12,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        gap: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },
    optionIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionText: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    optionDescription: {
        fontSize: 13,
    },
});
