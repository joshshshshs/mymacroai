/**
 * StrainGauge - Capacity vs Strain dual bar comparison
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface Props {
    strain: number;    // 0-21 scale
    capacity: number;  // 0-21 scale
}

export const StrainGauge: React.FC<Props> = ({ strain, capacity }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const strainWidth = useSharedValue(0);
    const capacityWidth = useSharedValue(0);

    useEffect(() => {
        const maxValue = 21;
        strainWidth.value = withTiming((strain / maxValue) * 100, {
            duration: 800,
            easing: Easing.out(Easing.cubic),
        });
        capacityWidth.value = withTiming((capacity / maxValue) * 100, {
            duration: 800,
            easing: Easing.out(Easing.cubic),
        });
    }, [strain, capacity]);

    const strainStyle = useAnimatedStyle(() => ({
        width: `${strainWidth.value}%`,
    }));

    const capacityStyle = useAnimatedStyle(() => ({
        width: `${capacityWidth.value}%`,
    }));

    const isOverloaded = strain > capacity;

    const colors = {
        bg: isDark ? '#2C2C2E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        track: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
        strain: '#FF5C00',
        capacity: '#6B7280',
        warning: '#EF4444',
    };

    return (
        <View style={[styles.card, { backgroundColor: colors.bg }]}>
            <View style={styles.header}>
                <Ionicons name="flash" size={18} color={colors.strain} />
                <Text style={[styles.title, { color: colors.text }]}>Load vs Capacity</Text>
                {isOverloaded && (
                    <View style={styles.warningBadge}>
                        <Ionicons name="warning" size={12} color={colors.warning} />
                        <Text style={[styles.warningText, { color: colors.warning }]}>Overload</Text>
                    </View>
                )}
            </View>

            {/* Capacity Bar */}
            <View style={styles.barRow}>
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>CAPACITY</Text>
                <View style={styles.barWrapper}>
                    <View style={[styles.track, { backgroundColor: colors.track }]}>
                        <Animated.View style={[styles.bar, { backgroundColor: colors.capacity }, capacityStyle]} />
                    </View>
                    <Text style={[styles.barValue, { color: colors.text }]}>{capacity.toFixed(1)}</Text>
                </View>
            </View>

            {/* Strain Bar */}
            <View style={styles.barRow}>
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>STRAIN</Text>
                <View style={styles.barWrapper}>
                    <View style={[styles.track, { backgroundColor: colors.track }]}>
                        <Animated.View
                            style={[
                                styles.bar,
                                { backgroundColor: isOverloaded ? colors.warning : colors.strain },
                                strainStyle
                            ]}
                        />
                    </View>
                    <Text style={[styles.barValue, { color: colors.text }]}>{strain.toFixed(1)}</Text>
                </View>
            </View>

            <Text style={[styles.hint, { color: colors.textSecondary }]}>
                Keep strain below capacity for optimal recovery
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
    },
    warningBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(239,68,68,0.1)',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    warningText: {
        fontSize: 10,
        fontWeight: '700',
    },
    barRow: {
        marginBottom: 12,
    },
    barLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    barWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    track: {
        flex: 1,
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        borderRadius: 6,
    },
    barValue: {
        fontSize: 14,
        fontWeight: '700',
        width: 36,
        textAlign: 'right',
    },
    hint: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: 4,
    },
});
