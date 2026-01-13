declare module 'expo-blur' {
  import { ComponentType } from 'react';
  import { ViewProps, StyleProp, ViewStyle } from 'react-native';

  export interface BlurViewProps extends ViewProps {
    tint?: 'light' | 'dark' | 'default' | 'extraLight' | 'regular' | 'prominent';
    intensity?: number;
    style?: StyleProp<ViewStyle>;
  }

  export const BlurView: ComponentType<BlurViewProps>;
}