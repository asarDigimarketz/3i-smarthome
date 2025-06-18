import { useRouter } from 'expo-router';
import { Cctv, HelpCircle, HouseWifi, Phone, Search, Speaker, Tv2 } from 'lucide-react-native';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { customers } from '../../../data/mockData';

const Customer = () => {
  const router = useRouter();

  const getServiceIcon = (service) => {
    switch (service) {
      case 'Home Cinema':
        return {
          icon: <Tv2 size={24} color="#7c3aed" />,
          bgColor: 'bg-services-cinema-light'
        };
      case 'Home Automation':
        return {
          icon: <HouseWifi size={24} color="#2563eb" />,
          bgColor: 'bg-services-automation-light'
        };
      case 'Security System':
        return {
          icon: <Cctv size={24} color="#0891b2" />,
          bgColor: 'bg-services-security-light'
        };
      case 'Outdoor Audio':
        return {
          icon: <Speaker size={24} color="#db2777" />,
          bgColor: 'bg-services-audio-light'
        };
      default:
        return {
          icon: <HelpCircle size={24} color="#6B7280" />,
          bgColor: 'bg-gray-100'
        };
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
                    {customer.services.map((service, index) => {
                      const { icon, bgColor } = getServiceIcon(service);
                      return (
                        <View key={index} className={`mr-4 ${bgColor} p-2 rounded-lg`}>
                          {icon}
                        </View>
                      );
                    })}
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