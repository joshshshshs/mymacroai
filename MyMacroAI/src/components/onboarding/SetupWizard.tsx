import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft, SlideInRight, SlideOutLeft, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { SoftGlassCard } from '@/src/components/ui/SoftGlassCard';
import { useUserStore } from '@/src/store/UserStore';
import { useHaptics } from '@/hooks/useHaptics';
import { PASTEL_COLORS } from '@/src/design-system/aesthetics';

const { width } = Dimensions.get('window');

const GOALS = [
    { id: 'fat_loss', label: 'Fat Loss', icon: 'flame' },
    { id: 'muscle', label: 'Muscle', icon: 'barbell' },
    { id: 'sleep', label: 'Sleep', icon: 'moon' },
    { id: 'longevity', label: 'Longevity', icon: 'heart' },
];

export function SetupWizard() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const haptics = useHaptics();

    // Store Actions
    const { actions, healthMetrics, hardware } = useUserStore();

    // Local State for Step 1
    const [weight, setWeight] = useState(healthMetrics.weight?.toString() || '');
    const [height, setHeight] = useState(healthMetrics.height?.toString() || '');

    // Local State for Step 3
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

    const handleNext = () => {
        haptics.light();
        if (step < 2) {
            setStep(prev => prev + 1);
        } else {
            // Finish
            router.replace('/(tabs)/dashboard');
        }
    };

    const handleBack = () => {
        haptics.light();
        if (step > 0) {
            setStep(prev => prev - 1);
        }
    };

    const updateBiometrics = () => {
        actions.updateHealthMetrics({
            weight: parseFloat(weight) || null,
            height: parseFloat(height) || null,
        });
        handleNext();
    };

    // Step 1: The Basics
    const renderStep1 = () => (
        <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContainer}>
            <Text style={styles.title}>The Basics</Text>
            <Text style={styles.subtitle}>Let's calibrate your macros.</Text>

            <View style={styles.inputRow}>
                <SoftGlassCard variant="soft" style={styles.inputCard}>
                    <Text style={styles.inputLabel}>Weight (kg)</Text>
                    <TextInput
                        style={styles.largeInput}
                        placeholder="0.0"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        keyboardType="numeric"
                        value={weight}
                        onChangeText={setWeight}
                    />
                </SoftGlassCard>

                <SoftGlassCard variant="soft" style={styles.inputCard}>
                    <Text style={styles.inputLabel}>Height (cm)</Text>
                    <TextInput
                        style={styles.largeInput}
                        placeholder="0"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        keyboardType="numeric"
                        value={height}
                        onChangeText={setHeight}
                    />
                </SoftGlassCard>
            </View>

            <SoftGlassCard
                onPress={updateBiometrics}
                variant="prominent"
                style={styles.nextButton}
            >
                <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </View>
            </SoftGlassCard>
        </Animated.View>
    );

    // Step 2: The Gear Check
    const renderStep2 = () => (
        <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContainer}>
            <Text style={styles.title}>Gear Check</Text>
            <Text style={styles.subtitle}>Do you wear a fitness tracker?</Text>

            <View style={styles.gearOptions}>
                <TouchableOpacity onPress={() => {
                    actions.setHardware(true, 'apple');
                    haptics.success();
                    handleNext();
                }}>
                    <SoftGlassCard variant={hardware.hasWearable ? 'prominent' : 'soft'} style={styles.gearCard} glowColor={hardware.hasWearable ? PASTEL_COLORS.accents.primary : undefined}>
                        <Ionicons name="watch" size={40} color={hardware.hasWearable ? '#10B981' : '#FFF'} />
                        <Text style={styles.gearText}>Yes, I wear a watch</Text>
                        <Text style={styles.gearSubText}>Apple Watch, Garmin, Whoop</Text>
                    </SoftGlassCard>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {
                    actions.setHardware(false, 'none');
                    haptics.light();
                    handleNext();
                }}>
                    <SoftGlassCard variant={!hardware.hasWearable ? 'prominent' : 'soft'} style={styles.gearCard}>
                        <Ionicons name="phone-portrait" size={40} color={!hardware.hasWearable ? '#F59E0B' : '#FFF'} />
                        <Text style={styles.gearText}>No, just my phone</Text>
                        <Text style={styles.gearSubText}>Manual Mode activated</Text>
                    </SoftGlassCard>
                </TouchableOpacity>
            </View>

            {!hardware.hasWearable && hardware.deviceType !== null && (
                <Animated.View entering={FadeInRight} style={styles.disclaimerBox}>
                    <Ionicons name="information-circle" size={20} color="#94A3B8" />
                    <Text style={styles.disclaimerText}>
                        Biometrics like Heart Rate will be hidden. You can log weight manually.
                    </Text>
                </Animated.View>
            )}
        </Animated.View>
    );

    // Step 3: The Customizer
    const renderStep3 = () => {
        const toggleGoal = (id: string) => {
            haptics.light();
            if (selectedGoals.includes(id)) {
                setSelectedGoals(prev => prev.filter(g => g !== id));
            } else {
                // Check for Sleep warning
                if (id === 'sleep' && !hardware.hasWearable) {
                    haptics.error();
                }
                setSelectedGoals(prev => [...prev, id]);
            }
        };

        return (
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft} style={styles.stepContainer}>
                <Text style={styles.title}>Goals</Text>
                <Text style={styles.subtitle}>What matters to you?</Text>

                <View style={styles.goalsGrid}>
                    {GOALS.map((goal) => {
                        const isSelected = selectedGoals.includes(goal.id);
                        const isWarning = goal.id === 'sleep' && !hardware.hasWearable && isSelected;

                        return (
                            <TouchableOpacity key={goal.id} onPress={() => toggleGoal(goal.id)} style={styles.goalButton}>
                                <SoftGlassCard
                                    variant={isSelected ? 'prominent' : 'soft'}
                                    style={styles.goalCardInner}
                                    glowColor={isSelected ? '#10B981' : undefined}
                                >
                                    <Ionicons
                                        name={goal.icon as any}
                                        size={32}
                                        color={isSelected ? '#10B981' : 'rgba(255,255,255,0.6)'}
                                    />
                                    <Text style={[styles.goalLabel, isSelected && styles.goalLabelSelected]}>
                                        {goal.label}
                                    </Text>
                                    {isWarning && (
                                        <View style={styles.warningBadge}>
                                            <Ionicons name="alert" size={12} color="#000" />
                                        </View>
                                    )}
                                </SoftGlassCard>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {selectedGoals.includes('sleep') && !hardware.hasWearable && (
                    <Animated.View entering={FadeInRight} style={styles.warningBox}>
                        <Ionicons name="moon" size={18} color="#F59E0B" />
                        <Text style={styles.warningText}>
                            Sleep tracking is limited without a device. We'll rely on manual logs.
                        </Text>
                    </Animated.View>
                )}

                <View style={styles.footer}>
                    <SoftGlassCard
                        onPress={() => router.replace('/(tabs)/dashboard')}
                        variant="prominent"
                        style={styles.finishButton}
                        glowColor={PASTEL_COLORS.accents.primary}
                    >
                        <View style={styles.buttonContent}>
                            <Ionicons name="checkmark" size={20} color="#FFF" />
                            <Text style={styles.buttonText}>Finish Setup</Text>
                        </View>
                    </SoftGlassCard>
                </View>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Progress Dots */}
            <View style={styles.progressContainer}>
                {[0, 1, 2].map((i) => (
                    <Animated.View
                        key={i}
                        layout={Layout.springify()}
                        style={[
                            styles.progressDot,
                            i === step && styles.progressDotActive,
                            i < step && styles.progressDotCompleted
                        ]}
                    />
                ))}
            </View>

            {step === 0 && renderStep1()}
            {step === 1 && renderStep2()}
            {step === 2 && renderStep3()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 40,
        gap: 8,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    progressDotActive: {
        backgroundColor: '#10B981',
        width: 24,
    },
    progressDotCompleted: {
        backgroundColor: '#10B981',
    },
    stepContainer: {
        flex: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 32,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    inputCard: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
    },
    inputLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 12,
    },
    largeInput: {
        fontSize: 36,
        fontWeight: '700',
        color: '#FFF',
        textAlign: 'center',
        width: '100%',
    },
    nextButton: {
        marginTop: 'auto',
        marginBottom: 40,
        padding: 16,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    finishButton: {
        width: '100%',
        padding: 16,
    },
    gearOptions: {
        gap: 16,
    },
    gearCard: {
        padding: 24,
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
    },
    gearText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
    },
    gearSubText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
    },
    disclaimerBox: {
        marginTop: 24,
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        gap: 12,
        alignItems: 'center',
    },
    disclaimerText: {
        flex: 1,
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
        lineHeight: 20,
    },
    goalsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    goalButton: {
        width: (width - 40 - 12) / 2,
        aspectRatio: 1,
    },
    goalCardInner: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    goalLabel: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '500',
    },
    goalLabelSelected: {
        color: '#FFF',
        fontWeight: '700',
    },
    warningBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#F59E0B',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    warningBox: {
        marginTop: 24,
        flexDirection: 'row',
        padding: 12,
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderRadius: 12,
        gap: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    warningText: {
        flex: 1,
        color: '#FCD34D',
        fontSize: 13,
    },
    footer: {
        marginTop: 'auto',
        marginBottom: 40,
    }
});
