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
import { API_CONFIG } from '../../../../config';
import apiClient from '../../../utils/apiClient'; 

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
    email: '', // Changed from emailId to match web version
    addressLine: '', // Changed from addressLine1 to match web version
    city: '', // Changed from cityTownVillage to match web version
    district: '',
    state: '',
    country: '',
    pincode: '', // Changed from pinCode to match web version
    services: '', // Changed from service to match web version
    projectDescription: '',
    projectAmount: '',
    size: '',
    status: 'Warm', // Set default status
    comment: '',
    date: new Date().toISOString().split('T')[0], // Set default to today's date
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
      const response = await apiClient.get(`/api/customers?search=${encodeURIComponent(search)}`);

      const data = response.data;
      if (!data.success) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
      email: customer.email || '',
      addressLine: customer.address?.addressLine || '',
      city: customer.address?.city || '',
      district: customer.address?.district || '',
      state: customer.address?.state || '',
      country: customer.address?.country || '',
      pincode: customer.address?.pincode || '',
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
    setFormData((prev) => ({ ...prev, email: value }));

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
      // Use setTimeout to avoid state updates during render
      const timer = setTimeout(() => {
        fetchProposalData();
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [isEdit, proposalId]);

  const fetchProposalData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/proposals/${proposalId}`, {
        timeout: 30000, // 30 seconds timeout
      });
      
      const data = response.data;
      if (!data.success) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (data.success) {
        const proposal = data.data.proposal;
        setFormData((prev) => ({
          ...prev,
          customerName: proposal.customerName || '',
          contactNumber: proposal.contactNumber || '',
          email: proposal.email || '',
          addressLine: proposal.address?.addressLine || '',
          city: proposal.address?.city || '',
          district: proposal.address?.district || '',
          state: proposal.address?.state || '',
          country: proposal.address?.country || '',
          pincode: proposal.address?.pincode || '',
          services: proposal.services || '',
          projectDescription: proposal.projectDescription || '',
          projectAmount: proposal.projectAmount || '',
          size: proposal.size || '',
          status: proposal.status || 'Warm',
          comment: proposal.comment || '',
          date: proposal.date
            ? new Date(proposal.date).toISOString().split('T')[0]
            : '',
          attachments: Array.isArray(proposal.attachments) 
            ? proposal.attachments.map(att => {
                // Extract data from Mongoose document
                const attachmentData = att._doc || att;
                return {
                  ...attachmentData,
                  // Extract filename from URL if not present
                  filename: attachmentData.filename || attachmentData.url?.split('/').pop(),
                  // Extract originalName from filename if not present
                  originalName: attachmentData.originalName || attachmentData.filename || attachmentData.url?.split('/').pop(),
                  // Determine mimetype from file extension if not present
                  mimetype: attachmentData.mimetype || getMimeTypeFromUrl(attachmentData.url)
                };
              })
            : [],
        }));

        // Update input values for edit mode
        setEmailInput(proposal.email || '');
        setContactInput(proposal.contactNumber || '');
        
        // Ensure formData is properly synchronized
        setFormData((prev) => ({
          ...prev,
          email: proposal.email || '',
          contactNumber: proposal.contactNumber || '',
        }));

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

  const getMimeTypeFromUrl = (url) => {
    if (!url) return 'application/octet-stream';
    
    const extension = url.split('.').pop()?.toLowerCase();
    const mimeTypes = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain',
      'rtf': 'application/rtf'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
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
      console.error('Document picker error:', err);
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
    // Validate required fields - matching web version exactly
    const requiredFields = [
      'customerName',
      'contactNumber', 
      'email',
      'addressLine',
      'city',
      'district',
      'state',
      'country',
      'pincode',
      'services',
      'projectDescription',
      'projectAmount',
      'size'
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);
    
    if (missingFields.length > 0) {
      const fieldLabels = {
        customerName: 'Customer Name',
        contactNumber: 'Contact Number',
        email: 'Email ID',
        addressLine: 'Address Line',
        city: 'City/Town/Village',
        district: 'District',
        state: 'State',
        country: 'Country',
        pincode: 'Pin Code',
        services: 'Service',
        projectDescription: 'Project Description',
        projectAmount: 'Project Amount',
        size: 'Size'
      };
      
      const missingLabels = missingFields.map(field => fieldLabels[field]).join(', ');
      Alert.alert('Validation Error', `Please fill in all required fields: ${missingLabels}`);
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
      // Add current project amount to amountOptions if not already present
      const currentAmountFormatted = `₹${parseInt(formData.projectAmount).toLocaleString('en-IN')}`;
      if (!amountOptions.includes(currentAmountFormatted)) {
        setAmountOptions((prev) => [...prev, currentAmountFormatted]);
      }

      // Create FormData for file upload - matching web version exactly
      const submitData = new FormData();

      // Add all form fields - matching web version structure
      submitData.append('customerName', formData.customerName);
      submitData.append('contactNumber', formData.contactNumber);
      submitData.append('email', formData.email);
      submitData.append('date', formData.date);
      
      // Address object - matching web version exactly
      submitData.append('address', JSON.stringify({
        addressLine: formData.addressLine,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
      }));
      
      submitData.append('services', formData.services);
      submitData.append('projectDescription', formData.projectDescription);
      submitData.append('projectAmount', formData.projectAmount);
      submitData.append('size', formData.size);
      submitData.append('status', formData.status);
      submitData.append('comment', formData.comment);

      // Include updated amountOptions with the current amount - matching web version
      const updatedAmountOptions = amountOptions.includes(currentAmountFormatted)
        ? amountOptions
        : [...amountOptions, currentAmountFormatted];
      submitData.append('amountOptions', JSON.stringify(updatedAmountOptions));

      // Add files if selected - matching web version exactly
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          // Create proper file object for FormData
          const fileObject = {
            uri: file.uri,
            type: file.mimeType || 'application/octet-stream',
            name: file.name || 'document'
          };
          submitData.append('attachments', fileObject);
        });
      }

      // Add removed attachments for edit mode - matching web version
      if (isEdit && removedAttachments.length > 0) {
        const filenames = removedAttachments
          .map((att) => att && (att.filename || (att._doc && att._doc.filename)))
          .filter(Boolean); // Remove null/undefined
        if (filenames.length > 0) {
          submitData.append('removeAttachments', JSON.stringify(filenames));
        }
      }

      // Make API call - matching web version exactly
      let response;
      if (isEdit) {
        response = await apiClient.put(`/api/proposals/${proposalId}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds timeout for file uploads
        });
      } else {
        response = await apiClient.post('/api/proposals', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds timeout for file uploads
        });
      }

      if (response.data.success) {
        let message = isEdit
          ? 'Proposal updated successfully!'
          : 'Proposal created successfully!';

        // Check if project was automatically created
        if (response.data.data.project) {
          message += ' A project has been automatically created from this confirmed proposal.';
        }

        // Check if customer was created
        if (response.data.data.customer) {
          message += ' Customer information has been saved.';
        }

        Alert.alert('Success', message, [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)/proposal')
          }
        ]);
      } else {
        throw new Error(response.data.error || 'Failed to save proposal');
      }
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} proposal:`, error);
      
      let errorMessage = 'Network error. Please check your connection.';
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.error || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please try again.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
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
            onPress={() => router.push('/(tabs)/proposal')}
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
                value={formData.addressLine}
                onChangeText={(text) => setFormData({...formData, addressLine: text})}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
              />
            </View>
            <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
              <TextInput
                mode="outlined"
                label="City / Town / Village"
                value={formData.city}
                onChangeText={(text) => setFormData({...formData, city: text})}
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
                value={formData.pincode}
                onChangeText={(text) => setFormData({...formData, pincode: text})}
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
                    formData.services ? 
                      formData.services === 'Home Cinema' ? 'text-purple-600' :
                      formData.services === 'Security System' ? 'text-cyan-600' :
                      formData.services === 'Home Automation' ? 'text-blue-600' :
                      formData.services === 'Outdoor Audio Solution' ? 'text-pink-600' :
                      'text-gray-500'
                    : 'text-gray-500'
                  } text-base font-medium`}>
                    {formData.services || 'Service'}
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
                          setFormData({ ...formData, services: service.value });
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
              <View className="space-y-2 gap-4">
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
                    className="bg-red-600 px-4 h-14 mt-2 rounded-lg flex items-center justify-center"
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
              onPress={() => router.push('/(tabs)/proposal')}
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
                <Text className="text-white font-medium">
                  {isEdit ? 'Update Proposal' : 'Save Proposal'}
                </Text>
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