import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { logger } from './utils/logger';

export default function App() {
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

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
