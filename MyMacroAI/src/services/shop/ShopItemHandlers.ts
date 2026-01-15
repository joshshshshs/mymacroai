/**
 * Shop Item Handlers
 * Centralized handlers for all purchasable items
 */

import { Alert } from 'react-native';
import { router } from 'expo-router';
import { StoreItem } from '@/src/types';
import { StreakFreezeService } from './StreakFreezeService';

export interface ShopItemHandler {
  onPurchase: (item: StoreItem, userStore: any) => Promise<void>;
  description: string;
}

export const SHOP_ITEM_HANDLERS: Record<string, ShopItemHandler> = {
  // AI Protocol Gen
  ai_protocol: {
    onPurchase: async (item, userStore) => {
      // Already handled in shop.tsx - opens modal
    },
    description: 'Generates AI-powered health protocol',
  },

  // Streak Freezes
  streak_freeze_7: {
    onPurchase: async (item, userStore) => {
      const freeze = StreakFreezeService.activateFreeze(7);
      // Add freeze to user state
      userStore.addStreakFreeze(freeze);
      Alert.alert(
        '🛡️ Streak Freeze Activated!',
        '7 days of protection added. Your streak is now safe even if you miss a day.',
        [{ text: 'Got it!' }]
      );
    },
    description: 'Activates 7-day streak protection',
  },

  streak_freeze_3: {
    onPurchase: async (item, userStore) => {
      const freeze = StreakFreezeService.activateFreeze(3);
      userStore.addStreakFreeze(freeze);
      Alert.alert(
        '🛡️ Streak Freeze Activated!',
        '3 days of protection added. Your streak is now safe!',
        [{ text: 'Got it!' }]
      );
    },
    description: 'Activates 3-day streak protection',
  },

  // Ghost Mode
  ghost_mode: {
    onPurchase: async (item, userStore) => {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      userStore.activateGhostMode(expiresAt.toISOString());
      Alert.alert(
        '👻 Ghost Mode Activated!',
        'You\'re now invisible on the leaderboard for 24 hours. You can still log data and maintain your streak.',
        [{ text: 'Nice!' }]
      );
    },
    description: 'Activates 24h leaderboard invisibility',
  },

  // Profile Frames
  frame_molten: {
    onPurchase: async (item, userStore) => {
      userStore.unlockProfileFrame('molten');
      Alert.alert(
        '🔥 The Molten Frame Unlocked!',
        'Your profile now has an animated burning border. Set it as active in your profile settings.',
        [{ text: 'Awesome!', onPress: () => router.push('/profile') }]
      );
    },
    description: 'Unlocks animated molten profile frame',
  },

  frame_frost: {
    onPurchase: async (item, userStore) => {
      userStore.unlockProfileFrame('frost');
      Alert.alert(
        '❄️ The Frost Frame Unlocked!',
        'Your profile now has a frozen glass border. Ice cold discipline!',
        [{ text: 'Cool!', onPress: () => router.push('/profile') }]
      );
    },
    description: 'Unlocks frozen glass profile frame',
  },

  frame_void: {
    onPurchase: async (item, userStore) => {
      userStore.unlockProfileFrame('void');
      Alert.alert(
        '🌑 The Void Frame Unlocked!',
        'Elite status achieved. Pitch black stealth border activated.',
        [{ text: 'Perfect', onPress: () => router.push('/profile') }]
      );
    },
    description: 'Unlocks elite void profile frame',
  },

  // Nudge Amplifiers
  nudge_heartbeat: {
    onPurchase: async (item, userStore) => {
      userStore.unlockNudgePattern('heartbeat');
      Alert.alert(
        '💗 Heartbeat Nudge Unlocked!',
        'You can now send heartbeat pattern vibrations to your squad members.',
        [{ text: 'Try it!', onPress: () => router.push('/squad') }]
      );
    },
    description: 'Unlocks heartbeat haptic pattern',
  },

  nudge_siren: {
    onPurchase: async (item, userStore) => {
      userStore.unlockNudgePattern('siren');
      Alert.alert(
        '🚨 Siren Nudge Unlocked!',
        'Send urgent siren patterns to wake up your squad!',
        [{ text: 'Nice!', onPress: () => router.push('/squad') }]
      );
    },
    description: 'Unlocks siren haptic pattern',
  },

  // Custom App Icons
  icon_stealth: {
    onPurchase: async (item, userStore) => {
      userStore.unlockAppIcon('stealth');
      Alert.alert(
        '🎯 Stealth Icon Unlocked!',
        'Invisible mode. Your app icon now matches the iOS dark background. Change it in Settings > App Icon.',
        [{ text: 'Got it!' }]
      );
    },
    description: 'Unlocks stealth app icon',
  },

  icon_nuclear: {
    onPurchase: async (item, userStore) => {
      userStore.unlockAppIcon('nuclear');
      Alert.alert(
        '☢️ Nuclear Icon Unlocked!',
        'Bright orange safety color for maximum visibility. Change it in Settings > App Icon.',
        [{ text: 'Awesome!' }]
      );
    },
    description: 'Unlocks nuclear orange app icon',
  },

  icon_terminal: {
    onPurchase: async (item, userStore) => {
      userStore.unlockAppIcon('terminal');
      Alert.alert(
        '💻 Terminal Icon Unlocked!',
        'Retro code style for the developer aesthetic. Change it in Settings > App Icon.',
        [{ text: 'Nice!' }]
      );
    },
    description: 'Unlocks terminal app icon',
  },
};

/**
 * Execute handler for purchased item
 */
export async function executeShopItemHandler(
  itemId: string,
  item: StoreItem,
  userStore: any
): Promise<void> {
  const handler = SHOP_ITEM_HANDLERS[itemId];
  if (handler) {
    await handler.onPurchase(item, userStore);
  }
}
