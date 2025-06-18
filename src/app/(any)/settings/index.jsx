import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ArrowLeft, Upload } from 'lucide-react-native';
import * as React from 'react';
import { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TextInput as PaperTextInput } from 'react-native-paper';

export default function GeneralSettings() {
  const router = useRouter()
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const [text, setText] = React.useState('');
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

  const [selectedImage, setSelectedImage] = useState(null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image:', error);
    }
  };

  return (
    <KeyboardAwareScrollView 
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={50}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
    >
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
          {selectedImage ? (
            <View className="mb-2">
              <Image
                source={{ uri: selectedImage }}
                className="w-32 h-32 rounded-xl self-center "
                resizeMode="contain"
              />
            </View>
          ) : (
            <View className="w-32 h-32 bg-gray-300 rounded-xl self-center mb-2 items-center justify-center">
              <Upload size={32} color="#9CA3AF" />
            </View>
          )}
          
          <TouchableOpacity 
            className="bg-red-600 h-12 rounded-full items-center justify-center flex-row"
            onPress={pickImage}
          >
            <Upload size={20} color="white" className="mr-2" />
            <Text className="text-white font-medium">Upload Logo</Text>
          </TouchableOpacity>
        </View>

        {/* Company Details */}
        <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <PaperTextInput
              mode="outlined"
              label="Company Name"
              value={formData.companyName}
              onChangeText={(text) => setFormData({...formData, companyName: text})}
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <PaperTextInput
              mode="outlined"
              label="GST No"
              value={formData.gstNo}
              onChangeText={(text) => setFormData({...formData, gstNo: text})}
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
        </View>

        {/* User Details */}
        <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <PaperTextInput
              mode="outlined"
              label="First Name"
              value={formData.userFirstName}
              onChangeText={(text) => setFormData({...formData, userFirstName: text})}
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <PaperTextInput
              mode="outlined"
              label="Last Name"
              value={formData.userLastName}
              onChangeText={(text) => setFormData({...formData, userLastName: text})}
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
        </View>

        {/* Contact Details */}
        <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <PaperTextInput
              mode="outlined"
              label="Phone Number"
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData({...formData, phoneNumber: text})}
              keyboardType="phone-pad"
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <PaperTextInput
              mode="outlined"
              label="Email"
              value={formData.emailId}
              onChangeText={(text) => setFormData({...formData, emailId: text})}
              keyboardType="email-address"
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
        </View>

        {/* Address Section */}
        <Text className="text-lg font-medium text-gray-900 mb-4">Address</Text>

        <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <PaperTextInput
              mode="outlined"
              label="Address Line 1"
              value={formData.addressLine1}
              onChangeText={(text) => setFormData({...formData, addressLine1: text})}
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <PaperTextInput
              mode="outlined"
              label="City/Town/Village"
              value={formData.cityTownVillage}
              onChangeText={(text) => setFormData({...formData, cityTownVillage: text})}
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
        </View>

        <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <PaperTextInput
              mode="outlined"
              label="District"
              value={formData.district}
              onChangeText={(text) => setFormData({...formData, district: text})}
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <PaperTextInput
              mode="outlined"
              label="State"
              value={formData.state}
              onChangeText={(text) => setFormData({...formData, state: text})}
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
        </View>

        <View className={`${isTablet ? "flex-row space-x-4" : ""} mb-8`}>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <PaperTextInput
              mode="outlined"
              label="Country"
              value={formData.country}
              onChangeText={(text) => setFormData({...formData, country: text})}
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
          <View className={`${isTablet ? "flex-1" : ""}`}>
            <PaperTextInput
              mode="outlined"
              label="Pin Code"
              value={formData.pinCode}
              onChangeText={(text) => setFormData({...formData, pinCode: text})}
              keyboardType="number-pad"
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-center space-x-4 mb-6 gap-2">
          <TouchableOpacity 
            className="bg-red-600 px-8 py-3 rounded-lg"
            onPress={() => {/* Handle save */}}
          >
            <Text className="text-white font-medium">Save</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-gray-500 px-8 py-3 rounded-lg"
            onPress={() => router.back()}
          >
            <Text className="text-white font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAwareScrollView>
  )
}