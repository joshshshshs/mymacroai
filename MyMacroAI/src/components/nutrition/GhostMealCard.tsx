/**
 * GhostMealCard - Empty meal slot with tap to add
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useHaptics } from '@/hooks/useHaptics';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface Props {
    type: MealType;
    onPress: () => void;
}

const MEAL_CONFIG: Record<MealType, { icon: string; time: string }> = {
    breakfast: { icon: 'sunny-outline', time: '6am - 10am' },
    lunch: { icon: 'restaurant-outline', time: '11am - 2pm' },
    dinner: { icon: 'moon-outline', time: '5pm - 9pm' },
    snack: { icon: 'cafe-outline', time: 'Anytime' },
};

export const GhostMealCard: React.FC<Props> = ({ type, onPress }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { light } = useHaptics();

    const config = MEAL_CONFIG[type];
    const label = type.charAt(0).toUpperCase() + type.slice(1);

    const colors = {
        bg: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        text: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
        accent: '#FF5C00',
    };

    const handlePress = () => {
        light();
        onPress();
    };

    return (
        <Animated.View entering={FadeIn.delay(100 * ['breakfast', 'lunch', 'dinner', 'snack'].indexOf(type))}>
            <TouchableOpacity
                style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.border }]}
                onPress={handlePress}
                activeOpacity={0.6}
            >
                {/* Icon */}
                <View style={styles.iconContainer}>
                    <Ionicons name={config.icon as any} size={22} color={colors.text} />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
                    <Text style={[styles.time, { color: colors.text }]}>{config.time}</Text>
                </View>

                {/* Add Button */}
                <View style={[styles.addButton, { backgroundColor: `${colors.accent}15` }]}>
                    <Ionicons name="add" size={20} color={colors.accent} />
                </View>

                {/* Calories */}
                <Text style={[styles.calories, { color: colors.text }]}>0 kcal</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        marginBottom: 10,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(150,150,150,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
    },
    time: {
        fontSize: 11,
        marginTop: 2,
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    calories: {
        fontSize: 13,
        fontWeight: '600',
    },
});
