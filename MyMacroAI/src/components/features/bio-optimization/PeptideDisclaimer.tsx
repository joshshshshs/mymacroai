/**
 * PeptideDisclaimer - Full-screen glassmorphic disclaimer modal
 * Must be acknowledged before accessing bio-optimization settings
 * Supports both light and dark mode
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { SPACING, SHADOWS } from '@/src/design-system/tokens';

// Checklist item component
interface ChecklistItemProps {
    icon: string;
    iconColor: string;
    title: string;
    description: string;
    delay: number;
    isDark: boolean;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ icon, iconColor, title, description, delay, isDark }) => (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
        <View style={[
            styles.checklistItem,
            {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.8)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
            }
        ]}>
            <View style={[styles.checklistIcon, { backgroundColor: `${iconColor}20` }]}>
                <Ionicons name={icon as any} size={22} color={iconColor} />
            </View>
            <View style={styles.checklistContent}>
                <Text style={[styles.checklistTitle, { color: isDark ? '#FFFFFF' : '#1F2937' }]}>
                    {title}
                </Text>
                <Text style={[styles.checklistDescription, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0, 0, 0, 0.5)' }]}>
                    {description}
                </Text>
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
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = {
        bg: isDark ? '#0A0A0C' : '#F8F9FA',
        text: isDark ? '#FFFFFF' : '#1F2937',
        textSecondary: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0, 0, 0, 0.5)',
        textTertiary: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0, 0, 0, 0.4)',
        card: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.8)',
        cardBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.9)',
        bottomBg: isDark ? 'rgba(10, 10, 12, 0.95)' : 'rgba(248, 249, 250, 0.95)',
        privacyBg: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
        privacyBorder: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)',
        privacyTitle: isDark ? '#34D399' : '#065F46',
    };

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
            <View style={[styles.container, { backgroundColor: colors.bg }]}>
                {/* Background gradient */}
                {isDark ? (
                    <LinearGradient
                        colors={['#0A0A0C', '#1A1A1E', '#0A0A0C']}
                        style={StyleSheet.absoluteFill}
                    />
                ) : (
                    <LinearGradient
                        colors={['#FFF5F0', '#F8F9FA', '#FFFFFF']}
                        style={StyleSheet.absoluteFill}
                    />
                )}

                {/* Header with proper safe area */}
                <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                    <TouchableOpacity onPress={handleDecline} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Bio-Optimization</Text>
                    <View style={styles.backButton} />
                </View>

                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 160 }]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero Visual */}
                    <Animated.View
                        entering={FadeInDown.delay(100).springify()}
                        style={styles.heroContainer}
                    >
                        <View style={styles.iconContainer}>
                            <View style={[styles.iconGlow, { backgroundColor: isDark ? 'rgba(255, 92, 0, 0.25)' : 'rgba(255, 92, 0, 0.15)' }]} />
                            <Ionicons name="flask" size={64} color="#FF5C00" />
                        </View>
                        <Text style={[styles.heroTitle, { color: colors.text }]}>
                            Peptide Protocol Tracking
                        </Text>
                        <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                            Harm Reduction & Education
                        </Text>
                    </Animated.View>

                    {/* Section Title */}
                    <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
                        IMPORTANT INFORMATION
                    </Text>

                    {/* Checklist Cards */}
                    <View style={styles.checklistContainer}>
                        <ChecklistItem
                            icon="school"
                            iconColor="#F59E0B"
                            title="Educational Only"
                            description="This feature provides general educational information. MyMacro AI is not a medical advisor and cannot prescribe or recommend treatments."
                            delay={200}
                            isDark={isDark}
                        />
                        <ChecklistItem
                            icon="medkit"
                            iconColor="#3B82F6"
                            title="Consult Professionals"
                            description="Always consult qualified healthcare professionals before starting, modifying, or stopping any supplementation protocol."
                            delay={300}
                            isDark={isDark}
                        />
                        <ChecklistItem
                            icon="warning"
                            iconColor="#EF4444"
                            title="Your Responsibility"
                            description="You acknowledge that you are solely responsible for any decisions made based on information provided by this app."
                            delay={400}
                            isDark={isDark}
                        />
                    </View>

                    {/* Privacy Seal */}
                    <Animated.View entering={FadeInDown.delay(500).springify()}>
                        <View style={[
                            styles.privacySeal,
                            {
                                backgroundColor: colors.privacyBg,
                                borderColor: colors.privacyBorder,
                            }
                        ]}>
                            <View style={styles.privacyIconContainer}>
                                <View style={[styles.shieldIcon, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.15)' }]}>
                                    <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                                </View>
                            </View>
                            <View style={styles.privacyContent}>
                                <Text style={[styles.privacyTitle, { color: colors.privacyTitle }]}>
                                    Privacy-First Storage
                                </Text>
                                <Text style={[styles.privacyDescription, { color: colors.textSecondary }]}>
                                    Your compound data is stored locally on your device using encrypted storage.
                                    It is never uploaded to our servers or shared with third parties.
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Legal Disclaimer Card */}
                    <Animated.View entering={FadeInDown.delay(600).springify()}>
                        <View style={[
                            styles.legalCard,
                            {
                                backgroundColor: colors.card,
                                borderColor: colors.cardBorder,
                            }
                        ]}>
                            <Text style={[styles.legalTitle, { color: colors.text }]}>
                                Legal Disclaimer
                            </Text>
                            <Text style={[styles.legalText, { color: colors.textSecondary }]}>
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
                <View style={[
                    styles.bottomContainer,
                    {
                        paddingBottom: insets.bottom + 16,
                        backgroundColor: colors.bottomBg,
                    }
                ]}>
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
                        <Text style={[styles.declineText, { color: colors.textSecondary }]}>
                            Go Back
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
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
        borderRadius: 50,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '800',
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
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
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
        marginBottom: 4,
    },
    checklistDescription: {
        fontSize: 13,
        lineHeight: 18,
    },
    privacySeal: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
    },
    privacyIconContainer: {
        marginRight: 14,
    },
    shieldIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    privacyContent: {
        flex: 1,
    },
    privacyTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    privacyDescription: {
        fontSize: 12,
        lineHeight: 16,
    },
    legalCard: {
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        ...SHADOWS.soft,
    },
    legalTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 12,
    },
    legalText: {
        fontSize: 12,
        lineHeight: 18,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 16,
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
    },
});

export default PeptideDisclaimer;
