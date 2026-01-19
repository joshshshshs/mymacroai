/**
 * CategoryFilter - Community Kitchen Filters
 * 
 * Horizontal scrolling category chips for feed filtering.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

import { RECIPE_CATEGORIES, RecipeCategory } from '@/src/services/supabase/recipes';
import { useCombinedTheme } from '@/src/design-system/theme';
import { SPACING, RADIUS } from '@/src/design-system/tokens';

interface CategoryFilterProps {
    selected: RecipeCategory | null;
    onSelect: (category: RecipeCategory | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
    selected,
    onSelect,
}) => {
    const { colors } = useCombinedTheme();

    const handleSelect = (category: RecipeCategory | null) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect(category);
    };

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {/* All option */}
            <TouchableOpacity
                style={[
                    styles.chip,
                    selected === null && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                    },
                ]}
                onPress={() => handleSelect(null)}
                activeOpacity={0.7}
            >
                <Text style={[
                    styles.chipText,
                    selected === null && styles.chipTextActive,
                ]}>
                    All
                </Text>
            </TouchableOpacity>

            {/* Category chips */}
            {RECIPE_CATEGORIES.map((category) => (
                <TouchableOpacity
                    key={category}
                    style={[
                        styles.chip,
                        selected === category && {
                            backgroundColor: colors.primary,
                            borderColor: colors.primary,
                        },
                    ]}
                    onPress={() => handleSelect(category)}
                    activeOpacity={0.7}
                >
                    <Text style={[
                        styles.chipText,
                        selected === category && styles.chipTextActive,
                    ]}>
                        {category}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.lg,
        gap: 8,
        paddingVertical: SPACING.sm,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: RADIUS.xl,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    chipText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6B7280',
    },
    chipTextActive: {
        color: '#FFF',
    },
});

export default CategoryFilter;
