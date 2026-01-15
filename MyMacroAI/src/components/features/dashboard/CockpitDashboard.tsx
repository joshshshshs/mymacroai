import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { HeroRing } from './HeroRing';
import { RecoveryGauge } from './RecoveryGauge';
import { ContextRow } from './ContextRow';
import { QuickActionStrip } from './QuickActionStrip';
import { CoachOrb } from './CoachOrb';
import { ThemedText } from '@/src/components/ui/ThemedText';
import { SoftGlassCard } from '../../ui/SoftGlassCard';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore, useAdjustedDailyTarget } from '@/src/store/UserStore';
import { MacroCoinIcon } from '../../ui/MacroCoinIcon';

const { width } = Dimensions.get('window');

export const CockpitDashboard: React.FC = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const {
        user,
        currentIntake,
        economy,
        social,
        resetDaily,
        streak
    } = useUserStore();
    const adjustedTarget = useAdjustedDailyTarget();

    const coachState = 'idle';

    // Real Data from Store
    const calories = currentIntake.calories;
    const target = adjustedTarget.calories;
    const macros = {
        protein: { current: currentIntake.protein, target: adjustedTarget.protein },
        carbs: { current: currentIntake.carbs, target: adjustedTarget.carbs },
        fats: { current: currentIntake.fats, target: adjustedTarget.fats },
    };
    const recoveryScore = 78; // TODO: Connect to HealthKit/Wearable data in future phase

    // Format Date
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    const handleAction = (id: string) => {
        if (id === 'shop') {
            router.push('/(modals)/shop' as any);
        } else if (id === 'streak') {
            router.push('/(modals)/streak' as any);
        } else if (id === 'profile') {
            router.push('/(modals)/profile' as any);
        } else if (id === 'edit_widget') {
            // TODO: Open widget editor modal
        } else {
            // Handle Quick Actions
            if (id === 'food') router.push('/(modals)/scan' as any);
            if (id === 'water') router.push('/(tabs)/health' as any);
            if (id === 'workout') router.push('/(modals)/import' as any);
        }
    };

    const toggleCoach = () => {
        // Navigate to AI Chat modal
        router.push('/(modals)/ai-chat' as any);
    };

    return (
        <View style={styles.container}>
            <SoftDreamyBackground />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Top Navigation Bar */}
                <View style={styles.topNav}>
                    <View style={styles.statsRow}>
                        {/* MacroCoins */}
                        <SoftGlassCard variant="soft" style={styles.statPill} onPress={() => handleAction('shop')}>
                            <MacroCoinIcon size={16} />
                            <ThemedText variant="caption" style={{ color: '#FFF', fontWeight: '600' }}>
                                {economy.macroCoins}
                            </ThemedText>
                        </SoftGlassCard>

                        {/* Streak */}
                        <SoftGlassCard variant="soft" style={styles.statPill} onPress={() => handleAction('streak')}>
                            <Ionicons name="flame" size={14} color="#EF4444" />
                            <ThemedText variant="caption" style={{ color: '#FFF', fontWeight: '600' }}>
                                {streak}
                            </ThemedText>
                        </SoftGlassCard>
                    </View>

                    {/* Profile Button */}
                    <SoftGlassCard variant="soft" style={styles.profileButton} onPress={() => handleAction('profile')}>
                        <Ionicons name="person" size={20} color="rgba(0,0,0,0.7)" />
                    </SoftGlassCard>
                </View>

                {/* Greeting / Date Title */}
                <View style={styles.greetingSection}>
                    <ThemedText variant="caption" style={{ color: 'rgba(0,0,0,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>{dateString}</ThemedText>
                    <ThemedText variant="h3" style={{ color: '#1F2937' }}>Hello, {user?.name || 'Guest'}</ThemedText>
                </View>

                {/* Hero Section */}
                <HeroRing
                    calories={calories}
                    target={target}
                    macros={macros}
                    variant="macros-split"
                    onEditPress={() => handleAction('edit_widget')}
                />

                {/* Context Row */}
                <ContextRow />

                {/* Recovery Gauge */}
                <View style={styles.section}>
                    <ThemedText variant="label" style={styles.sectionTitle}>RECOVERY STATUS</ThemedText>
                    <SoftGlassCard variant="soft" style={styles.recoveryCard}>
                        <RecoveryGauge score={recoveryScore} />
                        <View style={styles.recoveryInfo}>
                            <ThemedText variant="body" style={{ color: 'rgba(0,0,0,0.7)', textAlign: 'center', marginTop: 10 }}>
                                HRV is stable. You are ready for peak performance today.
                            </ThemedText>
                        </View>
                    </SoftGlassCard>
                </View>

                {/* Insight Banner */}
                <SoftGlassCard variant="medium" style={styles.insightBanner}>
                    <View style={styles.insightIcon}>
                        <Ionicons name="bulb" size={18} color="#A78BFA" />
                    </View>
                    <ThemedText variant="caption" style={{ color: '#1F2937', flex: 1, lineHeight: 20 }}>
                        <ThemedText style={{ fontWeight: '700', color: '#A78BFA' }}>AI TIP:</ThemedText> Sleep debt is high. Consider a 20min power nap before 2PM to restore alertness.
                    </ThemedText>
                </SoftGlassCard>

            </ScrollView>

            {/* Bottom Floating Dock */}
            <View style={[styles.dockContainer, { paddingBottom: insets.bottom + 10 }]}>
                {/* Quick Actions */}
                <QuickActionStrip onActionPress={handleAction} />

                {/* Coach Trigger - Floating above the dock */}
                <View style={styles.coachContainer}>
                    <CoachOrb state={coachState} onPress={toggleCoach} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    topNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    statPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        gap: 6,
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    greetingSection: {
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: 'rgba(0,0,0,0.4)',
        marginBottom: 10,
        marginLeft: 4,
    },
    recoveryCard: {
        padding: 20,
        alignItems: 'center',
    },
    recoveryInfo: {
        marginTop: 0,
        maxWidth: 240,
    },
    insightBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
        marginBottom: 20,
    },
    insightIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(167, 139, 250, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dockContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    coachContainer: {
        position: 'absolute',
        bottom: 80, // Floating above the strip
        alignSelf: 'center',
    }
});
