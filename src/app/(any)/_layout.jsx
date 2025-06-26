import { Stack } from "expo-router";
import React, { useState } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";

export default function RootLayout() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar backgroundColor="#030303" barStyle="light-content" />
        <Header onMenuPress={() => setIsSidebarVisible(true)} />
        <Sidebar
          isVisible={isSidebarVisible}
          onClose={() => setIsSidebarVisible(false)}
        />
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
