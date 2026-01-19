/**
 * RecipeCard - Community Kitchen Feed Card
 * 
 * Displays a public recipe with image, macros, and engagement.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { PublicRecipe } from '@/src/services/supabase/recipes';
import { useCombinedTheme } from '@/src/design-system/theme';
import { SPACING, RADIUS } from '@/src/design-system/tokens';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 3) / 2;

interface RecipeCardProps {
    recipe: PublicRecipe;
    onPress: () => void;
    onAuthorPress?: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
    recipe,
    onPress,
    onAuthorPress,
}) => {
    const { colors } = useCombinedTheme();

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            {/* Image */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: recipe.image_url }}
                    style={styles.image}
                    resizeMode="cover"
                />

                {/* Gradient overlay */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={styles.imageGradient}
                />

                {/* Macros badge */}
                <View style={styles.macrosBadge}>
                    <Text style={styles.caloriesText}>{recipe.calories}</Text>
                    <Text style={styles.caloriesLabel}>kcal</Text>
                </View>

                {/* Heart count */}
                {recipe.heart_count > 0 && (
                    <View style={styles.heartBadge}>
                        <Ionicons name="heart" size={12} color="#FF6B6B" />
                        <Text style={styles.heartCount}>{recipe.heart_count}</Text>
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                    {recipe.name}
                </Text>

                {/* Macro bar */}
                <View style={styles.macroRow}>
                    <View style={[styles.macroDot, { backgroundColor: colors.macros.protein }]} />
                    <Text style={styles.macroText}>P: {recipe.protein}g</Text>
                    <View style={[styles.macroDot, { backgroundColor: colors.macros.carbs }]} />
                    <Text style={styles.macroText}>C: {recipe.carbs}g</Text>
                    <View style={[styles.macroDot, { backgroundColor: colors.macros.fats }]} />
                    <Text style={styles.macroText}>F: {recipe.fats}g</Text>
                </View>

                {/* Author */}
                {recipe.author && (
                    <TouchableOpacity
                        style={styles.authorRow}
                        onPress={onAuthorPress}
                        activeOpacity={0.7}
                    >
                        {recipe.author.avatar_url ? (
                            <Image
                                source={{ uri: recipe.author.avatar_url }}
                                style={styles.authorAvatar}
                            />
                        ) : (
                            <View style={[styles.authorAvatar, styles.avatarPlaceholder]}>
                                <Ionicons name="person" size={10} color="#FFF" />
                            </View>
                        )}
                        <Text style={styles.authorName} numberOfLines={1}>
                            @{recipe.author.username}
                        </Text>
                        {recipe.author.is_verified && (
                            <Ionicons name="checkmark-circle" size={12} color="#3B82F6" />
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#FFF',
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        marginBottom: SPACING.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    imageContainer: {
        width: '100%',
        height: CARD_WIDTH,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
    },
    macrosBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 2,
    },
    caloriesText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
    },
    caloriesLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.8)',
    },
    heartBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 10,
        gap: 3,
    },
    heartCount: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFF',
    },
    content: {
        padding: SPACING.sm,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        lineHeight: 18,
        marginBottom: 6,
    },
    macroRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    macroDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    macroText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#6B7280',
        marginRight: 4,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    authorAvatar: {
        width: 18,
        height: 18,
        borderRadius: 9,
    },
    avatarPlaceholder: {
        backgroundColor: '#CBD5E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    authorName: {
        fontSize: 11,
        color: '#6B7280',
        flex: 1,
    },
});

export default RecipeCard;
