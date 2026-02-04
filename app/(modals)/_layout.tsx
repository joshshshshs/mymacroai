import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
      presentation: 'modal',
      gestureEnabled: true
    }}>
      {/* Core Modals */}
      <Stack.Screen name="streak" />
      <Stack.Screen name="shop" />
      <Stack.Screen name="macrocoin-topup" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="import" />
      <Stack.Screen name="scan" />
      <Stack.Screen name="referrals" />
      <Stack.Screen name="add-friend" />
      <Stack.Screen name="premium" />
      <Stack.Screen name="water-log" />
      <Stack.Screen name="recovery" />

      {/* AI Modals */}
      <Stack.Screen name="ai-hub" />
      <Stack.Screen name="ai-chat" />
      <Stack.Screen name="ai-daily-summary" />
      <Stack.Screen name="ai-protocol-result" />
      <Stack.Screen name="voice-log" />

      {/* Body Scan Modals */}
      <Stack.Screen name="body-scan-briefing" />
      <Stack.Screen name="body-scan-capture" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
      <Stack.Screen name="three-photo" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
      <Stack.Screen name="progress-photos" />
      <Stack.Screen name="vault" />

      {/* Food & Nutrition Modals */}
      <Stack.Screen name="log-meal" />
      <Stack.Screen name="search-food" />
      <Stack.Screen name="food-detail" />
      <Stack.Screen name="food-detail-modal" />
      <Stack.Screen name="food-contribute" />
      <Stack.Screen name="food-camera" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="barcode-scanner" options={{ presentation: 'fullScreenModal' }} />

      {/* Recipe Modals */}
      <Stack.Screen name="recipe-detail" />
      <Stack.Screen name="publish-recipe" />
      <Stack.Screen name="report-recipe" />

      {/* Health Detail Modals */}
      <Stack.Screen name="cycle-detail" />
      <Stack.Screen name="cycle-tracking" />
      <Stack.Screen name="cycle-macros" />
      <Stack.Screen name="heart-detail" />
      <Stack.Screen name="stress-detail" />
      <Stack.Screen name="spo2-detail" />
      <Stack.Screen name="respiration-detail" />

      {/* Profile & Settings Modals */}
      <Stack.Screen name="user-profile" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="edit-age" />
      <Stack.Screen name="edit-weight" />
      <Stack.Screen name="edit-height" />
      <Stack.Screen name="edit-goal" />
      <Stack.Screen name="edit-units" />
      <Stack.Screen name="edit-diet-style" />
      <Stack.Screen name="edit-voice" />
      <Stack.Screen name="edit-theme" />
      <Stack.Screen name="edit-language" />
      <Stack.Screen name="public-profile" />
      <Stack.Screen name="data-privacy" />
      <Stack.Screen name="support" />

      {/* Feature Modals */}
      <Stack.Screen name="features" />
      <Stack.Screen name="hardware" />
      <Stack.Screen name="wearable-sync" />
      <Stack.Screen name="bio-optimization" />
      <Stack.Screen name="training-onboarding" />
      <Stack.Screen name="dashboard-edit" />
      <Stack.Screen name="roadmap" />

      {/* Social Modals */}
      <Stack.Screen name="squad-ranking" />

      {/* Journal Modals */}
      <Stack.Screen name="journaling" />
      <Stack.Screen name="journal-history" />

      {/* Utility Modals */}
      <Stack.Screen name="unwind-dnd" />
    </Stack>
  );
}

