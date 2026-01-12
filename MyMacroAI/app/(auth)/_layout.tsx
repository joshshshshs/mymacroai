import React from 'react';
import { Stack } from 'expo-router';
import { useUserStore } from '../../store/userStore';

/**
 * 认证模块布局 - 管理登录和引导流程
 * 根据用户引导状态自动路由到相应界面
 */
export default function AuthLayout() {
  const isOnboardingCompleted = useUserStore(state => state.isOnboardingCompleted);
  const isAuthenticated = useUserStore(state => state.isAuthenticated);

  // 如果用户已认证，重定向到主界面
  if (isAuthenticated) {
    return null; // 将由上层路由处理重定向
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