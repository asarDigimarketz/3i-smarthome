import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ArrowLeft, Upload } from 'lucide-react-native';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, useWindowDimensions, View, Alert, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TextInput as PaperTextInput } from 'react-native-paper';
import axios from 'axios';
import { API_CONFIG } from '../../../../config';

export default function GeneralSettings() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form data state - matching desktop structure
  const [formData, setFormData] = useState({
    companyName: '',
    gstNo: '',
    firstName: '',
    lastName: '',
    mobileNo: '',
    landlineNo: '',
    emailId: '',
    doorNo: '',
    streetName: '',
    pincode: '',
    district: '',
    state: '',
    country: '',
    logo: null,
    logoUrl: null
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [newLogo, setNewLogo] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);

  // Fetch initial data on component mount
  useEffect(() => {
    fetchGeneralData();
  }, []);

  const fetchGeneralData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📤 Fetching general data from:', `${API_CONFIG.API_URL}/api/settings/general`);
      
      const response = await axios.get(
        `${API_CONFIG.API_URL}/api/settings/general`,
        {
          headers: {
            'x-api-key': API_CONFIG.API_KEY,
          },
        }
      );

      console.log('📥 Response Status:', response.status);
      console.log('📥 Response Data:', response.data);

      if (response.data.success) {
        const generalData = response.data.generalData;
        setFormData({
          companyName: generalData.companyName || '',
          gstNo: generalData.gstNo || '',
          firstName: generalData.firstName || '',
          lastName: generalData.lastName || '',
          mobileNo: generalData.mobileNo || '',
          landlineNo: generalData.landlineNo || '',
          emailId: generalData.emailId || '',
          doorNo: generalData.doorNo || '',
          streetName: generalData.streetName || '',
          pincode: generalData.pincode || '',
          district: generalData.district || '',
          state: generalData.state || '',
          country: generalData.country || '',
          logo: generalData.logo || null,
          logoUrl: generalData.logoUrl || generalData.logo || null
        });

        // Set logo preview if available
        if (generalData.logoUrl || generalData.logo) {
          const logoUrl = generalData.logoUrl || generalData.logo;
          console.log('📷 Raw logo URL from API:', logoUrl);
          
          // Handle different URL formats and fix localhost issue
          let fullLogoUrl;
          if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
            // Replace localhost with actual server IP for mobile access
            fullLogoUrl = logoUrl.replace('http://localhost:5000', API_CONFIG.API_URL)
                                 .replace('https://localhost:5000', API_CONFIG.API_URL);
          } else if (logoUrl.startsWith('/')) {
            fullLogoUrl = `${API_CONFIG.API_URL}${logoUrl}`;
          } else {
            fullLogoUrl = `${API_CONFIG.API_URL}/${logoUrl}`;
          }
          
          console.log('📷 Converted logo URL for mobile:', fullLogoUrl);
          console.log('📷 API_CONFIG.API_URL:', API_CONFIG.API_URL);
          setSelectedImage(fullLogoUrl);
        }
      } else {
        setError(response.data.message || 'Failed to fetch general data');
      }
    } catch (err) {
      console.error('🚨 Error fetching general data:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load general settings';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'companyName') {
      // Handle company name change similar to desktop version
      handleCompanyNameChange(value);
      return;
    }

    setFormData(prevData => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleCompanyNameChange = (value) => {
    const prefix = value.slice(0, 3).toLowerCase();
    const newCompanyDb = `${prefix}-${formData.preferenceId || 'default'}`.toLowerCase();

    setFormData(prevData => ({
      ...prevData,
      companyName: value,
      companyDb: newCompanyDb,
    }));
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        
        // Check file size (5MB limit like desktop version)
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert('File Size Error', 'File size should be less than 5MB');
          return;
        }

        setSelectedImage(asset.uri);
        setNewLogo(asset);
        
        // Update form data
        setFormData(prev => ({
          ...prev,
          newLogo: asset
        }));
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Create FormData for file upload (similar to desktop version)
      const formDataToSend = new FormData();

      // Add all form fields to FormData
      Object.keys(formData).forEach((key) => {
        if (
          key !== 'newLogo' && 
          key !== 'logoUrl' &&
          formData[key] !== null &&
          formData[key] !== undefined &&
          formData[key] !== ''
        ) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add logo file if exists
      if (newLogo && newLogo.uri) {
        const uriParts = newLogo.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        
        formDataToSend.append('logo', {
          uri: newLogo.uri,
          name: `logo.${fileType}`,
          type: `image/${fileType}`,
        });
        
        console.log('📎 Adding logo file to FormData');
      }

      console.log('📤 Sending update request to:', `${API_CONFIG.API_URL}/api/settings/general`);

      const response = await axios.put(
        `${API_CONFIG.API_URL}/api/settings/general`,
        formDataToSend,
        {
          headers: {
            'x-api-key': API_CONFIG.API_KEY,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('📥 Update Response:', response.data);

      if (response.data.success) {
        const updatedData = response.data.generalData;
        
        // Update form data with response
        setFormData(prev => ({
          ...prev,
          ...updatedData,
          newLogo: null,
        }));

        // Update logo preview with new URL if available
        if (updatedData.logoUrl) {
          const logoUrl = updatedData.logoUrl;
          let fullLogoUrl;
          if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
            // Replace localhost with actual server IP for mobile access
            fullLogoUrl = logoUrl.replace('http://localhost:5000', API_CONFIG.API_URL)
                                 .replace('https://localhost:5000', API_CONFIG.API_URL);
          } else if (logoUrl.startsWith('/')) {
            fullLogoUrl = `${API_CONFIG.API_URL}${logoUrl}`;
          } else {
            fullLogoUrl = `${API_CONFIG.API_URL}/${logoUrl}`;
          }
          console.log('📷 Updated logo URL converted for mobile:', fullLogoUrl);
          setSelectedImage(fullLogoUrl);
        }

        setNewLogo(null);

        Alert.alert(
          'Success',
          'Company details updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Optionally navigate back or refresh
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update company details');
      }
    } catch (error) {
      console.error('🚨 Error updating company details:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update company details';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#DC2626" />
        <Text className="mt-4 text-gray-600">Loading general settings...</Text>
      </View>
    );
  }

  // Error state
  if (error && !formData.companyName) {
    return (
      <View className="flex-1 bg-white justify-center items-center p-4">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <TouchableOpacity 
          className="bg-red-600 px-6 py-3 rounded-lg"
          onPress={fetchGeneralData}
        >
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          {loading ? (
            <View className="w-32 h-32 items-center justify-center self-center">
              <ActivityIndicator size="large" color="#DC2626" />
              <Text className="text-gray-500 text-xs mt-2">Loading logo...</Text>
            </View>
          ) : selectedImage ? (
            <View className="mb-2">
              <Image
                source={{ uri: selectedImage }}
                className="w-32 h-32 rounded-xl self-center border border-gray-200"
                resizeMode="contain"
                onError={(error) => {
                  console.error('📷 Error loading logo image:', error);
                  console.log('📷 Failed URL:', selectedImage);
                }}
                onLoad={() => {
                  console.log('📷 Logo loaded successfully:', selectedImage);
                }}
                onLoadStart={() => {
                  console.log('📷 Starting to load logo from:', selectedImage);
                }}
              />

            </View>
          ) : (
            <View className="w-32 h-32 bg-gray-100 rounded-xl self-center mb-2 items-center justify-center border-2 border-dashed border-gray-300">
              <Upload size={32} color="#9CA3AF" />
              <Text className="text-xs text-gray-500 text-center mt-1">No Logo</Text>
            </View>
          )}
          
          <TouchableOpacity 
            className="bg-red-600 h-12 rounded-full items-center justify-center flex-row mt-2"
            onPress={pickImage}
          >
            <Upload size={20} color="white" className="mr-2" />
            <Text className="text-white font-medium">Upload Logo</Text>
          </TouchableOpacity>
          
          {selectedImage && (
            <TouchableOpacity 
              className="bg-gray-500 h-12 rounded-full items-center justify-center flex-row mt-2"
              onPress={() => {
                setSelectedImage(null);
                setNewLogo(null);
                setFormData(prev => ({ ...prev, newLogo: null }));
              }}
            >
              <Text className="text-white font-medium">Remove Logo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Company Details */}
        <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <PaperTextInput
              mode="outlined"
              label="Company Name"
              value={formData.companyName}
              onChangeText={(text) => handleInputChange('companyName', text)}
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <PaperTextInput
              mode="outlined"
              label="GST No"
              value={formData.gstNo}
              onChangeText={(text) => handleInputChange('gstNo', text)}
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
        </View>

        {/* Contact Person Details */}
        <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <PaperTextInput
              mode="outlined"
              label="First Name"
              value={formData.firstName}
              onChangeText={(text) => handleInputChange('firstName', text)}
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <PaperTextInput
              mode="outlined"
              label="Last Name"
              value={formData.lastName}
              onChangeText={(text) => handleInputChange('lastName', text)}
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
              label="Mobile No"
              value={formData.mobileNo}
              onChangeText={(text) => handleInputChange('mobileNo', text)}
              keyboardType="phone-pad"
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <PaperTextInput
              mode="outlined"
              label="Landline No"
              value={formData.landlineNo}
              onChangeText={(text) => handleInputChange('landlineNo', text)}
              keyboardType="phone-pad"
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
        </View>

        {/* Email */}
        <View className="mb-4">
          <PaperTextInput
            mode="outlined"
            label="Email ID"
            value={formData.emailId}
            onChangeText={(text) => handleInputChange('emailId', text)}
            keyboardType="email-address"
            outlineColor="#d1d5db"
            activeOutlineColor="#DC2626"
          />
        </View>

        {/* Address Section */}
        <Text className="text-lg font-medium text-gray-900 mb-4">Address</Text>

        <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <PaperTextInput
              mode="outlined"
              label="Door No."
              value={formData.doorNo}
              onChangeText={(text) => handleInputChange('doorNo', text)}
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <PaperTextInput
              mode="outlined"
              label="Street Name"
              value={formData.streetName}
              onChangeText={(text) => handleInputChange('streetName', text)}
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
        </View>

        <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <PaperTextInput
              mode="outlined"
              label="Pin Code"
              value={formData.pincode}
              onChangeText={(text) => handleInputChange('pincode', text)}
              keyboardType="number-pad"
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <PaperTextInput
              mode="outlined"
              label="District"
              value={formData.district}
              onChangeText={(text) => handleInputChange('district', text)}
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
        </View>

        <View className={`${isTablet ? "flex-row space-x-4" : ""} mb-8`}>
          <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
            <PaperTextInput
              mode="outlined"
              label="State"
              value={formData.state}
              onChangeText={(text) => handleInputChange('state', text)}
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
          <View className={`${isTablet ? "flex-1" : ""}`}>
            <PaperTextInput
              mode="outlined"
              label="Country"
              value={formData.country}
              onChangeText={(text) => handleInputChange('country', text)}
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-center space-x-4 mb-6 gap-2">
          <TouchableOpacity 
            className={`px-8 py-3 rounded-lg ${saving ? 'bg-gray-400' : 'bg-red-600'}`}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-medium ml-2">Saving...</Text>
              </View>
            ) : (
              <Text className="text-white font-medium">Save</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-gray-500 px-8 py-3 rounded-lg"
            onPress={handleCancel}
            disabled={saving}
          >
            <Text className="text-white font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAwareScrollView>
  );
}