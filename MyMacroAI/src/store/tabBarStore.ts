/**
 * TabBar Store - Controls tab bar visibility for sheet/modal animations
 */

import { create } from 'zustand';

interface TabBarState {
    isVisible: boolean;
    hideTabBar: () => void;
    showTabBar: () => void;
}

export const useTabBarStore = create<TabBarState>((set) => ({
    isVisible: true,
    hideTabBar: () => set({ isVisible: false }),
    showTabBar: () => set({ isVisible: true }),
}));
