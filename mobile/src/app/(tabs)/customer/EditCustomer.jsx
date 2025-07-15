import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_CONFIG } from '../../../../config';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';

const EditCustomer = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusOptions = [
    { value: 'Active', color: 'text-green-600', bg: 'bg-green-100' },
    { value: 'Inactive', color: 'text-red-600', bg: 'bg-red-100' },
  ];
  const [customer, setCustomer] = useState({
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
    status: 'Active',
  });

  useEffect(() => {
    if (id) fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.API_URL}/api/customers/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.API_KEY,
        },
      });
      const data = await response.json();
      if (response.ok && data.success && data.data && data.data.customer) {
        const c = data.data.customer;
        setCustomer({
          customerName: c.customerName || '',
          contactNumber: c.contactNumber || '',
          email: c.email || '',
          addressLine: c.address?.addressLine || '',
          city: c.address?.city || '',
          district: c.address?.district || '',
          state: c.address?.state || '',
          country: c.address?.country || 'India',
          pincode: c.address?.pincode || '',
          notes: c.notes || '',
          status: c.status || 'Active',
        });
      } else {
        Alert.alert('Error', 'Failed to load customer data');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      Alert.alert('Error', 'Failed to load customer data');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async () => {
    try {
      setSaving(true);
      if (!customer.customerName || !customer.contactNumber || !customer.email || 
          !customer.addressLine || !customer.city || !customer.district || 
          !customer.state || !customer.country || !customer.pincode) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
      const address = {
        addressLine: customer.addressLine,
        city: customer.city,
        district: customer.district,
        state: customer.state,
        country: customer.country,
        pincode: customer.pincode,
      };
      const customerData = {
        customerName: customer.customerName,
        contactNumber: customer.contactNumber,
        email: customer.email,
        address: address,
        notes: customer.notes,
        status: customer.status,
      };
      const response = await fetch(`${API_CONFIG.API_URL}/api/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.API_KEY,
        },
        body: JSON.stringify(customerData),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert('Success', 'Customer updated successfully');
        router.back();
      } else {
        Alert.alert('Error', data.message || 'Failed to update customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      Alert.alert('Error', 'Failed to update customer. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#DC2626" />
        <Text className="text-gray-600 mt-4">Loading customer...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white p-4 shadow-sm flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-3"
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Edit Customer</Text>
        </View>
      </View>
      {/* Form Content */}
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1}}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={40}
        keyboardOpeningTime={0}
      >
        <View className="p-6">
          {/* Customer Details */}
          <Text className="text-lg font-medium text-gray-700 mb-4">Customer Details</Text>
          <View className="mb-4">
            <PaperTextInput
              label="Customer Name *"
              value={customer.customerName}
              onChangeText={(text) => setCustomer({...customer, customerName: text})}
              mode="outlined"
              theme={{ colors: { primary: '#DC2626' } }}
            />
          </View>
          <View className="mb-4">
            <PaperTextInput
              label="Contact Number *"
              value={customer.contactNumber}
              onChangeText={(text) => setCustomer({...customer, contactNumber: text})}
              mode="outlined"
              keyboardType="phone-pad"
              theme={{ colors: { primary: '#DC2626' } }}
            />
          </View>
          <View className="mb-4">
            <PaperTextInput
              label="Email *"
              value={customer.email}
              onChangeText={(text) => setCustomer({...customer, email: text})}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              theme={{ colors: { primary: '#DC2626' } }}
            />
          </View>
          {/* Address Section Header */}
          <Text className="text-lg font-medium text-gray-700 mb-4 mt-2">Address Information</Text>
          <View className="mb-4">
            <PaperTextInput
              label="Address Line *"
              value={customer.addressLine}
              onChangeText={(text) => setCustomer({...customer, addressLine: text})}
              mode="outlined"
              theme={{ colors: { primary: '#DC2626' } }}
            />
          </View>
          <View className="mb-4">
            <PaperTextInput
              label="City *"
              value={customer.city}
              onChangeText={(text) => setCustomer({...customer, city: text})}
              mode="outlined"
              theme={{ colors: { primary: '#DC2626' } }}
            />
          </View>
          <View className="mb-4">
            <PaperTextInput
              label="District *"
              value={customer.district}
              onChangeText={(text) => setCustomer({...customer, district: text})}
              mode="outlined"
              theme={{ colors: { primary: '#DC2626' } }}
            />
          </View>
          <View className="mb-4">
            <PaperTextInput
              label="State *"
              value={customer.state}
              onChangeText={(text) => setCustomer({...customer, state: text})}
              mode="outlined"
              theme={{ colors: { primary: '#DC2626' } }}
            />
          </View>
          <View className="mb-4">
            <PaperTextInput
              label="Country *"
              value={customer.country}
              onChangeText={(text) => setCustomer({...customer, country: text})}
              mode="outlined"
              theme={{ colors: { primary: '#DC2626' } }}
            />
          </View>
          <View className="mb-4">
            <PaperTextInput
              label="Pincode *"
              value={customer.pincode}
              onChangeText={(text) => setCustomer({...customer, pincode: text})}
              mode="outlined"
              keyboardType="numeric"
              maxLength={6}
              theme={{ colors: { primary: '#DC2626' } }}
            />
          </View>
          {/* Notes */}
          <View className="mb-4">
            <PaperTextInput
              label="Notes (Optional)"
              value={customer.notes}
              onChangeText={(text) => setCustomer({...customer, notes: text})}
              mode="outlined"
              multiline
              numberOfLines={3}
              theme={{ colors: { primary: '#DC2626' } }}
            />
          </View>
          {/* Status Dropdown */}
          <View className="mb-4 relative">
            <Text className="text-base font-medium text-gray-700 mb-2">Status</Text>
            <TouchableOpacity
              onPress={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex-row items-center justify-between bg-gray-100 rounded-lg h-14 px-4 w-full"
            >
              <Text className={`text-base font-medium ${customer.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                {customer.status || 'Status'}
              </Text>
              <ChevronDown size={16} color="#6B7280" />
            </TouchableOpacity>
            {showStatusDropdown && (
              <View className="absolute top-14 left-0 bg-white rounded-lg shadow-xl z-10 w-full">
                {statusOptions.map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    className="px-4 py-3 border-b border-gray-100 active:bg-gray-50"
                    onPress={() => {
                      setCustomer({ ...customer, status: status.value });
                      setShowStatusDropdown(false);
                    }}
                  >
                    <Text className={`${status.color} text-lg font-medium`}>
                      {status.value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          {/* Form Actions */}
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity 
              className="flex-1 bg-gray-200 py-3 rounded-lg"
              onPress={() => router.back()}
              disabled={saving}
            >
              <Text className="text-gray-700 font-semibold text-center">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-red-600 py-3 rounded-lg"
              onPress={updateCustomer}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold text-center">Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default EditCustomer; 