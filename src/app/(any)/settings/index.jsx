import { View, Text, TextInput, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { ArrowLeft, Upload } from 'lucide-react-native'

export default function GeneralSettings() {
  const router = useRouter()
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [formData, setFormData] = useState({
    companyName: '',
    gstNo: '',
    userFirstName: '',
    userLastName: '',
    phoneNumber: '',
    emailId: '',
    addressLine1: '',
    cityTownVillage: '',
    district: '',
    state: '',
    country: '',
    pinCode: ''
  })

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Setting - General</Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Logo Upload */}
        <View className="mb-6">
          <TextInput
            className="h-12 px-4 border border-gray-200 rounded-full text-gray-900 mb-2"
            placeholder="Upload Logo"
            editable={false}
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity 
            className="bg-red-600 h-12 rounded-full items-center justify-center"
            onPress={() => {/* Handle upload */}}
          >
            <Text className="text-white font-medium">Upload</Text>
          </TouchableOpacity>
        </View>

        {/* Company Details */}
        <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <TextInput
              className="h-12 px-4 border border-gray-200 rounded-full text-gray-900"
              placeholder="Company Name"
              value={formData.companyName}
              onChangeText={(text) => setFormData({...formData, companyName: text})}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <TextInput
              className="h-12 px-4 border border-gray-200 rounded-full text-gray-900"
              placeholder="GST No"
              value={formData.gstNo}
              onChangeText={(text) => setFormData({...formData, gstNo: text})}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* User Details */}
        <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <TextInput
              className="h-12 px-4 border border-gray-200 rounded-full text-gray-900"
              placeholder="User First Name"
              value={formData.userFirstName}
              onChangeText={(text) => setFormData({...formData, userFirstName: text})}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <TextInput
              className="h-12 px-4 border border-gray-200 rounded-full text-gray-900"
              placeholder="User Last Name"
              value={formData.userLastName}
              onChangeText={(text) => setFormData({...formData, userLastName: text})}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Contact Details */}
        <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <TextInput
              className="h-12 px-4 border border-gray-200 rounded-full text-gray-900"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData({...formData, phoneNumber: text})}
              keyboardType="phone-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <TextInput
              className="h-12 px-4 border border-gray-200 rounded-full text-gray-900"
              placeholder="Email Id"
              value={formData.emailId}
              onChangeText={(text) => setFormData({...formData, emailId: text})}
              keyboardType="email-address"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Address Section */}
        <Text className="text-lg font-medium text-gray-900 mb-4">Address</Text>

        <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <TextInput
              className="h-12 px-4 border border-gray-200 rounded-full text-gray-900"
              placeholder="Address Line 1"
              value={formData.addressLine1}
              onChangeText={(text) => setFormData({...formData, addressLine1: text})}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <TextInput
              className="h-12 px-4 border border-gray-200 rounded-full text-gray-900"
              placeholder="City/ Town/ Village"
              value={formData.cityTownVillage}
              onChangeText={(text) => setFormData({...formData, cityTownVillage: text})}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <TextInput
              className="h-12 px-4 border border-gray-200 rounded-full text-gray-900"
              placeholder="District"
              value={formData.district}
              onChangeText={(text) => setFormData({...formData, district: text})}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <TextInput
              className="h-12 px-4 border border-gray-200 rounded-full text-gray-900"
              placeholder="State"
              value={formData.state}
              onChangeText={(text) => setFormData({...formData, state: text})}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View className={`${isTablet ? "flex-row space-x-4" : ""} mb-8`}>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <TextInput
              className="h-12 px-4 border border-gray-200 rounded-full text-gray-900"
              placeholder="Country"
              value={formData.country}
              onChangeText={(text) => setFormData({...formData, country: text})}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View className={`${isTablet ? "flex-1" : ""}`}>
            <TextInput
              className="h-12 px-4 border border-gray-200 rounded-full text-gray-900"
              placeholder="Pin code"
              value={formData.pinCode}
              onChangeText={(text) => setFormData({...formData, pinCode: text})}
              keyboardType="number-pad"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-center space-x-4 mb-6 gap-2">
          <TouchableOpacity 
            className="bg-red-600 px-8 py-3 rounded-full"
            onPress={() => {/* Handle save */}}
          >
            <Text className="text-white font-medium">Save</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-gray-500 px-8 py-3 rounded-full"
            onPress={() => router.back()}
          >
            <Text className="text-white font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}