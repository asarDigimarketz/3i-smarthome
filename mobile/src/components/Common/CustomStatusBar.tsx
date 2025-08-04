import React from 'react';
import { StatusBar, StatusBarStyle } from 'react-native';

interface CustomStatusBarProps {
  backgroundColor?: string;
  barStyle?: StatusBarStyle;
  translucent?: boolean;
  animated?: boolean;
}

export default function CustomStatusBar({
  backgroundColor = '#030303',
  barStyle = 'light-content',
  translucent = false,
  animated = true
}: CustomStatusBarProps) {
  return (
    <StatusBar
      backgroundColor={backgroundColor}
      barStyle={barStyle}
      translucent={translucent}
      animated={animated}
    />
  );
} 