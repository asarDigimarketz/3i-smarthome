import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  useWindowDimensions 
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ChevronDown, Calendar, Upload, ArrowLeft } from 'lucide-react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { proposalData } from '../../../data/mockData';

const EditProposal = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768; // Standard tablet breakpoint

  const router = useRouter();
  const { proposalId } = useLocalSearchParams();

  // Get the proposal data from mockData
  const proposal = proposalData.find(p => p.id === Number(proposalId)) || {};

  // Initialize form data with existing proposal data
  const [formData, setFormData] = useState({
    customerName: proposal.name || '',
    contactNumber: proposal.phone || '',
    emailId: proposal.email || '',
    date: proposal.date || '',
    addressLine1: proposal.address || '',
    cityTownVillage: proposal.cityTownVillage || '',
    district: proposal.district || '',
    state: proposal.state || '',
    country: proposal.country || '',
    pinCode: proposal.pinCode || '',
    service: proposal.service || '',
    projectDescription: proposal.description || '',
    projectAmount: proposal.amount || '',
    size: proposal.size || '',
    status: proposal.status || '',
    comment: proposal.comment || '',
  });

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const statusOptions = [
    { value: 'Hot', color: 'text-red-600', bg: 'bg-red-100' },
    { value: 'Cold', color: 'text-blue-600', bg: 'bg-blue-100' },
    { value: 'Warm', color: 'text-orange-600', bg: 'bg-orange-100' },
    { value: 'Scrap', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { value: 'Confirm', color: 'text-green-600', bg: 'bg-green-100' }
  ];

  const serviceOptions = [
    { value: 'Home Cinema', color: 'text-purple-600', bg: 'bg-purple-50' },
    { value: 'Security System', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { value: 'Home Automation', color: 'text-blue-600', bg: 'bg-blue-50' },
    { value: 'Outdoor Audio', color: 'text-pink-600', bg: 'bg-pink-50' }
  ];

  const showDatePicker = () => {
    DateTimePickerAndroid.open({
      value: formData.date ? new Date(formData.date) : new Date(),
      onChange: (event, selectedDate) => {
        if (event.type === 'set' && selectedDate) {
          const formattedDate = selectedDate.toISOString().split('T')[0];
          setFormData({ ...formData, date: formattedDate });
        }
      },
      mode: 'date',
    });
  };

  const InputField = ({ placeholder, value, onChangeText, hasDropdown = false }) => (
    <View className="relative">
      <TextInput
        className="h-12 border border-gray-200 rounded-full px-4 bg-white text-gray-700"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#9CA3AF"
      />
      {hasDropdown && (
        <View className="absolute right-4 top-3.5">
          <ChevronDown size={20} color="#9CA3AF" />
        </View>
      )}
    </View>
  );

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/*'
        ],
        multiple: false
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
        setFormData({
          ...formData,
          attachment: file
        });
      }
    } catch (err) {
      console.log('Document picker error:', err);
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
          <Text className="text-xl font-bold text-gray-800">Edit Proposal</Text>
        </View>
      </View>

      {/* Form Content */}
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1}}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={100}
        keyboardOpeningTime={0}
      >
        <View className="p-6">
        
        {/* Customer Details */}
        <Text className="text-base font-medium text-gray-700 mb-4">Customer Details</Text>

        <View className={`${isTablet ? 'flex-row space-x-4' : ''}`}>
          <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
            <InputField
              placeholder="Customer Name"
              value={formData.customerName}
              onChangeText={(text) => setFormData({...formData, customerName: text})}
              hasDropdown={true}
            />
          </View>

          <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
            <InputField
              placeholder="Contact Number"
              value={formData.contactNumber}
              onChangeText={(text) => setFormData({...formData, contactNumber: text})}
              hasDropdown={true}
            />
          </View>
        </View>

        <View className={`${isTablet ? 'flex-row space-x-4' : ''}`}>
          <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
            <InputField
              placeholder="Email Id"
              value={formData.emailId}
              onChangeText={(text) => setFormData({...formData, emailId: text})}
            />
          </View>

          <View className={`${isTablet ? 'flex-1' : 'mb-6'}`}>
            <View className="relative">
              <TextInput
                className="h-12 border border-gray-200 rounded-full px-4 bg-white text-gray-700 text-base"
                placeholder="Date"
                value={formData.date}
                editable={false}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity 
                className="absolute right-4 top-3.5"
                onPress={showDatePicker}
              >
                <Calendar size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Address */}
        <Text className="text-base font-medium text-gray-700 mb-4">Address</Text>

        <View className={`${isTablet ? 'flex-row space-x-4' : ''}`}>
          <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
            <InputField
              placeholder="Address Line 1"
              value={formData.addressLine1}
              onChangeText={(text) => setFormData({...formData, addressLine1: text})}
            />
          </View>
          <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
            <InputField
              placeholder="City / Town / Village"
              value={formData.cityTownVillage}
              onChangeText={(text) => setFormData({...formData, cityTownVillage: text})}
            />
          </View>
        </View>

        <View className={`${isTablet ? 'flex-row space-x-4' : ''}`}>
          <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
            <InputField
              placeholder="District"
              value={formData.district}
              onChangeText={(text) => setFormData({...formData, district: text})}
            />
          </View>
          <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
            <InputField
              placeholder="State"
              value={formData.state}
              onChangeText={(text) => setFormData({...formData, state: text})}
            />
          </View>
        </View>

        <View className={`${isTablet ? 'flex-row space-x-4' : ''}`}>
          <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
            <InputField
              placeholder="Country"
              value={formData.country}
              onChangeText={(text) => setFormData({...formData, country: text})}
            />
          </View>
          <View className={`${isTablet ? 'flex-1' : 'mb-6'}`}>
            <InputField
              placeholder="Pin Code"
              value={formData.pinCode}
              onChangeText={(text) => setFormData({...formData, pinCode: text})}
            />
          </View>
        </View>

        {/* Project Details */}
        <Text className="text-base font-medium text-gray-700 mb-4">Project Details</Text>

        {/* Service and Description */}
        <View className={`${isTablet ? 'flex-row space-x-4' : ''}`}>
          <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
            {/* Service Dropdown */}
            <View className="relative">
              <TouchableOpacity
                onPress={() => setShowServiceDropdown(true)}
                className="h-12 border border-gray-200 rounded-full px-4 bg-white flex-row items-center justify-between"
              >
                <Text className={`${
                  formData.service ? 
                    formData.service === 'Home Cinema' ? 'text-purple-600' :
                    formData.service === 'Security System' ? 'text-cyan-600' :
                    formData.service === 'Home Automation' ? 'text-blue-600' :
                    formData.service === 'Outdoor Audio' ? 'text-pink-600' :
                    'text-gray-500'
                  : 'text-gray-500'
                }`}>
                  {formData.service || 'Service'}
                </Text>
                <ChevronDown size={20} color="#9CA3AF" />
              </TouchableOpacity>

              <Modal
                visible={showServiceDropdown}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowServiceDropdown(false)}
              >
                <TouchableOpacity
                  className="flex-1 bg-black/30"
                  onPress={() => setShowServiceDropdown(false)}
                >
                  <View className="absolute top-1/3 left-6 right-6 bg-white rounded-xl shadow-xl">
                    {serviceOptions.map((service, index) => (
                      <TouchableOpacity
                        key={service.value}
                        className={`px-4 py-3 flex-row items-center justify-between ${
                          index !== serviceOptions.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                        onPress={() => {
                          setFormData({ ...formData, service: service.value });
                          setShowServiceDropdown(false);
                        }}
                      >
                        <Text className={service.color}>{service.value}</Text>
                        {formData.service === service.value && (
                          <View className={`w-3 h-3 rounded-full ${service.bg}`} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>
          </View>

          <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
            <InputField 
              placeholder="Description"
              value={formData.projectDescription}
              onChangeText={(text) => setFormData({...formData, projectDescription: text})}
            />
          </View>
        </View>

        {/* Amount and Size */}
        <View className={`${isTablet ? 'flex-row space-x-4' : ''}`}>
          <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
            <InputField
              placeholder="Project Amount"
              value={formData.projectAmount}
              onChangeText={(text) => setFormData({...formData, projectAmount: text})}
            />
          </View>
          <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
            <View className="flex-row">
              <TextInput
                className="flex-1 h-12 border border-gray-200 rounded-l-full px-4 bg-white text-gray-700"
                placeholder="Size"
                value={formData.size}
                onChangeText={(text) => setFormData({...formData, size: text})}
                placeholderTextColor="#9CA3AF"
              />
              <View className="h-12 bg-gray-50 border-t border-r border-b border-gray-200 rounded-r-full px-4 justify-center">
                <Text className="text-gray-500">Sqt</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Status */}
        <View className="relative mb-4">
          <TouchableOpacity
            onPress={() => setShowStatusDropdown(true)}
            className="h-12 border border-gray-200 rounded-full px-4 bg-white flex-row items-center justify-between"
          >
            <Text className={`${
              formData.status ? 
                formData.status === 'Hot' ? 'text-red-600' :
                formData.status === 'Cold' ? 'text-blue-600' :
                formData.status === 'Warm' ? 'text-orange-600' :
                formData.status === 'Scrap' ? 'text-yellow-600' :
                formData.status === 'Confirm' ? 'text-green-600' :
                'text-gray-500'
              : 'text-gray-500'
            }`}>
              {formData.status || 'Status'}
            </Text>
            <ChevronDown size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <Modal
            visible={showStatusDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowStatusDropdown(false)}
          >
            <TouchableOpacity
              className="flex-1 bg-black/30"
              onPress={() => setShowStatusDropdown(false)}
            >
              <View className="absolute top-1/3 left-6 right-6 bg-white rounded-xl shadow-xl">
                {statusOptions.map((status, index) => (
                  <TouchableOpacity
                    key={status.value}
                    className={`px-4 py-3 flex-row items-center justify-between ${
                      index !== statusOptions.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                    onPress={() => {
                      setFormData({ ...formData, status: status.value });
                      setShowStatusDropdown(false);
                    }}
                  >
                    <Text className={status.color}>{status.value}</Text>
                    {formData.status === status.value && (
                      <View className={`w-3 h-3 rounded-full ${status.bg}`} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* Comment */}
        <TextInput
          className="h-32 border border-gray-200 rounded-2xl px-4 py-3 mb-6 bg-white text-gray-700"
          placeholder="Comment"
          value={formData.comment}
          onChangeText={(text) => setFormData({...formData, comment: text})}
          multiline={true}
          textAlignVertical="top"
          placeholderTextColor="#9CA3AF"
        />

        {/* Project Attachment */}
        <Text className="text-base font-medium text-gray-700 mb-4">Project Attachment</Text>
        <TouchableOpacity 
          className="bg-red-600 h-12 rounded-full flex-row items-center justify-center mb-2"
          onPress={pickDocument}
        >
          <Upload size={20} color="white" className="mr-2" />
          <Text className="text-white font-medium">Upload</Text>
        </TouchableOpacity>

        {selectedFile && (
          <View className="flex-row items-center justify-between bg-gray-50 p-3 rounded-lg mb-2">
            <View className="flex-1">
              <Text className="text-gray-800 font-medium" numberOfLines={1}>
                {selectedFile.name}
              </Text>
              <Text className="text-gray-500 text-sm">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </Text>
            </View>
            <TouchableOpacity 
              className="p-2"
              onPress={() => {
                setSelectedFile(null);
                setFormData({
                  ...formData,
                  attachment: null
                });
              }}
            >
              <Text className="text-red-600">Remove</Text>
            </TouchableOpacity>
          </View>
        )}

        {!selectedFile && (
          <Text className="text-gray-500 text-sm">
            Supported formats: PDF, DOC, DOCX, Images
          </Text>
        )}

        {/* Action Buttons */}
        <View className="flex-row justify-center space-x-4 mt-8 gap-2">
          <TouchableOpacity 
            className="bg-gray-100 px-8 py-3 rounded-full"
            onPress={() => router.back()}
          >
            <Text className="text-gray-600 font-medium">Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-red-600 px-8 py-3 rounded-full"
            onPress={() => {
              // Add your update logic here
              console.log('Updated Form Data:', formData);
              router.back();
            }}
          >
            <Text className="text-white font-medium">Update</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  </View>
  );
};

export default EditProposal;