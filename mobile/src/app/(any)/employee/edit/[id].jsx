"use client"

import { DateTimePickerAndroid } from "@react-native-community/datetimepicker"
import * as DocumentPicker from "expo-document-picker"
import { useRouter, useLocalSearchParams } from "expo-router"
import { ArrowLeft, Calendar, ChevronDown, Upload, Plus, FileText, X } from "lucide-react-native"
import { useEffect, useState } from "react"
import { Image, Text, TouchableOpacity, useWindowDimensions, View, Alert, Linking } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { TextInput } from 'react-native-paper'
import { API_CONFIG } from '../../../../../config';
import auth from '../../../../utils/auth';

// Avatar helper function to handle server images
const fallbackAvatar = 'https://img.heroui.chat/image/avatar?w=200&h=200&u=1';
const getAvatarUrl = (avatar) => {
  if (!avatar) return fallbackAvatar;
  if (avatar.startsWith('http')) {
    try {
      const url = new URL(avatar);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return avatar.replace(`${url.protocol}//${url.hostname}:5000`, API_CONFIG.API_URL);
      }
      return avatar;
    } catch {
      return avatar;
    }
  }
  if (avatar.startsWith('/')) {
    return `${API_CONFIG.API_URL}${avatar}`;
  }
  return avatar;
};

