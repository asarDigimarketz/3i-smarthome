import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { API_CONFIG } from '../../../../config';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ArrowLeft } from 'lucide-react-native';
import { ChevronDown } from 'lucide-react-native';

const AddCustomer = () => {
  const router = useRouter();
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
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const statusOptions = [
    { value: 'Active', color: 'text-green-600', bg: 'bg-green-100' },
    { value: 'Inactive', color: 'text-red-600', bg: 'bg-red-100' },
  ];

  // Add new customer function
  const addCustomer = async () => {
    try {
      setAddingCustomer(true);
      if (!newCustomer.customerName || !newCustomer.contactNumber || !newCustomer.email || 
          !newCustomer.addressLine || !newCustomer.city || !newCustomer.district || 
          !newCustomer.state || !newCustomer.country || !newCustomer.pincode) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
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
      const response = await fetch(`${API_CONFIG.API_URL}/api/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.API_KEY,
        },
        body: JSON.stringify(customerData),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert('Success', 'Customer added successfully');
        router.back();
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
          <Text className="text-xl font-bold text-gray-800">Add Customer</Text>
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
              value={newCustomer.customerName}
              onChangeText={(text) => setNewCustomer({...newCustomer, customerName: text})}
              mode="outlined"
              theme={{ colors: { primary: '#DC2626' } }}
            />
          </View>
          <View className="mb-4">
            <PaperTextInput
              label="Contact Number *"
              value={newCustomer.contactNumber}
              onChangeText={(text) => setNewCustomer({...newCustomer, contactNumber: text})}
              mode="outlined"
              keyboardType="phone-pad"
              theme={{ colors: { primary: '#DC2626' } }}
            />
          </View>
          <View className="mb-4">
            <PaperTextInput
              label="Email *"
              value={newCustomer.email}
              onChangeText={(text) => setNewCustomer({...newCustomer, email: text})}
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
              value={newCustomer.addressLine}
              onChangeText={(text) => setNewCustomer({...newCustomer, addressLine: text})}
              mode="outlined"
              theme={{ colors: { primary: '#DC2626' } }}
            />
          </View>

          <View className="mb-4">
              <PaperTextInput
                label="City *"
                value={newCustomer.city}
                onChangeText={(text) => setNewCustomer({...newCustomer, city: text})}
                mode="outlined"
                theme={{ colors: { primary: '#DC2626' } }}
              />
          </View>

          <View className="mb-4">
              <PaperTextInput
                label="District *"
                value={newCustomer.district}
                onChangeText={(text) => setNewCustomer({...newCustomer, district: text})}
                mode="outlined"
                theme={{ colors: { primary: '#DC2626' } }}
              />
          </View>

          <View className="mb-4">
              <PaperTextInput
                label="State *"
                value={newCustomer.state}
                onChangeText={(text) => setNewCustomer({...newCustomer, state: text})}
                mode="outlined"
                theme={{ colors: { primary: '#DC2626' } }}
              />
          </View>

          <View className="mb-4">
              <PaperTextInput
                label="Country *"
                value={newCustomer.country}
                onChangeText={(text) => setNewCustomer({...newCustomer, country: text})}
                mode="outlined"
                theme={{ colors: { primary: '#DC2626' } }}
              />
          </View>

            <View className="mb-4">
              <PaperTextInput
                label="Pincode *"
                value={newCustomer.pincode}
                onChangeText={(text) => setNewCustomer({...newCustomer, pincode: text})}
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
              value={newCustomer.notes}
              onChangeText={(text) => setNewCustomer({...newCustomer, notes: text})}
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
             <Text className={`text-base font-medium ${newCustomer.status === 'Active' ? 'text-green-600' : 'text-gray-600'}`}>
               {newCustomer.status || 'Status'}
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
                     setNewCustomer({ ...newCustomer, status: status.value });
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
              disabled={addingCustomer}
            >
              <Text className="text-gray-700 font-semibold text-center">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-red-600 py-3 rounded-lg"
              onPress={addCustomer}
              disabled={addingCustomer}
            >
              {addingCustomer ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold text-center">Save Customer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AddCustomer; 