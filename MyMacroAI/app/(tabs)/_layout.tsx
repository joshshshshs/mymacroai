/**
 * Tabs Layout - Main Navigation Structure
 * Uses new ProtrudingTabBar with curved notch center button
 */

import React from 'react';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { ProtrudingTabBar } from '@/src/components/navigation/ProtrudingTabBar';

export default function TabsLayout() {
  const pathname = usePathname();
  const router = useRouter();

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname.includes('/ai')) return 'ai-hub';
    if (pathname.includes('/dashboard')) return 'dashboard';
    if (pathname.includes('/nutrition')) return 'nutrition';
    if (pathname.includes('/health')) return 'health';
    if (pathname.includes('/squad')) return 'squad';
    return 'dashboard';
  };

  const handleTabPress = (tabName: string) => {
    if (tabName === 'ai-hub') {
      // Open AI Hub modal instead of tab
      router.push('/(modals)/ai-hub' as any);
    } else {
      router.push(`/(tabs)/${tabName}` as any);
    }
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Hide default tab bar completely
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ href: null }} // Hide from tab bar
        />

        <Tabs.Screen
          name="dashboard"
          options={{ title: 'Dashboard' }}
        />

        <Tabs.Screen
          name="nutrition"
          options={{ title: 'Nutrition' }}
        />

        <Tabs.Screen
          name="ai"
          options={{ title: 'AI' }}
        />

        <Tabs.Screen
          name="sleep"
          options={{ title: 'Sleep' }}
        />

        <Tabs.Screen
          name="health"
          options={{ title: 'Health' }}
        />

        <Tabs.Screen
          name="squad"
          options={{ title: 'Squad' }}
        />
      </Tabs>

      {/* Custom Protruding Tab Bar */}
      <ProtrudingTabBar
        activeTab={getActiveTab()}
        onTabPress={handleTabPress}
      />
    </>
  );
}
