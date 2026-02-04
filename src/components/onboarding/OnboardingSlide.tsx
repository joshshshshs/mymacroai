/**
 * OnboardingSlide - Individual slide content
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface SlideData {
    headline: string;
    highlightWord: string;
    subtext: string;
    icons?: string[];
}

interface Props {
    data: SlideData;
    index: number;
}

export const OnboardingSlide: React.FC<Props> = ({ data, index }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = {
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
        accent: '#FF5C00',
    };

    // Split headline to highlight the last word
    const words = data.headline.split(' ');
    const lastWord = words.pop();
    const firstPart = words.join(' ');

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Icons for slide 2 */}
                {data.icons && (
                    <View style={styles.iconRow}>
                        {data.icons.map((icon, i) => (
                            <View key={i} style={styles.iconBubble}>
                                <Ionicons name={icon as any} size={28} color={colors.accent} />
                            </View>
                        ))}
                    </View>
                )}

                {/* Headline */}
                <Animated.Text
                    entering={FadeIn.delay(200).duration(400)}
                    style={[styles.headline, { color: colors.text }]}
                >
                    {firstPart}{' '}
                    <Text style={{ color: colors.accent }}>{lastWord}</Text>
                </Animated.Text>

                {/* Subtext */}
                <Animated.Text
                    entering={FadeIn.delay(400).duration(400)}
                    style={[styles.subtext, { color: colors.textSecondary }]}
                >
                    {data.subtext}
                </Animated.Text>

                {/* Chat bubble for slide 3 */}
                {index === 2 && (
                    <Animated.View
                        entering={FadeIn.delay(600).duration(400)}
                        style={styles.chatBubble}
                    >
                        <Text style={styles.chatText}>Yo. Ready to train?</Text>
                    </Animated.View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: SCREEN_WIDTH,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    content: {
        alignItems: 'center',
        marginTop: 120,
    },
    iconRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    iconBubble: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,92,0,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headline: {
        fontSize: 36,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: -0.5,
        marginBottom: 16,
    },
    subtext: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 300,
    },
    chatBubble: {
        marginTop: 32,
        backgroundColor: '#FF5C00',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderBottomLeftRadius: 4,
    },
    chatText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
});
