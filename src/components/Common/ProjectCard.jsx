import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Text, View } from 'react-native';

const ProjectCard = ({ project, customer }) => {
  const getServiceGradient = (service) => {
    switch (service) {
      case 'Home Cinema':
        return ['#613eff', '#9cbbff'];
      case 'Home Automation':
        return ['#026b87', '#5deaff'];
      case 'Security System':
        return ['#014c95', '#36b9f6'];
      case 'Outdoor Audio Solution':
        return ['#df2795', '#eb7ab7'];
      default:
        return ['#4F46E5', '#06B6D4'];
    }
  };

  return (
    <View className="rounded-xl shadow-sm mb-4 overflow-hidden">
      <LinearGradient
        colors={getServiceGradient(project.service)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-6"
      >
        {/* Status and Service Section */}
        <View className="flex-row justify-between items-start mb-6">
          <View className="bg-white/20 px-4 py-2 rounded-lg">
            <Text className="text-base font-semibold text-white">{project.status}</Text>
          </View>
          <View className="items-end">
            <Text className="text-sm text-white/70 mb-1">Service</Text>
            <Text className="text-lg font-bold text-white">{project.service}</Text>
          </View>
        </View>
        
        {/* Customer Info Section */}
        <View className="flex-row justify-between">
          <View className="flex-1 pr-4">
            <View className="flex-row items-center mb-3">
              <Text className="text-xl font-bold text-white mr-3">{customer.name}</Text>
            </View>
            <Text className="text-base text-white/70 leading-5">{customer.address}</Text>
          </View>
          
          {/* Amount and Date Section */}
          <View className="items-end">
            <View className="mb-4">
              <Text className="text-sm text-white/70 mb-1">Amount</Text>
              <Text className="text-lg font-bold text-white">{project.amount}</Text>
            </View>
            <View>
              <Text className="text-sm text-white/70 mb-1">Date</Text>
              <Text className="text-lg font-bold text-white">{project.date}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
      
      {/* Progress Bar Section */}
      <View className="bg-white p-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-row">
            <View className="w-10 h-10 rounded-full border-2 border-white">
              <Image 
                source={{ uri: 'https://i.pravatar.cc/40?img=1' }} 
                className="w-full h-full rounded-full"
              />
            </View>
            <View className="w-10 h-10 rounded-full border-2 border-white -ml-3">
              <Image 
                source={{ uri: 'https://i.pravatar.cc/40?img=2' }} 
                className="w-full h-full rounded-full"
              />
            </View>
          </View>
          <View className="flex-1 mx-4">
            <View className="h-2 bg-red-600 rounded-full" />
          </View>
          <Text className="text-xl font-bold text-gray-900">{project.progress}</Text>
        </View>
      </View>
    </View>
  );
};

export default ProjectCard;