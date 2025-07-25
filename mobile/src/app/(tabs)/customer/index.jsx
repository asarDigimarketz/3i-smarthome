import { router } from 'expo-router';
import { Cctv, HelpCircle, HouseWifi, Phone, Search, Speaker, Tv2, Plus, X } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Button,
} from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { API_CONFIG } from '../../../../config';
import auth from '../../../utils/auth';
import { useAuth } from '../../../utils/AuthContext';
import { hasPagePermission, getPageActions } from '../../../utils/permissions';
import PermissionGuard from '../../../components/Common/PermissionGuard';

const Customer = () => {
  const { user } = useAuth();
  const actions = getPageActions(user, '/dashboard/customers');
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    customerName: '',
    contactNumber: '',
    email: '',
    addressLine: '',
    city: '',
    district: '',
    state: '',
    country: 'India',
    pincode: '',
    notes: '',
    status: 'Active'
  });

  if (!hasPagePermission(user, '/dashboard/customers', 'view')) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#c92125', fontSize: 18, textAlign: 'center' }}>
          You do not have permission to view this page.
        </Text>
      </View>
    );
  }

  // Fetch customers from API
  const fetchCustomers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await auth.fetchWithAuth(`${API_CONFIG.API_URL}/api/customers`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data && Array.isArray(data.data.customers)) {
        // Transform data to match the component's expected format
        const transformedCustomers = data.data.customers.map(customer => ({
          id: customer._id,
          name: customer.customerName,
          phone: customer.contactNumber,
          email: customer.email,
          address: customer.fullAddress || 
                  `${customer.address.addressLine}, ${customer.address.city}, ${customer.address.state}, ${customer.address.country} - ${customer.address.pincode}`,
          services: customer.services || [],
          amountSpend: customer.formattedTotalSpent || `₹${customer.totalSpent?.toLocaleString('en-IN') || '0'}`,
          totalProjects: customer.totalProjects || 0,
          status: customer.status || 'Active',
          createdAt: customer.createdAt,
        }));

        setCustomers(transformedCustomers);
        setFilteredCustomers(transformedCustomers);
      } else {
        console.error('Invalid API response structure:', data);
        Alert.alert('Error', 'Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      Alert.alert(
        'Network Error', 
        'Failed to fetch customers. Please check your internet connection and try again.',
        [
          { text: 'Retry', onPress: () => fetchCustomers() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle pull-to-refresh
  const onRefresh = () => {
    fetchCustomers(true);
  };

  // Search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      // If search is empty, show all customers
      setFilteredCustomers(customers);
    } else {
      // Filter customers based on name, phone, email, or address
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.phone.includes(query) ||
        customer.email.toLowerCase().includes(query.toLowerCase()) ||
        customer.address.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  };

  // Add new customer function
  const addCustomer = async () => {
    try {
      setAddingCustomer(true);

      // Validate required fields
      if (!newCustomer.customerName || !newCustomer.contactNumber || !newCustomer.email || 
          !newCustomer.addressLine || !newCustomer.city || !newCustomer.district || 
          !newCustomer.state || !newCustomer.country || !newCustomer.pincode) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      // Prepare address object
      const address = {
        addressLine: newCustomer.addressLine,
        city: newCustomer.city,
        district: newCustomer.district,
        state: newCustomer.state,
        country: newCustomer.country,
        pincode: newCustomer.pincode,
      };

      const customerData = {
        customerName: newCustomer.customerName,
        contactNumber: newCustomer.contactNumber,
        email: newCustomer.email,
        address: address,
        notes: newCustomer.notes,
        status: newCustomer.status,
      };

      const response = await auth.fetchWithAuth(`${API_CONFIG.API_URL}/api/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Success', 'Customer added successfully');
        setShowAddForm(false);
        setNewCustomer({
          customerName: '',
          contactNumber: '',
          email: '',
          addressLine: '',
          city: '',
          district: '',
          state: '',
          country: 'India',
          pincode: '',
          notes: '',
          status: 'Active'
        });
        // Refresh the customer list
        fetchCustomers();
      } else {
        Alert.alert('Error', data.message || 'Failed to add customer');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      Alert.alert('Error', 'Failed to add customer. Please try again.');
    } finally {
      setAddingCustomer(false);
    }
  };

  // Navigate to customer detail screen with customer data
  const viewCustomerDetail = (customer) => {
    router.push({
      pathname: "/(tabs)/customer/[id]",
      params: { 
        id: customer.id,
        customer: JSON.stringify(customer) // Pass customer data for immediate display
      }
    });
  };

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
      case 'Outdoor Audio Solution':
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#DC2626" />
        <Text className="text-gray-600 mt-4">Loading customers...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#DC2626']}
            tintColor="#DC2626"
            title="Pull to refresh customers"
            titleColor="#DC2626"
          />
        }
      >
        <View className="flex-row justify-between items-center px-5 py-4 bg-white">
          <Text className="text-xl font-bold text-gray-800">Customers</Text>
          {actions.add && (
            <TouchableOpacity 
              className="flex-row items-center bg-red-600 px-4 py-2 rounded-lg"
              onPress={() => router.push('/(tabs)/customer/AddCustomer')}
            >
              <Text className="text-white font-semibold mr-1">Add</Text>
              <Plus size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
        
        <View className="p-2">
          {/* Search Bar */}
          <View className="flex-row items-center border border-gray-200 bg-white rounded-xl px-4 mb-6">
            <Search size={18} color="#666666" className="mr-3" />
            <TextInput
              className="flex-1 text-sm text-black py-4"
              placeholder="Search Customers"
              placeholderTextColor="#666666"
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </View>

          {/* No customers message */}
          {filteredCustomers.length === 0 && !loading && (
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-gray-500 text-lg">
                {searchQuery ? 'No customers found matching your search' : 'No customers available'}
              </Text>
              {!searchQuery && (
                <Text className="text-gray-400 text-sm mt-2">
                  Pull down to refresh or add a new customer
                </Text>
              )}
            </View>
          )}

          {/* Customer Cards */}
          {filteredCustomers.map((customer) => (
            <TouchableOpacity
              key={customer.id}
              className="bg-[#f4f4f4] rounded-xl p-5 shadow-lg mb-5 border border-[#c92125]"
              onPress={() => viewCustomerDetail(customer)}
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-800">{customer.name}</Text>
                  <Text className="text-sm text-gray-600 mt-1">{customer.status}</Text>
                </View>
                <TouchableOpacity className="flex-row items-center bg-red-50 px-3 py-1.5 rounded-lg">
                  <Phone size={14} color="#DC2626" />
                  <Text className="text-sm text-gray-600 ml-2">{customer.phone}</Text>
                </TouchableOpacity>
              </View>
              
              <Text className="text-base text-gray-600 mb-5 leading-5">{customer.address}</Text>
              
              <View className="flex-row justify-between items-end">
                <View className="flex-1">
                  <Text className="text-base text-gray-600 mb-2">Services</Text>
                  <View className="flex-row flex-wrap">
                    {customer.services.length > 0 ? (
                      customer.services.map((service, index) => {
                        const { icon, bgColor } = getServiceIcon(service);
                        return (
                          <View key={index} className={`mr-2 mb-2 ${bgColor} p-2 rounded-lg`}>
                            {icon}
                          </View>
                        );
                      })
                    ) : (
                      <Text className="text-gray-400 text-sm">No services</Text>
                    )}
                  </View>
                </View>
                
                <View className="items-end ml-4">
                  <Text className="text-base text-gray-600 mb-2">Amount Spent</Text>
                  <Text className="text-lg font-bold text-gray-800">{customer.amountSpend}</Text>
                  <Text className="text-sm text-gray-500 mt-1">{customer.totalProjects} projects</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Pull to Refresh Instruction */}
          {refreshing && (
            <View className="items-center py-4">
              <Text className="text-gray-500 text-sm">Refreshing customers list...</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const CustomerWithPermissions = () => {
  return (
    <PermissionGuard page="Customers" action="view">
      <Customer />
    </PermissionGuard>
  );
};

export default CustomerWithPermissions;