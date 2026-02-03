/**
 * Unwind & Do Not Disturb Settings Modal
 * Customizable wind-down schedule and sleep notifications
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    useColorScheme,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SPACING, RADIUS } from '@/src/design-system/tokens';
import { useUserStore } from '@/src/store/UserStore';

interface TimePickerProps {
    label: string;
    value: string;
    onPress: () => void;
    isDark: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({ label, value, onPress, isDark }) => (
    <TouchableOpacity
        style={[
            styles.timePicker,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <Text style={[styles.timePickerLabel, { color: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280' }]}>
            {label}
        </Text>
        <Text style={[styles.timePickerValue, { color: isDark ? '#FFF' : '#1A1A1A' }]}>{value}</Text>
    </TouchableOpacity>
);

export default function UnwindDNDModal() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const preferences = useUserStore((s) => s.preferences);
    const updatePreferences = useUserStore((s) => s.actions.updatePreferences);

    // State for settings
    const [unwindEnabled, setUnwindEnabled] = useState(preferences?.unwindEnabled ?? true);
    const [dndEnabled, setDndEnabled] = useState(preferences?.dndEnabled ?? false);
    const [unwindTime, setUnwindTime] = useState(preferences?.unwindTime ?? '21:30');
    const [bedtime, setBedtime] = useState(preferences?.bedtime ?? '22:30');
    const [wakeTime, setWakeTime] = useState(preferences?.wakeTime ?? '07:00');
    const [sleepReminder, setSleepReminder] = useState(preferences?.sleepReminder ?? true);

    const colors = {
        bg: isDark ? '#121214' : '#F5F5F7',
        card: isDark ? '#1E1E20' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
        accent: '#4F46E5', // Indigo for sleep theme
        accentSoft: isDark ? 'rgba(79, 70, 229, 0.2)' : 'rgba(79, 70, 229, 0.1)',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    };

    const handleSave = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        updatePreferences({
            unwindEnabled,
            dndEnabled,
            unwindTime,
            bedtime,
            wakeTime,
            sleepReminder,
        });
        router.back();
    };

    const toggleWithHaptic = (setter: (val: boolean) => void, currentValue: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setter(!currentValue);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Sleep Settings',
                    headerStyle: { backgroundColor: colors.bg },
                    headerTintColor: colors.text,
                    headerShadowVisible: false,
                    headerRight: () => (
                        <TouchableOpacity onPress={handleSave}>
                            <Text style={[styles.saveButton, { color: colors.accent }]}>Save</Text>
                        </TouchableOpacity>
                    ),
                }}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Unwind Section */}
                <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>WIND DOWN</Text>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="moon-outline" size={22} color={colors.accent} />
                                <View style={styles.settingText}>
                                    <Text style={[styles.settingTitle, { color: colors.text }]}>
                                        Enable Wind Down
                                    </Text>
                                    <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                                        Gradually prepare for sleep
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={unwindEnabled}
                                onValueChange={() => toggleWithHaptic(setUnwindEnabled, unwindEnabled)}
                                trackColor={{ false: colors.border, true: colors.accent }}
                                thumbColor="#FFFFFF"
                            />
                        </View>

                        {unwindEnabled && (
                            <>
                                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                                <View style={styles.timeRow}>
                                    <TimePicker
                                        label="Unwind starts"
                                        value={unwindTime}
                                        onPress={() =>
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                        }
                                        isDark={isDark}
                                    />
                                    <TimePicker
                                        label="Bedtime"
                                        value={bedtime}
                                        onPress={() =>
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                        }
                                        isDark={isDark}
                                    />
                                </View>
                            </>
                        )}
                    </View>
                </Animated.View>

                {/* DND Section */}
                <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>DO NOT DISTURB</Text>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="notifications-off-outline" size={22} color={colors.accent} />
                                <View style={styles.settingText}>
                                    <Text style={[styles.settingTitle, { color: colors.text }]}>
                                        Sleep Focus Mode
                                    </Text>
                                    <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                                        Silence notifications during sleep
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={dndEnabled}
                                onValueChange={() => toggleWithHaptic(setDndEnabled, dndEnabled)}
                                trackColor={{ false: colors.border, true: colors.accent }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                    </View>
                </Animated.View>

                {/* Wake Time Section */}
                <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>MORNING</Text>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="sunny-outline" size={22} color="#F59E0B" />
                                <View style={styles.settingText}>
                                    <Text style={[styles.settingTitle, { color: colors.text }]}>Wake Time</Text>
                                    <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                                        {wakeTime}
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="alarm-outline" size={22} color={colors.accent} />
                                <View style={styles.settingText}>
                                    <Text style={[styles.settingTitle, { color: colors.text }]}>
                                        Sleep Reminder
                                    </Text>
                                    <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                                        Notify 30 min before bedtime
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={sleepReminder}
                                onValueChange={() => toggleWithHaptic(setSleepReminder, sleepReminder)}
                                trackColor={{ false: colors.border, true: colors.accent }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                    </View>
                </Animated.View>

                {/* Tips Card */}
                <Animated.View entering={FadeInDown.delay(400).duration(400)}>
                    <View
                        style={[styles.tipsCard, { backgroundColor: colors.accentSoft, borderColor: colors.border }]}
                    >
                        <Ionicons name="bulb-outline" size={20} color={colors.accent} />
                        <Text style={[styles.tipsText, { color: colors.text }]}>
                            Consistent sleep and wake times help regulate your circadian rhythm for better
                            recovery.
                        </Text>
                    </View>
                </Animated.View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: SPACING.lg,
    },
    saveButton: {
        fontSize: 16,
        fontWeight: '600',
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 8,
        marginTop: 16,
        marginLeft: 4,
    },
    card: {
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
    },
    settingText: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    settingSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    divider: {
        height: 1,
        marginHorizontal: 16,
    },
    timeRow: {
        flexDirection: 'row',
        padding: 16,
        paddingTop: 8,
        gap: 12,
    },
    timePicker: {
        flex: 1,
        padding: 16,
        borderRadius: RADIUS.md,
        alignItems: 'center',
    },
    timePickerLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 4,
    },
    timePickerValue: {
        fontSize: 24,
        fontWeight: '700',
    },
    tipsCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: RADIUS.lg,
        gap: 12,
        marginTop: 16,
        borderWidth: 1,
    },
    tipsText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 20,
    },
});
