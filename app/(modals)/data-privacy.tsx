/**
 * Data Privacy Screen - Vault & Privacy
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, Alert } from 'react-native';
import { Stack } from 'expo-router';

import { SPACING } from '@/src/design-system/tokens';
import { ProfileMenuItem } from '@/src/components/profile';
import { useHaptics } from '@/hooks/useHaptics';

export default function DataPrivacyScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { light, medium } = useHaptics();

    const [ghostMode, setGhostMode] = useState(false);
    const [faceId, setFaceId] = useState(false);

    const colors = {
        bg: isDark ? '#121214' : '#F5F5F7',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        accent: '#FF5C00',
    };

    const handleClearCache = () => {
        light();
        Alert.alert(
            'Clear Cache',
            'This will clear cached images and data. Your logs will not be deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: () => medium() },
            ]
        );
    };

    const handleExport = () => {
        light();
        Alert.alert('Export Data', 'Your data will be exported as a JSON file.');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Data & Privacy',
                    headerStyle: { backgroundColor: colors.bg },
                    headerTintColor: colors.text,
                    headerShadowVisible: false,
                }}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Privacy */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PRIVACY</Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <ProfileMenuItem
                        icon="eye-off-outline"
                        label="Ghost Mode"
                        subtitle="Hide from public leaderboard"
                        rightElement="toggle"
                        toggleValue={ghostMode}
                        onToggle={setGhostMode}
                    />
                    <ProfileMenuItem
                        icon="lock-closed-outline"
                        label="Require Face ID"
                        subtitle="Lock app on launch"
                        rightElement="toggle"
                        toggleValue={faceId}
                        onToggle={setFaceId}
                    />
                </View>

                {/* Storage */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>LOCAL STORAGE</Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <ProfileMenuItem
                        icon="folder-outline"
                        label="Storage Used"
                        subtitle="145 MB on device"
                        rightElement="badge"
                        badgeText="Local-First"
                    />
                    <ProfileMenuItem
                        icon="trash-outline"
                        label="Clear Cache"
                        subtitle="Does not delete your logs"
                        onPress={handleClearCache}
                    />
                </View>

                {/* Export */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>DATA EXPORT</Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <ProfileMenuItem
                        icon="download-outline"
                        label="Export My Data"
                        subtitle="Download as JSON/CSV"
                        onPress={handleExport}
                    />
                    <ProfileMenuItem
                        icon="cloud-upload-outline"
                        label="Backup to iCloud"
                        subtitle="Coming soon"
                        rightElement="badge"
                        badgeText="Soon"
                    />
                </View>

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
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: 8,
        marginTop: 16,
        marginLeft: 4,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
    },
});
