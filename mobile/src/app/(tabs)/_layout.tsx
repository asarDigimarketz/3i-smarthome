import { Tabs } from "expo-router";
import { ChartColumn, FolderKanban, Home, ListChecks, User } from "lucide-react-native";
import React, { useState } from "react";
import { StatusBar, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "../../../global.css";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useAuth } from "../../utils/AuthContext";
import { filterMenuItemsByPermissions } from "../../utils/permissions";

export default function TabsLayout() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const { user } = useAuth();

  const allTabs = [
    { name: "index", label: "Home", icon: Home, title: "Home", url: "/dashboard" },
    { name: "proposal", label: "Proposal", icon: ChartColumn, title: "Proposal", url: "/dashboard/proposals" },
    { name: "projects", label: "Projects", icon: FolderKanban, title: "Projects", url: "/dashboard/projects" },
    { name: "tasks", label: "Tasks", icon: ListChecks, title: "Tasks", url: "/dashboard/tasks" },
    { name: "customer", label: "Customer", icon: User, title: "Customer", url: "/dashboard/customers" },
  ];

  const visibleTabs = filterMenuItemsByPermissions(allTabs, user);

  if (visibleTabs.length === 0) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <StatusBar backgroundColor="#030303" barStyle="light-content" />
          <Header onMenuPress={() => setIsSidebarVisible(true)} />
          <Sidebar 
            isVisible={isSidebarVisible}
            onClose={() => setIsSidebarVisible(false)}
          />
          <Text style={{ color: '#c92125', fontSize: 18, textAlign: 'center', marginTop: 40 }}>
            You do not have access to any sections. Please contact your administrator.
          </Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

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
          {visibleTabs.map(tab => (
            <Tabs.Screen
              key={tab.name}
              name={tab.name}
              options={{
                title: tab.title,
                tabBarIcon: ({ color }) => <tab.icon color={color} />,
                tabBarLabel: tab.label,
                popToTopOnBlur: true,
              }}
            />
          ))}
        </Tabs>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}