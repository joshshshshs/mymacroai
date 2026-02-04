/**
 * ReactionRewardsProvider
 * 
 * Subscribes to real-time reaction events and awards MacroCoins.
 * Mount this near the app root after authentication.
 */

import React, { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

import { getSupabase } from '@/src/lib/supabase';
import { useUserStore } from '@/src/store/UserStore';
import { ReactionRewardsService } from '@/src/services/supabase/reactionRewards';

interface Props {
    children: React.ReactNode;
}

export const ReactionRewardsProvider: React.FC<Props> = ({ children }) => {
    const addCoins = useUserStore(state => state.addCoins);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        let isMounted = true;

        const setupSubscription = async () => {
            // Get current user
            const { data: { user } } = await getSupabase().auth.getUser();
            if (!user || !isMounted) return;

            // Subscribe to reaction rewards
            const unsubscribe = await ReactionRewardsService.subscribeToReactionRewards(
                user.id,
                (coinsAwarded) => {
                    if (!isMounted) return;

                    // Add coins to user's balance
                    addCoins(coinsAwarded);

                    // Celebration feedback
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                    // Optional: Show toast notification
                    // You could use a toast library here
                    if (__DEV__) console.log(`🎉 +${coinsAwarded} MacroCoins from a heart!`);
                }
            );

            unsubscribeRef.current = unsubscribe;
        };

        setupSubscription();

        return () => {
            isMounted = false;
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [addCoins]);

    return <>{children}</>;
};

export default ReactionRewardsProvider;
