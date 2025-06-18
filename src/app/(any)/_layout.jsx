import { Stack } from "expo-router";
import React, { useState } from "react";
import { StatusBar, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";

export default function RootLayout() {
   const insets = useSafeAreaInsets();
    const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  return (
    <React.Fragment>
      <View className="flex-1" style={{ paddingBottom: insets.bottom }}>
        <StatusBar backgroundColor="#030303" barStyle="light-content" />
        <Header onMenuPress={() => setIsSidebarVisible(true)} />
        <Sidebar
          isVisible={isSidebarVisible}
          onClose={() => setIsSidebarVisible(false)}
        />
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </React.Fragment>
  );
}
