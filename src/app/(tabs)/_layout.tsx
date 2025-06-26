import { Tabs } from "expo-router";
import { ChartColumn, FolderKanban, Home, ListChecks, User } from "lucide-react-native";
import React, { useState } from "react";
import { StatusBar, Pressable } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "../../../global.css";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";

export default function TabsLayout() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar backgroundColor="#030303" barStyle="light-content" />
        <Header onMenuPress={() => setIsSidebarVisible(true)} />
        <Sidebar 
          isVisible={isSidebarVisible}
          onClose={() => setIsSidebarVisible(false)}
        />
        <Tabs screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#c92125',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: 60,
            paddingBottom: 10,
          },
          tabBarItemStyle: {
            paddingVertical: 0,
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
        }}>
        <Tabs.Screen name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <Home color={color} />
            ),
            tabBarLabel: "Home",
          }}
        />
        <Tabs.Screen name="proposal"
          options={{
            title: "Proposal",
            tabBarIcon: ({ color }) => (
              <ChartColumn color={color} />
            ),
            tabBarLabel: "Proposal",
            popToTopOnBlur: true,
          }}
        />
        <Tabs.Screen name="projects"  
          options={{
            title: "Projects",
            tabBarIcon: ({ color }) => (
              <FolderKanban color={color} />
            ),
            tabBarLabel: "Projects",
            popToTopOnBlur: true,
          }}
        />
        <Tabs.Screen name="tasks"     
          options={{
            title: "Tasks",
            tabBarIcon: ({ color }) => (
              <ListChecks color={color} />
            ),
            tabBarLabel: "Tasks",
            popToTopOnBlur: true,
          }}
        />
        <Tabs.Screen name="customer"
          options={{
            title: "Customer",
            tabBarIcon: ({ color }) => (
              <User color={color} />
            ),
            tabBarLabel: "Customer",
            popToTopOnBlur: true,
          }}
        />
      </Tabs>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}