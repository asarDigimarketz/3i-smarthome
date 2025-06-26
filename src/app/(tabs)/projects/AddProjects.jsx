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
    emailId: "",
    dateOfBooking: "",
    addressLine1: "",
    cityTownVillage: "",
    district: "",
    state: "",
    country: "",
    pinCode: "",
    projectId: "",
    service: "",
    projectDescription: "",
    size: "",
    projectAmount: "",
    status: "",
  });

  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
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

  const showDatePicker = () => {
    DateTimePickerAndroid.open({
      value: formData.dateOfBooking
        ? new Date(formData.dateOfBooking)
        : new Date(),
      onChange: (event, selectedDate) => {
        if (event.type === "set" && selectedDate) {
          const formattedDate = selectedDate.toISOString().split("T")[0];
          handleInputChange("dateOfBooking", formattedDate);
        }
      },
      mode: "date",
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleDropdown = (type) => {
    if (type === "service") {
      setShowServiceDropdown(true);
    } else if (type === "status") {
      setShowStatusDropdown(true);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/*",
        ],
        multiple: false,
      });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
      }
    } catch (err) {
      console.log("Document picker error:", err);
    }
  };

  const validateForm = () => {
    const requiredFields = {
      customerName: "Customer Name",
      contactNumber: "Contact Number",
      emailId: "Email ID",
      dateOfBooking: "Date of Booking",
      addressLine1: "Address Line 1",
      cityTownVillage: "City/Town/Village",
      district: "District",
      state: "State",
      country: "Country",
      pinCode: "Pin Code",
      service: "Service",
      projectDescription: "Project Description",
      size: "Size",
      projectAmount: "Project Amount",
      status: "Status"
    };

    const emptyFields = [];
    
    Object.keys(requiredFields).forEach(field => {
      if (!formData[field] || formData[field].trim() === "") {
        emptyFields.push(requiredFields[field]);
      }
    });

    if (emptyFields.length > 0) {
      Alert.alert(
        "Missing Information",
        `Please fill in the following fields:\n• ${emptyFields.join('\n• ')}`
      );
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.emailId)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return false;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[+]?[\d\s-()]{10,}$/;
    if (!phoneRegex.test(formData.contactNumber)) {
      Alert.alert("Invalid Phone Number", "Please enter a valid phone number.");
      return false;
    }

    // Validate project amount
    const amount = parseFloat(formData.projectAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid project amount.");
      return false;
    }

    return true;
  };

  const retrySubmissionWithoutFile = async () => {
    console.log('🔄 Retrying project submission without file...');
    setIsSubmitting(true);
    
    try {
      // Prepare project data (same as main submission but without file handling)
      const projectData = {
        customerName: formData.customerName.trim(),
        contactNumber: formData.contactNumber.trim(),
        email: formData.emailId.trim(),
        address: {
          addressLine: formData.addressLine1.trim(),
          city: formData.cityTownVillage.trim(),
          district: formData.district.trim(),
          state: formData.state.trim(),
          country: formData.country.trim(),
          pincode: formData.pinCode.trim()
        },
        services: formData.service,
        projectDescription: formData.projectDescription.trim(),
        projectAmount: parseFloat(formData.projectAmount),
        size: formData.size.trim(),
        comment: "",
        projectStatus: mapMobileToServerStatus(formData.status),
        projectDate: formData.dateOfBooking
      };

      console.log('📤 Retrying with project data (no file):', projectData);

      // Send JSON data without file
      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
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
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare project data according to server API expectations
      const projectData = {
        customerName: formData.customerName.trim(),
        contactNumber: formData.contactNumber.trim(),
        email: formData.emailId.trim(),
        address: {
          addressLine: formData.addressLine1.trim(),
          city: formData.cityTownVillage.trim(),
          district: formData.district.trim(),
          state: formData.state.trim(),
          country: formData.country.trim(),
          pincode: formData.pinCode.trim()
        },
        services: formData.service,
        projectDescription: formData.projectDescription.trim(),
        projectAmount: parseFloat(formData.projectAmount),
        size: formData.size.trim(),
        comment: "", // Add comment field if needed
        projectStatus: mapMobileToServerStatus(formData.status),
        projectDate: formData.dateOfBooking
      };

      console.log('📤 Submitting project data:', projectData);
      console.log('📎 Selected file:', selectedFile);

      let response;

      if (selectedFile) {
        // Create FormData for file upload
        const formDataToSend = new FormData();
        
        // Add project data fields
        Object.keys(projectData).forEach(key => {
          if (key === 'address') {
            formDataToSend.append(key, JSON.stringify(projectData[key]));
          } else {
            formDataToSend.append(key, projectData[key].toString());
          }
        });

        // Add file attachment with proper structure for React Native
        formDataToSend.append('attachment', {
          uri: selectedFile.uri,
          type: selectedFile.mimeType || 'application/octet-stream',
          name: selectedFile.name || 'attachment'
        });

        console.log('📤 FormData fields:', Object.keys(projectData));
        console.log('📎 File details:', {
          uri: selectedFile.uri,
          type: selectedFile.mimeType,
          name: selectedFile.name,
          size: selectedFile.size
        });

        response = await fetch(`${API_BASE_URL}/api/projects`, {
          method: 'POST',
          headers: {
            'x-api-key': API_KEY,
            // Don't set Content-Type for FormData - let React Native handle it
          },
          body: formDataToSend,
        });
      } else {
        // Send JSON data without file
        response = await fetch(`${API_BASE_URL}/api/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
          body: JSON.stringify(projectData),
        });
      }

      console.log('📥 Response Status:', response.status);
      console.log('📥 Response Headers:', response.headers);

      // Get response text first to see raw response
      const responseText = await response.text();
      console.log('📥 Raw Response:', responseText);

      if (!response.ok) {
        // Try to parse error response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // If response is not JSON, use the text as error message
          if (responseText) {
            errorMessage = responseText;
          }
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      const responseData = JSON.parse(responseText);
      console.log('📥 Create project response:', responseData);

      if (responseData.success) {
        Alert.alert(
          "Success",
          "Project created successfully!",
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
      console.error('🚨 Error creating project:', error);
      
      let errorMessage = 'An unexpected error occurred';
      let shouldRetryWithoutFile = false;
      
      if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Unauthorized. Please check your API configuration.';
      } else if (error.message.includes('ENOENT') && error.message.includes('attachments')) {
        errorMessage = 'Server directory issue detected. Would you like to create the project without the file attachment?';
        shouldRetryWithoutFile = true;
      } else if (error.message.includes('400')) {
        errorMessage = 'Bad Request. Please check your input data.';
      } else {
        errorMessage = error.message || 'Failed to create project';
      }
      
      if (shouldRetryWithoutFile && selectedFile) {
        Alert.alert(
          "File Upload Issue",
          "There's an issue with the server's file storage. Would you like to create the project without the attachment?",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            {
              text: "Create Without File",
              onPress: async () => {
                console.log('🔄 Retrying without file attachment...');
                setSelectedFile(null);
                // Retry submission without file
                await retrySubmissionWithoutFile();
              }
            }
          ]
        );
      } else {
        Alert.alert("Error", errorMessage);
      }
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
            </View>
          </View>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Email Id"
                value={formData.emailId}
                onChangeText={(text) => handleInputChange("emailId", text)}
                keyboardType="email-address"
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                disabled={isSubmitting}
              />
            </View>

            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Date of Booking"
                value={formData.dateOfBooking}
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
                value={formData.addressLine1}
                onChangeText={(text) => handleInputChange("addressLine1", text)}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                disabled={isSubmitting}
              />
            </View>

            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="City / Town / Village"
                value={formData.cityTownVillage}
                onChangeText={(text) => handleInputChange("cityTownVillage", text)}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                disabled={isSubmitting}
              />
            </View>
          </View>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="District"
                value={formData.district}
                onChangeText={(text) => handleInputChange("district", text)}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                disabled={isSubmitting}
              />
            </View>

            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="State"
                value={formData.state}
                onChangeText={(text) => handleInputChange("state", text)}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                disabled={isSubmitting}
              />
            </View>
          </View>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Country"
                value={formData.country}
                onChangeText={(text) => handleInputChange("country", text)}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                disabled={isSubmitting}
              />
            </View>

            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Pin Code"
                value={formData.pinCode}
                onChangeText={(text) => handleInputChange("pinCode", text)}
                keyboardType="numeric"
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                disabled={isSubmitting}
              />
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
                      formData.service
                        ? "text-gray-800"
                        : "text-gray-500"
                    } text-base font-medium`}
                  >
                    {formData.service || "Select Service"}
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
            </View>
          </View>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Size"
                value={formData.size}
                onChangeText={(text) => handleInputChange("size", text)}
                right={<TextInput.Affix text="Sqt" />}
                keyboardType="numeric"
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                disabled={isSubmitting}
              />
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
                      formData.status
                        ? formData.status === "New"
                          ? "text-blue-600"
                          : formData.status === "InProgress"
                          ? "text-yellow-600"
                          : formData.status === "Done"
                          ? "text-green-600"
                          : formData.status === "Complete"
                          ? "text-purple-600"
                          : "text-gray-500"
                        : "text-gray-500"
                    } text-base font-medium`}
                  >
                    {formData.status || "Select Status"}
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
            onPress={!isSubmitting ? pickDocument : undefined}
            disabled={isSubmitting}
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
                onPress={!isSubmitting ? () => setSelectedFile(null) : undefined}
                disabled={isSubmitting}
              >
                <Text className={`${isSubmitting ? 'text-gray-400' : 'text-red-600'}`}>Remove</Text>
              </TouchableOpacity>
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
