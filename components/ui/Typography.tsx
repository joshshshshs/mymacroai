import React from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

export interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption';
  style?: StyleProp<TextStyle>;
}

// Typography UI component
export default function Typography({ children, style }: TypographyProps) {
  return <Text style={style}>{children}</Text>;
}
