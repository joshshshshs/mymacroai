/**
 * Support Screen - Help & About
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, Linking } from 'react-native';
import { Stack } from 'expo-router';
import Constants from 'expo-constants';

import { SPACING } from '@/src/design-system/tokens';
import { ProfileMenuItem } from '@/src/components/profile';
import { useHaptics } from '@/hooks/useHaptics';

export default function SupportScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { light } = useHaptics();

    const appVersion = Constants.expoConfig?.version || '1.0.0';
    const buildNumber = Constants.expoConfig?.ios?.buildNumber || '1';

    const colors = {
        bg: isDark ? '#121214' : '#F5F5F7',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        accent: '#FF5C00',
    };

    const handleRoadmap = () => {
        light();
        Linking.openURL('https://mymacro.canny.io');
    };

    const handleBugReport = () => {
        light();
        Linking.openURL('mailto:support@mymacro.app?subject=Bug Report');
    };

    const handlePrivacy = () => {
        light();
        Linking.openURL('https://mymacro.app/privacy');
    };

    const handleTerms = () => {
        light();
        Linking.openURL('https://mymacro.app/terms');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Support',
                    headerStyle: { backgroundColor: colors.bg },
                    headerTintColor: colors.text,
                    headerShadowVisible: false,
                }}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Help */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>HELP & FEEDBACK</Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <ProfileMenuItem
                        icon="map-outline"
                        label="Roadmap & Voting"
                        subtitle="Vote on new features"
                        onPress={handleRoadmap}
                    />
                    <ProfileMenuItem
                        icon="bug-outline"
                        label="Report a Bug"
                        subtitle="Opens email with device logs"
                        onPress={handleBugReport}
                    />
                </View>

                {/* Legal */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>LEGAL</Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <ProfileMenuItem
                        icon="shield-checkmark-outline"
                        label="Privacy Policy"
                        onPress={handlePrivacy}
                    />
                    <ProfileMenuItem
                        icon="document-text-outline"
                        label="Terms of Service"
                        onPress={handleTerms}
                    />
                </View>

                {/* About */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ABOUT</Text>
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <ProfileMenuItem
                        icon="information-circle-outline"
                        label="Version"
                        subtitle={`v${appVersion} (Build ${buildNumber})`}
                        rightElement="badge"
                        badgeText="Latest"
                    />
                </View>

                {/* Made with love */}
                <Text style={[styles.madeWith, { color: colors.textSecondary }]}>
                    Made with 🧡 in Sydney
                </Text>

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
    madeWith: {
        textAlign: 'center',
        fontSize: 13,
        marginTop: 32,
    },
});
