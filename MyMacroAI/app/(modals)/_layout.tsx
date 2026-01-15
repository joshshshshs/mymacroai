import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
      presentation: 'modal',
      gestureEnabled: true
    }}>
      <Stack.Screen name="streak" />
      <Stack.Screen name="shop" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="import" />
      <Stack.Screen name="scan" />
      <Stack.Screen name="referrals" />
      <Stack.Screen name="add-friend" />
      <Stack.Screen name="premium" />
      <Stack.Screen name="ai-hub" />
      <Stack.Screen name="ai-chat" />
      <Stack.Screen name="voice-log" />
      <Stack.Screen name="body-scan-briefing" />
      <Stack.Screen name="body-scan-capture" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
      <Stack.Screen name="data-privacy" />
      <Stack.Screen name="support" />
      <Stack.Screen name="log-meal" />
      <Stack.Screen name="training-onboarding" />
    </Stack>
  );
}

