import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { ChevronDown, ArrowLeft, Upload } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const initialProject = {
  customerName: 'Vinoth R',
  phone: '+91 8544 578341',
  amount: '₹30,00,000',
  address: '123/ss colony, Thirunager, Madurai-625018',
  email: 'vinoth@gmail.com',
  description: 'Full home automation system including lights',
  size: '2200 x 3450 sqt',
};

const initialTasks = [
  {
    id: 1,
    title: 'Electric Work',
    assignee: 'Arun R',
    status: 'New Task',
    startDate: '28/03/2025',
    endDate: '',
    note: '',
    attachments: [],
  },
  {
    id: 2,
    title: 'Home Cinema Setup',
    assignee: 'Kamal N',
    status: 'Inprogress',
    startDate: '18/04/2025',
    endDate: '19/04/2025',
    note: 'Interested in 5-seater Dolby setup',
    attachments: [],
  },
];

export default function TaskAdd() {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gradient-to-r from-[#030303] to-[#4d0f10] p-4 flex-row items-center justify-between rounded-b-2xl">
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-3" onPress={() => router.back()}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">31 SMART home</Text>
        </View>
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Project Dropdown */}
        <View className="px-4 mt-4">
          <TouchableOpacity className="flex-row items-center justify-between bg-gray-100 rounded-lg h-12 px-4">
            <Text className="text-gray-700 text-base">{initialProject.customerName}  <Text className="text-xs text-gray-500">{initialProject.phone}</Text></Text>
            <ChevronDown size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-gray-700 text-base mt-1">{initialProject.amount}</Text>
        </View>
        {/* Project Details */}
        <View className="bg-white rounded-lg p-4 mx-4 mt-4 mb-2">
          <View className="flex-row justify-between mb-2">
            <View className="flex-1">
              <Text className="font-bold text-gray-800">Address</Text>
              <Text className="text-gray-600 text-xs">{initialProject.address}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-gray-800">Email Id</Text>
              <Text className="text-gray-600 text-xs">{initialProject.email}</Text>
            </View>
          </View>
          <View className="flex-row justify-between">
            <View className="flex-1">
              <Text className="font-bold text-gray-800">Description</Text>
              <Text className="text-gray-600 text-xs">{initialProject.description}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-gray-800">Size</Text>
              <Text className="text-gray-600 text-xs">{initialProject.size}</Text>
            </View>
          </View>
        </View>
        {/* Task Board */}
        <Text className="text-lg font-bold text-gray-800 px-4 mt-2 mb-2">Task Board</Text>
        <View className="px-4 pb-8">
          {tasks.map((task, idx) => (
            <View key={task.id} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
              <View className="flex-row justify-between items-center mb-2">
                <TextInput
                  className="text-base font-bold text-gray-800 flex-1"
                  value={task.title}
                  onChangeText={text => {
                    const updated = [...tasks];
                    updated[idx].title = text;
                    setTasks(updated);
                  }}
                />
                <View className={
                  task.status === 'Done' ? 'bg-green-100' :
                  task.status === 'Inprogress' ? 'bg-orange-100' :
                  'bg-gray-100' + ' px-3 py-1 rounded-full'
                }>
                  <Text className={
                    task.status === 'Done' ? 'text-green-700' :
                    task.status === 'Inprogress' ? 'text-orange-700' :
                    'text-gray-700' + ' text-xs font-medium'
                  }>{task.status}</Text>
                </View>
              </View>
              <Text className="text-gray-600 mb-1">Assignee:</Text>
              <TextInput
                className="text-gray-700 border-b border-gray-200 mb-1"
                value={task.assignee}
                onChangeText={text => {
                  const updated = [...tasks];
                  updated[idx].assignee = text;
                  setTasks(updated);
                }}
              />
              <View className="flex-row justify-between mb-1">
                <TextInput
                  className="text-gray-500 text-xs border-b border-gray-200 flex-1 mr-2"
                  value={task.startDate}
                  onChangeText={text => {
                    const updated = [...tasks];
                    updated[idx].startDate = text;
                    setTasks(updated);
                  }}
                  placeholder="Start Date"
                />
                <TextInput
                  className="text-gray-500 text-xs border-b border-gray-200 flex-1"
                  value={task.endDate}
                  onChangeText={text => {
                    const updated = [...tasks];
                    updated[idx].endDate = text;
                    setTasks(updated);
                  }}
                  placeholder="End Date"
                />
              </View>
              <Text className="text-gray-700 mb-2">Note:</Text>
              <TextInput
                className="text-gray-700 border-b border-gray-200 mb-2"
                value={task.note}
                onChangeText={text => {
                  const updated = [...tasks];
                  updated[idx].note = text;
                  setTasks(updated);
                }}
                placeholder="Add note..."
              />
              <Text className="text-gray-700 mb-1">Attachment:</Text>
              <View className="flex-row mb-2">
                {/* Placeholder for attachments, add upload logic as needed */}
                <TouchableOpacity className="bg-gray-100 px-2 py-1 rounded flex-row items-center mr-2">
                  <Upload size={16} color="#6B7280" />
                  <Text className="text-xs text-gray-700 ml-1">Upload</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      {/* Bottom Navigation */}
      <View className="flex-row justify-around items-center h-16 bg-white border-t border-gray-200">
        <TouchableOpacity className="items-center">
          <Text className="text-xs text-gray-700">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Text className="text-xs text-gray-700">Proposal</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Text className="text-xs text-red-600 font-bold">Task</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Text className="text-xs text-gray-700">Customer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
