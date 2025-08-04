import { Tabs } from "expo-router";
import { ChartColumn, FolderKanban, Home, ListChecks, User } from "lucide-react-native";
import React, { useState, useEffect } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import "../../../global.css";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useAuth } from "../../utils/AuthContext";
import { filterMenuItemsByPermissions } from "../../utils/permissions";

export default function TabsLayout() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect to splash if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/splash');
    }
  }, [loading, isAuthenticated, router]);

  const allTabs = [
    { name: "index", label: "Home", icon: Home, title: "Home", url: "/dashboard" },
    { name: "proposal", label: "Proposal", icon: ChartColumn, title: "Proposal", url: "/dashboard/proposals" },
    { name: "projects", label: "Projects", icon: FolderKanban, title: "Projects", url: "/dashboard/projects" },
    { name: "tasks", label: "Tasks", icon: ListChecks, title: "Tasks", url: "/dashboard/tasks" },
    { name: "customer", label: "Customer", icon: User, title: "Customer", url: "/dashboard/customers" },
  ];

  const visibleTabs = filterMenuItemsByPermissions(allTabs, user);

  // Redirect to splash if not authenticated (no loading message)
  if (loading || !isAuthenticated) {
    return null; // Return null to prevent any UI from showing
  }

  if (visibleTabs.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Header onMenuPress={() => setIsSidebarVisible(true)} />
        <Sidebar 
          isVisible={isSidebarVisible}
          onClose={() => setIsSidebarVisible(false)}
        />
        <Text style={{ color: '#c92125', fontSize: 18, textAlign: 'center', marginTop: 40 }}>
          You do not have access to any sections. Please contact your administrator.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
  );
}