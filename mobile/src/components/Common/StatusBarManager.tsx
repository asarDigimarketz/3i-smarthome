import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { usePathname } from 'expo-router';

interface StatusBarManagerProps {
  backgroundColor?: string;
  barStyle?: 'default' | 'light-content' | 'dark-content';
  translucent?: boolean;
}

export default function StatusBarManager({ 
  backgroundColor = "#030303", 
  barStyle = "light-content",
  translucent = false 
}: StatusBarManagerProps) {
  const colorScheme = useColorScheme();
  const pathname = usePathname();

  useEffect(() => {
    // Determine StatusBar style based on current route
    let currentBarStyle = barStyle;
    let currentBackgroundColor = backgroundColor;

    // Auth screens - light content on dark background
    if (pathname?.includes('(auth)') || pathname?.includes('login') || pathname?.includes('register')) {
      currentBarStyle = 'light-content';
      currentBackgroundColor = '#030303';
    }
    // Main app screens - light content on dark background
    else if (pathname?.includes('(tabs)') || pathname?.includes('(any)')) {
      currentBarStyle = 'light-content';
      currentBackgroundColor = '#030303';
    }
    // Splash screen - light content on dark background
    else if (pathname === '/splash') {
      currentBarStyle = 'light-content';
      currentBackgroundColor = '#030303';
    }
    // Default fallback
    else {
      currentBarStyle = colorScheme === 'dark' ? 'light-content' : 'dark-content';
      currentBackgroundColor = colorScheme === 'dark' ? '#000000' : '#ffffff';
    }

    // Update StatusBar
    StatusBar.setBarStyle(currentBarStyle);
    StatusBar.setBackgroundColor(currentBackgroundColor, !translucent);
  }, [pathname, colorScheme, barStyle, backgroundColor, translucent]);

  return null; // This component doesn't render anything
} 