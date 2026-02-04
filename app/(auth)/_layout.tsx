import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useUserStore } from '@/src/store/UserStore';

/**
 * Auth Module Layout - Manages login and onboarding flow
 * Routes users based on authentication and onboarding state
 */
export default function AuthLayout() {
  const isOnboardingCompleted = useUserStore(state => state.isOnboardingCompleted);
  const isAuthenticated = useUserStore(state => state.isAuthenticated);

  // Redirect authenticated users to main tabs
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      {/* 引导流程 - 新用户首次使用 */}
      <Stack.Screen 
        name="onboarding" 
        options={{
          title: 'Get Started',
          animation: isOnboardingCompleted ? 'fade' : 'slide_from_right',
        }}
      />
      
      {/* 登录界面 - 返回用户登录 */}
      <Stack.Screen 
        name="login" 
        options={{
          title: 'Sign In',
          animation: 'slide_from_left',
        }}
      />
    </Stack>
  );
}