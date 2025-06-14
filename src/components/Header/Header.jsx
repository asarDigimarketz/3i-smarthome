import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Menu } from 'lucide-react-native';

export default function Header({ onMenuPress }) {
  const insets = useSafeAreaInsets();
  
  return (
    <LinearGradient 
      colors={["#030303", "#4d0f10"]} 
      className="w-full" 
      style={{ 
        paddingTop: insets.top,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20
      }}
    >
      <View className="flex-row items-center justify-between w-full p-6">
        <Image 
          source={require('../../../assets/icons/image14.png')} 
          className="w-[160px] h-14"
          resizeMode="contain"
        />
        <TouchableOpacity 
          onPress={onMenuPress}
          className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
        >
          <Menu size={24} color="white" strokeWidth={1.5} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}