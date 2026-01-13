import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SoftStreakHub } from '@/src/components/features/gamification/SoftStreakHub';
import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { ThemedText } from '@/src/components/ui/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

export default function StreakModalScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
            <SoftDreamyBackground />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Modal Header */}
                <View style={styles.header}>
                    <ThemedText variant="h2" style={{ color: '#FFF' }}>Daily Challenges</ThemedText>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={styles.closeButton}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                        <Ionicons name="close" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <SoftStreakHub />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFF',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
