import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, View, useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { VISCOUS_SPRING, SNAPPY_SPRING } from '../../utils/animations';
import { haptics } from '../../utils/haptics';
import { useCombinedTheme } from '../../design-system/theme';

interface GlassButtonProps {
    title?: string;
    label?: string; // Alias for title
    onPress: () => void;
    style?: ViewStyle;
    icon?: keyof typeof Ionicons.glyphMap;
    variant?: 'glass' | 'primary' | 'secondary';
    children?: React.ReactNode;
    disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GlassButton: React.FC<GlassButtonProps> = ({
    title,
    label,
    onPress,
    style,
    icon,
    variant = 'glass',
    children,
    disabled = false,
}) => {
    const scale = useSharedValue(1);
    const displayTitle = label || title;
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Get dynamic theme colors
    const theme = useCombinedTheme();
    const {
        primary,
        secondary,
        textContrast,
        shadow,
        shadowRgb,
        gradientStart,
        gradientEnd,
    } = theme.colors;

    const handlePressIn = () => {
        if (!disabled) {
            scale.value = withSpring(0.98, SNAPPY_SPRING);
        }
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, SNAPPY_SPRING);
    };

    const handlePress = () => {
        if (!disabled) {
            haptics.medium();
            onPress();
        }
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    // Primary variant - solid gradient button with theme colors
    if (variant === 'primary') {
        return (
            <AnimatedPressable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                    styles.container,
                    {
                        shadowColor: shadow,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 12,
                        elevation: 8,
                        opacity: disabled ? 0.5 : 1,
                    },
                    style,
                    animatedStyle,
                ]}
                disabled={disabled}
            >
                <LinearGradient
                    colors={[gradientStart, gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    {icon && (
                        <Ionicons
                            name={icon}
                            size={20}
                            color={textContrast}
                            style={{ marginRight: displayTitle ? 8 : 0 }}
                        />
                    )}
                    {displayTitle && (
                        <Text style={[styles.text, { color: textContrast }]}>
                            {displayTitle}
                        </Text>
                    )}
                </LinearGradient>
            </AnimatedPressable>
        );
    }

    // Secondary variant - outlined with theme color
    if (variant === 'secondary') {
        return (
            <AnimatedPressable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                    styles.container,
                    {
                        backgroundColor: `rgba(${shadowRgb}, 0.1)`,
                        borderWidth: 1,
                        borderColor: `rgba(${shadowRgb}, 0.3)`,
                        opacity: disabled ? 0.5 : 1,
                    },
                    style,
                    animatedStyle,
                ]}
                disabled={disabled}
            >
                <View style={styles.secondaryInner}>
                    {icon && (
                        <Ionicons
                            name={icon}
                            size={20}
                            color={primary}
                            style={{ marginRight: displayTitle ? 8 : 0 }}
                        />
                    )}
                    {displayTitle && (
                        <Text style={[styles.text, { color: primary }]}>
                            {displayTitle}
                        </Text>
                    )}
                </View>
            </AnimatedPressable>
        );
    }

    // Default glass variant
    const textColor = isDark ? '#FFFFFF' : '#0B1410';
    const iconColor = isDark ? '#FFFFFF' : '#0B1410';

    return (
        <AnimatedPressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[
                styles.container,
                { opacity: disabled ? 0.5 : 1 },
                style,
                animatedStyle,
            ]}
            disabled={disabled}
        >
            <BlurView intensity={40} tint={isDark ? 'dark' : 'light'} style={styles.blur}>
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={iconColor}
                        style={{ marginRight: displayTitle ? 8 : 0 }}
                    />
                )}
                {displayTitle && <Text style={[styles.text, { color: textColor }]}>{displayTitle}</Text>}
            </BlurView>
            <GlassBorder />
        </AnimatedPressable>
    );
};

const GlassBorder = () => (
    <Animated.View style={styles.border} />
);

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    blur: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradient: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryInner: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: '600',
        fontSize: 16,
    },
    border: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        pointerEvents: 'none',
    },
});