const EditEmployee = () => {
  const { width } = useWindowDimensions()
  const isTablet = width >= 768
  const router = useRouter()
  const { id } = useLocalSearchParams()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNo: "",
    gender: "",
    dateOfBirth: "",
    dateOfHiring: "",
    role: "",
    department: "",
    status: "active",
    notes: "",
    address: {
      addressLine: "",
      city: "",
      district: "",
      state: "",
      country: "",
      pincode: "",
    },
  })

  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [documents, setDocuments] = useState([])
  const [roles, setRoles] = useState([]);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [originalAvatar, setOriginalAvatar] = useState(null);
  const [existingDocuments, setExistingDocuments] = useState([]);
  
  // Departments as in EmployeeModal.jsx
  const departments = [
    { name: "Installation", createdAt: new Date() },
    { name: "Service", createdAt: new Date() },
    { name: "Sales", createdAt: new Date() },
    { name: "Support", createdAt: new Date() },
  ]

  const statusOptions = [
    { value: "active", color: "text-green-600", bg: "bg-green-50" },
    { value: "inactive", color: "text-red-600", bg: "bg-red-50" },
  ]

  // Fetch employee data by ID
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!id) return;
      try {
        setFetchingData(true);
        const response = await auth.fetchWithAuth(
          `${API_CONFIG.API_URL}/api/employeeManagement/${id}`,
          {
            method: 'GET',
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.employee) {
          const emp = data.employee;
          setFormData({
            firstName: emp.firstName || "",
            lastName: emp.lastName || "",
            email: emp.email || "",
            mobileNo: emp.mobileNo || "",
            gender: emp.gender || "",
            dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split("T")[0] : "",
            dateOfHiring: emp.dateOfHiring ? emp.dateOfHiring.split("T")[0] : "",
            role: emp.role?._id || "",
            department: emp.department?.name || "",
            status: emp.status || "active",
            notes: emp.notes || "",
            address: {
              addressLine: emp.address?.addressLine || "",
              city: emp.address?.city || "",
              district: emp.address?.district || "",
              state: emp.address?.state || "",
              country: emp.address?.country || "",
              pincode: emp.address?.pincode || "",
            },
          });
          setOriginalAvatar(emp.avatar || null);
          // Set avatar preview to show the server image properly
          if (emp.avatar) {
            setAvatarPreview(getAvatarUrl(emp.avatar));
          }
          // Set existing documents
          if (emp.documents && Array.isArray(emp.documents)) {
            setExistingDocuments(emp.documents);
          }
        } else {
          Alert.alert("Error", "Failed to fetch employee data");
          router.back();
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
        Alert.alert("Error", "Failed to fetch employee data");
        router.back();
      } finally {
        setFetchingData(false);
      }
    };
    fetchEmployeeData();
  }, [id]);

  const showDatePicker = (field) => {
    DateTimePickerAndroid.open({
      value: formData[field] ? new Date(formData[field]) : new Date(),
      onChange: (event, selectedDate) => {
        if (event.type === "set" && selectedDate) {
          const formattedDate = selectedDate.toISOString().split("T")[0]
          handleInputChange(field, formattedDate)
        }
      },
      mode: "date",
    })
  }

  // Handle avatar upload (image only)
  const pickAvatar = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        multiple: false,
      })

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0]
        
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          Alert.alert("File too large", "Avatar file size should be less than 5MB")
          return
        }

        // Validate file type
        if (!file.mimeType || !file.mimeType.startsWith("image/")) {
          Alert.alert("Invalid file type", "Please upload an image file")
          return
        }

        setAvatar(file)
        setAvatarPreview(file.uri) // Set to new image URI
      }
    } catch (err) {
      console.log("Avatar picker error:", err)
      Alert.alert("Error", "Failed to pick image. Please try again.")
    }
  }

  // Handle document upload (multiple files)
  const pickDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        multiple: true,
      })

      if (result.assets && result.assets.length > 0) {
        setDocuments(prev => [...prev, ...result.assets])
      }
    } catch (err) {
      console.log("Document picker error:", err)
    }
  }

  // Remove document from list
  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index))
  }

  // Reset avatar to original server image
  const resetAvatar = () => {
    setAvatar(null)
    if (originalAvatar) {
      setAvatarPreview(getAvatarUrl(originalAvatar))
    } else {
      setAvatarPreview(null)
    }
  }

  // Get document URL for server files
  const getDocumentUrl = (docPath) => {
    if (!docPath) return null;
    
    if (docPath.startsWith('http')) {
      try {
        const url = new URL(docPath);
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
          // Replace localhost with API_CONFIG.API_URL and ensure /public is included
          const pathWithPublic = url.pathname.includes('/public') ? url.pathname : `/public${url.pathname}`;
          return `${API_CONFIG.API_URL}${pathWithPublic}`;
        }
        return docPath;
      } catch {
        return docPath;
      }
    }
    
    if (docPath.startsWith('/assets')) {
      // Add /public prefix if not present
      return `${API_CONFIG.API_URL}/public${docPath}`;
    }
    
    if (docPath.startsWith('/')) {
      return `${API_CONFIG.API_URL}${docPath}`;
    }
    
    return docPath;
  }

  // View document functionality
  const viewDocument = async (doc, isExisting = false) => {
    try {
      if (isExisting) {
        // For existing server documents (URLs as strings)
        const documentUrl = typeof doc === 'string' ? doc : (doc.path || doc.url);
        if (documentUrl) {
          const properDocumentUrl = getDocumentUrl(documentUrl);
          if (properDocumentUrl) {
            await Linking.openURL(properDocumentUrl);
          } else {
            Alert.alert('Error', 'Document URL not available');
          }
        } else {
          Alert.alert('Error', 'Document URL not available');
        }
      } else {
        // For newly uploaded documents
        if (doc.uri) {
          await Linking.openURL(doc.uri);
        } else {
          Alert.alert('Error', 'Document not available');
        }
      }
    } catch (error) {
      console.error('Error opening document:', error);
      Alert.alert('Error', 'Could not open the file. Please try again.');
    }
  }

  // Remove existing document
  const removeExistingDocument = (index) => {
    Alert.alert(
      'Remove Document',
      'Are you sure you want to remove this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setExistingDocuments(prev => prev.filter((_, i) => i !== index));
          }
        }
      ]
    );
  }

  const handleInputChange = (field, value) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
      if (errors[addressField]) {
        setErrors((prev) => ({
          ...prev,
          [addressField]: undefined,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.mobileNo.trim()) newErrors.mobileNo = "Mobile number is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.dateOfHiring) newErrors.dateOfHiring = "Date of hiring is required";
    if (!formData.role) newErrors.role = "Role is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.address.addressLine.trim()) newErrors.addressLine = "Address is required";
    if (!formData.address.city.trim()) newErrors.city = "City is required";
    if (!formData.address.state.trim()) newErrors.state = "State is required";
    if (!formData.address.country.trim()) newErrors.country = "Country is required";
    if (!formData.address.pincode.trim()) newErrors.pincode = "Pincode is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    const mobileRegex = /^\d{10}$/;
    if (formData.mobileNo && !mobileRegex.test(formData.mobileNo)) {
      newErrors.mobileNo = "Mobile number must be 10 digits";
    }
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = "Employee must be at least 18 years old";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await auth.fetchWithAuth(`${API_CONFIG.API_URL}/api/rolesAndPermission`, {
          method: 'GET',
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data.success) {
          setRoles(data.roles);
        } else {
          console.error("Failed to fetch roles:", data.message);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    fetchRoles();
  }, []);

  const handleUpdate = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors in the form");
      return;
    }
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("mobileNo", formData.mobileNo);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("dateOfBirth", formData.dateOfBirth);
      formDataToSend.append("dateOfHiring", formData.dateOfHiring);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("notes", formData.notes);
      formDataToSend.append("address[addressLine]", formData.address.addressLine);
      formDataToSend.append("address[city]", formData.address.city);
      formDataToSend.append("address[district]", formData.address.district);
      formDataToSend.append("address[state]", formData.address.state);
      formDataToSend.append("address[country]", formData.address.country);
      formDataToSend.append("address[pincode]", formData.address.pincode);
      const selectedRole = roles.find((r) => r._id === formData.role);
      if (selectedRole) {
        formDataToSend.append("role", JSON.stringify({
          _id: selectedRole._id,
          role: selectedRole.role,
          createdAt: selectedRole.createdAt,
        }));
      }
      const selectedDepartment = departments.find((d) => d.name === formData.department);
      if (selectedDepartment) {
        formDataToSend.append("department", JSON.stringify(selectedDepartment));
      }
      if (avatar && avatar.uri) {
        formDataToSend.append("avatar", {
          uri: avatar.uri,
          type: avatar.mimeType || 'image/jpeg',
          name: avatar.name || 'profile.jpg',
        });
      }

      // Document files - only new documents
      documents.forEach((doc) => {
        formDataToSend.append("documents", {
          uri: doc.uri,
          type: doc.mimeType || 'application/octet-stream',
          name: doc.name || 'document',
        });
      });

      // Send existing documents list (for server to keep track)
      formDataToSend.append("existingDocuments", JSON.stringify(existingDocuments));
      const employeeRes = await auth.fetchWithAuth(
        `${API_CONFIG.API_URL}/api/employeeManagement/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formDataToSend,
        }
      );
      if (!employeeRes.ok) {
        throw new Error(`HTTP error! status: ${employeeRes.status}`);
      }
      const data = await employeeRes.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update employee');
      }
      Alert.alert("Success", "Employee updated successfully");
      router.back();
    } catch (error) {
      console.error("Error updating employee:", error);
      Alert.alert(
        "Error", 
        error.response?.data?.message || error.message || "Failed to update employee"
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-lg text-gray-600">Loading employee data...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="bg-white p-4 shadow-sm flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-3" onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Edit Employee</Text>
        </View>
      </View>
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={140}
      >
        <View className="p-6">
          {/* Profile Image Upload */}
          <View className="items-center py-6">
            <View className="relative">
              <View className="items-center justify-center mb-2">
                <TouchableOpacity
                  className=" justify-center items-center"
                  onPress={pickAvatar}
                >
                  {avatarPreview ? (
                    <Image
                      source={{ uri: avatarPreview }}
                      className="w-28 h-28 rounded-full"
                      onError={() => {
                        // Fallback to original avatar if preview fails
                        if (originalAvatar) {
                          setAvatarPreview(getAvatarUrl(originalAvatar));
                        }
                      }}
                    />
                  ) : originalAvatar ? (
                    <Image
                      source={{ uri: getAvatarUrl(originalAvatar) }}
                      className="w-24 h-24 rounded-full"
                      onError={() => {
                        // Show placeholder if image fails to load
                        setAvatarPreview(null);
                      }}
                    />
                  ) : (
                    <Plus size={24} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-600 rounded-full justify-center items-center"
                onPress={pickAvatar}
              >
                <Upload size={16} color="white" />
              </TouchableOpacity>
            </View>
            <Text className="text-sm text-gray-500">Upload profile image</Text>
          </View>
          <Text className="text-base font-medium text-gray-700 mb-4">
            Personal Details
          </Text>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="First Name"
                value={formData.firstName}
                onChangeText={(text) => handleInputChange("firstName", text)}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </View>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Last Name"
                value={formData.lastName}
                onChangeText={(text) => handleInputChange("lastName", text)}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </View>
          </View>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Email"
                value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
                keyboardType="email-address"
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                error={!!errors.email}
                helperText={errors.email}
              />
            </View>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Mobile No"
                value={formData.mobileNo}
                onChangeText={(text) => handleInputChange("mobileNo", text)}
                keyboardType="phone-pad"
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                error={!!errors.mobileNo}
                helperText={errors.mobileNo}
              />
            </View>
          </View>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Date of Birth"
                value={formData.dateOfBirth}
                editable={false}
                right={<TextInput.Icon icon={() => <Calendar size={20} color="#9CA3AF" />} onPress={() => showDatePicker("dateOfBirth")} />}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
              />
            </View>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Date of Hiring"
                value={formData.dateOfHiring}
                editable={false}
                right={<TextInput.Icon icon={() => <Calendar size={20} color="#9CA3AF" />} onPress={() => showDatePicker("dateOfHiring")} />}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
                error={!!errors.dateOfHiring}
                helperText={errors.dateOfHiring}
              />
            </View>
          </View>

          {/* Gender Dropdown */}
          <View className="relative mb-4">
            <TouchableOpacity
              onPress={() => setShowGenderDropdown(!showGenderDropdown)}
              className="flex-row items-center justify-between bg-gray-100 rounded-lg h-12 px-4 w-full"
            >
              <Text className={`$ {
                formData.gender ? 'text-gray-800' : 'text-gray-500'
              } text-base font-medium`}>
                {formData.gender || 'Select Gender'}
              </Text>
              <ChevronDown size={16} color="#6B7280" />
            </TouchableOpacity>
            {showGenderDropdown && (
              <View className="absolute top-14 left-0 bg-white rounded-lg shadow-xl z-10 w-full">
                {['male', 'female', 'other'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    className="px-4 py-3 border-b border-gray-100 active:bg-gray-50"
                    onPress={() => {
                      handleInputChange('gender', gender);
                      setShowGenderDropdown(false);
                    }}
                  >
                    <Text className="text-lg font-medium">{gender}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {errors.gender && (
              <Text className="text-red-600 text-sm mt-1">{errors.gender}</Text>
            )}
          </View>

          <View className="space-y-4">
            {/* Department Dropdown */}
            <View className="relative mb-4">
              <TouchableOpacity
                onPress={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                className="flex-row items-center justify-between bg-gray-100 rounded-lg h-12 px-4 w-full"
              >
                <Text className={`$ {
                  formData.department ? 'text-gray-800' : 'text-gray-500'
                } text-base font-medium`}>
                  {formData.department || 'Select Department'}
                </Text>
                <ChevronDown size={16} color="#6B7280" />
              </TouchableOpacity>
              {showDepartmentDropdown && (
                <View className="absolute top-14 left-0 bg-white rounded-lg shadow-xl z-10 w-full">
                  {departments.map((dept) => (
                    <TouchableOpacity
                      key={dept.name}
                      className="px-4 py-3 border-b border-gray-100 active:bg-gray-50"
                      onPress={() => {
                        handleInputChange('department', dept.name);
                        setShowDepartmentDropdown(false);
                      }}
                    >
                      <Text className="text-lg font-medium">
                        {dept.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Role Dropdown */}
            <View className="relative mb-4">
              <TouchableOpacity
                onPress={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex-row items-center justify-between bg-gray-100 rounded-lg h-12 px-4 w-full"
              >
                <Text className={`$ {
                  formData.role ? 'text-gray-800' : 'text-gray-500'
                } text-base font-medium`}>
                  {roles.find((r) => r._id === formData.role)?.role || 'Select Role'}
                </Text>
                <ChevronDown size={16} color="#6B7280" />
              </TouchableOpacity>
              {showRoleDropdown && (
                <View className="absolute top-14 left-0 bg-white rounded-lg shadow-xl z-10 w-full">
                  {roles.map((role) => (
                    <TouchableOpacity
                      key={role._id}
                      className="px-4 py-3 border-b border-gray-100 active:bg-gray-50"
                      onPress={() => {
                        handleInputChange('role', role._id);
                        setShowRoleDropdown(false);
                      }}
                    >
                      <Text className="text-lg font-medium">
                        {role.role}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Status Dropdown */}
            <View className="relative mt-6">
              <TouchableOpacity
                onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                className="flex-row items-center justify-between bg-gray-100 rounded-lg h-12 px-4 w-full"
              >
                <Text className={`${
                  formData.status ? 
                    formData.status === 'active' ? 'text-green-600' :
                    formData.status === 'inactive' ? 'text-red-600' :
                    'text-gray-500'
                  : 'text-gray-500'
                } text-base font-medium`}>
                  {formData.status || 'Select Status'}
                </Text>
                <ChevronDown size={16} color="#6B7280" />
              </TouchableOpacity>

              {showStatusDropdown && (
                <View className="absolute top-14 left-0 bg-white rounded-lg shadow-xl z-10 w-full">
                  {statusOptions.map((status) => (
                    <TouchableOpacity
                      key={status.value}
                      className={`px-4 py-3 border-b border-gray-100 active:bg-gray-50 ${
                        status.value === formData.status ? status.bg : ""
                      }`}
                      onPress={() => {
                        handleInputChange("status", status.value);
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

          {/* Address Section */}
          <View className="mt-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4 mt-5">Address</Text>

            <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
              <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
                <TextInput
                  mode="outlined"
                  label="Address Line"
                  value={formData.address.addressLine}
                  onChangeText={(text) => handleInputChange("address.addressLine", text)}
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#DC2626"
                  error={!!errors.addressLine}
                  helperText={errors.addressLine}
                />
              </View>
            </View>

            <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
              <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
                <TextInput
                  mode="outlined"
                  label="City"
                  value={formData.address.city}
                  onChangeText={(text) => handleInputChange("address.city", text)}
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#DC2626"
                  error={!!errors.city}
                  helperText={errors.city}
                />
              </View>
              <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
                <TextInput
                  mode="outlined"
                  label="District"
                  value={formData.address.district}
                  onChangeText={(text) => handleInputChange("address.district", text)}
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#DC2626"
                />
              </View>
            </View>

            <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
              <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
                <TextInput
                  mode="outlined"
                  label="State"
                  value={formData.address.state}
                  onChangeText={(text) => handleInputChange("address.state", text)}
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#DC2626"
                  error={!!errors.state}
                  helperText={errors.state}
                />
              </View>
              <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
                <TextInput
                  mode="outlined"
                  label="Country"
                  value={formData.address.country}
                  onChangeText={(text) => handleInputChange("address.country", text)}
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#DC2626"
                  error={!!errors.country}
                  helperText={errors.country}
                />
              </View>
            </View>

            <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
              <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
                <TextInput
                  mode="outlined"
                  label="Pincode"
                  value={formData.address.pincode}
                  onChangeText={(text) => handleInputChange("address.pincode", text)}
                  keyboardType="number-pad"
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#DC2626"
                  error={!!errors.pincode}
                  helperText={errors.pincode}
                />
              </View>
            </View>
          </View>

          {/* Notes Section */}
          <View className="mb-6">
            <TextInput
              mode="outlined"
              label="Notes"
              value={formData.notes}
              onChangeText={(text) => handleInputChange("notes", text)}
              multiline={true}
              numberOfLines={4}
              style={{
                minHeight: 120,
                textAlignVertical: 'top',
              }}
              outlineColor="#E5E7EB"
              activeOutlineColor="#DC2626"
            />
          </View>

          {/* Document Upload Section */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-700 mb-4">
              Documents
            </Text>
            
            {/* Existing Documents from Server */}
            {existingDocuments.length > 0 && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-600 mb-2">Existing Documents</Text>
                {existingDocuments.map((doc, index) => {
                  // Extract filename from URL for display
                  const filename = typeof doc === 'string' 
                    ? doc.split('/').pop() || `Document ${index + 1}`
                    : (doc.originalName || doc.name || `Document ${index + 1}`);
                  
                  return (
                    <TouchableOpacity
                      key={`existing-${index}`}
                      className="flex-row items-center justify-between p-3 bg-blue-50 rounded-lg mb-2 border border-blue-200"
                      onPress={() => viewDocument(doc, true)}
                    >
                      <View className="flex-row items-center flex-1">
                        <FileText size={20} color="#3B82F6" />
                        <View className="ml-3 flex-1">
                          <Text className="text-gray-800 font-medium" numberOfLines={1}>
                            {filename}
                          </Text>
                          <Text className="text-blue-600 text-xs">
                            Tap to open • Server document
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        className="p-2"
                        onPress={(e) => {
                          e.stopPropagation();
                          removeExistingDocument(index);
                        }}
                      >
                        <X size={20} color="#DC2626" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Upload Button */}
            <View className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
              <View className="items-center">
                <TouchableOpacity
                  className="bg-red-600 px-6 py-3 rounded-lg flex-row items-center"
                  onPress={pickDocuments}
                >
                  <Upload size={20} color="white" />
                  <Text className="text-white font-medium ml-2">Upload New Documents</Text>
                </TouchableOpacity>
                <Text className="text-sm text-gray-500 mt-2 text-center">
                  Upload additional documents (ID proof, certificates, etc.)
                </Text>
              </View>
            </View>

            {/* New Documents List */}
            {documents.length > 0 && (
              <View className="mt-4">
                <Text className="text-sm font-medium text-gray-600 mb-2">New Documents</Text>
                {documents.map((doc, index) => (
                  <TouchableOpacity
                    key={`new-${index}`}
                    className="flex-row items-center justify-between p-3 bg-green-50 rounded-lg mb-2 border border-green-200"
                    onPress={() => viewDocument(doc, false)}
                  >
                    <View className="flex-row items-center flex-1">
                      <FileText size={20} color="#10B981" />
                      <View className="ml-3 flex-1">
                        <Text className="text-gray-800 font-medium" numberOfLines={1}>
                          {doc.name}
                        </Text>
                        <Text className="text-green-600 text-xs">
                          Tap to open • {(doc.size / 1024).toFixed(2)} KB
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      className="p-2"
                      onPress={(e) => {
                        e.stopPropagation();
                        removeDocument(index);
                      }}
                    >
                      <X size={20} color="#DC2626" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* No Documents State */}
            {existingDocuments.length === 0 && documents.length === 0 && (
              <View className="mt-4 p-4 bg-gray-50 rounded-lg items-center">
                <FileText size={24} color="#9CA3AF" />
                <Text className="text-gray-500 text-sm mt-2">No documents uploaded</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View className="flex-row justify-center space-x-6 mt-8 gap-4">
            <TouchableOpacity
              className="bg-gray-100 px-8 py-3 rounded-lg"
              onPress={() => router.back()}
            >
              <Text className="text-gray-600 font-medium">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-red-600 px-8 py-3 rounded-lg"
              onPress={handleUpdate}
              disabled={loading}
            >
              {loading ? (
                <Text className="text-white font-medium">Updating...</Text>
              ) : (
                <Text className="text-white font-medium">Update</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  )
}

export default EditEmployee
