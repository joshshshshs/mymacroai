/**
 * Soft Streak Hub
 * Gamification center for streaks and daily challenges
 * Redesigned to match "Apple-like" glassmorphic aesthetic
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SoftGlassCard } from '@/src/components/ui/SoftGlassCard';
import { PASTEL_COLORS, SOFT_TYPOGRAPHY, SOFT_RADIUS } from '@/src/design-system/aesthetics';
import { SPACING } from '@/src/design-system/tokens';
import { useUserStore } from '@/src/store/UserStore';
import { useHaptics } from '@/hooks/useHaptics';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export const SoftStreakHub: React.FC = () => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const textColor = isDark ? '#FFFFFF' : '#000000';
    const secondaryTextColor = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)';
    const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
    const accentColor = '#2DD4BF';

    // Mock User Data
    const userName = "Josh"; // Ideally from store
    const { streak, coins, addCoins } = useUserStore(state => ({
        streak: state.streak,
        coins: state.coins,
        addCoins: state.addCoins
    }));

    const { light, success } = useHaptics();
    const [selectedDate, setSelectedDate] = useState('17');

    // Mock Date Data
    const weekDates = [
        { day: 'Wed', date: '17', status: 'completed' },
        { day: 'Thu', date: '18', status: 'future' },
        { day: 'Fri', date: '19', status: 'future' },
        { day: 'Sat', date: '20', status: 'future' },
        { day: 'Sun', date: '21', status: 'future' },
    ];

    // Mock Challenges Data
    const challenges = [
        {
            id: 1,
            title: 'Drink 2 cups of water',
            subtitle: 'in the morning',
            status: 'completed',
            icon: 'cafe',
            iconColor: '#FF9A9E', // Pinkish Red
            gradient: ['#FEE1E1', '#FF9A9E']
        },
        {
            id: 2,
            title: '15 minutes exercise',
            subtitle: 'morning exercise',
            status: 'completed',
            icon: 'barbell',
            iconColor: '#FBC2EB', // Soft Purple
            gradient: ['#E0C3FC', '#8EC5FC']
        },
        {
            id: 3,
            title: '30 minutes reading',
            subtitle: 'reading book',
            status: 'active',
            icon: 'book',
            iconColor: '#84FAB0', // Greenish
            gradient: ['#84FAB0', '#8FD3F4']
        },
        {
            id: 4,
            title: 'Drink 2 cups of water',
            subtitle: 'in the evening',
            status: 'active',
            icon: 'water',
            iconColor: '#A1C4FD', // Blueish
            gradient: ['#A1C4FD', '#C2E9FB']
        },
    ];

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Header Section */}
            <SoftGlassCard variant="prominent" gradient="ice" style={styles.headerCard}>
                <View style={styles.headerContent}>
                    <View style={styles.headerTextContainer}>
                        <Text style={[styles.welcomeText, { color: '#FFFFFF' }]}>Welcome back, <Text style={styles.userNameText}>{userName}</Text></Text>
                        <Text style={[styles.subText, { color: 'rgba(255, 255, 255, 0.8)' }]}>Complete 3/4 tasks today</Text>

                        {/* Progress Bar */}
                        <View style={styles.progressContainer}>
                            <LinearGradient
                                colors={['#2DD4BF', '#14B8A6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.progressBar, { width: '75%' }]}
                            />
                            <View style={[styles.progressThumb, { borderColor: '#0F766E' }]} />
                        </View>
                    </View>

                    {/* Illustration (Calendar/Clock Composition) */}
                    <View style={styles.illustrationContainer}>
                        {/* Calendar Base */}
                        <View style={styles.calendarIconBase}>
                            <View style={styles.calendarSprings}>
                                {[1, 2, 3, 4].map(i => <View key={i} style={styles.spring} />)}
                            </View>
                            <View style={styles.calendarBody}>
                                <Ionicons name="time-outline" size={32} color={PASTEL_COLORS.accents.primary} style={styles.clockIcon} />
                            </View>
                        </View>
                        {/* Magnifying Glass Overlay */}
                        <View style={styles.magnifierGlass}>
                            <Ionicons name="search" size={24} color="#FFF" />
                        </View>
                    </View>
                </View>
            </SoftGlassCard>

            {/* Date Strip */}
            <View style={styles.dateStrip}>
                {weekDates.map((item, index) => {
                    const isSelected = item.date === selectedDate;
                    return (
                        <TouchableOpacity
                            key={index}
                            activeOpacity={0.7}
                            onPress={() => {
                                light();
                                setSelectedDate(item.date);
                            }}
                        >
                            <SoftGlassCard
                                variant={isSelected ? "prominent" : "soft"}
                                style={[
                                    styles.dateCard,
                                    isSelected ? styles.activeDateCard : { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)' }
                                ]}
                            >
                                <Text style={[styles.dayText, isSelected ? { color: accentColor } : { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>
                                    {item.day}
                                </Text>
                                <Text style={[styles.dateText, isSelected ? { color: accentColor } : { color: textColor }]}>
                                    {item.date}
                                </Text>
                            </SoftGlassCard>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Challenges List */}
            <View style={styles.challengesContainer}>
                {challenges.map((challenge, index) => {
                    const isCompleted = challenge.status === 'completed';

                    return (
                        <TouchableOpacity
                            key={index}
                            activeOpacity={0.8}
                            onPress={() => light()}
                        >
                            <LinearGradient
                                colors={isCompleted
                                    ? (challenge.id === 1 ? ['#FFDEFF', '#B5FFFC'] : ['#E0C3FC', '#8EC5FC'])
                                    : [isDark ? '#1C1C1E' : '#FFFFFF', isDark ? '#1C1C1E' : '#FFFFFF']
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[styles.challengeCard, !isCompleted && { borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
                            >
                                <View style={styles.challengeRow}>
                                    <View style={[styles.iconCircle, { backgroundColor: isCompleted ? 'rgba(255,255,255,0.4)' : `${challenge.iconColor}15` }]}>
                                        <Ionicons name={challenge.icon as any} size={24} color={challenge.iconColor} />
                                    </View>
                                    <View style={styles.challengeInfo}>
                                        <Text style={[styles.challengeTitle, { color: isCompleted ? '#4A4A4A' : textColor }]}>{challenge.title}</Text>
                                        <Text style={[styles.challengeSubtitle, { color: isCompleted ? 'rgba(74, 74, 74, 0.6)' : secondaryTextColor }]}>{challenge.subtitle}</Text>

                                        <View style={styles.statusRow}>
                                            {isCompleted ? (
                                                <>
                                                    <View style={[styles.checkCircle, { backgroundColor: accentColor }]}>
                                                        <Ionicons name="checkmark" size={12} color="#FFF" />
                                                    </View>
                                                    <Text style={[styles.statusText, { color: accentColor }]}>Complete</Text>
                                                </>
                                            ) : (
                                                <View style={styles.startRow}>
                                                    <Text style={[styles.startText, { color: accentColor }]}>Start</Text>
                                                    <Ionicons name="arrow-forward" size={16} color={accentColor} />
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: SPACING.lg,
    },
    headerCard: {
        padding: SPACING.xl,
        borderRadius: 24,
        marginBottom: SPACING.xl,
        overflow: 'hidden',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTextContainer: {
        flex: 1,
        marginRight: SPACING.md,
    },
    welcomeText: {
        fontSize: 18,
        color: '#FFF',
        fontWeight: '400',
        marginBottom: 4,
    },
    userNameText: {
        fontWeight: '700',
    },
    subText: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: SPACING.lg,
    },
    progressContainer: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        width: '100%',
        position: 'relative',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    progressThumb: {
        position: 'absolute',
        left: '73%', // Slightly less than 75% to center thumb
        top: -4,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#FFF',
        borderWidth: 3,
        borderColor: '#5B2C6F', // Deep Purple
    },
    illustrationContainer: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarIconBase: {
        width: 60,
        height: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        alignItems: 'center',
        paddingTop: 6,
    },
    calendarSprings: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 4,
    },
    spring: {
        width: 4,
        height: 8,
        backgroundColor: '#DDD',
        borderRadius: 2,
    },
    calendarBody: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    clockIcon: {
        opacity: 0.8,
    },
    magnifierGlass: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: '#8E2DE2',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    dateStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xl,
    },
    dateCard: {
        width: 64,
        height: 84,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    activeDateCard: {
        backgroundColor: '#FFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    dayText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'none',
    },
    dateText: {
        fontSize: 20,
        fontWeight: '800',
    },
    challengesContainer: {
        gap: 16,
    },
    challengeCard: {
        borderRadius: 28,
        padding: 20,
        overflow: 'hidden',
    },
    challengeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    challengeInfo: {
        flex: 1,
    },
    challengeTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    challengeSubtitle: {
        fontSize: 13,
        marginBottom: 8,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    checkCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '700',
    },
    startRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    startText: {
        fontSize: 14,
        fontWeight: '700',
    },
});
