import React, { useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableWithoutFeedback, Platform, ViewStyle, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS
} from 'react-native-reanimated';
import { VISCOUS_SPRING } from '../../utils/animations';

interface GlassSheetProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    height?: number;
    triggerHaptics?: () => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export const GlassSheet: React.FC<GlassSheetProps> = ({
    visible,
    onClose,
    children,
    height,
    triggerHaptics
}) => {
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const backdropOpacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            if (triggerHaptics) triggerHaptics();
            translateY.value = withSpring(0, VISCOUS_SPRING);
            backdropOpacity.value = withTiming(1, { duration: 300 });
        } else {
            translateY.value = withSpring(SCREEN_HEIGHT, VISCOUS_SPRING);
            backdropOpacity.value = withTiming(0, { duration: 300 });
        }
    }, [visible]);

    const sheetStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    const backdropStyle = useAnimatedStyle(() => {
        return {
            opacity: backdropOpacity.value,
        };
    });

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.container}>
                {/* Backdrop */}
                <TouchableWithoutFeedback onPress={onClose}>
                    <Animated.View style={[styles.backdrop, backdropStyle]} />
                </TouchableWithoutFeedback>

                {/* Glass Sheet */}
                <Animated.View style={[styles.sheetContainer, sheetStyle, height ? { height } : undefined]}>
                    <BlurView intensity={60} tint="dark" style={styles.blur}>
                        {/* Drag Handle */}
                        <View style={styles.handleContainer}>
                            <View style={styles.handle} />
                        </View>

                        {/* Content */}
                        <View style={styles.content}>
                            {children}
                        </View>
                    </BlurView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    sheetContainer: {
        width: '100%',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        overflow: 'hidden',
        // Android Fallback color if blur fails or reduced transparency
        backgroundColor: Platform.select({
            android: undefined, // Let BlurView handle fallback or tint
            ios: 'transparent'
        }),
    },
    blur: {
        flex: 1,
        backgroundColor: Platform.OS === 'android' ? 'rgba(19, 32, 28, 0.95)' : undefined,
    },
    handleContainer: {
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 8,
    },
    handle: {
        width: 36,
        height: 5,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
});
