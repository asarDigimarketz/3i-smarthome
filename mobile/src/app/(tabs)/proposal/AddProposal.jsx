import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, ChevronDown, Upload } from 'lucide-react-native';
import { useState, useEffect } from 'react';
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
import { API_CONFIG } from '../../../../config';
import auth from '../../../utils/auth';

// 🔧 NETWORK CONFIGURATION - UPDATE WITH YOUR DEVELOPMENT MACHINE'S IP
const API_BASE_URL = API_CONFIG.API_URL; // ✅ Your actual IP address

const AddProposal = ({ isEdit = false, proposalId = null }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768; // Standard tablet breakpoint
  const router = useRouter();

  // TODO: Add permission checks here similar to web version
  // const { canCreate, canEdit, canView } = usePermissions();
  // Check permissions on component mount and show access denied if needed

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
    status: 'Warm', // Set default status
    comment: '',
    attachments: []
  });

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]); // Changed to support multiple files
  const [removedAttachments, setRemovedAttachments] = useState([]); // For edit mode
  const [loading, setLoading] = useState(false);
  
  // Customer autocomplete states
  const [customerOptions, setCustomerOptions] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [contactInput, setContactInput] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  
  // Amount management states
  const [amountOptions, setAmountOptions] = useState([]);
  const [showAmountDropdown, setShowAmountDropdown] = useState(false);

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

  // Debounce function for API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Fetch customers by email or contact
  const fetchCustomers = async (search) => {
    if (!search || search.length < 2) {
      setCustomerOptions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await auth.fetchWithAuth(
        `${API_BASE_URL}/api/customers?search=${encodeURIComponent(search)}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let customers = data.data?.customers || [];

      // Filter for matches in either field
      let filtered = customers.filter(
        (c) =>
          (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
          (c.contactNumber && c.contactNumber.includes(search))
      );

      // Prioritize exact matches
      filtered = [
        ...filtered.filter(
          (c) =>
            c.email?.toLowerCase() === search.toLowerCase() ||
            c.contactNumber === search
        ),
        ...filtered.filter(
          (c) =>
            c.email?.toLowerCase() !== search.toLowerCase() &&
            c.contactNumber !== search
        ),
      ];

      // Deduplicate by _id
      const seen = new Set();
      filtered = filtered.filter((c) => {
        if (seen.has(c._id)) return false;
        seen.add(c._id);
        return true;
      });

      setCustomerOptions(filtered);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomerOptions([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced version of fetchCustomers
  const debouncedFetchCustomers = debounce(fetchCustomers, 300);

  // When a customer is selected, autofill the form
  const autofillCustomer = (customer) => {
    if (!customer) return;

    setFormData((prev) => ({
      ...prev,
      customerName: customer.customerName || '',
      contactNumber: customer.contactNumber || '',
      emailId: customer.email || '',
      addressLine1: customer.address?.addressLine || '',
      cityTownVillage: customer.address?.city || '',
      district: customer.address?.district || '',
      state: customer.address?.state || '',
      country: customer.address?.country || '',
      pinCode: customer.address?.pincode || '',
    }));

    // Update input values
    setEmailInput(customer.email || '');
    setContactInput(customer.contactNumber || '');
  };

  // Handle customer selection from autocomplete
  const handleCustomerSelection = (customer) => {
    if (!customer) {
      setSelectedCustomer(null);
      return;
    }

    setSelectedCustomer(customer);
    autofillCustomer(customer);
    setShowEmailDropdown(false);
    setShowContactDropdown(false);
  };

  // Handle manual input changes
  const handleEmailInputChange = (value) => {
    setEmailInput(value);
    setFormData((prev) => ({ ...prev, emailId: value }));

    // Clear selection if input doesn't match selected customer
    if (selectedCustomer && selectedCustomer.email !== value) {
      setSelectedCustomer(null);
    }

    // Search for customers
    debouncedFetchCustomers(value);
  };

  const handleContactInputChange = (value) => {
    setContactInput(value);
    setFormData((prev) => ({ ...prev, contactNumber: value }));

    // Clear selection if input doesn't match selected customer
    if (selectedCustomer && selectedCustomer.contactNumber !== value) {
      setSelectedCustomer(null);
    }

    // Search for customers
    debouncedFetchCustomers(value);
  };

  // Fetch proposal data for edit mode
  useEffect(() => {
    if (isEdit && proposalId) {
      fetchProposalData();
    }
  }, [isEdit, proposalId]);

  const fetchProposalData = async () => {
    try {
      setLoading(true);
      const response = await auth.fetchWithAuth(
        `${API_BASE_URL}/api/proposals/${proposalId}`,
        {
          method: 'GET',
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const proposal = data.data.proposal;
        setFormData((prev) => ({
          ...prev,
          customerName: proposal.customerName || '',
          contactNumber: proposal.contactNumber || '',
          emailId: proposal.email || '',
          addressLine1: proposal.address?.addressLine || '',
          cityTownVillage: proposal.address?.city || '',
          district: proposal.address?.district || '',
          state: proposal.address?.state || '',
          country: proposal.address?.country || '',
          pinCode: proposal.address?.pincode || '',
          service: proposal.services || '',
          projectDescription: proposal.projectDescription || '',
          projectAmount: proposal.projectAmount || '',
          size: proposal.size || '',
          status: proposal.status || 'Warm',
          comment: proposal.comment || '',
          date: proposal.date
            ? new Date(proposal.date).toISOString().split('T')[0]
            : '',
          attachments: Array.isArray(proposal.attachments)
            ? proposal.attachments
            : [],
        }));

        // Update input values for edit mode
        setEmailInput(proposal.email || '');
        setContactInput(proposal.contactNumber || '');

        if (proposal.amountOptions) {
          setAmountOptions(proposal.amountOptions);
        }
      }
    } catch (error) {
      console.error('Error fetching proposal:', error);
      Alert.alert('Error', 'Failed to fetch proposal data');
    } finally {
      setLoading(false);
    }
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

  // Handle file selection (multiple)
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/*'
        ],
        multiple: true
      });

      if (result.assets && result.assets.length > 0) {
        // Validate each file
        const allowedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg', 
          'image/png',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        const maxSize = 10 * 1024 * 1024; // 10MB

        const validFiles = result.assets.filter((file) => {
          if (!allowedTypes.includes(file.mimeType)) {
            Alert.alert('Invalid File Type', `File ${file.name} is not a supported type`);
            return false;
          }
          if (file.size > maxSize) {
            Alert.alert('File Too Large', `File ${file.name} exceeds 10MB limit`);
            return false;
          }
          return true;
        });

        setSelectedFiles((prev) => [...prev, ...validFiles]);
      }
    } catch (err) {
      console.log('Document picker error:', err);
    }
  };

  // Remove a new file before upload
  const handleRemoveSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove an existing attachment (edit mode)
  const handleRemoveExistingAttachment = (index) => {
    if (!formData.attachments || !formData.attachments[index]) return;
    setRemovedAttachments((prev) => [...prev, formData.attachments[index]]);
    setFormData((prev) => {
      const newAttachments = Array.isArray(prev.attachments)
        ? prev.attachments.filter((_, i) => i !== index)
        : [];
      return {
        ...prev,
        attachments: newAttachments,
      };
    });
  };

  const validateForm = () => {
    // Enhanced validation to match web version
    const requiredFields = [
      'customerName',
      'contactNumber', 
      'emailId',
      'addressLine1',
      'cityTownVillage',
      'district',
      'state',
      'country',
      'pinCode',
      'service',
      'projectDescription',
      'projectAmount',
      'size'
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = field === 'emailId' ? emailInput : 
                   field === 'contactNumber' ? contactInput : 
                   formData[field];
      return !value || value.trim() === '';
    });

    if (missingFields.length > 0) {
      const fieldLabels = {
        customerName: 'Customer Name',
        contactNumber: 'Contact Number',
        emailId: 'Email ID',
        addressLine1: 'Address Line',
        cityTownVillage: 'City/Town/Village',
        district: 'District',
        state: 'State',
        country: 'Country',
        pinCode: 'Pin Code',
        service: 'Service',
        projectDescription: 'Project Description',
        projectAmount: 'Project Amount',
        size: 'Size'
      };
      
      const missingLabels = missingFields.map(field => fieldLabels[field]).join(', ');
      Alert.alert('Validation Error', `Please fill in all required fields: ${missingLabels}`);
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailToValidate = emailInput || formData.emailId;
    if (!emailRegex.test(emailToValidate)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }

    // Validate phone number (enhanced check)
    const contactToValidate = contactInput || formData.contactNumber;
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(contactToValidate)) {
      Alert.alert('Validation Error', 'Please enter a valid contact number (minimum 10 digits)');
      return false;
    }

    // Validate project amount
    const amount = parseInt(formData.projectAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid project amount');
      return false;
    }

    // Validate size format (Length X Width) - enhanced
    if (formData.size) {
      const sizePattern = /^\d{1,6}(\.\d{1,2})?\s*[xX]\s*\d{1,6}(\.\d{1,2})?$/;
      if (!sizePattern.test(formData.size.trim())) {
        Alert.alert('Validation Error', 'Size must be in format: Length X Width (e.g., 1200.36 X 1600.63)');
        return false;
      }
    }

    // Validate pin code
    const pinCodePattern = /^\d{5,6}$/;
    if (!pinCodePattern.test(formData.pinCode)) {
      Alert.alert('Validation Error', 'Please enter a valid 5-6 digit pin code');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      console.log(`🚀 Starting proposal ${isEdit ? 'update' : 'creation'}...`);
      console.log('📋 Form Data:', formData);

      // Add current project amount to amountOptions if not already present
      const currentAmountFormatted = `₹${parseInt(formData.projectAmount).toLocaleString('en-IN')}`;
      if (!amountOptions.includes(currentAmountFormatted)) {
        setAmountOptions((prev) => [...prev, currentAmountFormatted]);
      }
      
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

      // Include updated amountOptions with the current amount
      const updatedAmountOptions = amountOptions.includes(currentAmountFormatted)
        ? amountOptions
        : [...amountOptions, currentAmountFormatted];
      submitData.append('amountOptions', JSON.stringify(updatedAmountOptions));

      // Add files if selected (multiple files support)
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          submitData.append('attachments', {
            uri: file.uri,
            type: file.mimeType,
            name: file.name
          });
        });
      }

      // Add removed attachments for edit mode
      if (isEdit && removedAttachments.length > 0) {
        const filenames = removedAttachments
          .map((att) => att && (att.filename || (att._doc && att._doc.filename)))
          .filter(Boolean);
        if (filenames.length > 0) {
          submitData.append('removeAttachments', JSON.stringify(filenames));
        }
      }

      // Make API call
      const url = isEdit
        ? `${API_BASE_URL}/api/proposals/${proposalId}`
        : `${API_BASE_URL}/api/proposals`;

      const method = isEdit ? 'put' : 'post';

      console.log('🔗 API URL:', url);
      console.log('🔑 API Key:', API_CONFIG.API_KEY ? 'Set' : 'Not Set');
      console.log('📤 Sending request...');

      const response = await auth.fetchWithAuth(url, {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: submitData
      });

      console.log('📥 Response Status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥', data);

      if (data.success) {
        console.log(`✅ Proposal ${isEdit ? 'updated' : 'created'} successfully!`);
        
        let message = isEdit
          ? 'Proposal updated successfully!'
          : 'Proposal created successfully!';

        // Check if project was automatically created
        if (data.data.project) {
          message += ' A project has been automatically created from this confirmed proposal.';
        }

        // Check if customer was created
        if (data.data.customer) {
          message += ' Customer information has been saved.';
        }

        Alert.alert('Success', message, [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]);
      } else {
        console.error('❌ API returned success: false');
        console.error('❌ Error message:', data.error);
        Alert.alert('Error', data.error || `Failed to ${isEdit ? 'update' : 'create'} proposal`);
      }
    } catch (error) {
      console.error(`🚨 Error ${isEdit ? 'updating' : 'creating'} proposal:`);
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
      console.log(`🏁 ${isEdit ? 'Update' : 'Create'} operation completed`);
      setLoading(false);
    }
  };

  function formatSizeInput(text) {
    // Remove all non-numeric, non-dot, non-X, non-space characters
    let cleaned = text.replace(/[^0-9.xX\s]/g, '');
    // Replace the first space (or multiple spaces) with 'X'
    cleaned = cleaned.replace(/\s+/, 'X');
    // Remove any additional spaces
    cleaned = cleaned.replace(/\s+/g, '');
    // Only allow one 'X'
    const parts = cleaned.split('X');
    if (parts.length > 2) {
      cleaned = parts[0] + 'X' + parts.slice(1).join('');
    }
    return cleaned;
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
          <Text className="text-xl font-bold text-gray-800">{isEdit ? 'Edit Proposal' : 'Add Proposal'}</Text>
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
        <TouchableOpacity 
          activeOpacity={1}
          onPress={() => {
            setShowEmailDropdown(false);
            setShowContactDropdown(false);
            setShowStatusDropdown(false);
            setShowServiceDropdown(false);
            setShowAmountDropdown(false);
          }}
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
              <View className="relative">
                <TextInput
                  mode="outlined"
                  label="Contact Number"
                  value={contactInput}
                  onChangeText={handleContactInputChange}
                  onFocus={() => setShowContactDropdown(true)}
                  keyboardType="phone-pad"
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#DC2626"
                />
                {/* Customer autocomplete dropdown for contact */}
                {showContactDropdown && customerOptions.length > 0 && (
                  <View className="absolute top-14 left-0 bg-white rounded-lg shadow-xl z-50 w-full max-h-48">
                    <ScrollView className="max-h-48" showsVerticalScrollIndicator={false}>
                      {customerOptions.map((item) => (
                        <TouchableOpacity
                          key={item._id}
                          className="px-4 py-3 border-b border-gray-100"
                          onPress={() => handleCustomerSelection(item)}
                        >
                          <Text className="font-medium text-gray-800">{item.contactNumber}</Text>
                          <Text className="text-sm text-gray-500">{item.customerName} • {item.email}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                {isSearching && (
                  <View className="absolute right-3 top-4">
                    <ActivityIndicator size="small" color="#DC2626" />
                  </View>
                )}
              </View>
            </View>
          </View>

          <View className={`${isTablet ? 'flex-row space-x-4' : ''}`}>
            <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
              <View className="relative">
                <TextInput
                  mode="outlined"
                  label="Email Id"
                  value={emailInput}
                  onChangeText={handleEmailInputChange}
                  onFocus={() => setShowEmailDropdown(true)}
                  keyboardType="email-address"
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#DC2626"
                />
                {/* Customer autocomplete dropdown for email */}
                {showEmailDropdown && customerOptions.length > 0 && (
                  <View className="absolute top-14 left-0 bg-white rounded-lg shadow-xl z-50 w-full max-h-48">
                    <ScrollView className="max-h-48" showsVerticalScrollIndicator={false}>
                      {customerOptions.map((item) => (
                        <TouchableOpacity
                          key={item._id}
                          className="px-4 py-3 border-b border-gray-100"
                          onPress={() => handleCustomerSelection(item)}
                        >
                          <Text className="font-medium text-gray-800">{item.email}</Text>
                          <Text className="text-sm text-gray-500">{item.customerName} • {item.contactNumber}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                {isSearching && (
                  <View className="absolute right-3 top-4">
                    <ActivityIndicator size="small" color="#DC2626" />
                  </View>
                )}
              </View>
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
              <View className="space-y-2">
                {/* Amount Dropdown */}
                {amountOptions.length > 0 && (
                  <View className="relative">
                    <TouchableOpacity
                      onPress={() => setShowAmountDropdown(!showAmountDropdown)}
                      className="flex-row items-center justify-between bg-gray-100 rounded-lg h-14 px-4 w-full"
                    >
                      <Text className="text-gray-500 text-base font-medium">
                        {formData.projectAmount 
                          ? `₹${parseInt(formData.projectAmount).toLocaleString('en-IN')}` 
                          : 'Select Amount'}
                      </Text>
                      <ChevronDown size={16} color="#6B7280" />
                    </TouchableOpacity>
                    
                    {showAmountDropdown && (
                      <View className="absolute top-14 left-0 bg-white rounded-lg shadow-xl z-10 w-full max-h-48">
                        <ScrollView className="max-h-48" showsVerticalScrollIndicator={false}>
                          {amountOptions.map((item, index) => (
                            <TouchableOpacity
                              key={index.toString()}
                              className="px-4 py-3 border-b border-gray-100"
                              onPress={() => {
                                const numericValue = item.replace(/[^\d]/g, '');
                                setFormData({...formData, projectAmount: numericValue});
                                setShowAmountDropdown(false);
                              }}
                            >
                              <Text className="text-gray-800 text-base font-medium">{item}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                )}
                
                {/* Manual Amount Input */}
                <View className="flex-row space-x-2 gap-2">
                  <View className="flex-1">
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
                  <TouchableOpacity
                    className="bg-red-600 px-4 py-1 rounded-lg flex items-center justify-center"
                    onPress={() => {
                      if (formData.projectAmount) {
                        const newAmount = `₹${parseInt(formData.projectAmount).toLocaleString('en-IN')}`;
                        if (!amountOptions.includes(newAmount)) {
                          setAmountOptions((prev) => [...prev, newAmount]);
                        }
                      }
                    }}
                  >
                    <Text className="text-white font-medium text-sm">Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
              <TextInput
                mode="outlined"
                label="Size (Length X Width)"
                value={formData.size}
                onChangeText={(text) => {
                  const formattedText = formatSizeInput(text);
                  setFormData({ ...formData, size: formattedText });
                }}
                right={<TextInput.Affix text="Sq.ft" />}
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

          {/* Existing attachments (edit mode) */}
          {Array.isArray(formData.attachments) && formData.attachments.map((att, idx) => (
            <View key={att._id || att.url || att.filename} className="flex-row items-center justify-between bg-blue-50 p-3 rounded-lg mb-2">
              <View className="flex-1">
                <Text className="text-blue-800 font-medium" numberOfLines={1}>
                  {att.originalName || att.filename || 'Attachment'}
                </Text>
                <Text className="text-blue-600 text-sm">
                  Existing file
                </Text>
              </View>
              <TouchableOpacity 
                className="p-2"
                onPress={() => handleRemoveExistingAttachment(idx)}
              >
                <Text className="text-red-600">Remove</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* New files (not yet uploaded) */}
          {selectedFiles.map((file, idx) => (
            <View key={file.name + idx} className="flex-row items-center justify-between bg-gray-50 p-3 rounded-lg mb-2">
              <View className="flex-1">
                <Text className="text-gray-800 font-medium" numberOfLines={1}>
                  {file.name}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {(file.size / 1024).toFixed(2)} KB
                </Text>
              </View>
              <TouchableOpacity 
                className="p-2"
                onPress={() => handleRemoveSelectedFile(idx)}
              >
                <Text className="text-red-600">Remove</Text>
              </TouchableOpacity>
            </View>
          ))}

          {(!Array.isArray(formData.attachments) || formData.attachments.length === 0) && 
           selectedFiles.length === 0 && (
            <Text className="text-gray-500 text-sm">
              Supported formats: PDF, DOC, DOCX, Images (Max 10MB each)
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
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AddProposal;