import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_CONFIG } from '../../../../config';
import { TextInput as PaperTextInput } from "react-native-paper";
import * as DocumentPicker from "expo-document-picker";
import { Upload } from "lucide-react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const EditProject = () => {
  const router = useRouter();
  const { projectId } = useLocalSearchParams();
  
  const [formData, setFormData] = useState({
    customerName: '',
    contactNumber: '',
    email: '',
    address: {
      addressLine: '',
      city: '',
      district: '',
      state: '',
      country: 'India',
      pincode: ''
    },
    services: '',
    projectDescription: '',
    size: '',
    projectAmount: '',
    comment: '',
    projectStatus: 'new',
    projectDate: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]); // new files

  // Project status options
  const projectStatusOptions = [
    { value: "new", label: "New" },
    { value: "inprogress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "onhold", label: "On Hold" },
    { value: "cancelled", label: "Cancelled" }
  ];

  // Services options
  const servicesOptions = [
    { value: 'Home Cinema', label: 'Home Cinema' },
    { value: 'Home Automation', label: 'Home Automation' },
    { value: 'Security System', label: 'Security System' },
    { value: 'Outdoor Audio Solution', label: 'Outdoor Audio Solution' }
  ];

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

  // Fetch project data on component mount
  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.API_URL}/api/projects/${projectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        const project = data.data;
        setFormData({
          customerName: project.customerName || '',
          contactNumber: project.contactNumber || '',
          email: project.email || '',
          address: project.address || {
            addressLine: '',
            city: '',
            district: '',
            state: '',
            country: 'India',
            pincode: ''
          },
          services: project.services || '',
          projectDescription: project.projectDescription || '',
          size: project.size || '',
          projectAmount: project.projectAmount?.toString() || '',
          comment: project.comment || '',
          projectStatus: project.projectStatus || 'new',
          projectDate: project.projectDate ? new Date(project.projectDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
      } else {
        throw new Error(data.message || 'Failed to load project');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      Alert.alert('Error', 'Failed to load project data. Please try again.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [section, subField] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.address.addressLine.trim()) {
      newErrors['address.addressLine'] = 'Address line is required';
    }
    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }
    if (!formData.address.district.trim()) {
      newErrors['address.district'] = 'District is required';
    }
    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State is required';
    }
    if (!formData.address.pincode.trim()) {
      newErrors['address.pincode'] = 'Pincode is required';
    }
    if (!formData.services) {
      newErrors.services = 'Service selection is required';
    }
    if (!formData.projectDescription.trim()) {
      newErrors.projectDescription = 'Project description is required';
    }
    if (!formData.size.trim()) {
      newErrors.size = 'Size is required';
    }
    if (!formData.projectAmount || parseFloat(formData.projectAmount) <= 0) {
      newErrors.projectAmount = 'Project amount is required and must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly');
      return;
    }

    try {
      setUpdating(true);

      // Convert projectAmount to number
      const submitData = {
        ...formData,
        projectAmount: parseFloat(formData.projectAmount)
      };

      const response = await fetch(`${API_CONFIG.API_URL}/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.API_KEY,
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Project updated successfully', [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]);
      } else {
        throw new Error(data.message || 'Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      Alert.alert('Error', error.message || 'Failed to update project. Please try again.');
    } finally {
      setUpdating(false);
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
      console.log("Document picker error:", err);
    }
  };

  const handleRemoveSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const renderInput = (label, field, placeholder, type = 'text', required = false) => (
    <View className="mb-4">
      <PaperTextInput
        mode="outlined"
        label={label}
        value={formData[field]}
        onChangeText={(text) => handleInputChange(field, text)}
        outlineColor="#E5E7EB"
        activeOutlineColor="#DC2626"
        disabled={updating}
      />
      {errors[field] && (
        <Text className="text-red-500 text-xs mt-1">{errors[field]}</Text>
      )}
    </View>
  );

  const renderAddressInput = (label, field, placeholder, required = false) => (
    <View className="mb-4">
      <PaperTextInput
        mode="outlined"
        label={label}
        value={formData.address[field]}
        onChangeText={(text) => handleInputChange(`address.${field}`, text)}
        outlineColor="#E5E7EB"
        activeOutlineColor="#DC2626"
        disabled={updating}
      />
      {errors[`address.${field}`] && (
        <Text className="text-red-500 text-xs mt-1">{errors[`address.${field}`]}</Text>
      )}
    </View>
  );

  const renderDropdownSelect = (label, field, options, required = false, isOpen, setIsOpen) => (
    <View className="mb-4">
      <Text className="text-gray-700 mb-2 text-sm font-medium">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      <TouchableOpacity
        className={`border border-gray-300 rounded-lg px-3 py-2 ${errors[field] ? 'border-red-500' : ''}`}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text className="text-sm">
          {options.find(opt => opt.value === formData[field])?.label || 'Select...'}
        </Text>
      </TouchableOpacity>
      
      {isOpen && (
        <View className="border border-gray-300 rounded-lg mt-1 bg-white z-10">
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              className="px-3 py-2 border-b border-gray-100"
              onPress={() => {
                handleInputChange(field, option.value);
                setIsOpen(false);
              }}
            >
              <Text className="text-sm">{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {errors[field] && (
        <Text className="text-red-500 text-xs mt-1">{errors[field]}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-600 mt-4">Loading project...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAwareScrollView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center p-4 bg-white">
        <TouchableOpacity className="mr-3" onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Edit Project</Text>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Customer Information */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Customer Details</Text>
            
            {renderInput('Customer Name', 'customerName', 'Enter customer name', 'text', true)}
            {renderInput('Contact Number', 'contactNumber', 'Enter contact number', 'text', true)}
            {renderInput('Email', 'email', 'Enter email address', 'email', true)}
            {renderInput('Project Date', 'projectDate', 'Select date', 'date')}
          </View>

          {/* Address */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Address</Text>
            
            {renderAddressInput('Address Line', 'addressLine', 'Enter address line', true)}
            {renderAddressInput('City/Town/Village', 'city', 'Enter city', true)}
            {renderAddressInput('District', 'district', 'Enter district', true)}
            {renderAddressInput('State', 'state', 'Enter state', true)}
            {renderAddressInput('Country', 'country', 'Enter country')}
            {renderAddressInput('Pincode', 'pincode', 'Enter pincode', true)}
          </View>

          {/* Project Details */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Project Details</Text>
            
            <View className="mb-4">
              <PaperTextInput
                mode="outlined"
                label="Size (Length X Width)"
                value={formData.size}
                onChangeText={(text) => {
                  const formattedText = formatSizeInput(text);
                  handleInputChange('size', formattedText);
                }}
                right={<PaperTextInput.Affix text="Sq.ft" />}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                disabled={updating}
              />
              {errors.size && (
                <Text className="text-red-500 text-xs mt-1">{errors.size}</Text>
              )}
            </View>
            {renderDropdownSelect('Services', 'services', servicesOptions, true, showServicesDropdown, setShowServicesDropdown)}
            {renderInput('Project Amount (₹)', 'projectAmount', 'Enter amount', 'number', true)}
            {/* Project Status Dropdown (no label, like AddProjects.jsx) */}
            <View className="mb-4">
              <View className="relative">
                <TouchableOpacity
                  onPress={!updating ? () => setShowStatusDropdown(!showStatusDropdown) : undefined}
                  className="flex-row items-center justify-between bg-gray-100 rounded-lg h-12 px-4 w-full"
                  disabled={updating}
                >
                  <Text
                    className={`${
                      formData.projectStatus
                        ? formData.projectStatus === "New"
                          ? "text-blue-600"
                          : formData.projectStatus === "InProgress"
                          ? "text-yellow-600"
                          : formData.projectStatus === "Completed"
                          ? "text-green-600"
                          : formData.projectStatus === "OnHold"
                          ? "text-purple-600"
                          : "text-gray-500"
                        : "text-gray-500"
                    } text-base font-medium`}
                  >
                    {formData.projectStatus || "Select Status"}
                  </Text>
                  {/* <ChevronDown size={16} color="#6B7280" /> */}
                </TouchableOpacity>

                {showStatusDropdown && !updating && (
                  <View className="absolute top-14 left-0 bg-white rounded-lg shadow-xl z-10 w-full">
                    {[
                      { value: "New", color: "text-blue-600", bg: "bg-blue-100" },
                      { value: "InProgress", color: "text-yellow-600", bg: "bg-yellow-100" },
                      { value: "Completed", color: "text-green-600", bg: "bg-green-100" },
                      { value: "OnHold", color: "text-purple-600", bg: "bg-purple-100" },
                      { value: "Cancelled", color: "text-red-600", bg: "bg-red-100" }
                    ].map((status) => (
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
              {errors.projectStatus && (
                <Text className="text-red-500 text-xs mt-1">{errors.projectStatus}</Text>
              )}
            </View>
            {renderInput('Project Description', 'projectDescription', 'Enter project description', 'text', true)}
            {renderInput('Comment', 'comment', 'Enter any additional comments')}
          </View>

          {/* Project Attachment */}
          <Text className="text-base font-semibold text-gray-700 mb-2 mt-5">
            Project Attachment
          </Text>
          <Text className="text-sm text-amber-600 mb-4 bg-amber-50 p-3 rounded-lg">
            📋 Note: If file upload fails due to server configuration, you'll have the option to update the project without the attachment.
          </Text>
          <TouchableOpacity
            className={`${updating ? 'bg-gray-400' : 'bg-blue-600'} h-12 rounded-lg flex-row items-center justify-center mb-2`}
            onPress={!updating ? handleFileChange : undefined}
            disabled={updating}
          >
            <Upload size={20} color="white" className="mr-2" />
            <Text className="text-white font-medium">Upload</Text>
          </TouchableOpacity>

          {selectedFiles.length > 0 && (
            <View className="mt-4">
              <Text className="text-base font-semibold text-gray-700 mb-2">
                Selected Attachments ({selectedFiles.length})
              </Text>
              {selectedFiles.map((file, index) => (
                <View key={index} className="flex-row items-center justify-between bg-gray-50 p-3 rounded-lg mb-2">
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
                    onPress={!updating ? () => handleRemoveSelectedFile(index) : undefined}
                    disabled={updating}
                  >
                    <Text className={`${updating ? 'text-gray-400' : 'text-red-600'}`}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
            <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 border border-gray-300 rounded-lg py-3"
              onPress={() => router.back()}
              disabled={updating}
            >
              <Text className="text-center text-gray-700 font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-blue-600 rounded-lg py-3"
              onPress={handleSubmit}
              disabled={updating}
            >
              {updating ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-medium ml-2">Updating...</Text>
                </View>
              ) : (
                <Text className="text-center text-white font-medium">Update Project</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default EditProject; 