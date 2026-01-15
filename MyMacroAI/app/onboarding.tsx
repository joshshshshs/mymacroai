/**
 * Onboarding Screen - Welcome Carousel with Liquid Orb
 */

import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, FlatList, ViewToken, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';

import { LiquidOrb, OnboardingSlide, OnboardingPagination, SlideData } from '@/src/components/onboarding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES: SlideData[] = [
    {
        headline: 'Speak. Snap. Done.',
        highlightWord: 'Done.',
        subtext: 'The fastest logger in the world. Just tell MyMacro what you ate, or snap a photo. No more searching databases.',
    },
    {
        headline: 'Your Biology, Decoded.',
        highlightWord: 'Decoded.',
        subtext: 'We sync with your wearables to adjust your nutrition targets in real-time based on your recovery.',
        icons: ['watch-outline', 'fitness-outline', 'pulse-outline'],
    },
    {
        headline: 'A Coach, Not a Robot.',
        highlightWord: 'Robot.',
        subtext: 'Ruthless accountability. Proactive advice. Your new 24/7 performance partner.',
    },
];

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<SlideData>);

export default function OnboardingScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const flatListRef = useRef<FlatList<SlideData>>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useSharedValue(0);

    const colors = {
        bg: isDark ? '#121214' : '#FAFAFA',
    };

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setCurrentIndex(viewableItems[0].index);
        }
    }, []);

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        }
    };

    const handleComplete = () => {
        // Navigate to main app
        router.replace('/(tabs)/dashboard' as any);
    };

    const renderSlide = ({ item, index }: { item: SlideData; index: number }) => (
        <OnboardingSlide data={item} index={index} />
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.bg }]}>
            {/* Liquid Orb Background */}
            <LiquidOrb scrollX={scrollX} totalSlides={SLIDES.length} />

            <SafeAreaView style={styles.safeArea}>
                {/* Carousel */}
                <AnimatedFlatList
                    ref={flatListRef}
                    data={SLIDES}
                    renderItem={renderSlide}
                    keyExtractor={(_, index) => index.toString()}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    bounces={false}
                />

                {/* Pagination & Button */}
                <OnboardingPagination
                    scrollX={scrollX}
                    totalSlides={SLIDES.length}
                    currentIndex={currentIndex}
                    onNext={handleNext}
                    onComplete={handleComplete}
                />
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
});
