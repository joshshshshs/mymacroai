/**
 * Add Friend Modal - Add friends via code, QR scan, or share your QR
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useColorScheme,
    TextInput,
    Alert,
    Share,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeInUp, SlideInRight, SlideInLeft } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { CameraView, useCameraPermissions } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';

import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { SPACING } from '@/src/design-system/tokens';
import { useUserStore } from '@/src/store/UserStore';
import { referralService } from '@/src/services/social/ReferralService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const QR_SIZE = Math.min(SCREEN_WIDTH * 0.55, 220);

type TabType = 'code' | 'scan' | 'myqr';

export default function AddFriendModal() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const user = useUserStore((state) => state.user);

    const [activeTab, setActiveTab] = useState<TabType>('code');
    const [friendCode, setFriendCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

    const colors = {
        bg: isDark ? '#0A0A0C' : '#F8F9FA',
        card: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
        cardAlt: isDark ? 'rgba(255,255,255,0.03)' : '#F3F4F6',
        text: isDark ? '#FFFFFF' : '#000000',
        textSecondary: isDark ? 'rgba(255,255,255,0.6)' : '#6B7280',
        accent: '#FF5C00',
        success: '#10B981',
        error: '#EF4444',
        border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        inputBg: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
        tabActive: isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF',
        tabInactive: 'transparent',
    };

    const myCode = referralService.getReferralCode(user?.name || 'User', user?.id || 'user_id');

    const handleAddFriend = async (code?: string) => {
        const codeToUse = code || friendCode.trim();
        if (!codeToUse) {
            Alert.alert('Enter Code', 'Please enter your friend\'s code');
            return;
        }

        setIsLoading(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            const result = await referralService.addFriend(codeToUse);

            if (result.success && result.friend) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                    'Friend Added! 🎉',
                    `${result.friend.name} has been added to your friends list.`,
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            } else {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Could Not Add Friend', result.error || 'Please check the code and try again.');
                setScanned(false);
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
            setScanned(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyCode = async () => {
        await Clipboard.setStringAsync(myCode.code);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        try {
            const message = referralService.getShareMessage(myCode.code, user?.name || 'User');
            await Share.share({
                message,
                title: 'Add me on MyMacro AI!',
            });
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {
            console.error('Share failed:', error);
        }
    };

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (scanned) return;
        setScanned(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Check if it's a MyMacro friend code
        if (data.includes('mymacro://friend/') || data.match(/^[a-zA-Z]+-[A-Z0-9]{4}$/)) {
            const code = data.includes('mymacro://')
                ? data.split('mymacro://friend/')[1]
                : data;
            handleAddFriend(code);
        } else {
            Alert.alert(
                'Invalid QR Code',
                'This doesn\'t appear to be a MyMacro friend code.',
                [{ text: 'Try Again', onPress: () => setScanned(false) }]
            );
        }
    };

    const handleTabChange = (tab: TabType) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setActiveTab(tab);
        if (tab === 'scan') {
            setScanned(false);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'code':
                return (
                    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
                        {/* Add by Code Section */}
                        <View style={[styles.section, { backgroundColor: colors.card }]}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: `${colors.accent}15` }]}>
                                    <Ionicons name="keypad" size={20} color={colors.accent} />
                                </View>
                                <View style={styles.sectionText}>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Enter Friend Code</Text>
                                    <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                                        Type your friend's unique code
                                    </Text>
                                </View>
                            </View>

                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.cardAlt,
                                        color: colors.text,
                                        borderColor: colors.border,
                                    },
                                ]}
                                placeholder="e.g., sarah-A7K2"
                                placeholderTextColor={colors.textSecondary}
                                value={friendCode}
                                onChangeText={setFriendCode}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />

                            <TouchableOpacity
                                style={[styles.addButton, { opacity: isLoading ? 0.7 : 1 }]}
                                onPress={() => handleAddFriend()}
                                disabled={isLoading}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#FF5C00', '#FF8A00']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.addButtonGradient}
                                >
                                    <Ionicons name="person-add" size={18} color="#FFF" />
                                    <Text style={styles.addButtonText}>
                                        {isLoading ? 'Adding...' : 'Add Friend'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>

                        {/* Your Code Section */}
                        <View style={[styles.section, { backgroundColor: colors.card, marginTop: 16 }]}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: `${colors.success}15` }]}>
                                    <Ionicons name="share-social" size={20} color={colors.success} />
                                </View>
                                <View style={styles.sectionText}>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Code</Text>
                                    <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                                        Share with friends
                                    </Text>
                                </View>
                            </View>

                            <View style={[styles.codeBox, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
                                <Text style={[styles.codeText, { color: colors.text }]}>{myCode.code}</Text>
                                <TouchableOpacity
                                    style={[styles.copyButton, { backgroundColor: colors.card }]}
                                    onPress={handleCopyCode}
                                >
                                    <Ionicons
                                        name={copied ? 'checkmark' : 'copy-outline'}
                                        size={18}
                                        color={copied ? colors.success : colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={[styles.shareButton, { borderColor: colors.accent }]}
                                onPress={handleShare}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="share-outline" size={18} color={colors.accent} />
                                <Text style={[styles.shareButtonText, { color: colors.accent }]}>Share Link</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                );

            case 'scan':
                return (
                    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
                        <View style={[styles.scanSection, { backgroundColor: colors.card }]}>
                            {!permission?.granted ? (
                                <View style={styles.permissionContainer}>
                                    <View style={[styles.permissionIcon, { backgroundColor: `${colors.accent}15` }]}>
                                        <Ionicons name="camera" size={32} color={colors.accent} />
                                    </View>
                                    <Text style={[styles.permissionTitle, { color: colors.text }]}>
                                        Camera Access Needed
                                    </Text>
                                    <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
                                        To scan QR codes, we need access to your camera
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.permissionButton}
                                        onPress={requestPermission}
                                    >
                                        <LinearGradient
                                            colors={['#FF5C00', '#FF8A00']}
                                            style={styles.permissionButtonGradient}
                                        >
                                            <Text style={styles.permissionButtonText}>Enable Camera</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.cameraContainer}>
                                    <View style={styles.cameraWrapper}>
                                        <CameraView
                                            style={styles.camera}
                                            facing="back"
                                            barcodeScannerSettings={{
                                                barcodeTypes: ['qr'],
                                            }}
                                            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                                        />
                                        {/* Scan overlay */}
                                        <View style={styles.scanOverlay}>
                                            <View style={[styles.scanCorner, styles.topLeft]} />
                                            <View style={[styles.scanCorner, styles.topRight]} />
                                            <View style={[styles.scanCorner, styles.bottomLeft]} />
                                            <View style={[styles.scanCorner, styles.bottomRight]} />
                                        </View>
                                    </View>
                                    <Text style={[styles.scanHint, { color: colors.textSecondary }]}>
                                        Point at a friend's QR code to add them
                                    </Text>
                                    {scanned && (
                                        <TouchableOpacity
                                            style={[styles.rescanButton, { backgroundColor: colors.cardAlt }]}
                                            onPress={() => setScanned(false)}
                                        >
                                            <Ionicons name="refresh" size={18} color={colors.text} />
                                            <Text style={[styles.rescanText, { color: colors.text }]}>Scan Again</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>
                    </Animated.View>
                );

            case 'myqr':
                return (
                    <Animated.View entering={FadeIn.duration(300)} style={styles.tabContent}>
                        <View style={[styles.qrSection, { backgroundColor: colors.card }]}>
                            <View style={styles.qrContainer}>
                                <View style={styles.qrWrapper}>
                                    <QRCode
                                        value={`mymacro://friend/${myCode.code}`}
                                        size={QR_SIZE}
                                        backgroundColor="white"
                                        color="#000000"
                                        logo={undefined}
                                    />
                                </View>
                                <Text style={[styles.qrCode, { color: colors.text }]}>{myCode.code}</Text>
                                <Text style={[styles.qrHint, { color: colors.textSecondary }]}>
                                    Friends can scan this to add you instantly
                                </Text>
                            </View>

                            <View style={styles.qrActions}>
                                <TouchableOpacity
                                    style={[styles.qrActionButton, { backgroundColor: colors.cardAlt }]}
                                    onPress={handleCopyCode}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons
                                        name={copied ? 'checkmark-circle' : 'copy-outline'}
                                        size={20}
                                        color={copied ? colors.success : colors.text}
                                    />
                                    <Text style={[styles.qrActionText, { color: colors.text }]}>
                                        {copied ? 'Copied!' : 'Copy Code'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.qrActionButton, { backgroundColor: colors.cardAlt }]}
                                    onPress={handleShare}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="share-outline" size={20} color={colors.text} />
                                    <Text style={[styles.qrActionText, { color: colors.text }]}>Share</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>
                );
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <SoftDreamyBackground />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={[styles.backButton, { backgroundColor: colors.card }]}
                    >
                        <Ionicons name="close" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Add Friend</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Tab Bar */}
                <View style={[styles.tabBar, { backgroundColor: colors.cardAlt }]}>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === 'code' && [styles.tabActive, { backgroundColor: colors.tabActive }]
                        ]}
                        onPress={() => handleTabChange('code')}
                    >
                        <Ionicons
                            name="keypad"
                            size={18}
                            color={activeTab === 'code' ? colors.accent : colors.textSecondary}
                        />
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === 'code' ? colors.accent : colors.textSecondary }
                        ]}>
                            Code
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === 'scan' && [styles.tabActive, { backgroundColor: colors.tabActive }]
                        ]}
                        onPress={() => handleTabChange('scan')}
                    >
                        <Ionicons
                            name="scan"
                            size={18}
                            color={activeTab === 'scan' ? colors.accent : colors.textSecondary}
                        />
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === 'scan' ? colors.accent : colors.textSecondary }
                        ]}>
                            Scan
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === 'myqr' && [styles.tabActive, { backgroundColor: colors.tabActive }]
                        ]}
                        onPress={() => handleTabChange('myqr')}
                    >
                        <Ionicons
                            name="qr-code"
                            size={18}
                            color={activeTab === 'myqr' ? colors.accent : colors.textSecondary}
                        />
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === 'myqr' ? colors.accent : colors.textSecondary }
                        ]}>
                            My QR
                        </Text>
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    {renderTabContent()}
                </KeyboardAvoidingView>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    tabBar: {
        flexDirection: 'row',
        marginHorizontal: SPACING.lg,
        borderRadius: 14,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
    },
    tabActive: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    keyboardView: {
        flex: 1,
        paddingTop: SPACING.lg,
    },
    tabContent: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
    },
    section: {
        borderRadius: 20,
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 16,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionText: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    sectionSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    input: {
        height: 52,
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        fontWeight: '500',
        borderWidth: 1,
        marginBottom: 14,
    },
    addButton: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    addButtonGradient: {
        flexDirection: 'row',
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    codeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 52,
        borderRadius: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        marginBottom: 14,
    },
    codeText: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
    },
    copyButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shareButton: {
        flexDirection: 'row',
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 2,
    },
    shareButtonText: {
        fontSize: 15,
        fontWeight: '700',
    },
    // Scan tab styles
    scanSection: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
    },
    permissionContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    permissionIcon: {
        width: 72,
        height: 72,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    permissionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    permissionText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
    },
    permissionButton: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    permissionButtonGradient: {
        paddingVertical: 14,
        paddingHorizontal: 32,
    },
    permissionButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    cameraContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 24,
        paddingBottom: 20,
    },
    cameraWrapper: {
        width: SCREEN_WIDTH - 80,
        height: SCREEN_WIDTH - 80,
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
    },
    camera: {
        flex: 1,
    },
    scanOverlay: {
        ...StyleSheet.absoluteFillObject,
        padding: 40,
    },
    scanCorner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#FF5C00',
    },
    topLeft: {
        top: 40,
        left: 40,
        borderTopWidth: 3,
        borderLeftWidth: 3,
        borderTopLeftRadius: 8,
    },
    topRight: {
        top: 40,
        right: 40,
        borderTopWidth: 3,
        borderRightWidth: 3,
        borderTopRightRadius: 8,
    },
    bottomLeft: {
        bottom: 40,
        left: 40,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
        borderBottomLeftRadius: 8,
    },
    bottomRight: {
        bottom: 40,
        right: 40,
        borderBottomWidth: 3,
        borderRightWidth: 3,
        borderBottomRightRadius: 8,
    },
    scanHint: {
        fontSize: 14,
        marginTop: 20,
        textAlign: 'center',
    },
    rescanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginTop: 16,
    },
    rescanText: {
        fontSize: 14,
        fontWeight: '600',
    },
    // My QR tab styles
    qrSection: {
        borderRadius: 20,
        padding: 24,
    },
    qrContainer: {
        alignItems: 'center',
    },
    qrWrapper: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    qrCode: {
        fontSize: 20,
        fontWeight: '700',
        letterSpacing: 2,
        marginTop: 20,
    },
    qrHint: {
        fontSize: 13,
        marginTop: 8,
        textAlign: 'center',
    },
    qrActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    qrActionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 14,
    },
    qrActionText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
