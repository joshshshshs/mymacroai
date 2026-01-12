import { MainLayout } from '../components/ui/MainLayout';

// ... (keep imports)

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  // ... (keep useEffects)

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <OmniLoggerProvider>
            <MainLayout>
              <Stack screenOptions={{ headerShown: false }}>
                {/* Auth Group */}
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />

                {/* Tabs Group */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                {/* Modals Group */}
                <Stack.Screen
                  name="(modals)"
                  options={{
                    headerShown: false,
                    presentation: 'modal',
                    gestureEnabled: true
                  }}
                />

                {/* Individual Screens */}
                <Stack.Screen name="index" />
              </Stack>
            </MainLayout>

            <StatusBar style="light" />
          </OmniLoggerProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
