/**
 * SocialLinkInput - Text input with platform icon for social links
 * Features: platform icons, clean styling, character feedback
 */

import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    useColorScheme
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, RADIUS } from '../../design-system/tokens';

type SocialPlatform = 'instagram' | 'tiktok' | 'website';

interface SocialLinkInputProps {
    platform: SocialPlatform;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

const PLATFORM_CONFIG: Record<SocialPlatform, {
    icon: keyof typeof Ionicons.glyphMap;
    placeholder: string;
    prefix?: string;
}> = {
    instagram: {
        icon: 'logo-instagram',
        placeholder: 'your_username',
        prefix: '@',
    },
    tiktok: {
        icon: 'logo-tiktok',
        placeholder: 'your_username',
        prefix: '@',
    },
    website: {
        icon: 'link-outline',
        placeholder: 'yoursite.com',
    },
};

export const SocialLinkInput: React.FC<SocialLinkInputProps> = ({
    platform,
    value,
    onChangeText,
    placeholder,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const config = PLATFORM_CONFIG[platform];

    const colors = {
        bg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
        border: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        placeholder: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF',
        icon: isDark ? 'rgba(255,255,255,0.5)' : '#6B7280',
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <View style={styles.iconContainer}>
                <Ionicons name={config.icon} size={20} color={colors.icon} />
            </View>

            {config.prefix && (
                <Text style={[styles.prefix, { color: colors.placeholder }]}>
                    {config.prefix}
                </Text>
            )}

            <TextInput
                style={[styles.input, { color: colors.text }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder || config.placeholder}
                placeholderTextColor={colors.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType={platform === 'website' ? 'url' : 'default'}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.md,
        borderWidth: 1,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        marginBottom: SPACING.sm,
    },
    iconContainer: {
        width: 28,
        alignItems: 'center',
    },
    prefix: {
        fontSize: 15,
        fontWeight: '500',
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        paddingVertical: 0,
    },
});

export default SocialLinkInput;
