/**
 * ScanReviewModal - Review captured photos before processing
 * Allows retaking specific photos or proceeding to analysis
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScanStep } from './ScanGhostOverlay';

const { width } = Dimensions.get('window');

interface CapturedPhoto {
    uri: string;
    step: ScanStep;
    timestamp: number;
}

interface ScanReviewModalProps {
    visible: boolean;
    photos: CapturedPhoto[];
    onRetake: (step: ScanStep) => void;
    onProcess: () => void;
    onClose: () => void;
    processing?: boolean;
}

const STEP_LABELS: Record<ScanStep, string> = {
    FRONT: 'Front',
    SIDE: 'Side',
    BACK: 'Back',
};

export const ScanReviewModal: React.FC<ScanReviewModalProps> = ({
    visible,
    photos,
    onRetake,
    onProcess,
    onClose,
    processing = false,
}) => {
    const getPhotoByStep = (step: ScanStep) => {
        return photos.find(p => p.step === step);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <BlurView intensity={80} tint="dark" style={styles.backdrop}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Review Photos</Text>
                        <View style={styles.closeButton} />
                    </View>

                    {/* Subtitle */}
                    <Text style={styles.subtitle}>
                        Verify each angle is clear and properly positioned
                    </Text>

                    {/* Photo Grid */}
                    <View style={styles.photoGrid}>
                        {(['FRONT', 'SIDE', 'BACK'] as ScanStep[]).map((step) => {
                            const photo = getPhotoByStep(step);
                            return (
                                <View key={step} style={styles.photoContainer}>
                                    <View style={styles.photoCard}>
                                        {photo ? (
                                            <Image
                                                source={{ uri: photo.uri }}
                                                style={styles.photo}
                                            />
                                        ) : (
                                            <View style={styles.emptyPhoto}>
                                                <Ionicons name="image-outline" size={32} color="rgba(255,255,255,0.3)" />
                                            </View>
                                        )}

                                        {/* Retake button */}
                                        <TouchableOpacity
                                            style={styles.retakeButton}
                                            onPress={() => onRetake(step)}
                                        >
                                            <Ionicons name="refresh" size={16} color="#FFF" />
                                        </TouchableOpacity>

                                        {/* Check badge if photo exists */}
                                        {photo && (
                                            <View style={styles.checkBadge}>
                                                <Ionicons name="checkmark" size={12} color="#FFF" />
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.photoLabel}>{STEP_LABELS[step]}</Text>
                                </View>
                            );
                        })}
                    </View>

                    {/* Privacy Notice */}
                    <View style={styles.privacyNotice}>
                        <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                        <Text style={styles.privacyText}>
                            Photos are processed on-device. Only measurements are stored.
                        </Text>
                    </View>

                    {/* Process Button */}
                    <TouchableOpacity
                        style={[styles.processButton, processing && styles.processButtonDisabled]}
                        onPress={onProcess}
                        disabled={processing || photos.length < 3}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#FF4500', '#FF6B35']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.processGradient}
                        >
                            {processing ? (
                                <Text style={styles.processText}>Analyzing...</Text>
                            ) : (
                                <>
                                    <Ionicons name="sparkles" size={20} color="#FFF" />
                                    <Text style={styles.processText}>Process Scan</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </BlurView>
        </Modal>
    );
};

const PHOTO_WIDTH = (width - 80) / 3;

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: width - 40,
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        marginBottom: 24,
    },
    photoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    photoContainer: {
        alignItems: 'center',
    },
    photoCard: {
        width: PHOTO_WIDTH,
        height: PHOTO_WIDTH * 1.4,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 8,
    },
    photo: {
        width: '100%',
        height: '100%',
    },
    emptyPhoto: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    retakeButton: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkBadge: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
    },
    photoLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
    },
    privacyNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: 10,
        padding: 12,
        marginBottom: 20,
        gap: 10,
    },
    privacyText: {
        flex: 1,
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        lineHeight: 16,
    },
    processButton: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    processButtonDisabled: {
        opacity: 0.5,
    },
    processGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 10,
    },
    processText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },
});
