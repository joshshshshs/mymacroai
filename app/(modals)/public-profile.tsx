/**
 * Public Profile Modal
 * 
 * View another user's public profile with follow button and recipe grid.
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    FlatList,
    Dimensions,
    useColorScheme,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { RecipeCard } from '@/src/components/community';
import { ProfilesService, PublicProfile } from '@/src/services/supabase/profiles';
import { RecipesService, PublicRecipe } from '@/src/services/supabase/recipes';
import { useCombinedTheme } from '@/src/design-system/theme';
import { SPACING, RADIUS } from '@/src/design-system/tokens';

const { width } = Dimensions.get('window');

export default function PublicProfileScreen() {
    const { colors } = useCombinedTheme();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { userId } = useLocalSearchParams<{ userId: string }>();

    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [recipes, setRecipes] = useState<PublicRecipe[]>([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    const themeColors = {
        bg: isDark ? '#0A0A0C' : '#FFFFFF',
        surface: isDark ? '#1A1A1E' : '#F8F9FA',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        textSecondary: isDark ? '#9CA3AF' : '#6B7280',
    };

    useEffect(() => {
        if (userId) {
            loadProfile();
        }
    }, [userId]);

    const loadProfile = async () => {
        setIsLoading(true);
        try {
            const [profileData, isFollowingData, recipesData] = await Promise.all([
                ProfilesService.getProfileById(userId!),
                ProfilesService.isFollowing(userId!),
                RecipesService.getPublicFeed({}, 0, 50), // Would need author filter
            ]);

            setProfile(profileData);
            setIsFollowing(isFollowingData);
            // Filter recipes by author (temporary - ideally this is a server query)
            setRecipes(recipesData.filter(r => r.author_id === userId));
        } catch (error) {
            console.error('[PublicProfile] Load error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        if (!profile) return;

        setIsFollowLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            if (isFollowing) {
                await ProfilesService.unfollowUser(profile.id);
                setIsFollowing(false);
                setProfile(prev => prev ? { ...prev, follower_count: prev.follower_count - 1 } : null);
            } else {
                await ProfilesService.followUser(profile.id);
                setIsFollowing(true);
                setProfile(prev => prev ? { ...prev, follower_count: prev.follower_count + 1 } : null);
            }
        } catch (error) {
            console.error('[PublicProfile] Follow error:', error);
        } finally {
            setIsFollowLoading(false);
        }
    };

    const handleSocialLink = (type: 'instagram' | 'tiktok' | 'personal') => {
        if (!profile) return;

        let url = '';
        if (type === 'instagram' && profile.instagram_handle) {
            url = `https://instagram.com/${profile.instagram_handle}`;
        } else if (type === 'tiktok' && profile.tiktok_handle) {
            url = `https://tiktok.com/@${profile.tiktok_handle}`;
        } else if (type === 'personal' && profile.personal_link) {
            url = profile.personal_link;
        }

        if (url) {
            Linking.openURL(url);
        }
    };

    const handleRecipePress = (recipe: PublicRecipe) => {
        router.push({
            pathname: '/(modals)/recipe-detail',
            params: { recipeId: recipe.id },
        } as any);
    };

    if (isLoading || !profile) {
        return (
            <View style={[styles.container, styles.loadingContainer, { backgroundColor: themeColors.bg }]}>
                <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: themeColors.bg }]}>
            <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />

            <ScrollView>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="chevron-back" size={24} color={themeColors.text} />
                    </TouchableOpacity>
                </View>

                {/* Profile Info */}
                <View style={styles.profileSection}>
                    {/* Avatar */}
                    {profile.avatar_url ? (
                        <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Ionicons name="person" size={40} color="#FFF" />
                        </View>
                    )}

                    {/* Name & Username */}
                    <View style={styles.nameContainer}>
                        <Text style={[styles.displayName, { color: themeColors.text }]}>
                            {profile.display_name || profile.username}
                        </Text>
                        {profile.is_verified && (
                            <Ionicons name="checkmark-circle" size={20} color="#3B82F6" />
                        )}
                    </View>
                    <Text style={[styles.username, { color: themeColors.textSecondary }]}>
                        @{profile.username}
                    </Text>

                    {/* Bio */}
                    {profile.bio && (
                        <Text style={[styles.bio, { color: themeColors.textSecondary }]}>
                            {profile.bio}
                        </Text>
                    )}

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: themeColors.text }]}>
                                {profile.recipe_count}
                            </Text>
                            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                                Recipes
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: themeColors.text }]}>
                                {profile.follower_count}
                            </Text>
                            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                                Followers
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: themeColors.text }]}>
                                {profile.following_count}
                            </Text>
                            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                                Following
                            </Text>
                        </View>
                    </View>

                    {/* Follow Button */}
                    <TouchableOpacity
                        style={[
                            styles.followButton,
                            isFollowing ? styles.followingButton : { backgroundColor: colors.primary },
                        ]}
                        onPress={handleFollowToggle}
                        disabled={isFollowLoading}
                    >
                        {isFollowLoading ? (
                            <ActivityIndicator size="small" color={isFollowing ? colors.primary : '#FFF'} />
                        ) : (
                            <Text style={[
                                styles.followButtonText,
                                isFollowing && { color: colors.primary },
                            ]}>
                                {isFollowing ? 'Following' : 'Follow'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Social Links */}
                    <View style={styles.socialRow}>
                        {profile.instagram_handle && (
                            <TouchableOpacity
                                style={[styles.socialButton, { backgroundColor: themeColors.surface }]}
                                onPress={() => handleSocialLink('instagram')}
                            >
                                <Ionicons name="logo-instagram" size={20} color="#E4405F" />
                            </TouchableOpacity>
                        )}
                        {profile.tiktok_handle && (
                            <TouchableOpacity
                                style={[styles.socialButton, { backgroundColor: themeColors.surface }]}
                                onPress={() => handleSocialLink('tiktok')}
                            >
                                <Ionicons name="logo-tiktok" size={20} color={themeColors.text} />
                            </TouchableOpacity>
                        )}
                        {profile.personal_link && (
                            <TouchableOpacity
                                style={[styles.socialButton, { backgroundColor: themeColors.surface }]}
                                onPress={() => handleSocialLink('personal')}
                            >
                                <Ionicons name="link" size={20} color={colors.primary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Recipes Grid */}
                <View style={styles.recipesSection}>
                    <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                        Recipes
                    </Text>

                    {recipes.length === 0 ? (
                        <View style={styles.emptyRecipes}>
                            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                                No recipes shared yet
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.recipesGrid}>
                            {recipes.map((recipe) => (
                                <RecipeCard
                                    key={recipe.id}
                                    recipe={recipe}
                                    onPress={() => handleRecipePress(recipe)}
                                />
                            ))}
                        </View>
                    )}
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
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileSection: {
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: SPACING.md,
    },
    avatarPlaceholder: {
        backgroundColor: '#CBD5E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    displayName: {
        fontSize: 24,
        fontWeight: '700',
    },
    username: {
        fontSize: 15,
        marginTop: 2,
    },
    bio: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: SPACING.sm,
        paddingHorizontal: SPACING.xl,
        lineHeight: 20,
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: SPACING.lg,
        gap: SPACING.xl,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    followButton: {
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: RADIUS.xl,
        marginTop: SPACING.lg,
    },
    followingButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    followButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFF',
    },
    socialRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginTop: SPACING.md,
    },
    socialButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    recipesSection: {
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: SPACING.md,
    },
    emptyRecipes: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
    },
    recipesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
});
