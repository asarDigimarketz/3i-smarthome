import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, ChevronDown, Upload } from 'lucide-react-native';
import { useState } from 'react';
import {
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TextInput } from 'react-native-paper';

const AddProposal = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768; // Standard tablet breakpoint

  const [formData, setFormData] = useState({
    customerName: '',
    contactNumber: '',
    emailId: '',
    date: '',
    addressLine1: '',
    cityTownVillage: '',
    district: '',
    state: '',
    country: '',
    pinCode: '',
    service: '',
    projectDescription: '',
    projectAmount: '',
    size: '',
    status: '',
    comment: ''
  });

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const router = useRouter();

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
        // Add file to form data
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
          <Text className="text-xl font-bold text-gray-800">Add Proposal</Text>
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
          <Text className="text-lg font-medium text-gray-700 mb-4">Customer Details</Text>

          <View className={`${isTablet ? 'flex-row space-x-4' : ''}`}>
            <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
              <TextInput
                mode="outlined"
                label="Customer Name"
                value={formData.customerName}
                onChangeText={(text) => setFormData({...formData, customerName: text})}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
              />
            </View>

            <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
              <TextInput
                mode="outlined"
                label="Contact Number"
                value={formData.contactNumber}
                onChangeText={(text) => setFormData({...formData, contactNumber: text})}
                keyboardType="phone-pad"
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
              />
            </View>
          </View>

          <View className={`${isTablet ? 'flex-row space-x-4' : ''}`}>
            <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
              <TextInput
                mode="outlined"
                label="Email Id"
                value={formData.emailId}
                onChangeText={(text) => setFormData({...formData, emailId: text})}
                keyboardType="email-address"
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
              />
            </View>

            <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
              <TextInput
                mode="outlined"
                label="Date"
                value={formData.date}
                editable={false}
                right={<TextInput.Icon icon={() => <Calendar size={20} color="#9CA3AF" />} onPress={showDatePicker} />}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
              />
            </View>
          </View>

          {/* Address */}
          <Text className="text-lg font-medium text-gray-700 mb-4">Address</Text>

          <View className={`${isTablet ? 'flex-row space-x-4' : ''}`}>
            <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
              <TextInput
                mode="outlined"
                label="Address Line 1"
                value={formData.addressLine1}
                onChangeText={(text) => setFormData({...formData, addressLine1: text})}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
              />
            </View>
            <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
              <TextInput
                mode="outlined"
                label="City / Town / Village"
                value={formData.cityTownVillage}
                onChangeText={(text) => setFormData({...formData, cityTownVillage: text})}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
              />
            </View>
          </View>

          <View className={`${isTablet ? 'flex-row space-x-4' : ''}`}>
            <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
              <TextInput
                mode="outlined"
                label="District"
                value={formData.district}
                onChangeText={(text) => setFormData({...formData, district: text})}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
              />
            </View>
            <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
              <TextInput
                mode="outlined"
                label="State"
                value={formData.state}
                onChangeText={(text) => setFormData({...formData, state: text})}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
              />
            </View>
          </View>

          <View className={`${isTablet ? 'flex-row space-x-4' : ''}`}>
            <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
              <TextInput
                mode="outlined"
                label="Country"
                value={formData.country}
                onChangeText={(text) => setFormData({...formData, country: text})}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
              />
            </View>
            <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
              <TextInput
                mode="outlined"
                label="Pin Code"
                value={formData.pinCode}
                onChangeText={(text) => setFormData({...formData, pinCode: text})}
                keyboardType="number-pad"
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
              />
            </View>
          </View>

          {/* Project Details */}
          <Text className="text-lg font-medium text-gray-700 mb-4">Project Details</Text>

          <View className={`${isTablet ? 'flex-row space-x-4' : ''}`}>
            <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
              {/* Service Dropdown */}
              <View className="relative">
                <TouchableOpacity
                  onPress={() => setShowServiceDropdown(!showServiceDropdown)}
                  className="flex-row items-center justify-between bg-gray-100 rounded-lg h-14 px-4 w-full"
                >
                  <Text className={`${
                    formData.service ? 
                      formData.service === 'Home Cinema' ? 'text-purple-600' :
                      formData.service === 'Security System' ? 'text-cyan-600' :
                      formData.service === 'Home Automation' ? 'text-blue-600' :
                      formData.service === 'Outdoor Audio' ? 'text-pink-600' :
                      'text-gray-500'
                    : 'text-gray-500'
                  } text-base font-medium`}>
                    {formData.service || 'Service'}
                  </Text>
                  <ChevronDown size={16} color="#6B7280" />
                </TouchableOpacity>
                
                {showServiceDropdown && (
                  <View className="absolute top-14 left-0 bg-white rounded-lg shadow-xl z-10 w-full">
                    {serviceOptions.map((service) => (
                      <TouchableOpacity
                        key={service.value}
                        className="px-4 py-3 border-b border-gray-100 active:bg-gray-50"
                        onPress={() => {
                          setFormData({ ...formData, service: service.value });
                          setShowServiceDropdown(false);
                        }}
                      >
                        <Text className={`${service.color} text-lg font-medium`}>
                          {service.value}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
              <TextInput
                mode="outlined"
                label="Description"
                value={formData.projectDescription}
                onChangeText={(text) => setFormData({...formData, projectDescription: text})}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
              />
            </View>
          </View>

          <View className={`${isTablet ? 'flex-row space-x-4' : ''}`}>
            <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
              <TextInput
                mode="outlined"
                label="Project Amount"
                value={formData.projectAmount}
                onChangeText={(text) => setFormData({...formData, projectAmount: text})}
                keyboardType="numeric"
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
              />
            </View>
            <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
              <TextInput
                mode="outlined"
                label="Size"
                value={formData.size}
                onChangeText={(text) => setFormData({...formData, size: text})}
                right={<TextInput.Affix text="Sqt" />}
                keyboardType="numeric"
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
              />
            </View>
          </View>

          {/* Status */}
          <View className="relative mb-4">
            <TouchableOpacity
              onPress={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex-row items-center justify-between bg-gray-100 rounded-lg h-14 px-4 w-full"
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
              } text-base font-medium`}>
                {formData.status || 'Status'}
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
                      setFormData({ ...formData, status: status.value });
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

          {/* Comment TextArea */}
          <TextInput
            mode="outlined"
            label="Comment"
            value={formData.comment}
            onChangeText={(text) => setFormData({...formData, comment: text})}
            multiline={true}
            numberOfLines={4}
            style={{
              minHeight: 120,
              textAlignVertical: 'top',
            }}
            outlineColor="#E5E7EB"
            activeOutlineColor="#DC2626"
          />

          {/* Project Attachment */}
          <Text className="text-base font-medium text-gray-700 mb-4">Project Attachment</Text>
          <TouchableOpacity 
            className="bg-red-600 h-12 rounded-lg flex-row items-center justify-center mb-2"
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
              className="bg-gray-100 px-8 py-3 rounded-lg"
              onPress={() => router.back()}
            >
              <Text className="text-gray-600 font-medium">Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-red-600 px-8 py-3 rounded-lg"
              onPress={() => {
                // Add your save logic here
                console.log('Form Data:', formData);
                router.back();
              }}
            >
              <Text className="text-white font-medium">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AddProposal;