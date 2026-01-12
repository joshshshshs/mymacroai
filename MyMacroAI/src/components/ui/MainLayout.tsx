import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Slot, useRouter, usePathname } from 'expo-router';

// Components
import { AppHeader } from './AppHeader';
import { GlassDockNav, TabItem } from './GlassDockNav';
import { OmniLoggerSheet } from '../features/input/OmniLoggerSheet';
import { haptics } from '@/src/utils/haptics';

interface MainLayoutProps {
    children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const pathname = usePathname();

    const [isOmniLoggerOpen, setIsOmniLoggerOpen] = useState(false);

    // Determine active tab index based on pathname
    // 0: dashboard (home), 1: kitchen (nutrition), 2: jarvis (center), 3: biology (health), 4: squad
    // This is a simplified mapping
    let activeIndex = 0;
    if (pathname.includes('/nutrition') || pathname.includes('/kitchen')) activeIndex = 1;
    else if (pathname.includes('/health') || pathname.includes('/biology')) activeIndex = 3;
    else if (pathname.includes('/squad')) activeIndex = 4;

    const handleTabPress = (index: number) => {
        haptics.selection();
        if (index === 0) router.push('/(tabs)/dashboard');
        else if (index === 1) router.push('/(tabs)/nutrition');
        // Index 2 is Jarvis, handled by Dock internal logic or callback? 
        // Wait, GlassDockNav usually handles center button specially if defined, 
        // or we handle it here if it emits the index.
        else if (index === 3) router.push('/(tabs)/health');
        else if (index === 4) router.push('/(tabs)/squad');
    };

    const handleJarvisPress = () => {
        setIsOmniLoggerOpen(true);
    };

    // Define Tabs with Jarvis in middle
    const tabs: TabItem[] = [
        { icon: 'home-outline', label: 'Home' },
        { icon: 'restaurant-outline', label: 'Kitchen' },
        { icon: 'mic', label: '', isJarvis: true }, // Special flag for Dock
        { icon: 'pulse-outline', label: 'Biology' },
        { icon: 'people-outline', label: 'Squad' },
    ];

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

            {/* Floating Dock */}
            <GlassDockNav
                tabs={tabs}
                activeIndex={activeIndex}
                onTabPress={handleTabPress}
                onJarvisPress={handleJarvisPress}
                jarvisState={isOmniLoggerOpen ? 'listening' : 'idle'}
            />

            {/* Global Omni Logger */}
            <OmniLoggerSheet
                visible={isOmniLoggerOpen}
                onClose={() => setIsOmniLoggerOpen(false)}
            />
        </View>
    );
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
