import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { VISCOUS_SPRING, SNAPPY_SPRING } from '../../utils/physics';
import { haptics } from '../../utils/haptics';

interface GlassButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GlassButton: React.FC<GlassButtonProps> = ({
    title,
    onPress,
    style,
}) => {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
        scale.value = withSpring(0.98, SNAPPY_SPRING);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, SNAPPY_SPRING);
    };

    const handlePress = () => {
        haptics.medium();
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.container, style, animatedStyle]}
        >
            <BlurView intensity={40} tint="light" style={styles.blur}>
                <Text style={styles.text}>{title}</Text>
            </BlurView>
            <StartBorder />
        </AnimatedPressable>
    );
};

const StartBorder = () => (
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#0B1410', // Dark text for light glass or customize based on usage
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
