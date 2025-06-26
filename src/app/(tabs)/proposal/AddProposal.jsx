import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, ChevronDown, Upload } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TextInput } from 'react-native-paper';
import axios from 'axios';

// 🔧 NETWORK CONFIGURATION - UPDATE WITH YOUR DEVELOPMENT MACHINE'S IP
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL; // ✅ Your actual IP address

const AddProposal = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768; // Standard tablet breakpoint
  const router = useRouter();

  const [formData, setFormData] = useState({
    customerName: '',
    contactNumber: '',
    emailId: '',
    date: new Date().toISOString().split('T')[0], // Set default to today's date
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
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: 'Hot', color: 'text-red-600', bg: 'bg-red-100' },
    { value: 'Cold', color: 'text-blue-600', bg: 'bg-blue-100' },
    { value: 'Warm', color: 'text-orange-600', bg: 'bg-orange-100' },
    { value: 'Scrap', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { value: 'Confirmed', color: 'text-green-600', bg: 'bg-green-100' }
  ];

  const serviceOptions = [
    { value: 'Home Cinema', color: 'text-purple-600', bg: 'bg-purple-50' },
    { value: 'Security System', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { value: 'Home Automation', color: 'text-blue-600', bg: 'bg-blue-50' },
    { value: 'Outdoor Audio Solution', color: 'text-pink-600', bg: 'bg-pink-50' }
  ];

  const stateOptions = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  const getDistrictsByState = (state) => {
    const districtMap = {
      'Tamil Nadu': [
        'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 
        'Dindigul', 'Erode', 'Kallakurichi', 'Kanchipuram', 'Kanyakumari', 'Karur', 
        'Krishnagiri', 'Madurai', 'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 
        'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 
        'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 
        'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
      ],
      'Karnataka': [
        'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban', 'Bidar', 
        'Chamarajanagar', 'Chikballapur', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 
        'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi', 'Kodagu', 
        'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Ramanagara', 'Shivamogga', 
        'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir'
      ],
      'Maharashtra': [
        'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 
        'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 
        'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 
        'Nandurbar', 'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 
        'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'
      ],
      'Kerala': [
        'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 
        'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 
        'Thrissur', 'Wayanad'
      ],
      'Andhra Pradesh': [
        'Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna', 'Kurnool', 
        'Nellore', 'Prakasam', 'Srikakulam', 'Visakhapatnam', 'Vizianagaram', 
        'West Godavari', 'YSR Kadapa'
      ],
      'Telangana': [
        'Adilabad', 'Bhadradri Kothagudem', 'Hyderabad', 'Jagtial', 'Jangaon', 'Jayashankar Bhupalpally', 
        'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam', 'Komaram Bheem Asifabad', 
        'Mahabubabad', 'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal–Malkajgiri', 'Mulugu', 
        'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal', 'Nizamabad', 'Peddapalli', 
        'Rajanna Sircilla', 'Rangareddy', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad', 
        'Wanaparthy', 'Warangal Rural', 'Warangal Urban', 'Yadadri Bhuvanagiri'
      ],
      // Add more states as needed
      'Default': ['Please select a state first']
    };
    
    return districtMap[state] || districtMap['Default'];
  };

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

  const validateForm = () => {
    const requiredFields = {
      customerName: 'Customer Name',
      contactNumber: 'Contact Number',
      emailId: 'Email ID',
      addressLine1: 'Address Line 1',
      service: 'Service',
      projectDescription: 'Project Description',
      projectAmount: 'Project Amount',
      size: 'Size'
    };

    for (const [key, label] of Object.entries(requiredFields)) {
      if (!formData[key] || formData[key].trim() === '') {
        Alert.alert('Validation Error', `${label} is required`);
        return false;
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.emailId)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }

    // Validate phone number (basic check)
    if (formData.contactNumber.length < 10) {
      Alert.alert('Validation Error', 'Please enter a valid contact number');
      return false;
    }

    // Validate size format (Length X Width)
    if (formData.size) {
      const sizePattern = /^\d{1,4}(\.\d{1,2})?\s*X\s*\d{1,4}(\.\d{1,2})?$/i;
      if (!sizePattern.test(formData.size.trim())) {
        Alert.alert('Validation Error', 'Size must be in format: 1200.36 X 1600.63 (Length X Width)');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      console.log('🚀 Starting proposal creation...');
      console.log('📋 Form Data:', formData);
      
      // Prepare FormData for file upload
      const submitData = new FormData();
      
      // Add form fields
      submitData.append('customerName', formData.customerName);
      submitData.append('contactNumber', formData.contactNumber);
      submitData.append('email', formData.emailId);
      submitData.append('date', formData.date || new Date().toISOString());
      
      // Address object - mapping to server expected field names
      const address = {
        addressLine: formData.addressLine1,        // Server expects 'addressLine'
        city: formData.cityTownVillage,           // Server expects 'city'
        district: formData.district,
        state: formData.state,
        country: formData.country,
        pincode: formData.pinCode                 // Server expects 'pincode' (lowercase)
      };
      console.log('🏠 Address Object (mapped for server):', address);
      submitData.append('address', JSON.stringify(address));
      
      submitData.append('services', formData.service);
      submitData.append('projectDescription', formData.projectDescription);
      submitData.append('projectAmount', formData.projectAmount);
      submitData.append('size', formData.size);
      submitData.append('status', formData.status || 'Warm');
      submitData.append('comment', formData.comment || '');

      // Add file if selected
      if (selectedFile) {
        console.log('📎 File selected:', selectedFile.name);
        submitData.append('attachment', {
          uri: selectedFile.uri,
          type: selectedFile.mimeType,
          name: selectedFile.name
        });
      }

      console.log('🔗 API URL:', `${API_BASE_URL}/api/proposals`);
      console.log('🔑 API Key:', process.env.EXPO_PUBLIC_API_KEY ? 'Set' : 'Not Set');
      console.log('📤 Sending request...');

      const response = await axios.post(`${API_BASE_URL}/api/proposals`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-api-key': process.env.EXPO_PUBLIC_API_KEY
        }
      });

      console.log('📥 Response Status:', response.status);
      console.log('📥 Response Data:', response.data);

      if (response.data.success) {
        console.log('✅ Proposal created successfully!');
        Alert.alert(
          'Success', 
          'Proposal created successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        console.error('❌ API returned success: false');
        console.error('❌ Error message:', response.data.error);
        Alert.alert('Error', response.data.error || 'Failed to create proposal');
      }
    } catch (error) {
      console.error('🚨 Error creating proposal:');
      console.error('🚨 Error type:', error.name);
      console.error('🚨 Error message:', error.message);
      
      if (error.response) {
        // Server responded with error status
        console.error('🚨 Response status:', error.response.status);
        console.error('🚨 Response headers:', error.response.headers);
        console.error('🚨 Response data:', error.response.data);
        
        let errorMessage = 'Server error occurred';
        if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid data sent to server. Please check all fields.';
        } else if (error.response.status === 401) {
          errorMessage = 'Unauthorized. Please check your API key.';
        } else if (error.response.status === 404) {
          errorMessage = 'API endpoint not found. Please check server configuration.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        Alert.alert('Error', errorMessage);
      } else if (error.request) {
        // Network error
        console.error('🚨 Network Error - Request made but no response received');
        console.error('🚨 Request details:', error.request);
        Alert.alert('Network Error', 'No response from server. Please check your internet connection and server status.');
      } else {
        // Other error
        console.error('🚨 Unexpected Error:', error);
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      console.log('🏁 Create operation completed');
      setLoading(false);
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
                label="Size (Length X Width)"
                value={formData.size}
                onChangeText={(text) => {
                  // Allow digits, decimal points, spaces, and X
                  const formattedText = text.replace(/[^0-9.X\s]/g, '');
                  setFormData({...formData, size: formattedText});
                }}
                placeholder="1200.36 X 1600.63"
                right={<TextInput.Affix text="Sqt" />}
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
                  formData.status === 'Confirmed' ? 'text-green-600' :
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
              disabled={loading}
            >
              <Text className="text-gray-600 font-medium">Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`${loading ? 'bg-gray-400' : 'bg-red-600'} px-8 py-3 rounded-lg flex-row items-center`}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-medium ml-2">Saving...</Text>
                </>
              ) : (
                <Text className="text-white font-medium">Save Proposal</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AddProposal;