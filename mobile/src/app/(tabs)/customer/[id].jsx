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
  
  // Edit form states (similar to add form in index.jsx)
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [editForm, setEditForm] = useState({
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
                  `${customerData.address.addressLine}, ${customerData.address.city}, ${customerData.address.state} - ${customerData.address.pincode}`,
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

  // Open edit form with pre-populated data (similar to add form pattern)
  const handleEditCustomer = () => {
    if (customer && customer.addressDetails) {
      setEditForm({
        customerName: customer.name,
        contactNumber: customer.phone,
        email: customer.email,
        addressLine: customer.addressDetails.addressLine || '',
        city: customer.addressDetails.city || '',
        district: customer.addressDetails.district || '',
        state: customer.addressDetails.state || '',
        country: customer.addressDetails.country || 'India',
        pincode: customer.addressDetails.pincode || '',
        notes: customer.notes || '',
        status: customer.status || 'Active'
      });
      setShowEditForm(true);
    }
  };

  // Update customer function (similar to add customer in index.jsx)
  const updateCustomer = async () => {
    try {
      setEditingCustomer(true);

      // Validate required fields
      if (!editForm.customerName || !editForm.contactNumber || !editForm.email || 
          !editForm.addressLine || !editForm.city || !editForm.district || 
          !editForm.state || !editForm.pincode) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      // Prepare address object
      const address = {
        addressLine: editForm.addressLine,
        city: editForm.city,
        district: editForm.district,
        state: editForm.state,
        country: editForm.country,
        pincode: editForm.pincode,
      };

      const updateData = {
        customerName: editForm.customerName,
        contactNumber: editForm.contactNumber,
        email: editForm.email,
        address: address,
        notes: editForm.notes,
        status: editForm.status,
      };

      const response = await fetch(`${API_CONFIG.API_URL}/api/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.API_KEY,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Success', 'Customer updated successfully');
        setShowEditForm(false);
        setEditForm({
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
        // Refresh customer data
        fetchCustomerDetails();
      } else {
        Alert.alert('Error', data.message || 'Failed to update customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      Alert.alert('Error', 'Failed to update customer. Please try again.');
    } finally {
      setEditingCustomer(false);
    }
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
              onPress={handleEditCustomer}
            >
              <Edit size={20} color="#666666" />
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

        {/* Edit Customer Form - Using React Native Paper TextInput */}
        {showEditForm && (
          <View className="bg-white rounded-xl p-4 mb-6 shadow-lg">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-900">Edit Customer</Text>
              <TouchableOpacity 
                onPress={() => setShowEditForm(false)}
                className="p-1"
              >
                <X size={20} color="#666666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
              {/* Customer Name */}
              <View className="mb-4">
                <TextInput
                  label="Customer Name *"
                  value={editForm.customerName}
                  onChangeText={(text) => setEditForm({...editForm, customerName: text})}
                  mode="outlined"
                  theme={{ colors: { primary: '#DC2626' } }}
                />
              </View>

              {/* Contact Number */}
              <View className="mb-4">
                <TextInput
                  label="Contact Number *"
                  value={editForm.contactNumber}
                  onChangeText={(text) => setEditForm({...editForm, contactNumber: text})}
                  mode="outlined"
                  keyboardType="phone-pad"
                  theme={{ colors: { primary: '#DC2626' } }}
                />
              </View>

              {/* Email */}
              <View className="mb-4">
                <TextInput
                  label="Email *"
                  value={editForm.email}
                  onChangeText={(text) => setEditForm({...editForm, email: text})}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  theme={{ colors: { primary: '#DC2626' } }}
                />
              </View>

              {/* Address Line */}
              <View className="mb-4">
                <TextInput
                  label="Address Line *"
                  value={editForm.addressLine}
                  onChangeText={(text) => setEditForm({...editForm, addressLine: text})}
                  mode="outlined"
                  theme={{ colors: { primary: '#DC2626' } }}
                />
              </View>

              {/* City and District */}
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <TextInput
                    label="City *"
                    value={editForm.city}
                    onChangeText={(text) => setEditForm({...editForm, city: text})}
                    mode="outlined"
                    theme={{ colors: { primary: '#DC2626' } }}
                  />
                </View>
                <View className="flex-1">
                  <TextInput
                    label="District *"
                    value={editForm.district}
                    onChangeText={(text) => setEditForm({...editForm, district: text})}
                    mode="outlined"
                    theme={{ colors: { primary: '#DC2626' } }}
                  />
                </View>
              </View>

              {/* State and Pincode */}
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <TextInput
                    label="State *"
                    value={editForm.state}
                    onChangeText={(text) => setEditForm({...editForm, state: text})}
                    mode="outlined"
                    theme={{ colors: { primary: '#DC2626' } }}
                  />
                </View>
                <View className="flex-1">
                  <TextInput
                    label="Pincode *"
                    value={editForm.pincode}
                    onChangeText={(text) => setEditForm({...editForm, pincode: text})}
                    mode="outlined"
                    keyboardType="numeric"
                    maxLength={6}
                    theme={{ colors: { primary: '#DC2626' } }}
                  />
                </View>
              </View>

              {/* Status */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Status</Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity 
                    className={`flex-1 p-3 rounded-lg border ${editForm.status === 'Active' ? 'bg-green-100 border-green-500' : 'bg-gray-50 border-gray-200'}`}
                    onPress={() => setEditForm({...editForm, status: 'Active'})}
                  >
                    <Text className={`text-center font-semibold ${editForm.status === 'Active' ? 'text-green-800' : 'text-gray-600'}`}>
                      Active
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className={`flex-1 p-3 rounded-lg border ${editForm.status === 'Inactive' ? 'bg-gray-100 border-gray-500' : 'bg-gray-50 border-gray-200'}`}
                    onPress={() => setEditForm({...editForm, status: 'Inactive'})}
                  >
                    <Text className={`text-center font-semibold ${editForm.status === 'Inactive' ? 'text-gray-800' : 'text-gray-600'}`}>
                      Inactive
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Notes */}
              <View className="mb-4">
                <TextInput
                  label="Notes (Optional)"
                  value={editForm.notes}
                  onChangeText={(text) => setEditForm({...editForm, notes: text})}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  theme={{ colors: { primary: '#DC2626' } }}
                />
              </View>
            </ScrollView>

            {/* Form Actions */}
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity 
                className="flex-1 bg-gray-200 py-3 rounded-lg"
                onPress={() => setShowEditForm(false)}
                disabled={editingCustomer}
              >
                <Text className="text-gray-700 font-semibold text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 bg-red-600 py-3 rounded-lg flex-row justify-center items-center"
                onPress={updateCustomer}
                disabled={editingCustomer}
              >
                {editingCustomer ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Save size={16} color="#FFFFFF" />
                    <Text className="text-white font-semibold ml-2">Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View className="flex-row gap-3 mb-5">
          <View className="flex-1 bg-white p-4 rounded-xl items-center">
            <Text className="text-sm text-gray-600 mb-2">Total Projects</Text>
            <Text className="text-lg font-bold text-gray-900">{customer.totalProjects}</Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-xl items-center">
            <Text className="text-sm text-gray-600 mb-2">Total Amount Spent</Text>
            <Text className="text-lg font-bold text-gray-900">{customer.amountSpend}</Text>
          </View>
          <View className="flex-1 bg-white p-4 rounded-xl items-center">
            <Text className="text-sm text-gray-600 mb-2">Services</Text>
            <Text className="text-lg font-bold text-gray-900">{customer.services.length}</Text>
          </View>
        </View>

        {/* Services Used */}
        {customer.services.length > 0 && (
          <View className="bg-white rounded-xl p-4 mb-5">
            <Text className="text-lg font-bold text-gray-900 mb-3">Services Used</Text>
            <View className="flex-row flex-wrap gap-2">
              {customer.services.map((service, index) => (
                <View key={index} className="bg-red-100 px-3 py-2 rounded-lg">
                  <Text className="text-red-800 text-sm font-medium">{service}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Projects Section */}
        <View className="mb-5">
          <Text className="text-lg font-bold text-gray-900 mb-3">Projects ({projects.length})</Text>
          
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

        {/* Action Buttons */}
        <View className="pb-8">
          <TouchableOpacity 
            className="bg-red-600 py-3 rounded-lg mb-3"
            onPress={handleDeleteCustomer}
          >
            <Text className="text-white font-semibold text-center">Delete Customer</Text>
          </TouchableOpacity>
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