import { useEffect } from 'react';
import { StatusBar } from 'react-native';

interface UseStatusBarOptions {
  barStyle?: 'default' | 'light-content' | 'dark-content';
  backgroundColor?: string;
  translucent?: boolean;
}

export function useStatusBar({
  barStyle = 'light-content',
  backgroundColor = '#030303',
  translucent = false
}: UseStatusBarOptions = {}) {
  useEffect(() => {
    StatusBar.setBarStyle(barStyle);
    StatusBar.setBackgroundColor(backgroundColor, !translucent);
    
    // Cleanup function to reset StatusBar when component unmounts
    return () => {
      StatusBar.setBarStyle('light-content');
      StatusBar.setBackgroundColor('#030303', true);
    };
  }, [barStyle, backgroundColor, translucent]);
} 