import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { HeroRing } from './HeroRing';
import { RecoveryGauge } from './RecoveryGauge';
import { ContextRow } from './ContextRow';
import { QuickActionStrip } from './QuickActionStrip';
import { JarvisOrb } from './JarvisOrb';
import { ThemedText } from '@/src/components/ui/ThemedText';
import { SoftGlassCard } from '../../ui/SoftGlassCard';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/src/store/UserStore';

const { width } = Dimensions.get('window');

export const CockpitDashboard: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { user } = useUserStore();
    const [jarvisState, setJarvisState] = useState<'idle' | 'listening' | 'processing'>('idle');

    // Mock data for display - integrate with real store later
    const calories = 1650;
    const target = 2500;
    const macros = {
        protein: { current: 120, target: 180 },
        carbs: { current: 200, target: 250 },
        fats: { current: 55, target: 80 },
    };
    const recoveryScore = 78;

    const handleAction = (id: string) => {
        console.log('Action:', id);
    };

    const toggleJarvis = () => {
        if (jarvisState === 'idle') setJarvisState('listening');
        else if (jarvisState === 'listening') setJarvisState('processing');
        else setJarvisState('idle');
    };

    return (
        <View style={styles.container}>
            <SoftDreamyBackground />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Header: Date + Coins */}
                <View style={styles.header}>
                    <View>
                        <ThemedText variant="caption" style={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>MONDAY, JAN 13</ThemedText>
                        <ThemedText variant="h3" style={{ color: '#FFF' }}>Hello, {user?.name || 'Joshua'}</ThemedText>
                    </View>
                    <SoftGlassCard variant="soft" style={styles.coinPill}>
                        <Ionicons name="sparkles" size={14} color="#FBBF24" />
                        <ThemedText variant="caption" style={{ color: '#FFF', fontWeight: '600' }}>240</ThemedText>
                    </SoftGlassCard>
                </View>

                {/* Hero Section */}
                <HeroRing calories={calories} target={target} macros={macros} />

                {/* Context Row */}
                <ContextRow />

                {/* Recovery Gauge - Centered or part of another row? Design spec has it prominent. */}
                {/* Let's put it below context row as a secondary hero */}
                <View style={styles.section}>
                    <ThemedText variant="label" style={styles.sectionTitle}>RECOVERY STATUS</ThemedText>
                    <SoftGlassCard variant="soft" style={styles.recoveryCard}>
                        <RecoveryGauge score={recoveryScore} />
                        <View style={styles.recoveryInfo}>
                            <ThemedText variant="body" style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 10 }}>
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
                    <ThemedText variant="caption" style={{ color: '#FFF', flex: 1, lineHeight: 20 }}>
                        <ThemedText style={{ fontWeight: '700', color: '#A78BFA' }}>AI TIP:</ThemedText> Sleep debt is high. Consider a 20min power nap before 2PM to restore alertness.
                    </ThemedText>
                </SoftGlassCard>

            </ScrollView>

            {/* Bottom Floating Dock */}
            <View style={[styles.dockContainer, { paddingBottom: insets.bottom + 10 }]}>
                {/* Quick Actions */}
                <QuickActionStrip onActionPress={handleAction} />

                {/* Jarvis Trigger - Floating absolute on top of dock or integrated? */}
                {/* Spec says "Jarvis Mic hovers above it" */}
                <View style={styles.jarvisContainer}>
                    <JarvisOrb state={jarvisState} onPress={toggleJarvis} />
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    coinPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        gap: 6,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: 'rgba(255,255,255,0.4)',
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
    jarvisContainer: {
        position: 'absolute',
        bottom: 80, // Floating above the strip
        alignSelf: 'center',
    }
});
