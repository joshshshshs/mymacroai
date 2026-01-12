import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JarvisMicButton, JarvisState } from './JarvisMicButton';
import { haptics } from '@/src/utils/haptics';

export interface TabItem {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    badge?: number;
    isJarvis?: boolean;
}

interface GlassDockNavProps {
    tabs: TabItem[];
    activeIndex: number;
    onTabPress: (index: number) => void;
    onJarvisPress?: () => void;
    jarvisState?: JarvisState;
}

export const GlassDockNav: React.FC<GlassDockNavProps> = ({
    tabs,
    activeIndex,
    onTabPress,
    onJarvisPress,
    jarvisState = 'idle'
}) => {
    const insets = useSafeAreaInsets();
    // Floating bottom offset
    const bottomOffset = 30;

    return (
        <View style={[styles.container, { bottom: bottomOffset, paddingBottom: 0 }]}>
            <BlurView intensity={80} tint="dark" style={styles.blur}>
                <View style={styles.tabsContainer}>
                    {tabs.map((tab, index) => {
                        // Special handling for Jarvis Button
                        if (tab.isJarvis) {
                            return (
                                <View key={index} style={styles.jarvisContainer}>
                                    <JarvisMicButton
                                        state={jarvisState}
                                        onPress={onJarvisPress || (() => { })}
                                        style={{ marginTop: -24 }} // Pull up slightly to break boundary
                                    />
                                </View>
                            );
                        }

                        const isActive = index === activeIndex;
                        const color = isActive ? '#A3E635' : 'rgba(255,255,255,0.5)';

                        return (
                            <TouchableOpacity
                                key={index}
                                style={styles.tab}
                                onPress={() => onTabPress(index)}
                            >
                                <View style={styles.iconContainer}>
                                    <Ionicons name={tab.icon} size={24} color={color} />
                                    {tab.badge && tab.badge > 0 && (
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>{tab.badge}</Text>
                                        </View>
                                    )}
                                </View>
                                {tab.label ? <Text style={[styles.label, { color }]}>{tab.label}</Text> : null}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Top Border */}
                <View style={styles.borderTop} />
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 20,
        right: 20,
        borderRadius: 36, // glass-radius + 4
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    blur: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 36,
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end', // Align bottom so pushing Jarvis up works
        paddingHorizontal: 8,
    },
    tab: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        height: 48,
        flex: 1,
    },
    jarvisContainer: {
        width: 60,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    label: {
        fontSize: 10,
        fontWeight: '500',
    },
    borderTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    iconContainer: {
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -8,
        backgroundColor: '#EF4444',
        borderRadius: 6,
        minWidth: 12,
        height: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    badgeText: {
        color: 'white',
        fontSize: 8,
        fontWeight: 'bold',
    },
});
