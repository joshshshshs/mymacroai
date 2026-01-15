/**
 * Body Scan Briefing Screen - Educational setup before camera
 * Establishes trust and ensures proper positioning
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { SPACING, RADIUS, SHADOWS, COLORS } from '@/src/design-system/tokens';

const { width, height } = Dimensions.get('window');

// Wireframe body icon component
const WireframeBody = () => (
    <Svg width={120} height={180} viewBox="0 0 120 180">
        <Defs>
            <SvgGradient id="wireGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#FF4500" stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#FF6B35" stopOpacity="0.4" />
            </SvgGradient>
        </Defs>
        <G stroke="url(#wireGradient)" strokeWidth="1.5" fill="none">
            {/* Head */}
            <Circle cx="60" cy="25" r="15" />
            {/* Neck */}
            <Path d="M60 40 L60 50" />
            {/* Shoulders */}
            <Path d="M35 55 L60 50 L85 55" />
            {/* Arms */}
            <Path d="M35 55 L25 85 L20 115" />
            <Path d="M85 55 L95 85 L100 115" />
            {/* Torso */}
            <Path d="M40 55 L40 105" />
            <Path d="M80 55 L80 105" />
            <Path d="M40 105 L80 105" />
            {/* Center line */}
            <Path d="M60 50 L60 105" strokeDasharray="4 2" />
            {/* Legs */}
            <Path d="M40 105 L35 145 L32 175" />
            <Path d="M80 105 L85 145 L88 175" />
            {/* Hip */}
            <Path d="M40 105 L60 110 L80 105" />
        </G>
    </Svg>
);

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

export default function BodyScanBriefingScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const handleStartSequence = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/(modals)/body-scan-capture' as any);
    };

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <SoftDreamyBackground />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="rgba(0,0,0,0.7)" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Body Composition Scan</Text>
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
                        <View style={styles.wireframeContainer}>
                            <View style={styles.wireframeGlow} />
                            <WireframeBody />
                        </View>
                        <Text style={styles.heroSubtitle}>
                            AI-Powered Body Analysis
                        </Text>
                    </Animated.View>

                    {/* Section Title */}
                    <Text style={styles.sectionTitle}>PROTOCOL CHECKLIST</Text>

                    {/* Checklist Cards */}
                    <View style={styles.checklistContainer}>
                        <ChecklistItem
                            icon="sunny"
                            iconColor="#F59E0B"
                            title="Light & Background"
                            description="Use consistent, even lighting. Stand against a plain wall or neutral background."
                            delay={200}
                        />
                        <ChecklistItem
                            icon="body"
                            iconColor="#3B82F6"
                            title="Clothing"
                            description="Wear tight-fitting activewear or underwear. Baggy clothes confuse the AI analysis."
                            delay={300}
                        />
                        <ChecklistItem
                            icon="resize"
                            iconColor="#10B981"
                            title="Positioning"
                            description="Place phone at waist height on a stable surface. Stand 2 meters (6 feet) back."
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
                                <Text style={styles.privacyTitle}>Privacy-First Processing</Text>
                                <Text style={styles.privacyDescription}>
                                    Images are processed locally on your device. Only mathematical wireframes and measurements are saved — never your photos.
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* What to Expect */}
                    <Animated.View entering={FadeInDown.delay(600).springify()}>
                        <View style={styles.expectCard}>
                            <Text style={styles.expectTitle}>What to Expect</Text>
                            <View style={styles.expectSteps}>
                                <View style={styles.expectStep}>
                                    <View style={styles.stepNumber}>
                                        <Text style={styles.stepNumberText}>1</Text>
                                    </View>
                                    <Text style={styles.stepText}>Front pose</Text>
                                </View>
                                <View style={styles.stepArrow}>
                                    <Ionicons name="chevron-forward" size={16} color="rgba(0,0,0,0.3)" />
                                </View>
                                <View style={styles.expectStep}>
                                    <View style={styles.stepNumber}>
                                        <Text style={styles.stepNumberText}>2</Text>
                                    </View>
                                    <Text style={styles.stepText}>Side pose</Text>
                                </View>
                                <View style={styles.stepArrow}>
                                    <Ionicons name="chevron-forward" size={16} color="rgba(0,0,0,0.3)" />
                                </View>
                                <View style={styles.expectStep}>
                                    <View style={styles.stepNumber}>
                                        <Text style={styles.stepNumberText}>3</Text>
                                    </View>
                                    <Text style={styles.stepText}>Back pose</Text>
                                </View>
                            </View>
                            <Text style={styles.expectNote}>
                                5-second countdown timer allows you to get into position
                            </Text>
                        </View>
                    </Animated.View>
                </ScrollView>

                {/* Bottom Action */}
                <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 16 }]}>
                    <TouchableOpacity
                        style={styles.startButton}
                        onPress={handleStartSequence}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={['#FF4500', '#FF6B35']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.startGradient}
                        >
                            <Ionicons name="camera" size={22} color="#FFF" />
                            <Text style={styles.startText}>I'm Ready — Start Sequence</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

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
    wireframeContainer: {
        width: 160,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    wireframeGlow: {
        position: 'absolute',
        width: 120,
        height: 180,
        backgroundColor: 'rgba(255, 69, 0, 0.1)',
        borderRadius: 60,
        transform: [{ scaleX: 0.8 }],
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
    expectCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.9)',
        ...SHADOWS.soft,
    },
    expectTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
        textAlign: 'center',
    },
    expectSteps: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    expectStep: {
        alignItems: 'center',
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FF4500',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    stepNumberText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFF',
    },
    stepText: {
        fontSize: 11,
        fontWeight: '500',
        color: 'rgba(0, 0, 0, 0.6)',
    },
    stepArrow: {
        marginHorizontal: 16,
        marginBottom: 20,
    },
    expectNote: {
        fontSize: 11,
        color: 'rgba(0, 0, 0, 0.4)',
        textAlign: 'center',
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
    startButton: {
        borderRadius: 16,
        overflow: 'hidden',
        ...SHADOWS.md,
    },
    startGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 12,
    },
    startText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFF',
    },
});
