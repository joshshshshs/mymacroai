/**
 * Add Friend Modal - Add friends via code or share your link
 */

import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

import { SoftDreamyBackground } from '@/src/components/ui/SoftDreamyBackground';
import { SPACING } from '@/src/design-system/tokens';
import { useUserStore } from '@/src/store/UserStore';
import { referralService } from '@/src/services/social/ReferralService';

export default function AddFriendModal() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const user = useUserStore((state) => state.user);

    const [friendCode, setFriendCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const colors = {
        bg: isDark ? '#121214' : '#F2F2F4',
        card: isDark ? '#1E1E20' : '#FFFFFF',
        cardAlt: isDark ? '#2C2C2E' : '#E8E8EA',
        text: isDark ? '#FFFFFF' : '#000000',
        textSecondary: isDark ? '#9CA3AF' : '#6B7280',
        accent: '#EA6842',
        success: '#10B981',
        error: '#EF4444',
        border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        inputBg: isDark ? '#1E1E20' : '#FFFFFF',
    };

    const myCode = referralService.getReferralCode(user?.name || 'User', user?.id || 'user_id');

    const handleAddFriend = async () => {
        if (!friendCode.trim()) {
            Alert.alert('Enter Code', 'Please enter your friend\'s code');
            return;
        }

        setIsLoading(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            const result = await referralService.addFriend(friendCode.trim());

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
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
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
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>Add Friend</Text>
                    <View style={{ width: 40 }} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    {/* Add by Code */}
                    <Animated.View entering={FadeInDown.duration(400)}>
                        <View style={[styles.section, { backgroundColor: colors.card }]}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: `${colors.accent}15` }]}>
                                    <Ionicons name="person-add" size={20} color={colors.accent} />
                                </View>
                                <View>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Add by Code</Text>
                                    <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                                        Enter your friend's code
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
                                style={[styles.addButton, { backgroundColor: colors.accent, opacity: isLoading ? 0.7 : 1 }]}
                                onPress={handleAddFriend}
                                disabled={isLoading}
                            >
                                <Text style={styles.addButtonText}>
                                    {isLoading ? 'Adding...' : 'Add Friend'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                        <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OR</Text>
                        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                    </View>

                    {/* Share Your Code */}
                    <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                        <View style={[styles.section, { backgroundColor: colors.card }]}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.iconContainer, { backgroundColor: `${colors.success}15` }]}>
                                    <Ionicons name="share-social" size={20} color={colors.success} />
                                </View>
                                <View>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Share Your Code</Text>
                                    <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                                        Let friends add you
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
                            >
                                <Ionicons name="share-outline" size={18} color={colors.accent} />
                                <Text style={[styles.shareButtonText, { color: colors.accent }]}>Share Link</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* QR Code hint */}
                    <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                        <View style={styles.hintContainer}>
                            <Ionicons name="qr-code-outline" size={18} color={colors.textSecondary} />
                            <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                                QR code scanning coming soon!
                            </Text>
                        </View>
                    </Animated.View>
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
    keyboardView: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg,
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
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
        paddingHorizontal: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: 16,
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
        fontSize: 16,
        fontWeight: '700',
    },
    hintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 24,
        opacity: 0.7,
    },
    hintText: {
        fontSize: 13,
    },
});
