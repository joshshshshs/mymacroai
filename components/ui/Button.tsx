import React from 'react';
import { Pressable, Text, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

export interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'transparent';
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

// UI Button Component
export default function Button({
  title,
  onPress,
  disabled,
  style,
  textStyle,
}: ButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={style}>
      <Text style={textStyle}>{title}</Text>
    </Pressable>
  );
}
