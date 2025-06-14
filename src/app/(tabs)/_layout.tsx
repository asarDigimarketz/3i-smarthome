import { Tabs } from "expo-router";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Home, FolderKanban, User, ChartColumn, ListChecks } from "lucide-react-native";
import "../../../global.css";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";

export default function TabsLayout() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  return (
    <React.Fragment>
      <StatusBar style="light" />
      <Header onMenuPress={() => setIsSidebarVisible(true)} />
      <Sidebar 
        isVisible={isSidebarVisible}
        onClose={() => setIsSidebarVisible(false)}
      />
      <Tabs screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#c92125', // Add this line for active tab color
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
          }}
        />
        <Tabs.Screen name="projects"  
          options={{
            title: "Projects",
            tabBarIcon: ({ color }) => (
              <FolderKanban color={color} />
            ),
            tabBarLabel: "Projects",
          }}
        />
        <Tabs.Screen name="tasks"     
          options={{
            title: "Tasks",
            tabBarIcon: ({ color }) => (
              <ListChecks color={color} />
            ),
            tabBarLabel: "Tasks",
          }}
        />
        <Tabs.Screen name="customer"
          options={{
            title: "Customer",
            tabBarIcon: ({ color }) => (
              <User color={color} />
            ),
            tabBarLabel: "Customer",
          }}
        />
      </Tabs>
    </React.Fragment>
  );
}