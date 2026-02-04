/**
 * Publish Recipe Modal
 * 
 * Allows users to share their logged meals to the Community Kitchen.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    useColorScheme,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import { RecipesService, RECIPE_CATEGORIES, RecipeCategory } from '@/src/services/supabase/recipes';
import { useCombinedTheme } from '@/src/design-system/theme';
import { SPACING, RADIUS } from '@/src/design-system/tokens';

export default function PublishRecipeScreen() {
    const { colors } = useCombinedTheme();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const params = useLocalSearchParams<{
        mealName?: string;
        calories?: string;
        protein?: string;
        carbs?: string;
        fats?: string;
        ingredients?: string;
        mealId?: string;
    }>();

    // Form state
    const [name, setName] = useState(params.mealName || '');
    const [description, setDescription] = useState('');
    const [instructions, setInstructions] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<RecipeCategory[]>([]);
    const [prepTime, setPrepTime] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);

    // Parsed macros (locked from meal log)
    const calories = parseInt(params.calories || '0');
    const protein = parseFloat(params.protein || '0');
    const carbs = parseFloat(params.carbs || '0');
    const fats = parseFloat(params.fats || '0');
    const ingredients = params.ingredients ? JSON.parse(params.ingredients) : [];

    const themeColors = {
        bg: isDark ? '#0A0A0C' : '#FFFFFF',
        surface: isDark ? '#1A1A1E' : '#F8F9FA',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? '#9CA3AF' : '#6B7280',
        border: isDark ? '#2A2A2E' : '#E5E7EB',
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
        }
    };

    const toggleCategory = (category: RecipeCategory) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedCategories(prev => {
            if (prev.includes(category)) {
                return prev.filter(c => c !== category);
            }
            if (prev.length >= 2) {
                Alert.alert('Limit reached', 'You can select up to 2 categories');
                return prev;
            }
            return [...prev, category];
        });
    };

    const handlePublish = async () => {
        // Validation
        if (!name.trim()) {
            Alert.alert('Required', 'Please enter a recipe name');
            return;
        }
        if (!imageUri) {
            Alert.alert('Photo Required', 'Please add a photo of your meal');
            return;
        }

        setIsPublishing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            const result = await RecipesService.publishRecipe({
                name: name.trim(),
                description: description.trim() || undefined,
                instructions: instructions.trim() || undefined,
                imageUri,
                calories,
                protein,
                carbs,
                fats,
                categories: selectedCategories,
                prepTimeMinutes: prepTime ? parseInt(prepTime) : undefined,
                ingredients,
                localMealId: params.mealId,
            });

            if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                    '🎉 Published!',
                    'Your recipe is now live in the Community Kitchen!',
                    [{ text: 'Awesome', onPress: () => router.back() }]
                );
            } else {
                Alert.alert('Error', result.error || 'Failed to publish');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong');
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.bg }]}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: 'Share Recipe',
                    presentation: 'modal',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="close" size={24} color={themeColors.text} />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={handlePublish}
                            disabled={isPublishing}
                        >
                            {isPublishing ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                                <Text style={[styles.publishButton, { color: colors.primary }]}>
                                    Publish
                                </Text>
                            )}
                        </TouchableOpacity>
                    ),
                }}
            />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Image Picker */}
                <TouchableOpacity
                    style={[styles.imagePicker, { backgroundColor: themeColors.surface }]}
                    onPress={handlePickImage}
                >
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.pickedImage} />
                    ) : (
                        <View style={styles.imagePickerContent}>
                            <Ionicons name="camera" size={40} color={themeColors.textSecondary} />
                            <Text style={[styles.imagePickerText, { color: themeColors.textSecondary }]}>
                                Add a photo (required)
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Locked Macros */}
                <View style={[styles.macroCard, { backgroundColor: themeColors.surface }]}>
                    <View style={styles.macroHeader}>
                        <Ionicons name="lock-closed" size={14} color={themeColors.textSecondary} />
                        <Text style={[styles.macroLabel, { color: themeColors.textSecondary }]}>
                            Verified Macros (from your log)
                        </Text>
                    </View>
                    <View style={styles.macroRow}>
                        <View style={styles.macroItem}>
                            <Text style={[styles.macroValue, { color: themeColors.text }]}>{calories}</Text>
                            <Text style={[styles.macroUnit, { color: themeColors.textSecondary }]}>kcal</Text>
                        </View>
                        <View style={styles.macroItem}>
                            <Text style={[styles.macroValue, { color: colors.macros.protein }]}>{protein}g</Text>
                            <Text style={[styles.macroUnit, { color: themeColors.textSecondary }]}>protein</Text>
                        </View>
                        <View style={styles.macroItem}>
                            <Text style={[styles.macroValue, { color: colors.macros.carbs }]}>{carbs}g</Text>
                            <Text style={[styles.macroUnit, { color: themeColors.textSecondary }]}>carbs</Text>
                        </View>
                        <View style={styles.macroItem}>
                            <Text style={[styles.macroValue, { color: colors.macros.fats }]}>{fats}g</Text>
                            <Text style={[styles.macroUnit, { color: themeColors.textSecondary }]}>fats</Text>
                        </View>
                    </View>
                </View>

                {/* Name */}
                <Text style={[styles.fieldLabel, { color: themeColors.text }]}>Recipe Name</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: themeColors.surface, color: themeColors.text, borderColor: themeColors.border }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Give your meal a name"
                    placeholderTextColor={themeColors.textSecondary}
                />

                {/* Description (The Hack) */}
                <Text style={[styles.fieldLabel, { color: themeColors.text }]}>The Hack 💡</Text>
                <TextInput
                    style={[styles.input, styles.textArea, { backgroundColor: themeColors.surface, color: themeColors.text, borderColor: themeColors.border }]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="What's the secret? (e.g., 'Greek yogurt instead of sour cream')"
                    placeholderTextColor={themeColors.textSecondary}
                    multiline
                    numberOfLines={3}
                />

                {/* Instructions */}
                <Text style={[styles.fieldLabel, { color: themeColors.text }]}>Instructions (optional)</Text>
                <TextInput
                    style={[styles.input, styles.textArea, { backgroundColor: themeColors.surface, color: themeColors.text, borderColor: themeColors.border }]}
                    value={instructions}
                    onChangeText={setInstructions}
                    placeholder="How do you make it?"
                    placeholderTextColor={themeColors.textSecondary}
                    multiline
                    numberOfLines={4}
                />

                {/* Prep Time */}
                <Text style={[styles.fieldLabel, { color: themeColors.text }]}>Prep Time (minutes)</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: themeColors.surface, color: themeColors.text, borderColor: themeColors.border }]}
                    value={prepTime}
                    onChangeText={setPrepTime}
                    placeholder="15"
                    placeholderTextColor={themeColors.textSecondary}
                    keyboardType="number-pad"
                />

                {/* Categories */}
                <Text style={[styles.fieldLabel, { color: themeColors.text }]}>
                    Categories (select up to 2)
                </Text>
                <View style={styles.categoryGrid}>
                    {RECIPE_CATEGORIES.map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryChip,
                                { borderColor: themeColors.border },
                                selectedCategories.includes(category) && {
                                    backgroundColor: colors.primary,
                                    borderColor: colors.primary,
                                },
                            ]}
                            onPress={() => toggleCategory(category)}
                        >
                            <Text style={[
                                styles.categoryText,
                                { color: themeColors.textSecondary },
                                selectedCategories.includes(category) && { color: '#FFF' },
                            ]}>
                                {category}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: SPACING.lg,
    },
    publishButton: {
        fontSize: 16,
        fontWeight: '600',
    },
    imagePicker: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        marginBottom: SPACING.lg,
    },
    pickedImage: {
        width: '100%',
        height: '100%',
    },
    imagePickerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    imagePickerText: {
        fontSize: 15,
        fontWeight: '500',
    },
    macroCard: {
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.lg,
    },
    macroHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: SPACING.sm,
    },
    macroLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    macroRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    macroItem: {
        alignItems: 'center',
    },
    macroValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    macroUnit: {
        fontSize: 11,
        fontWeight: '500',
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        fontSize: 15,
        marginBottom: SPACING.lg,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '500',
    },
});
