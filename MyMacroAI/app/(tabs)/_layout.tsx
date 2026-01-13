/**
 * Tabs Layout - Main Navigation Structure
 * Uses new ProtrudingTabBar with curved notch center button
 */

import React, { useState } from 'react';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { AiHubModalRedesign } from '@/src/components/features/ai/AiHubModalRedesign';
import { ProtrudingTabBar } from '@/src/components/navigation/ProtrudingTabBar';

export default function TabsLayout() {
  const [aiHubVisible, setAiHubVisible] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname.includes('/dashboard')) return 'dashboard';
    if (pathname.includes('/nutrition')) return 'nutrition';
    if (pathname.includes('/health')) return 'health';
    if (pathname.includes('/squad')) return 'squad';
    return 'dashboard';
  };

  const handleTabPress = (tabName: string) => {
    if (tabName === 'ai-hub') {
      setAiHubVisible(true);
    } else {
      router.push(`/(tabs)/${tabName}`);
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

      {/* Full Screen AI Hub Modal */}
      <AiHubModalRedesign visible={aiHubVisible} onClose={() => setAiHubVisible(false)} />
    </>
  );
}