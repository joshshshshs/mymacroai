import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useAppTheme } from '@/src/design-system/theme';

interface ThemedTextProps extends TextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label' | 'premium-heading' | 'premium-body';
    color?: string; // Optional override
    weight?: '400' | '500' | '600' | '700'; // Override weight
}

export const ThemedText: React.FC<ThemedTextProps> = ({
    style,
    variant = 'body',
    color,
    weight,
    ...props
}) => {
    const theme = useAppTheme();

    // Typography Scale (Could be moved to theme.ts later)
    const styles = StyleSheet.create({
        h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
        h2: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
        h3: { fontSize: 18, fontWeight: '600', lineHeight: 28 },
        body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
        label: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
        caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
        // Premium Variants
        'premium-heading': {
            fontSize: 48,
            fontWeight: '700',
            letterSpacing: -1.5,
            lineHeight: 56, // tight leading for headings usually, but let's see. 48px * 1.2 = 57.6
            color: '#111827', // Gray 900
            fontFamily: 'Inter_700Bold'
        },
        'premium-body': {
            fontSize: 18,
            fontWeight: '400',
            letterSpacing: 0,
            lineHeight: 28, // relaxed
            color: '#6B7280', // Gray 500
            fontFamily: 'Inter_400Regular'
        }
    });

    const resolvedColor = color || theme.colors.textPrimary;

    // Font Family Logic (assuming Inter is loaded globally, falling back to system)
    // We apply fontWeight via style, React Native handles mapping to font files if configured,
    // or uses system fonts.

    return (
        <Text
            style={[
                styles[variant],
                { color: resolvedColor },
                weight && { fontWeight: weight },
                style
            ]}
            {...props}
        />
    );
};
