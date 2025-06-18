import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, View } from 'react-native';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-black justify-center items-center">
      <Image
        source={require('../../assets/icons/image15.png')}
        style={{ width: 200, height: 70, resizeMode: 'contain' }}
      />
    </View>
  );
} 