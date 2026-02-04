/**
 * SleepWidget - Sleep tracking block for Bevel grid
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SPACING } from '@/src/design-system/tokens';

export const SleepWidget: React.FC = () => {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Mock data - connect to health store later
    const sleepHours = 7.5;
    const quality = 'Good';

    const textColor = isDark ? '#FFFFFF' : '#000000';
    const secondaryColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
    const bgColor = isDark ? '#1C1C1E' : '#FFFFFF';
    const accentColor = '#A78BFA'; // Purple for sleep

    const handlePress = () => {
        router.push('/(tabs)/sleep');
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.8}
            style={[styles.container, { backgroundColor: bgColor }]}
        >
            <View style={styles.header}>
                <Text style={[styles.label, { color: secondaryColor }]}>SLEEP</Text>
                <Ionicons name="moon" size={16} color={accentColor} />
            </View>

            <View style={styles.content}>
                <Text style={[styles.value, { color: textColor }]}>
                    {sleepHours}
                    <Text style={[styles.unit, { color: secondaryColor }]}> hrs</Text>
                </Text>
                <Text style={[styles.quality, { color: accentColor }]}>{quality}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 32,
        padding: SPACING.lg,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
    content: {
        marginTop: 'auto',
    },
    value: {
        fontSize: 28,
        fontWeight: '700',
        letterSpacing: -1,
    },
    unit: {
        fontSize: 14,
        fontWeight: '400',
    },
    quality: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
});
