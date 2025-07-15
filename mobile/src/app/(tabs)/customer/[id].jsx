import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Edit,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  X,
  Save,
} from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import ProjectCard from '../../../components/Common/ProjectCard';
import { API_CONFIG } from '../../../../config';

const CustomerView = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const customerId = params.id;
  
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState([]);
  
  // Fetch customer details from API
  const fetchCustomerDetails = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`${API_CONFIG.API_URL}/api/customers/${customerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.API_KEY,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          Alert.alert('Error', 'Customer not found');
          router.back();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data && data.data.customer) {
        const customerData = data.data.customer;
        
        const formattedCustomer = {
          id: customerData._id,
          name: customerData.customerName,
          phone: customerData.contactNumber,
          email: customerData.email,
          address: customerData.fullAddress || 
                  `${customerData.address.addressLine}, ${customerData.address.city}, ${customerData.address.state}, ${customerData.address.country} - ${customerData.address.pincode}`,
          addressDetails: customerData.address, // Keep original address structure
          services: customerData.services || [],
          amountSpend: customerData.formattedTotalSpent || `₹${customerData.totalSpent?.toLocaleString('en-IN') || '0'}`,
          totalProjects: customerData.totalProjects || 0,
          status: customerData.status || 'Active',
          notes: customerData.notes || '',
          createdAt: customerData.createdAt,
        };

        // Format projects if available
        const customerProjects = customerData.projects ? customerData.projects.map(project => ({
          id: project._id,
          customerName: customerData.customerName,
          address: formattedCustomer.address,
          service: project.services || 'General',
          amount: `₹${project.projectAmount?.toLocaleString('en-IN') || '0'}`,
          date: project.projectDate ? new Date(project.projectDate).toLocaleDateString('en-IN') : 'Not set',
          status: project.projectStatus || 'Pending',
          progress: '1/1', // Default progress
        })) : [];
        
        setCustomer(formattedCustomer);
        setProjects(customerProjects);
      } else {
        console.error('Invalid API response structure:', data);
        Alert.alert('Error', 'Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      Alert.alert(
        'Network Error', 
        'Failed to fetch customer details. Please check your internet connection and try again.',
        [
          { text: 'Retry', onPress: () => fetchCustomerDetails() },
          { text: 'Go Back', onPress: () => router.back() }
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load customer data on component mount
  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails();
    }
  }, [customerId]);

  // Handle pull-to-refresh
  const onRefresh = () => {
    fetchCustomerDetails(true);
  };

  // Delete customer
  const handleDeleteCustomer = async () => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${customer?.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_CONFIG.API_URL}/api/customers/${customerId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': API_CONFIG.API_KEY,
                },
              });

              const data = await response.json();

              if (response.ok && data.success) {
                Alert.alert('Success', 'Customer deleted successfully');
                router.back();
              } else {
                Alert.alert('Error', data.message || 'Failed to delete customer');
              }
            } catch (error) {
              console.error('Error deleting customer:', error);
              Alert.alert('Error', 'Failed to delete customer. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#DC2626" />
        <Text className="text-gray-600 mt-4">Loading customer details...</Text>
      </SafeAreaView>
    );
  }

  // Handle case where customer is not found
  if (!customer) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-500">Customer not found</Text>
          <TouchableOpacity 
            className="mt-4 bg-red-600 px-4 py-2 rounded-lg"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1 px-4" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#DC2626']}
            tintColor="#DC2626"
            title="Pull to refresh customer data"
            titleColor="#DC2626"
          />
        }
      >
        <View className="flex-row justify-between items-center mt-5 mb-5">
          <TouchableOpacity 
            className="flex-row items-center" 
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color="#000000" />
            <Text className="text-xl font-bold text-gray-900">Customers</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center bg-red-600 px-4 py-2 rounded-lg"
            onPress={() => router.push("/(tabs)/proposal/AddProposal")}
          >
            <Text className="text-white font-semibold mr-1">Add</Text>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View className="bg-red-50 rounded-xl p-5 mb-5">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">{customer.name}</Text>
              <View className="flex-row items-center mt-2">
                <View className={`px-2 py-1 rounded-full ${customer.status === 'Active' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Text className={`text-xs font-semibold ${customer.status === 'Active' ? 'text-green-800' : 'text-gray-800'}`}>
                    {customer.status}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity 
              className="bg-white p-2 rounded-lg"
              onPress={() => router.push({ pathname: '/(tabs)/customer/EditCustomer', params: { id: customer.id } })}
            >
              <Edit size={20} color="#c92125" />
            </TouchableOpacity>
          </View>
          
          <View className="space-y-2">
            <View className="flex-row items-center">
              <Phone size={16} color="#DC2626" />
              <Text className="text-base text-gray-600 ml-3">{customer.phone}</Text>
            </View>
            <View className="flex-row items-start">
              <Mail size={16} color="#DC2626" className="mt-1" />
              <Text className="text-base text-gray-600 ml-3">{customer.email}</Text>
            </View>
            <View className="flex-row items-start">
              <MapPin size={16} color="#DC2626" className="mt-1" />
              <Text className="text-base text-gray-600 ml-3 flex-1">{customer.address}</Text>
            </View>
          </View>

          {customer.notes && (
            <View className="mt-4 p-3 bg-white rounded-lg">
              <Text className="text-sm font-semibold text-gray-700 mb-1">Notes:</Text>
              <Text className="text-sm text-gray-600">{customer.notes}</Text>
            </View>
          )}
        </View>

        <View className="flex-row gap-3 mb-5">
          <View className="flex-1 bg-white p-4 rounded-xl items-center">
            <Text className="text-sm text-gray-600 mb-2">Total Projects</Text>
            <Text className="text-lg font-bold text-gray-900">{customer.totalProjects}</Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-xl items-center">
            <Text className="text-sm text-gray-600 mb-2">Total Amount Spent</Text>
            <Text className="text-lg font-bold text-gray-900">{customer.amountSpend}</Text>
          </View>
        </View>

        {/* Projects Section */}
        <View className="mb-5">
        
          {projects.length === 0 ? (
            <View className="bg-white rounded-xl p-6 items-center">
              <Text className="text-gray-500 text-center">No projects found for this customer</Text>
              <TouchableOpacity 
                className="mt-3 bg-red-600 px-4 py-2 rounded-lg"
                onPress={() => router.push("/(tabs)/projects/AddProjects")}
              >
                <Text className="text-white font-semibold">Create Project</Text>
              </TouchableOpacity>
            </View>
          ) : (
            projects.map((project) => (
              <ProjectCard 
                key={project.id}
                project={project}
                customer={customer}
              />
            ))
          )}
        </View>

        {/* Pull to Refresh Instruction */}
        {refreshing && (
          <View className="items-center py-4">
            <Text className="text-gray-500 text-sm">Refreshing customer data...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomerView; 