import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { GlassCard } from './GlassCard';
import { haptics } from '@/src/utils/haptics';

export const AppHeader: React.FC = () => {
    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });

    return (
        <View style={styles.container}>
            {/* Left: Date + Cycle Phase */}
            <View style={styles.leftContainer}>
                <Text style={styles.dateText}>{currentDate.toUpperCase()}</Text>
                <View style={styles.divider} />
                <View style={styles.phaseContainer}>
                    <View style={styles.phaseDot} />
                    <Text style={styles.phaseText}>Luteal</Text>
                </View>
            </View>

            {/* Right: Coins + Avatar */}
            <View style={styles.rightContainer}>
                <TouchableOpacity onPress={() => haptics.light()} activeOpacity={0.8}>
                    <GlassCard style={styles.coinPill} intensity={30}>
                        <Text style={styles.coinText}>🪙 150</Text>
                    </GlassCard>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => haptics.light()} style={styles.avatarContainer}>
                    {/* Placeholder Avatar */}
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>JK</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        zIndex: 50,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dateText: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    divider: {
        width: 1,
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    phaseContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    phaseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#F472B6', // Pink for Luteal
        shadowColor: '#F472B6',
        shadowOpacity: 0.6,
        shadowRadius: 4,
    },
    phaseText: {
        color: '#F1F5F9', // White
        fontSize: 12,
        fontWeight: '500',
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    coinPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
    },
    coinText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FCD34D', // Amber 300
    },
    avatarContainer: {
        shadowColor: 'black',
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1E293B',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    avatarText: {
        color: '#F1F5F9',
        fontWeight: '600',
        fontSize: 12,
    },
});
