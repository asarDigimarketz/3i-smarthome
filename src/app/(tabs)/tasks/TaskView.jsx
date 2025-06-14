import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ChevronDown, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Mock data for demonstration
const project = {
  customerName: 'Sanker A',
  phone: '+91 85464 865724',
  amount: '₹20,00,000',
  address: '1A/67 Anbu Nager, Anna Nager, Madurai-625018',
  email: 'sanker@gmail.com',
  description: 'Asked for quote for Dolby speakers',
  size: '2500 x 3500 sqt',
  tasks: [
    {
      id: 1,
      title: 'Site Visit',
      assignee: 'Anbarasan K',
      status: 'Done',
      startDate: '10/04/2025',
      endDate: '11/04/2025',
      note: 'Complete check and verify the site',
      attachments: [
        { type: 'image', uri: 'https://via.placeholder.com/80x80?text=Before' },
        { type: 'image', uri: 'https://via.placeholder.com/80x80?text=After' },
        { type: 'file', name: 'pro-98765.pdf' }
      ]
    },
    {
      id: 2,
      title: 'Electric Work',
      assignee: 'Kamal N',
      status: 'Done',
      startDate: '18/04/2025',
      endDate: '21/04/2025',
      note: 'Complete the electric work in the corridor',
      attachments: []
    }
  ]
};

export default function TaskView() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white p-4 shadow-sm flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-3" onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Home Automation</Text>
        </View>
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Project Dropdown */}
        <View className="px-4 mt-4">
          <TouchableOpacity className="flex-row items-center justify-between bg-gray-100 rounded-lg h-12 px-4">
            <Text className="text-gray-700 text-base">{project.customerName}  <Text className="text-xs text-gray-500">{project.phone}</Text></Text>
            <ChevronDown size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-gray-700 text-base mt-1">{project.amount}</Text>
        </View>
        {/* Project Details */}
        <View className="bg-white rounded-lg p-4 mx-4 mt-4 mb-2">
          <View className="flex-row justify-between mb-2">
            <View className="flex-1">
              <Text className="font-bold text-gray-800">Address</Text>
              <Text className="text-gray-600 text-xs">{project.address}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-gray-800">Email Id</Text>
              <Text className="text-gray-600 text-xs">{project.email}</Text>
            </View>
          </View>
          <View className="flex-row justify-between">
            <View className="flex-1">
              <Text className="font-bold text-gray-800">Description</Text>
              <Text className="text-gray-600 text-xs">{project.description}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-gray-800">Size</Text>
              <Text className="text-gray-600 text-xs">{project.size}</Text>
            </View>
          </View>
        </View>
        {/* Task Board */}
        <Text className="text-lg font-bold text-gray-800 px-4 mt-2 mb-2">Task Board</Text>
        <View className="px-4 pb-8">
          {project.tasks.map((task) => (
            <View key={task.id} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-base font-bold text-gray-800">{task.title}</Text>
                <View className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-700 text-xs font-medium">{task.status}</Text>
                </View>
              </View>
              <Text className="text-gray-600 mb-1">Assignee: <Text className="font-bold">{task.assignee}</Text></Text>
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-500 text-xs">Start Date: {task.startDate}</Text>
                <Text className="text-gray-500 text-xs">End Date: {task.endDate}</Text>
              </View>
              <Text className="text-gray-700 mb-2">Note: {task.note}</Text>
              <Text className="text-gray-700 mb-1">Attachment:</Text>
              <View className="flex-row mb-2">
                {task.attachments.map((att, idx) => (
                  att.type === 'image' ? (
                    <Image key={idx} source={{ uri: att.uri }} className="w-20 h-20 rounded-lg mr-2" />
                  ) : (
                    <View key={idx} className="bg-gray-100 px-2 py-1 rounded flex-row items-center mr-2">
                      <Text className="text-xs text-gray-700">{att.name}</Text>
                    </View>
                  )
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
} 