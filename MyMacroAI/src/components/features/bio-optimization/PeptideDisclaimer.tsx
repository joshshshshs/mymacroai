/**
 * PeptideDisclaimer - Full-screen glassmorphic disclaimer modal
 * Must be acknowledged before accessing bio-optimization settings
 *
 * Pattern Reference: body-scan-briefing.tsx
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { SPACING, SHADOWS } from '@/src/design-system/tokens';

const { width } = Dimensions.get('window');

// Checklist item component
interface ChecklistItemProps {
    icon: string;
    iconColor: string;
    title: string;
    description: string;
    delay: number;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ icon, iconColor, title, description, delay }) => (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
        <View style={styles.checklistItem}>
            <View style={[styles.checklistIcon, { backgroundColor: `${iconColor}20` }]}>
                <Ionicons name={icon as any} size={22} color={iconColor} />
            </View>
            <View style={styles.checklistContent}>
                <Text style={styles.checklistTitle}>{title}</Text>
                <Text style={styles.checklistDescription}>{description}</Text>
            </View>
        </View>
    </Animated.View>
);

interface PeptideDisclaimerProps {
    visible: boolean;
    onAccept: () => void;
    onDecline: () => void;
}

export const PeptideDisclaimer: React.FC<PeptideDisclaimerProps> = ({
    visible,
    onAccept,
    onDecline,
}) => {
    const insets = useSafeAreaInsets();

    const handleAccept = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onAccept();
    };

    const handleDecline = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onDecline();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={onDecline}
        >
            <View style={styles.container}>
                <SoftDreamyBackground />

                <SafeAreaView style={styles.safeArea} edges={['top']}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleDecline} style={styles.backButton}>
                            <Ionicons name="chevron-back" size={24} color="rgba(0,0,0,0.7)" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Bio-Optimization</Text>
                        <View style={styles.backButton} />
                    </View>

                    <ScrollView
                        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Hero Visual */}
                        <Animated.View
                            entering={FadeInDown.delay(100).springify()}
                            style={styles.heroContainer}
                        >
                            <View style={styles.iconContainer}>
                                <View style={styles.iconGlow} />
                                <Ionicons name="flask" size={64} color="#FF5C00" />
                            </View>
                            <Text style={styles.heroTitle}>Peptide Protocol Tracking</Text>
                            <Text style={styles.heroSubtitle}>
                                Harm Reduction & Education
                            </Text>
                        </Animated.View>

                        {/* Section Title */}
                        <Text style={styles.sectionTitle}>IMPORTANT INFORMATION</Text>

                        {/* Checklist Cards */}
                        <View style={styles.checklistContainer}>
                            <ChecklistItem
                                icon="school"
                                iconColor="#F59E0B"
                                title="Educational Only"
                                description="This feature provides general educational information. MyMacro AI is not a medical advisor and cannot prescribe or recommend treatments."
                                delay={200}
                            />
                            <ChecklistItem
                                icon="medkit"
                                iconColor="#3B82F6"
                                title="Consult Professionals"
                                description="Always consult qualified healthcare professionals before starting, modifying, or stopping any supplementation protocol."
                                delay={300}
                            />
                            <ChecklistItem
                                icon="warning"
                                iconColor="#EF4444"
                                title="Your Responsibility"
                                description="You acknowledge that you are solely responsible for any decisions made based on information provided by this app."
                                delay={400}
                            />
                        </View>

                        {/* Privacy Seal */}
                        <Animated.View entering={FadeInDown.delay(500).springify()}>
                            <View style={styles.privacySeal}>
                                <View style={styles.privacyIconContainer}>
                                    <View style={styles.shieldIcon}>
                                        <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                                    </View>
                                </View>
                                <View style={styles.privacyContent}>
                                    <Text style={styles.privacyTitle}>Privacy-First Storage</Text>
                                    <Text style={styles.privacyDescription}>
                                        Your compound data is stored locally on your device using encrypted storage.
                                        It is never uploaded to our servers or shared with third parties.
                                    </Text>
                                </View>
                            </View>
                        </Animated.View>

                        {/* Legal Disclaimer Card */}
                        <Animated.View entering={FadeInDown.delay(600).springify()}>
                            <View style={styles.legalCard}>
                                <Text style={styles.legalTitle}>Legal Disclaimer</Text>
                                <Text style={styles.legalText}>
                                    MyMacro AI provides general educational information only. The information
                                    provided is not intended as medical advice, diagnosis, or treatment. The AI
                                    acts as a research librarian, providing information from published literature
                                    — not as a medical professional. Peptides and research compounds may be
                                    regulated differently in your region. By proceeding, you acknowledge that
                                    you have read and understood this disclaimer.
                                </Text>
                            </View>
                        </Animated.View>
                    </ScrollView>

                    {/* Bottom Action */}
                    <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}>
                        <TouchableOpacity
                            style={styles.acceptButton}
                            onPress={handleAccept}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={['#FF4500', '#FF6B35']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.acceptGradient}
                            >
                                <Ionicons name="checkmark-circle" size={22} color="#FFF" />
                                <Text style={styles.acceptText}>I Understand & Accept</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.declineButton}
                            onPress={handleDecline}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.declineText}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1F2937',
    },
    scrollContent: {
        paddingHorizontal: 20,
    },
    heroContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 32,
    },
    iconContainer: {
        width: 120,
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    iconGlow: {
        position: 'absolute',
        width: 100,
        height: 100,
        backgroundColor: 'rgba(255, 92, 0, 0.15)',
        borderRadius: 50,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(0, 0, 0, 0.5)',
        letterSpacing: 0.5,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '800',
        color: 'rgba(0, 0, 0, 0.4)',
        letterSpacing: 1.5,
        marginBottom: 16,
        marginLeft: 4,
    },
    checklistContainer: {
        gap: 12,
        marginBottom: 24,
    },
    checklistItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.9)',
        ...SHADOWS.soft,
    },
    checklistIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    checklistContent: {
        flex: 1,
    },
    checklistTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 4,
    },
    checklistDescription: {
        fontSize: 13,
        color: 'rgba(0, 0, 0, 0.5)',
        lineHeight: 18,
    },
    privacySeal: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    privacyIconContainer: {
        marginRight: 14,
    },
    shieldIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    privacyContent: {
        flex: 1,
    },
    privacyTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#065F46',
        marginBottom: 4,
    },
    privacyDescription: {
        fontSize: 12,
        color: 'rgba(0, 0, 0, 0.5)',
        lineHeight: 16,
    },
    legalCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.9)',
        ...SHADOWS.soft,
    },
    legalTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 12,
    },
    legalText: {
        fontSize: 12,
        color: 'rgba(0, 0, 0, 0.6)',
        lineHeight: 18,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 16,
        backgroundColor: 'rgba(248, 249, 250, 0.95)',
    },
    acceptButton: {
        borderRadius: 16,
        overflow: 'hidden',
        ...SHADOWS.md,
        marginBottom: 12,
    },
    acceptGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 12,
    },
    acceptText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFF',
    },
    declineButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    declineText: {
        fontSize: 15,
        fontWeight: '600',
        color: 'rgba(0, 0, 0, 0.5)',
    },
});

export default PeptideDisclaimer;
