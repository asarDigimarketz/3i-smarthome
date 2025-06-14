import { Stack } from "expo-router";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import React, { useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function RootLayout() {
   const insets = useSafeAreaInsets();
    const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  return (
    <React.Fragment>
      <View className="flex-1" style={{ paddingBottom: insets.bottom }}>
        <StatusBar style="auto" />
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
