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
    </Stack>
  );
}
