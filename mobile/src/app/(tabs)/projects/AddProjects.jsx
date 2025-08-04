import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, ChevronDown, Upload } from "lucide-react-native";
import { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Alert,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { TextInput } from "react-native-paper";
import auth from '../../../utils/auth';
import apiClient from '../../../utils/apiClient';

const AddProject = ({ isEdit = false, projectId = null }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const router = useRouter();

  // API Configuration
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
  const API_KEY = process.env.EXPO_PUBLIC_API_KEY;



  const [formData, setFormData] = useState({
    customerName: "",
    contactNumber: "",
    email: "",
    address: {
      addressLine: "",
      city: "",
      district: "",
      state: "",
      country: "India",
      pincode: "",
    },
    services: "",
    projectDescription: "",
    size: "",
    projectAmount: "",
    comment: "",
    projectStatus: "New",
    projectDate: new Date().toISOString().split("T")[0],
    attachments: [],
  });
  const [selectedFiles, setSelectedFiles] = useState([]); // new files
  const [removedAttachments, setRemovedAttachments] = useState([]); // For edit mode
  const [errors, setErrors] = useState({});
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Customer autocomplete states
  const [customerOptions, setCustomerOptions] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [contactInput, setContactInput] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showEmailDropdown, setShowEmailDropdown] = useState(false);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const serviceOptions = [
    { value: "Home Cinema", color: "text-purple-600", bg: "bg-purple-50" },
    { value: "Security System", color: "text-cyan-600", bg: "bg-cyan-50" },
    { value: "Home Automation", color: "text-blue-600", bg: "bg-blue-50" },
    { value: "Outdoor Audio Solution", color: "text-pink-600", bg: "bg-pink-50" },
  ];

  // Update the statusOptions array
  const statusOptions = [
    { value: "New", color: "text-blue-600", bg: "bg-blue-100" },
    { value: "InProgress", color: "text-yellow-600", bg: "bg-yellow-100" },
    { value: "Done", color: "text-green-600", bg: "bg-green-100" },
    { value: "Complete", color: "text-purple-600", bg: "bg-purple-100" },
  ];

  // Helper function to map mobile status to server status
  const mapMobileToServerStatus = (mobileStatus) => {
    const statusMap = {
      'New': 'new',
      'InProgress': 'in-progress',
      'Complete': 'completed',
      'Done': 'done',
      'Cancelled': 'cancelled'
    };
    return statusMap[mobileStatus] || 'new';
  };

  // Helper function to format size input
  const formatSizeInput = (text) => {
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
      address: {
        addressLine: customer.address?.addressLine || '',
        city: customer.address?.city || '',
        district: customer.address?.district || '',
        state: customer.address?.state || '',
        country: customer.address?.country || 'India',
        pincode: customer.address?.pincode || '',
      }
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

  // Fetch project data for edit mode
  const fetchProjectData = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/api/projects/${projectId}`);
      
      const data = response.data;
      if (!data.success) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (data.success && data.data && data.data.project) {
        const project = data.data.project;
        
        // Add null checks for all project properties
        setFormData((prev) => ({
          ...prev,
          customerName: project.customerName || '',
          contactNumber: project.contactNumber || '',
          email: project.email || '',
          address: {
            addressLine: project.address?.addressLine || '',
            city: project.address?.city || '',
            district: project.address?.district || '',
            state: project.address?.state || '',
            country: project.address?.country || 'India',
            pincode: project.address?.pincode || '',
          },
          services: project.services || '',
          projectDescription: project.projectDescription || '',
          projectAmount: project.projectAmount?.toString() || '',
          size: project.size || '',
          comment: project.comment || '',
          projectStatus: project.projectStatus || 'new',
          projectDate: project.projectDate ? new Date(project.projectDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          attachments: Array.isArray(project.attachments) 
            ? project.attachments.map(att => {
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

        // Update input values for customer search with null checks
        setEmailInput(project.email || '');
        setContactInput(project.contactNumber || '');

        // Debug: Log attachment data for edit mode
        
      } else if (data.success && data.data) {
        // Actual structure: project data is directly in data.data
        const project = data.data;
        
        setFormData((prev) => ({
          ...prev,
          customerName: project.customerName || '',
          contactNumber: project.contactNumber || '',
          email: project.email || '',
          address: {
            addressLine: project.address?.addressLine || '',
            city: project.address?.city || '',
            district: project.address?.district || '',
            state: project.address?.state || '',
            country: project.address?.country || 'India',
            pincode: project.address?.pincode || '',
          },
          services: project.services || '',
          projectDescription: project.projectDescription || '',
          projectAmount: project.projectAmount?.toString() || '',
          size: project.size || '',
          comment: project.comment || '',
          projectStatus: project.projectStatus || 'new',
          projectDate: project.projectDate ? new Date(project.projectDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          attachments: Array.isArray(project.attachments) 
            ? project.attachments.map(att => {
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

        setEmailInput(project.email || '');
        setContactInput(project.contactNumber || '');

       
      } else if (data.success && data.project) {
        // Fallback: direct project object in response
        const project = data.project;
        
        setFormData((prev) => ({
          ...prev,
          customerName: project.customerName || '',
          contactNumber: project.contactNumber || '',
          email: project.email || '',
          address: {
            addressLine: project.address?.addressLine || '',
            city: project.address?.city || '',
            district: project.address?.district || '',
            state: project.address?.state || '',
            country: project.address?.country || 'India',
            pincode: project.address?.pincode || '',
          },
          services: project.services || '',
          projectDescription: project.projectDescription || '',
          projectAmount: project.projectAmount?.toString() || '',
          size: project.size || '',
          comment: project.comment || '',
          projectStatus: project.projectStatus || 'new',
          projectDate: project.projectDate ? new Date(project.projectDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          attachments: Array.isArray(project.attachments) ? project.attachments : [],
        }));

        setEmailInput(project.email || '');
        setContactInput(project.contactNumber || '');
      } else {
        console.error('Invalid project data structure:', data);
        Alert.alert('Error', 'Invalid project data received from server');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      Alert.alert('Error', 'Failed to fetch project data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch project data for edit mode
  useEffect(() => {
    if (isEdit && projectId) {
      // Use setTimeout to avoid state updates during render
      const timer = setTimeout(() => {
        fetchProjectData();
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [isEdit, projectId]);

  const showDatePicker = () => {
    DateTimePickerAndroid.open({
      value: formData.projectDate
        ? new Date(formData.projectDate)
        : new Date(),
      onChange: (event, selectedDate) => {
        if (event.type === "set" && selectedDate) {
          const formattedDate = selectedDate.toISOString().split("T")[0];
          handleInputChange("projectDate", formattedDate);
        }
      },
      mode: "date",
    });
  };

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [section, subField] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/*",
        ],
        multiple: true,
      });
      if (result.assets && result.assets.length > 0) {
        setSelectedFiles((prev) => [...prev, ...result.assets]);
      }
    } catch (err) {
      console.error('Document picker error:', err);
    }
  };

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
    const newErrors = {};
    if (!formData.customerName.trim()) newErrors.customerName = "Customer name is required";
    if (!formData.contactNumber.trim()) newErrors.contactNumber = "Contact number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.address.addressLine.trim()) newErrors["address.addressLine"] = "Address line is required";
    if (!formData.address.city.trim()) newErrors["address.city"] = "City is required";
    if (!formData.address.district.trim()) newErrors["address.district"] = "District is required";
    if (!formData.address.state.trim()) newErrors["address.state"] = "State is required";
    if (!formData.address.pincode.trim()) newErrors["address.pincode"] = "Pincode is required";
    if (!formData.services) newErrors.services = "Service selection is required";
    if (!formData.projectDescription.trim()) newErrors.projectDescription = "Project description is required";
    if (!formData.size.trim()) newErrors.size = "Size is required";
    if (!formData.projectAmount || formData.projectAmount <= 0) newErrors.projectAmount = "Project amount is required and must be positive";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const retrySubmissionWithoutFile = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare project data (same as main submission but without file handling)
      const projectData = {
        customerName: formData.customerName.trim(),
        contactNumber: formData.contactNumber.trim(),
        email: formData.email.trim(),
        address: {
          addressLine: formData.address.addressLine.trim(),
          city: formData.address.city.trim(),
          district: formData.address.district.trim(),
          state: formData.address.state.trim(),
          country: formData.address.country.trim(),
          pincode: formData.address.pincode.trim()
        },
        services: formData.services,
        projectDescription: formData.projectDescription.trim(),
        projectAmount: parseFloat(formData.projectAmount),
        size: formData.size.trim(),
        comment: "",
        projectStatus: mapMobileToServerStatus(formData.projectStatus),
        projectDate: formData.projectDate
      };

      // Send JSON data without file
      const response = await apiClient.post(`/api/projects`, projectData);

      const responseData = response.data;

      if (responseData.success) {
        Alert.alert(
          "Success",
          "Project created successfully (without attachment)!",
          [
            {
              text: "OK",
              onPress: () => {
                router.push('/(tabs)/projects');
              }
            }
          ]
        );
      } else {
        Alert.alert("Error", responseData.message || "Failed to create project");
      }
    } catch (error) {
      console.error('Retry Error:', error);
      Alert.alert("Error", error.message || 'Failed to create project even without file');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitProjectToAPI = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    
    // Retry mechanism for failed uploads
    const maxRetries = 2;
    let retryCount = 0;
    
    const attemptUpload = async () => {
      try {
        const submitData = new FormData();
        Object.keys(formData).forEach((key) => {
          if (key === "address") {
            submitData.append(key, JSON.stringify(formData[key]));
          } else if (key === "projectStatus") {
            submitData.append(key, mapMobileToServerStatus(formData[key]));
          } else if (key !== "attachments") {
            submitData.append(key, formData[key]);
          }
        });
        
        // Add files if selected (multiple files support)
        if (selectedFiles.length > 0) {
          selectedFiles.forEach((file, index) => {
            // Create a proper file object for FormData
            const fileObject = {
              uri: file.uri,
              type: file.mimeType || 'application/octet-stream',
              name: file.name || 'document'
            };
            submitData.append('attachments', fileObject);
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
          ? `/api/projects/${projectId}`
          : `/api/projects`;

        const method = isEdit ? 'put' : 'post';

        // Increase timeout for file uploads
        const requestConfig = {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 60000, // 60 seconds timeout for file uploads
        };

        const response = isEdit 
          ? await apiClient.put(url, submitData, requestConfig)
          : await apiClient.post(url, submitData, requestConfig);
        
        const responseData = response.data;
        if (!responseData.success) {
          // If error is about missing directory or ENOENT, retry without file
          if (responseData.error && (responseData.error.includes('ENOENT') || responseData.error.includes('no such file or directory'))) {
            await retrySubmissionWithoutFile();
            return;
          }
          throw new Error(responseData.error || responseData.message || `Failed to ${isEdit ? 'update' : 'create'} project`);
        }
        
        if (responseData.success) {
          Alert.alert("Success", `Project ${isEdit ? 'updated' : 'created'} successfully!`, [{ text: "OK", onPress: () => router.push('/(tabs)/projects') }]);
        } else {
          Alert.alert("Error", responseData.message || `Failed to ${isEdit ? 'update' : 'create'} project`);
        }
      } catch (error) {
        console.error(`Error ${isEdit ? 'updating' : 'creating'} project:`, error);
        
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
        
        // Retry logic for network errors
        if (retryCount < maxRetries && (error.message.includes('Network Error') || error.code === 'ECONNABORTED')) {
          retryCount++;
          setTimeout(() => {
            attemptUpload();
          }, 2000); // Wait 2 seconds before retry
          return;
        }
        
        Alert.alert('Error', errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    };
    
    // Start the upload attempt
    attemptUpload();
  };

  return (
    <View className="flex-1 bg-white">
      {/* Loading Screen for Edit Mode */}
      {isEdit && isLoading && (
        <View className="flex-1 bg-white justify-center items-center">
          <ActivityIndicator size="large" color="#DC2626" />
          <Text className="mt-2 text-gray-600">Loading project data...</Text>
        </View>
      )}

      {/* Main Content */}
      {(!isEdit || !isLoading) && (
        <>
          {/* Header */}
          <View className="bg-white p-4 shadow-sm flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity className="mr-3" onPress={() => router.push('/(tabs)/projects')}>
                <ArrowLeft size={24} color="#374151" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-gray-800">
                {isEdit ? "Edit Project" : "Add Project"}
              </Text>
            </View>
          </View>

          <KeyboardAwareScrollView className="flex-1">
            <View className="p-6">
          {/* Customer Details */}
          <Text className="text-lg font-medium text-gray-700 mb-4">
            Customer Details
          </Text>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Customer Name"
                value={formData.customerName}
                onChangeText={(text) => handleInputChange("customerName", text)}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                disabled={isSubmitting}
              />
              {errors.customerName && <Text className="text-red-500 text-xs mt-1">{errors.customerName}</Text>}
            </View>

            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
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
                  disabled={isSubmitting}
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
              {errors.contactNumber && <Text className="text-red-500 text-xs mt-1">{errors.contactNumber}</Text>}
            </View>
          </View>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
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
                  disabled={isSubmitting}
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
              {errors.email && <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>}
            </View>

            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Date of Booking"
                value={formData.projectDate}
                editable={false}
                right={
                  <TextInput.Icon
                    icon={() => <Calendar size={20} color="#9CA3AF" />}
                    onPress={!isSubmitting ? showDatePicker : undefined}
                  />
                }
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
              />
            </View>
          </View>

          {/* Address Section */}
          <Text className="text-lg font-medium text-gray-700 mb-4 mt-6">
            Address
          </Text>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Address Line 1"
                value={formData.address.addressLine}
                onChangeText={(text) => handleInputChange("address.addressLine", text)}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                disabled={isSubmitting}
              />
              {errors["address.addressLine"] && <Text className="text-red-500 text-xs mt-1">{errors["address.addressLine"]}</Text>}
            </View>

            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="City / Town / Village"
                value={formData.address.city}
                onChangeText={(text) => handleInputChange("address.city", text)}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                disabled={isSubmitting}
              />
              {errors["address.city"] && <Text className="text-red-500 text-xs mt-1">{errors["address.city"]}</Text>}
            </View>
          </View>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="District"
                value={formData.address.district}
                onChangeText={(text) => handleInputChange("address.district", text)}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                disabled={isSubmitting}
              />
              {errors["address.district"] && <Text className="text-red-500 text-xs mt-1">{errors["address.district"]}</Text>}
            </View>

            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="State"
                value={formData.address.state}
                onChangeText={(text) => handleInputChange("address.state", text)}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                disabled={isSubmitting}
              />
              {errors["address.state"] && <Text className="text-red-500 text-xs mt-1">{errors["address.state"]}</Text>}
            </View>
          </View>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Country"
                value={formData.address.country}
                onChangeText={(text) => handleInputChange("address.country", text)}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                disabled={isSubmitting}
              />
              {errors["address.country"] && <Text className="text-red-500 text-xs mt-1">{errors["address.country"]}</Text>}
            </View>

            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Pin Code"
                value={formData.address.pincode}
                onChangeText={(text) => handleInputChange("address.pincode", text)}
                keyboardType="numeric"
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                disabled={isSubmitting}
              />
              {errors["address.pincode"] && <Text className="text-red-500 text-xs mt-1">{errors["address.pincode"]}</Text>}
            </View>
          </View>

          {/* Project Details Section */}
          <Text className="text-lg font-medium text-gray-700 mb-4 mt-6">
            Project Details
          </Text>

          {/* Service Selection */}
          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <View className="relative">
                <TouchableOpacity
                  onPress={!isSubmitting ? () => setShowServiceDropdown(!showServiceDropdown) : undefined}
                  className="flex-row items-center justify-between bg-gray-100 rounded-lg h-12 px-4 w-full"
                >
                  <Text
                    className={`${
                      formData.services
                        ? "text-gray-800"
                        : "text-gray-500"
                    } text-base font-medium`}
                  >
                    {formData.services || "Select Service"}
                  </Text>
                  <ChevronDown size={16} color="#6B7280" />
                </TouchableOpacity>

                {showServiceDropdown && !isSubmitting && (
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
              {errors.services && <Text className="text-red-500 text-xs mt-1">{errors.services}</Text>}
            </View>

            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Project Description"
                value={formData.projectDescription}
                onChangeText={(text) => handleInputChange("projectDescription", text)}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                disabled={isSubmitting}
              />
              {errors.projectDescription && <Text className="text-red-500 text-xs mt-1">{errors.projectDescription}</Text>}
            </View>
          </View>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Size (Length X Width)"
                value={formData.size}
                onChangeText={(text) => {
                  const formattedText = formatSizeInput(text);
                  handleInputChange("size", formattedText);
                }}
                right={<TextInput.Affix text="Sq.ft" />}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                disabled={isSubmitting}
              />
              {errors.size && <Text className="text-red-500 text-xs mt-1">{errors.size}</Text>}
            </View>

            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Project Amount"
                value={formData.projectAmount}
                onChangeText={(text) => handleInputChange("projectAmount", text)}
                keyboardType="numeric"
                right={<TextInput.Affix text="₹" />}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                disabled={isSubmitting}
              />
              {errors.projectAmount && <Text className="text-red-500 text-xs mt-1">{errors.projectAmount}</Text>}
            </View>
          </View>

          {/* Status Selection */}
          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <View className="relative">
                <TouchableOpacity
                  onPress={!isSubmitting ? () => setShowStatusDropdown(!showStatusDropdown) : undefined}
                  className="flex-row items-center justify-between bg-gray-100 rounded-lg h-12 px-4 w-full"
                >
                  <Text
                    className={`${
                      formData.projectStatus
                        ? formData.projectStatus === "New"
                          ? "text-blue-600"
                          : formData.projectStatus === "InProgress"
                          ? "text-yellow-600"
                          : formData.projectStatus === "Done"
                          ? "text-green-600"
                          : formData.projectStatus === "Complete"
                          ? "text-purple-600"
                          : "text-gray-500"
                        : "text-gray-500"
                    } text-base font-medium`}
                  >
                    {formData.projectStatus || "Select Status"}
                  </Text>
                  <ChevronDown size={16} color="#6B7280" />
                </TouchableOpacity>

                {showStatusDropdown && !isSubmitting && (
                  <View className="absolute top-14 left-0 bg-white rounded-lg shadow-xl z-10 w-full">
                    {statusOptions.map((status) => (
                      <TouchableOpacity
                        key={status.value}
                        className="px-4 py-3 border-b border-gray-100 active:bg-gray-50"
                        onPress={() => {
                          setFormData({ ...formData, projectStatus: status.value });
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
            </View>
          </View>

          {/* Project Attachment Section */}
          <Text className="text-base font-semibold text-gray-700 mb-2 mt-5">
            Project Attachment
          </Text>
          
          

          <TouchableOpacity
            className={`${isSubmitting ? 'bg-gray-400' : 'bg-red-600'} h-12 rounded-lg flex-row items-center justify-center mb-2`}
            onPress={!isSubmitting ? handleFileChange : undefined}
            disabled={isSubmitting}
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
                disabled={isSubmitting}
              >
                <Text className={`${isSubmitting ? 'text-gray-400' : 'text-red-600'}`}>Remove</Text>
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
                disabled={isSubmitting}
              >
                <Text className={`${isSubmitting ? 'text-gray-400' : 'text-red-600'}`}>Remove</Text>
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
          <View className="flex-row justify-center space-x-4 mt-8 gap-4">
            <TouchableOpacity
              className={`${isSubmitting ? 'bg-gray-300' : 'bg-gray-100'} px-8 py-3 rounded-lg`}
              onPress={!isSubmitting ? () => router.back() : undefined}
              disabled={isSubmitting}
            >
              <Text className={`${isSubmitting ? 'text-gray-500' : 'text-gray-600'} font-medium`}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`${isSubmitting ? 'bg-gray-400' : 'bg-red-600'} px-8 py-3 rounded-lg flex-row items-center`}
              onPress={!isSubmitting ? submitProjectToAPI : router.push('/(tabs)/projects')}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="white" className="mr-2" />
                  <Text className="text-white font-medium">Saving...</Text>
                </>
              ) : (
                <Text className="text-white font-medium">
                  {isEdit ? 'Update Project' : 'Save Project'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
        </>
      )}
    </View>
  );
};

export default AddProject;