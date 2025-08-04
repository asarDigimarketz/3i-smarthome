import { Stack } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";

export default function RootLayout() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header onMenuPress={() => setIsSidebarVisible(true)} />
      <Sidebar
        isVisible={isSidebarVisible}
        onClose={() => setIsSidebarVisible(false)}
      />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}
