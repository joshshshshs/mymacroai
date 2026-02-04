/**
 * WireframeScan - AI Analysis Display Component
 * Features:
 * - Wireframe grid overlay on captured photo
 * - Metric extraction cards (Body Fat, Waist-to-Hip, Lean Mass)
 * - Privacy badge
 * - Share/export actions
 */

import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withDelay,
    FadeIn,
    SlideInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WireframeScanProps {
    photoUri: string;
    onClose: () => void;
    onShare: () => void;
    dayNumber?: number;
}

// Mock AI analysis results
const MOCK_METRICS = {
    bodyFat: { value: '12-15', unit: '%', label: 'Body Fat Range' },
    waistToHip: { value: '0.82', unit: '', label: 'Waist-to-Hip' },
    leanMass: { value: '+1.2', unit: 'kg', label: 'Lean Mass Δ' },
};

export const WireframeScan: React.FC<WireframeScanProps> = ({
    photoUri,
    onClose,
    onShare,
    dayNumber = 42,
}) => {
    const scanLineY = useSharedValue(-100);
    const analyzeProgress = useSharedValue(0);

    useEffect(() => {
        // Simulate scanning animation
        scanLineY.value = withSequence(
            withTiming(500, { duration: 1500 }),
            withTiming(-100, { duration: 0 })
        );

        analyzeProgress.value = withDelay(
            1500,
            withTiming(1, { duration: 800 })
        );

        // Haptic feedback when analysis complete
        setTimeout(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 2300);
    }, []);

    const scanLineStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scanLineY.value }],
    }));

    const handleExport = () => {
        Alert.alert(
            'Export Photo',
            `Photo will be exported with watermark:\n"MyMacro AI - Day ${dayNumber}"`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Export',
                    onPress: () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        Alert.alert('Exported!', 'Photo saved to gallery with watermark.');
                    }
                },
            ]
        );
    };

    const handleSquadShare = () => {
        Alert.alert(
            'Squad Share',
            'Share WIREFRAME ONLY with your Squad?\nYour identity remains private.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Share Wireframe',
                    onPress: () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        onShare();
                    }
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.headerBadge}>
                    <Ionicons name="scan-outline" size={14} color="#FF4500" />
                    <Text style={styles.headerBadgeText}>AI ANALYSIS</Text>
                </View>
            </View>

            {/* Photo with wireframe overlay */}
            <View style={styles.photoContainer}>
                <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />

                {/* Wireframe Grid Overlay */}
                <View style={styles.wireframeOverlay}>
                    {/* Horizontal lines */}
                    {[...Array(10)].map((_, i) => (
                        <View
                            key={`h-${i}`}
                            style={[
                                styles.gridLine,
                                styles.gridLineHorizontal,
                                { top: `${(i + 1) * 10}%` }
                            ]}
                        />
                    ))}
                    {/* Vertical lines */}
                    {[...Array(6)].map((_, i) => (
                        <View
                            key={`v-${i}`}
                            style={[
                                styles.gridLine,
                                styles.gridLineVertical,
                                { left: `${(i + 1) * 16.66}%` }
                            ]}
                        />
                    ))}

                    {/* Body outline points */}
                    <View style={[styles.outlinePoint, { top: '15%', left: '50%' }]} />
                    <View style={[styles.outlinePoint, { top: '25%', left: '35%' }]} />
                    <View style={[styles.outlinePoint, { top: '25%', left: '65%' }]} />
                    <View style={[styles.outlinePoint, { top: '45%', left: '50%' }]} />
                    <View style={[styles.outlinePoint, { top: '70%', left: '40%' }]} />
                    <View style={[styles.outlinePoint, { top: '70%', left: '60%' }]} />
                </View>

                {/* Scan Line Animation */}
                <Animated.View style={[styles.scanLine, scanLineStyle]}>
                    <LinearGradient
                        colors={['transparent', 'rgba(255, 69, 0, 0.6)', 'transparent']}
                        style={styles.scanLineGradient}
                    />
                </Animated.View>

                {/* Watermark Preview */}
                <View style={styles.watermark}>
                    <Text style={styles.watermarkText}>MyMacro AI - Day {dayNumber}</Text>
                </View>
            </View>

            {/* Metrics Grid */}
            <Animated.View
                entering={SlideInUp.delay(2000).duration(600)}
                style={styles.metricsContainer}
            >
                <Text style={styles.metricsTitle}>Analysis Results</Text>

                <View style={styles.metricsGrid}>
                    {Object.entries(MOCK_METRICS).map(([key, metric]) => (
                        <View key={key} style={styles.metricCard}>
                            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                            <Text style={styles.metricLabel}>{metric.label}</Text>
                            <Text style={styles.metricValue}>
                                {metric.value}
                                <Text style={styles.metricUnit}>{metric.unit}</Text>
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Privacy Badge */}
                <View style={styles.privacyBadge}>
                    <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                    <Text style={styles.privacyText}>
                        Raw photos stored locally. AI only sees wireframe.
                    </Text>
                </View>
            </Animated.View>

            {/* Action Buttons */}
            <Animated.View
                entering={FadeIn.delay(2500).duration(400)}
                style={styles.actions}
            >
                <TouchableOpacity style={styles.actionButton} onPress={handleSquadShare}>
                    <BlurView intensity={40} tint="light" style={styles.actionButtonBlur}>
                        <Ionicons name="people-outline" size={20} color="#333" />
                        <Text style={styles.actionButtonText}>Squad Share</Text>
                    </BlurView>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButtonPrimary} onPress={handleExport}>
                    <LinearGradient colors={['#FF4500', '#FF6A00']} style={styles.actionButtonGradient}>
                        <Ionicons name="download-outline" size={20} color="#FFF" />
                        <Text style={styles.actionButtonTextPrimary}>Export</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(255, 69, 0, 0.15)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 69, 0, 0.3)',
    },
    headerBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#FF4500',
        letterSpacing: 1,
    },
    photoContainer: {
        height: 400,
        marginHorizontal: 16,
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    wireframeOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    gridLine: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 69, 0, 0.2)',
    },
    gridLineHorizontal: {
        left: 0,
        right: 0,
        height: 1,
    },
    gridLineVertical: {
        top: 0,
        bottom: 0,
        width: 1,
    },
    outlinePoint: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FF4500',
        marginLeft: -6,
        marginTop: -6,
        shadowColor: '#FF4500',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
    },
    scanLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 80,
    },
    scanLineGradient: {
        flex: 1,
    },
    watermark: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 8,
    },
    watermarkText: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.8)',
        letterSpacing: 0.5,
    },
    metricsContainer: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    metricsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 12,
    },
    metricsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    metricCard: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.5)',
        letterSpacing: 0.5,
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    metricValue: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFF',
    },
    metricUnit: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.6)',
    },
    privacyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    privacyText: {
        flex: 1,
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    actionButton: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        overflow: 'hidden',
    },
    actionButtonBlur: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },
    actionButtonPrimary: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        overflow: 'hidden',
    },
    actionButtonGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    actionButtonTextPrimary: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
});
