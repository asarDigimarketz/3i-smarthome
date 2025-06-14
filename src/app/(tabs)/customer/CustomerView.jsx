import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { 
  ChevronLeft,
  Plus,
  Phone,
  Mail,
  MapPin,
  Edit,
} from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ProjectCard from '../../../components/Common/ProjectCard';
import { projectData } from '../../../data/mockData';

const CustomerView = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const customer = JSON.parse(params.customer);

  // Filter projects for the current customer
  const customerProjects = projectData.filter(
    project => project.customerName === customer.name
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mt-5 mb-5">
          <TouchableOpacity 
            className="flex-row items-center" 
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color="#000000" />
            <Text className="text-xl font-bold text-gray-900">Customers</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center bg-red-600 px-4 py-2 rounded-full"
            onPress={() => router.push("/(tabs)/proposal/AddProposal")}
          >
            <Text className="text-white font-semibold mr-1">Add</Text>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View className="bg-red-50 rounded-xl p-5 mb-5">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold text-gray-900">{customer.name}</Text>
            <TouchableOpacity className="bg-white p-2 rounded-lg">
              <Edit size={20} color="#666666" />
            </TouchableOpacity>
          </View>
          
          <View className="space-y-2">
            <View className="flex-row items-center">
              <Phone size={16} color="#DC2626" />
              <Text className="text-base text-gray-600 ml-3">{customer.phone}</Text>
            </View>
            <View className="flex-row items-center">
              <Mail size={16} color="#DC2626" />
              <Text className="text-base text-gray-600 ml-3">vinoth@gmail.com</Text>
            </View>
            <View className="flex-row items-center">
              <MapPin size={16} color="#DC2626" />
              <Text className="text-base text-gray-600 ml-3">{customer.address}</Text>
            </View>
          </View>
        </View>

        <View className="flex-row gap-3 mb-5">
          <View className="flex-1 bg-white p-4 rounded-xl items-center">
            <Text className="text-sm text-gray-600 mb-2">Total Projects</Text>
            <Text className="text-lg font-bold text-gray-900">{customerProjects.length}</Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-xl items-center">
            <Text className="text-sm text-gray-600 mb-2">Total amount Spent</Text>
            <Text className="text-lg font-bold text-gray-900">{customer.amountSpend}</Text>
          </View>
        </View>

        {customerProjects.map((project) => (
          <ProjectCard 
            key={project.id}
            project={project}
            customer={customer}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomerView;