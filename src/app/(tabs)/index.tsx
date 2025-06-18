import React from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import ProjectCard from "../../components/Common/ProjectCard";
import { ActivitiesSection } from "../../components/Home/ActivityItem";
import { DashboardSection } from "../../components/Home/DashboardCard";
import { projectData } from "../../data/mockData";

export default function Index() {
  // Get the 5 most recent projects
  const recentProjects = projectData
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <>
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1 px-4">
          <DashboardSection />
          <ActivitiesSection />
          
          {/* Recent Projects Section */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-600 my-4">Recent Projects</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="mx-[-16px]"
            >
              <View className="flex-row px-4 space-x-4 gap-1">
                {recentProjects.map((project) => (
                  <View key={project.id} className="w-[300px]">
                    <ProjectCard
                      project={project}
                      customer={{
                        name: project.customerName,
                        address: project.address
                      }}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          <View className="h-5" /> 
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
