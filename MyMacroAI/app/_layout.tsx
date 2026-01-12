import { useEffect } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { JetBrainsMono_400Regular, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import { SplashScreen } from 'expo-router';
import OmniLoggerButton from '../components/ui/OmniLoggerButton';
import { OmniLoggerProvider } from '../contexts/OmniLoggerContext';
import { AuthProvider } from '../contexts/AuthContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { logger } from '../utils/logger';
import { storageService } from '../services/storage/storage';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  // Initialize storage service
  useEffect(() => {
    const initStorage = async () => {
      try {
        await storageService.initialize();
        logger.log('Storage initialized successfully');
      } catch (error) {
        logger.error('Storage initialization failed:', error);
      }
    };
    initStorage();
  }, []);

  // Initialize RevenueCat
  useEffect(() => {
    const iosApiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
    const androidApiKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
    const apiKey = Platform.OS === 'ios' ? iosApiKey : androidApiKey;
    const isExpoGo =
      Constants.appOwnership === 'expo' ||
      Constants.executionEnvironment === 'storeClient';

    if (isExpoGo) {
      logger.warn('RevenueCat disabled in Expo Go.');
      return;
    }

    if (!apiKey) {
      logger.warn('RevenueCat API key missing for this platform.');
      return;
    }

    let cancelled = false;
    const configurePurchases = async () => {
      try {
        const PurchasesModule = await import('react-native-purchases');
        if (cancelled) return;
        PurchasesModule.default.setLogLevel(PurchasesModule.LOG_LEVEL.VERBOSE);
        PurchasesModule.default.configure({ apiKey });
      } catch (error) {
        logger.warn('RevenueCat configure failed:', error);
      }
    };

    void configurePurchases();
    return () => {
      cancelled = true;
    };
  }, []);

  // Hide splash screen when fonts are loaded
  if (fontsLoaded || fontError) {
    SplashScreen.hideAsync();
  }

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <OmniLoggerProvider>
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

            {/* Global Omni-Logger Floating Button */}
            <OmniLoggerButton />

            <StatusBar style="auto" />
          </OmniLoggerProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
