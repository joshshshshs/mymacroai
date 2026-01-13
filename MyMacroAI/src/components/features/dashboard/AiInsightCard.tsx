import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '@/src/components/ui/GlassCard';
import { haptics } from '@/src/utils/haptics';

export const AiInsightCard = () => {
    const handleApply = () => {
        haptics.success();
        console.log("Applied adjustment");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>AI Insight Card</Text>
            <GlassCard variant="frosted" intensity={35} style={styles.card}>
                <View style={styles.content}>
                    <Text style={styles.message}>
                        We reduced your deficit today because your <Text style={{ color: '#A78BFA', fontWeight: '700' }}>Sleep Debt</Text> is high.
                    </Text>

                    <TouchableOpacity
                        onPress={handleApply}
                        activeOpacity={0.8}
                        style={styles.button}
                    >
                        <View style={styles.buttonBg}>
                            <Text style={styles.buttonText}>Apply adjustment</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </GlassCard>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        marginBottom: 30,
    },
    sectionTitle: {
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        padding: 20,
    },
    content: {
        alignItems: 'center',
        gap: 16,
    },
    message: {
        color: '#E2E8F0',
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
    },
    button: {
        marginTop: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },
    buttonBg: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    buttonText: {
        color: '#F8FAFC',
        fontSize: 13,
        fontWeight: '600',
    }
});
