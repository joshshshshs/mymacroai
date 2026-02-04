console.log('[DEBUG 4] _layout.tsx - Module loading');
fetch('http://127.0.0.1:7242/ingest/f574fcfe-6ee3-42f5-8653-33237ef6f5dc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({step:4,message:'_layout.tsx module start',timestamp:Date.now()})}).catch(()=>{});

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider, useThemeContext } from '../contexts/ThemeContext';
import { ErrorBoundary } from '@/src/components/ui/ErrorBoundary';

console.log('[DEBUG 5] _layout.tsx - All imports loaded');

// Inner component that uses theme context for status bar
function AppContent() {
  const { isDark } = useThemeContext();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(modals)"
          options={{
            headerShown: false,
            presentation: 'modal',
            gestureEnabled: true
          }}
        />
        <Stack.Screen name="index" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  console.log('[DEBUG 6] RootLayout function called');
  fetch('http://127.0.0.1:7242/ingest/f574fcfe-6ee3-42f5-8653-33237ef6f5dc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({step:6,message:'RootLayout called',timestamp:Date.now()})}).catch(()=>{});

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  console.log('[DEBUG 7] Font status:', { fontsLoaded, fontError: fontError?.message });
  fetch('http://127.0.0.1:7242/ingest/f574fcfe-6ee3-42f5-8653-33237ef6f5dc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({step:7,message:'font status',fontsLoaded,fontError:fontError?.message||null,timestamp:Date.now()})}).catch(()=>{});

  if (!fontsLoaded && !fontError) {
    console.log('[DEBUG 8] Showing loading screen - fonts not ready');
    return (
      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  console.log('[DEBUG 9] Rendering full app');
  fetch('http://127.0.0.1:7242/ingest/f574fcfe-6ee3-42f5-8653-33237ef6f5dc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({step:9,message:'rendering full app',timestamp:Date.now()})}).catch(()=>{});

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <AuthProvider>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </AuthProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
