import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { ArrowLeft, Calendar, ChevronDown, Upload } from "lucide-react-native";
import { useState } from "react";
import {
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Alert,
  ActivityIndicator
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { TextInput } from "react-native-paper";
import auth from '../../../utils/auth';

const AddProject = () => {
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
    projectStatus: "new",
    projectDate: new Date().toISOString().split("T")[0],
    attachments: [],
  });
  const [selectedFiles, setSelectedFiles] = useState([]); // new files
  const [errors, setErrors] = useState({});
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      console.log("Document picker error:", err);
    }
  };

  const handleRemoveSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
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
    console.log('🔄 Retrying project submission without file...');
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

      console.log('📤 Retrying with project data (no file):', projectData);

      // Send JSON data without file
      const response = await auth.fetchWithAuth(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      console.log('📥 Retry Response Status:', response.status);

      const responseText = await response.text();
      console.log('📥 Retry Raw Response:', responseText);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          if (responseText) {
            errorMessage = responseText;
          }
        }
        throw new Error(errorMessage);
      }

      const responseData = JSON.parse(responseText);
      console.log('📥 Retry Success Response:', responseData);

      if (responseData.success) {
        Alert.alert(
          "Success",
          "Project created successfully (without attachment)!",
          [
            {
              text: "OK",
              onPress: () => {
                router.back();
              }
            }
          ]
        );
      } else {
        Alert.alert("Error", responseData.message || "Failed to create project");
      }
    } catch (error) {
      console.error('🚨 Retry Error:', error);
      Alert.alert("Error", error.message || 'Failed to create project even without file');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitProjectToAPI = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
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
      selectedFiles.forEach((file) => {
        submitData.append("attachments", {
          uri: file.uri,
          type: file.mimeType || 'application/octet-stream',
          name: file.name || 'attachment',
        });
      });
      const response = await auth.fetchWithAuth(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        body: submitData,
      });
      const responseText = await response.text();
      if (!response.ok) {
        // If error is about missing directory or ENOENT, retry without file
        if (responseText.includes('ENOENT') || responseText.includes('no such file or directory')) {
          await retrySubmissionWithoutFile();
          return;
        }
        throw new Error(responseText);
      }
      const responseData = JSON.parse(responseText);
      if (responseData.success) {
        Alert.alert("Success", "Project created successfully!", [{ text: "OK", onPress: () => router.back() }]);
      } else {
        Alert.alert("Error", responseData.message || "Failed to create project");
      }
    } catch (error) {
      Alert.alert("Error", error.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white p-4 shadow-sm flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-3" onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Add Project</Text>
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
              <TextInput
                mode="outlined"
                label="Contact Number"
                value={formData.contactNumber}
                onChangeText={(text) => handleInputChange("contactNumber", text)}
                keyboardType="phone-pad"
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                disabled={isSubmitting}
              />
              {errors.contactNumber && <Text className="text-red-500 text-xs mt-1">{errors.contactNumber}</Text>}
            </View>
          </View>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Email Id"
                value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
                keyboardType="email-address"
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                disabled={isSubmitting}
              />
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
          
          <Text className="text-sm text-amber-600 mb-4 bg-amber-50 p-3 rounded-lg">
            📋 Note: If file upload fails due to server configuration, you'll have the option to create the project without the attachment.
          </Text>

          <TouchableOpacity
            className={`${isSubmitting ? 'bg-gray-400' : 'bg-red-600'} h-12 rounded-lg flex-row items-center justify-center mb-2`}
            onPress={!isSubmitting ? handleFileChange : undefined}
            disabled={isSubmitting}
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
                    onPress={!isSubmitting ? () => handleRemoveSelectedFile(index) : undefined}
                    disabled={isSubmitting}
                  >
                    <Text className={`${isSubmitting ? 'text-gray-400' : 'text-red-600'}`}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
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
              onPress={!isSubmitting ? submitProjectToAPI : undefined}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="white" className="mr-2" />
                  <Text className="text-white font-medium">Saving...</Text>
                </>
              ) : (
                <Text className="text-white font-medium">Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AddProject;
