import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, ChevronDown, Upload, X } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import {
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Alert,
  ActivityIndicator,
  Linking,
  Modal,
  Image,
  Dimensions,
  ScrollView
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TextInput } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import axios from 'axios';

// 🔧 NETWORK CONFIGURATION - UPDATE WITH YOUR DEVELOPMENT MACHINE'S IP
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL; // ✅ Your actual IP address

const EditProposal = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const router = useRouter();
  const { id } = useLocalSearchParams();

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
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [existingAttachment, setExistingAttachment] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const [currentFileUrl, setCurrentFileUrl] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [fileLoading, setFileLoading] = useState(false);

  const statusOptions = [
    { value: 'Hot', color: 'text-red-600' },
    { value: 'Cold', color: 'text-blue-600' },
    { value: 'Warm', color: 'text-orange-600' },
    { value: 'Scrap', color: 'text-yellow-600' },
    { value: 'Confirmed', color: 'text-green-600' }
  ];

  const serviceOptions = [
    { value: 'Home Cinema', color: 'text-purple-600' },
    { value: 'Security System', color: 'text-cyan-600' },
    { value: 'Home Automation', color: 'text-blue-600' },
    { value: 'Outdoor Audio', color: 'text-pink-600' }
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

  // Helper function to truncate filename to 6 words
  const truncateFilename = (filename, maxWords = 6) => {
    if (!filename) return '';
    
    const words = filename.split(' ');
    if (words.length <= maxWords) {
      return filename;
    }
    
    return words.slice(0, maxWords).join(' ') + '...';
  };

  // Helper function to get file type indicator
  const getFileTypeIndicator = (filename) => {
    if (!filename) return 'File';
    
    const extension = filename.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return '📷 Image';
    } else if (['pdf'].includes(extension)) {
      return '📄 PDF Document';
    } else if (['doc', 'docx'].includes(extension)) {
      return '📝 Word Document';
    } else if (['xls', 'xlsx'].includes(extension)) {
      return '📊 Excel Document';
    } else if (['ppt', 'pptx'].includes(extension)) {
      return '📊 Presentation';
    } else {
      return '📁 Document';
    }
  };

  // Function to view/open file in modal
  const handleViewFile = async (fileUrl, filename) => {
    try {
      if (!fileUrl) {
        Alert.alert('Error', 'File URL not available');
        return;
      }
      
      // Construct full URL if it's a relative path
      let fullUrl = fileUrl;
      if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
        fullUrl = `${API_BASE_URL}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
      }
      
      console.log('Opening file in modal:', fullUrl);
      
      // Set file details and show modal
      setCurrentFileUrl(fullUrl);
      setCurrentFileName(filename);
      setShowFileModal(true);
      
    } catch (error) {
      console.error('Error opening file:', error);
      Alert.alert('Error', `Failed to open file: ${error.message}`);
    }
  };

  const isImageFile = (filename) => {
    const extension = filename?.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension);
  };

  const isPdfFile = (filename) => {
    const extension = filename?.split('.').pop()?.toLowerCase();
    return extension === 'pdf';
  };

  const renderFileViewer = () => {
    if (isImageFile(currentFileName)) {
      return (
        <Image
          source={{ uri: currentFileUrl }}
          style={{ 
            width: Dimensions.get('window').width - 40, 
            height: Dimensions.get('window').height - 200,
            resizeMode: 'contain'
          }}
          onLoadStart={() => setFileLoading(true)}
          onLoadEnd={() => setFileLoading(false)}
          onError={() => {
            setFileLoading(false);
            Alert.alert('Error', 'Failed to load image');
          }}
        />
      );
    } else {
      // For PDFs and other files, use WebView
      return (
        <WebView
          source={{ uri: currentFileUrl }}
          style={{ 
            width: Dimensions.get('window').width - 40, 
            height: Dimensions.get('window').height - 200 
          }}
          onLoadStart={() => setFileLoading(true)}
          onLoadEnd={() => setFileLoading(false)}
          onError={() => {
            setFileLoading(false);
            Alert.alert('Error', 'Failed to load file');
          }}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      );
    }
  };

  // Fetch existing proposal data
  const fetchProposalData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/proposals/${id}`, {
        headers: {
          'x-api-key': process.env.EXPO_PUBLIC_API_KEY // Replace with your actual API key
        }
      });

      if (response.data.success) {
        const proposal = response.data.data.proposal;
        
        // Parse address if it's an object - mapping from server field names
        let addressData = {};
        if (typeof proposal.address === 'object') {
          addressData = {
            addressLine1: proposal.address.addressLine || '',      // Server uses 'addressLine'
            cityTownVillage: proposal.address.city || '',          // Server uses 'city'
            district: proposal.address.district || '',
            state: proposal.address.state || '',
            country: proposal.address.country || '',
            pinCode: proposal.address.pincode || ''                // Server uses 'pincode' (lowercase)
          };
        } else {
          addressData = {
            addressLine1: proposal.address || '',
            cityTownVillage: '',
            district: '',
            state: '',
            country: '',
            pinCode: ''
          };
        }

        setFormData({
          customerName: proposal.customerName || '',
          contactNumber: proposal.contactNumber || '',
          emailId: proposal.email || '',
          date: proposal.date ? new Date(proposal.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          ...addressData,
          service: proposal.services || '',
          projectDescription: proposal.projectDescription || '',
          projectAmount: proposal.projectAmount?.toString() || '',
          size: proposal.size || '',
          status: proposal.status || '',
          comment: proposal.comment || ''
        });

        if (proposal.attachment) {
          setExistingAttachment({
            name: proposal.attachment.originalName,
            url: response.data.data.attachmentUrl
          });
        }
      } else {
        Alert.alert('Error', 'Failed to fetch proposal data');
      }
    } catch (error) {
      console.error('Error fetching proposal:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProposalData();
    }
  }, [id]);

  const showDatePicker = () => {
    DateTimePickerAndroid.open({
      value: formData.date ? new Date(formData.date) : new Date(),
      onChange: (event, selectedDate) => {
        if (event.type === 'set' && selectedDate) {
          const formattedDate = selectedDate.toISOString().split('T')[0];
          setFormData({ ...formData, date: formattedDate });
        }
      },
      mode: 'date'
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
        setSelectedFile(result.assets[0]);
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

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    setUpdating(true);
    
    try {
      // Prepare FormData for file upload
      const updateData = new FormData();
      
      // Add form fields
      updateData.append('customerName', formData.customerName);
      updateData.append('contactNumber', formData.contactNumber);
      updateData.append('email', formData.emailId);
      updateData.append('date', formData.date || new Date().toISOString());
      
      // Address object - mapping to server expected field names
      const address = {
        addressLine: formData.addressLine1,        // Server expects 'addressLine'
        city: formData.cityTownVillage,           // Server expects 'city'
        district: formData.district,
        state: formData.state,
        country: formData.country,
        pincode: formData.pinCode                 // Server expects 'pincode' (lowercase)
      };
      updateData.append('address', JSON.stringify(address));
      
      updateData.append('services', formData.service);
      updateData.append('projectDescription', formData.projectDescription);
      updateData.append('projectAmount', formData.projectAmount);
      updateData.append('size', formData.size);
      updateData.append('status', formData.status || 'Warm');
      updateData.append('comment', formData.comment || '');

      // Add file if selected
      if (selectedFile) {
        updateData.append('attachment', {
          uri: selectedFile.uri,
          type: selectedFile.mimeType,
          name: selectedFile.name
        });
      }

      const response = await axios.put(`${API_BASE_URL}/api/proposals/${id}`, updateData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-api-key': process.env.EXPO_PUBLIC_API_KEY // Replace with your actual API key
        }
      });

      if (response.data.success) {
        Alert.alert(
          'Success', 
          'Proposal updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.error || 'Failed to update proposal');
      }
    } catch (error) {
      console.error('Error updating proposal:', error);
      
      let errorMessage = 'Network error. Please check your connection.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#DC2626" />
        <Text className="mt-2 text-gray-600">Loading proposal data...</Text>
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
          <Text className="text-xl font-bold text-gray-800">Edit Proposal</Text>
        </View>
      </View>

      {/* Form Content */}
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={100}
      >
        <View className="p-6">
          {/* Customer Details Section */}
          <Text className="text-base font-medium text-gray-700 mb-4">
            Customer Details
          </Text>
          
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
        <Text className="text-base font-medium text-gray-700 mb-4">Address</Text>

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
            {/* District Dropdown */}
            <View className="relative">
              <TouchableOpacity
                onPress={() => setShowDistrictDropdown(!showDistrictDropdown)}
                className={`flex-row items-center justify-between rounded-lg h-14 px-4 w-full border ${
                  formData.district ? 'bg-white border-gray-300' : 'bg-gray-100 border-gray-300'
                }`}
              >
                <Text className={`${
                  formData.district ? 'text-gray-800' : 'text-gray-500'
                } text-base font-medium`}>
                  {formData.district || 'District'}
                </Text>
                <ChevronDown size={16} color="#6B7280" />
              </TouchableOpacity>
              
              {showDistrictDropdown && (
                <View className="absolute top-14 left-0 bg-white rounded-lg shadow-xl z-20 w-full max-h-60">
                  <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={true}>
                    {getDistrictsByState(formData.state).map((district, index) => (
                      <TouchableOpacity
                        key={index}
                        className="px-4 py-3 border-b border-gray-100 active:bg-gray-50"
                        onPress={() => {
                          if (district !== 'Please select a state first') {
                            setFormData({ ...formData, district: district });
                          }
                          setShowDistrictDropdown(false);
                        }}
                        disabled={district === 'Please select a state first'}
                      >
                        <Text className={`${
                          district === 'Please select a state first' ? 'text-gray-400' : 'text-gray-800'
                        } text-base font-medium`}>
                          {district}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
          <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
            {/* State Dropdown */}
            <View className="relative">
              <TouchableOpacity
                onPress={() => setShowStateDropdown(!showStateDropdown)}
                className={`flex-row items-center justify-between rounded-lg h-14 px-4 w-full border ${
                  formData.state ? 'bg-white border-gray-300' : 'bg-gray-100 border-gray-300'
                }`}
              >
                <Text className={`${
                  formData.state ? 'text-gray-800' : 'text-gray-500'
                } text-base font-medium`}>
                  {formData.state || 'State'}
                </Text>
                <ChevronDown size={16} color="#6B7280" />
              </TouchableOpacity>
              
              {showStateDropdown && (
                <View className="absolute top-14 left-0 bg-white rounded-lg shadow-xl z-20 w-full max-h-60">
                  <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={true}>
                    {stateOptions.map((state, index) => (
                      <TouchableOpacity
                        key={index}
                        className="px-4 py-3 border-b border-gray-100 active:bg-gray-50"
                        onPress={() => {
                          setFormData({ ...formData, state: state, district: '' }); // Reset district when state changes
                          setShowStateDropdown(false);
                        }}
                      >
                        <Text className="text-gray-800 text-base font-medium">
                          {state}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
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
          <View className={`${isTablet ? 'flex-1' : 'mb-6'}`}>
            <TextInput
              mode="outlined"
              label="Pin Code"
              value={formData.pinCode}
              onChangeText={(text) => setFormData({...formData, pinCode: text})}
              outlineColor="#E5E7EB"
              activeOutlineColor="#DC2626"
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

        {/* Amount and Size */}
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

        {/* Comment */}
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
                {truncateFilename(selectedFile.name)}
              </Text>
              <Text className="text-gray-500 text-xs">
                {getFileTypeIndicator(selectedFile.name)} • {(selectedFile.size / 1024).toFixed(2)} KB
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

                 {/* Show existing attachment info if available */}
           {existingAttachment && !selectedFile && (
             <View className="mt-4">
               <Text className="text-sm text-gray-600 mb-2">Current attachment:</Text>
               <View className="flex-row items-center justify-between bg-blue-50 p-3 rounded-lg">
                 <View className="flex-1 mr-3">
                   <Text className="text-blue-800 font-medium" numberOfLines={1}>
                     {truncateFilename(existingAttachment.name)}
                   </Text>
                   <Text className="text-blue-600 text-xs mt-1">
                     {getFileTypeIndicator(existingAttachment.name)}
                   </Text>
                 </View>
                 <TouchableOpacity 
                   className="px-3 py-1 bg-blue-600 rounded"
                   onPress={() => handleViewFile(existingAttachment.url, existingAttachment.name)}
                 >
                   <Text className="text-white text-sm">View</Text>
                 </TouchableOpacity>
               </View>
             </View>
           )}

          
          {/* Action Buttons */}
          <View className="flex-row justify-center space-x-4 mt-8 gap-2">
            <TouchableOpacity 
              className="bg-gray-100 px-8 py-3 rounded-lg"
              onPress={() => router.back()}
              disabled={updating}
            >
              <Text className="text-gray-600 font-medium">Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`${updating ? 'bg-gray-400' : 'bg-red-600'} px-8 py-3 rounded-lg flex-row items-center`}
              onPress={handleUpdate}
              disabled={updating}
            >
              {updating ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-medium ml-2">Updating...</Text>
                </>
              ) : (
                <Text className="text-white font-medium">Update Proposal</Text>
              )}
            </TouchableOpacity>
          </View>


        </View>
      </KeyboardAwareScrollView>

      {/* File Viewer Modal */}
      <Modal
        visible={showFileModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFileModal(false)}
      >
        <View className="flex-1 bg-white">
          {/* Modal Header */}
          <View className="bg-white p-4 shadow-sm flex-row items-center justify-between border-b border-gray-200">
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
                {truncateFilename(currentFileName, 25)}
              </Text>
              <Text className="text-sm text-gray-500">
                {getFileTypeIndicator(currentFileName)}
              </Text>
            </View>
            <TouchableOpacity 
              className="ml-3 p-2"
              onPress={() => setShowFileModal(false)}
            >
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* File Content */}
          <View className="flex-1 justify-center items-center bg-gray-50">
            {fileLoading && (
              <View className="absolute inset-0 justify-center items-center bg-white bg-opacity-80 z-10">
                <ActivityIndicator size="large" color="#DC2626" />
                <Text className="mt-2 text-gray-600">Loading file...</Text>
              </View>
            )}
            
            {currentFileUrl ? renderFileViewer() : (
              <Text className="text-gray-500">No file to display</Text>
            )}
          </View>

          {/* Modal Footer */}
          <View className="bg-white p-4 border-t border-gray-200">
            <View className="flex-row justify-center space-x-4">
              <TouchableOpacity 
                className="bg-blue-600 rounded-lg px-6 py-3 flex-1 mr-2"
                onPress={async () => {
                  try {
                    await Linking.openURL(currentFileUrl);
                  } catch (error) {
                    Alert.alert('Error', 'Failed to open file externally');
                  }
                }}
              >
                <Text className="text-white font-semibold text-center">Open Externally</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EditProposal;