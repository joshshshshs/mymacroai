/**
 * LockedWidgetOverlay - Blurred overlay for widgets requiring hardware
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useHaptics } from '@/src/hooks/useHaptics';

interface Props {
    requirementText: string;
    children: React.ReactNode;
}

export const LockedWidgetOverlay: React.FC<Props> = ({ requirementText, children }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { light } = useHaptics();

    const colors = {
        text: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)',
        textSecondary: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
        accent: '#FF5C00',
        lockIcon: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.35)',
    };

    const handlePress = () => {
        light();
        router.push('/(modals)/hardware-hub' as any);
    };

    return (
        <View style={styles.container}>
            {/* Render the actual widget content (will be blurred) */}
            <View style={styles.content}>{children}</View>

            {/* Blur Overlay */}
            <BlurView intensity={25} tint={isDark ? 'dark' : 'light'} style={styles.blurOverlay}>
                <TouchableOpacity
                    style={styles.touchable}
                    onPress={handlePress}
                    activeOpacity={0.8}
                >
                    {/* Lock Icon */}
                    <View style={styles.lockContainer}>
                        <Ionicons name="lock-closed" size={24} color={colors.lockIcon} />
                    </View>

                    {/* Requirement Text */}
                    <Text style={[styles.requirementText, { color: colors.textSecondary }]}>
                        Requires {requirementText}
                    </Text>

                    {/* Action Link */}
                    <Text style={[styles.actionLink, { color: colors.accent }]}>
                        Connect Device
                    </Text>
                </TouchableOpacity>
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 24,
    },
    content: {
        opacity: 0.4,
    },
    blurOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 24,
        overflow: 'hidden',
    },
    touchable: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    lockContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(150,150,150,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    requirementText: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 6,
    },
    actionLink: {
        fontSize: 13,
        fontWeight: '700',
    },
});
