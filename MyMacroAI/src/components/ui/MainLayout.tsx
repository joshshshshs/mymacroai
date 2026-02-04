import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Slot, useRouter, usePathname } from 'expo-router';

// Components
import { AppHeader } from '../navigation/AppHeader';
import { ProtrudingTabBar } from '../navigation/ProtrudingTabBar';
import { haptics } from '@/src/utils/haptics';

// GlassDockNav type stub (component was removed, using ProtrudingTabBar instead)
export interface TabItem {
    icon: string;
    label: string;
    isCoach?: boolean;
}

interface MainLayoutProps {
    children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const pathname = usePathname();

    return (
        <View style={styles.container}>
            {/* Background Gradient */}
            <LinearGradient
                colors={['#0B1410', '#13201C']} // Deep Forest -> Card
                style={StyleSheet.absoluteFill}
            />

            {/* Main Content Area */}
            {/* We add top padding for header */}
            <View style={[styles.content, { paddingTop: insets.top }]}>
                <AppHeader />
                <View style={styles.slotContainer}>
                    {children || <Slot />}
                </View>
            </View>

            {/* Floating Tab Bar */}
            <ProtrudingTabBar
                activeTab={getActiveTabName()}
                onTabPress={handleTabPressName}
            />
        </View>
    );

    function getActiveTabName(): string {
        if (pathname.includes('/nutrition') || pathname.includes('/kitchen')) return 'nutrition';
        if (pathname.includes('/health') || pathname.includes('/biology')) return 'health';
        if (pathname.includes('/squad')) return 'squad';
        if (pathname.includes('/ai')) return 'ai-hub';
        return 'dashboard';
    }

    function handleTabPressName(tabName: string) {
        haptics.selection();
        if (tabName === 'dashboard') router.push('/(tabs)/dashboard');
        else if (tabName === 'nutrition') router.push('/(tabs)/nutrition');
        else if (tabName === 'health') router.push('/(tabs)/health');
        else if (tabName === 'squad') router.push('/(tabs)/squad');
        else if (tabName === 'ai-hub') router.push('/(modals)/ai-hub' as any);
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0B1410',
    },
    content: {
        flex: 1,
    },
    slotContainer: {
        flex: 1,
    }
});
