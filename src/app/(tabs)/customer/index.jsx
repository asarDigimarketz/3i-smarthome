import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Search, Phone, Tv2, HouseWifi, Cctv, Speaker, HelpCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { customers } from '../../../data/mockData';

const Customer = () => {
  const router = useRouter();

  const getServiceIcon = (service, size = 24, color = '#DC2626') => {
    switch (service) {
      case 'Home Cinema':
        return <Tv2 size={size} color={color} />;
      case 'Home Automation':
        return <HouseWifi size={size} color={color} />;
      case 'Security System':
        return <Cctv size={size} color={color} />;
      case 'Outdoor Audio':
        return <Speaker size={size} color={color} />;
      default:
        return <HelpCircle size={size} color={color} />;
    }
  };

  const handleCustomerPress = (customer) => {
    router.push({
      pathname: "/(tabs)/customer/CustomerView",
      params: { customer: JSON.stringify(customer) }
    });
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center px-5 py-4 bg-white">
          <Text className="text-xl font-bold text-gray-800">Customers</Text>
        </View>
        
        <View className="p-2">
          {/* Search Bar */}
          <View className="flex-row items-center bg-red-100 rounded-xl px-4 mb-6">
            <Search size={18} color="#666666" className="mr-3" />
            <TextInput
              className="flex-1 text-sm text-black"
              placeholder="Search Customers"
              placeholderTextColor="#666666"
            />
          </View>

          {/* Customer Cards */}
          {customers.map((customer) => (
            <TouchableOpacity
              key={customer.id}
              className="bg-[#f4f4f4] rounded-xl p-5 shadow-lg mb-5"
              onPress={() => handleCustomerPress(customer)}
            >
              <View className="flex-row justify-between items-start mb-3">
                <Text className="text-lg font-bold text-gray-800 flex-1">{customer.name}</Text>
                <TouchableOpacity className="flex-row items-center bg-red-50 px-3 py-1.5 rounded-lg">
                  <Phone size={14} color="#DC2626" />
                  <Text className="text-sm text-gray-600 ml-2">{customer.phone}</Text>
                </TouchableOpacity>
              </View>
              
              <Text className="text-base text-gray-600 mb-5 leading-5">{customer.address}</Text>
              
              <View className="flex-row justify-between items-end">
                <View className="flex-1">
                  <Text className="text-base text-gray-600 mb-2">Services</Text>
                  <View className="flex-row">
                    {customer.services.map((service, index) => (
                      <View key={index} className="mr-4 bg-red-50 p-2 rounded-lg">
                        {getServiceIcon(service)}
                      </View>
                    ))}
                  </View>
                </View>
                
                <View className="items-end">
                  <Text className="text-base text-gray-600 mb-2">Amount Spend</Text>
                  <Text className="text-lg font-bold text-gray-800">{customer.amountSpend}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Customer;