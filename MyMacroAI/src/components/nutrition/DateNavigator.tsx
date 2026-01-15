/**
 * DateNavigator - Swipeable date picker header
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';
import { useHaptics } from '@/hooks/useHaptics';

interface Props {
    date: Date;
    onDateChange: (date: Date) => void;
    onCalendarPress: () => void;
}

export const DateNavigator: React.FC<Props> = ({ date, onDateChange, onCalendarPress }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { light } = useHaptics();
    const translateX = useSharedValue(0);

    const colors = {
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        bg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
        accent: '#FF5C00',
    };

    const isToday = () => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const formatDate = () => {
        if (isToday()) {
            return `Today, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        }
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const changeDate = (direction: number) => {
        light();
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + direction);
        onDateChange(newDate);
    };

    const swipeGesture = Gesture.Pan()
        .onUpdate((e) => {
            translateX.value = e.translationX * 0.3;
        })
        .onEnd((e) => {
            if (e.translationX > 50) {
                runOnJS(changeDate)(-1);
            } else if (e.translationX < -50) {
                runOnJS(changeDate)(1);
            }
            translateX.value = withSpring(0);
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View style={styles.container}>
            {/* Label */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Nutrition</Text>

            {/* Date Picker */}
            <GestureDetector gesture={swipeGesture}>
                <View style={styles.dateContainer}>
                    <TouchableOpacity onPress={() => changeDate(-1)} style={styles.arrowButton}>
                        <Ionicons name="chevron-back" size={20} color={colors.text} />
                    </TouchableOpacity>

                    <Animated.View style={animatedStyle}>
                        <Text style={[styles.dateText, { color: colors.text }]}>{formatDate()}</Text>
                    </Animated.View>

                    <TouchableOpacity
                        onPress={() => changeDate(1)}
                        style={styles.arrowButton}
                        disabled={isToday()}
                    >
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={isToday() ? colors.textSecondary : colors.text}
                        />
                    </TouchableOpacity>
                </View>
            </GestureDetector>

            {/* Calendar Button */}
            <TouchableOpacity
                style={[styles.calendarButton, { backgroundColor: colors.bg }]}
                onPress={() => { light(); onCalendarPress(); }}
            >
                <Ionicons name="calendar-outline" size={20} color={colors.text} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
        position: 'absolute',
        left: 20,
        top: 4,
    },
    dateContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 8,
    },
    arrowButton: {
        padding: 8,
    },
    dateText: {
        fontSize: 17,
        fontWeight: '600',
        paddingHorizontal: 12,
    },
    calendarButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
