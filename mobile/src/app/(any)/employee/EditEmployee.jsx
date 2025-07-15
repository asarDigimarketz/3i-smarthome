import { DateTimePickerAndroid } from "@react-native-community/datetimepicker"
import * as DocumentPicker from "expo-document-picker"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ArrowLeft, Calendar, ChevronDown, Upload } from "lucide-react-native"
import { useEffect, useState } from "react"
import { Image, Text, TouchableOpacity, useWindowDimensions, View, Alert } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { TextInput } from 'react-native-paper'
import { API_CONFIG } from '../../../../config';
import axios from 'axios';

const EditEmployee = () => {
  const router = useRouter()
  const { employeeData: employeeDataString, id: employeeIdParam } = useLocalSearchParams()
  const { width } = useWindowDimensions()
  const isTablet = width >= 768

  // Helper to ensure address object is always present
  const ensureAddress = (address) => ({
    addressLine: address?.addressLine || "",
    city: address?.city || "",
    district: address?.district || "",
    state: address?.state || "",
    country: address?.country || "",
    pincode: address?.pincode || "",
  });

  // State for fetched employee data
  const [fetchedEmployee, setFetchedEmployee] = useState(null);

  // Parse the received data
  let parsedEmployeeData = {};
  if (employeeDataString) {
    try {
      parsedEmployeeData = JSON.parse(employeeDataString);
    } catch (e) {
      parsedEmployeeData = {};
    }
  }

  // Initialize form data with received employee data or fetched data
  const [formData, setFormData] = useState({
    firstName: parsedEmployeeData.firstName || fetchedEmployee?.firstName || "",
    lastName: parsedEmployeeData.lastName || fetchedEmployee?.lastName || "",
    email: parsedEmployeeData.email || fetchedEmployee?.email || "",
    mobileNo: parsedEmployeeData.mobileNo || fetchedEmployee?.mobileNo || "",
    gender: parsedEmployeeData.gender || fetchedEmployee?.gender || "",
    dateOfBirth: parsedEmployeeData.dateOfBirth || fetchedEmployee?.dateOfBirth || "",
    dateOfHiring: parsedEmployeeData.dateOfHiring || fetchedEmployee?.dateOfHiring || "",
    role: parsedEmployeeData.role || fetchedEmployee?.role || "",
    department: parsedEmployeeData.department || fetchedEmployee?.department || "",
    status: parsedEmployeeData.status || fetchedEmployee?.status || "active",
    notes: parsedEmployeeData.notes || fetchedEmployee?.notes || "",
    address: ensureAddress(parsedEmployeeData.address || fetchedEmployee?.address),
  })

  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Updated departments to match EmployeeModal.jsx structure
  const departments = [
    { name: "Installation", createdAt: new Date() },
    { name: "Service", createdAt: new Date() },
    { name: "Sales", createdAt: new Date() },
    { name: "Support", createdAt: new Date() },
  ]

  const statusOptions = [
    { value: "Active", color: "text-green-600", bg: "bg-green-50" },
    { value: "Inactive", color: "text-red-600", bg: "bg-red-50" },
  ]

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

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        multiple: false,
      })

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0]
        setSelectedFile(file)
      }
    } catch (err) {
      console.log("Document picker error:", err)
    }
  }

  // Enhanced handleInputChange with error clearing
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
      // Clear address field error when user starts typing
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
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    }
  };

  // Enhanced validation logic matching EmployeeModal.jsx
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.mobileNo.trim()) newErrors.mobileNo = "Mobile number is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.dateOfHiring) newErrors.dateOfHiring = "Date of hiring is required";
    if (!formData.role) newErrors.role = "Role is required";
    if (!formData.department) newErrors.department = "Department is required";
    
    // Address validation
    if (!formData.address.addressLine.trim()) newErrors.addressLine = "Address is required";
    if (!formData.address.city.trim()) newErrors.city = "City is required";
    if (!formData.address.state.trim()) newErrors.state = "State is required";
    if (!formData.address.country.trim()) newErrors.country = "Country is required";
    if (!formData.address.pincode.trim()) newErrors.pincode = "Pincode is required";
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Mobile number validation (10 digits)
    const mobileRegex = /^\d{10}$/;
    if (formData.mobileNo && !mobileRegex.test(formData.mobileNo)) {
      newErrors.mobileNo = "Mobile number must be 10 digits";
    }
    
    // Age validation (minimum 18 years)
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

  // Enhanced handleSave with proper FormData structure matching EmployeeModal.jsx
  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors in the form");
      return;
    }
    
    setLoading(true);
    try {
      const formDataToSend = new FormData();

      // Basic employee data
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("mobileNo", formData.mobileNo);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("dateOfBirth", formData.dateOfBirth);
      formDataToSend.append("dateOfHiring", formData.dateOfHiring);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("notes", formData.notes);

      // Address data - append each field individually like EmployeeModal.jsx
      formDataToSend.append("address[addressLine]", formData.address.addressLine);
      formDataToSend.append("address[city]", formData.address.city);
      formDataToSend.append("address[district]", formData.address.district);
      formDataToSend.append("address[state]", formData.address.state);
      formDataToSend.append("address[country]", formData.address.country);
      formDataToSend.append("address[pincode]", formData.address.pincode);

      // Role data - send as JSON string like EmployeeModal.jsx
      const selectedRole = roles.find((r) => r._id === formData.role);
      if (selectedRole) {
        formDataToSend.append("role", JSON.stringify({
          _id: selectedRole._id,
          role: selectedRole.role,
          createdAt: selectedRole.createdAt,
        }));
        }

      // Department data - send as JSON string like EmployeeModal.jsx
      const selectedDepartment = departments.find((d) => d.name === formData.department);
      if (selectedDepartment) {
        formDataToSend.append("department", JSON.stringify(selectedDepartment));
      }

      // Avatar file
      if (selectedFile && selectedFile.uri) {
        formDataToSend.append("avatar", {
          uri: selectedFile.uri,
          type: selectedFile.mimeType || 'image/jpeg',
          name: selectedFile.name || 'profile.jpg',
        });
      }

      // Step 1: Update Employee record
      const employeeRes = await axios.put(
        `${API_CONFIG.API_URL}/api/employeeManagement/${parsedEmployeeData.id}`,
        formDataToSend,
        {
          headers: {
            'x-api-key': API_CONFIG.API_KEY,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!employeeRes.data || !employeeRes.data.success) {
        throw new Error(employeeRes.data?.message || 'Failed to update employee');
      }

      // Step 2: Update UserEmployee record for authentication
      try {
        const selectedRole = roles.find((r) => r._id === formData.role);
        const roleUpdateResponse = await axios.put(
          `${API_CONFIG.API_URL}/api/auth/updateRole`,
          {
            email: formData.email,
            roleId: selectedRole?._id,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': API_CONFIG.API_KEY,
            },
          }
        );

        if (roleUpdateResponse.data.success) {
          Alert.alert(
            "Success", 
            "Employee and role updated successfully"
          );
        } else {
          Alert.alert(
            "Warning", 
            "Employee updated but failed to update role"
          );
      }
      } catch (error) {
        console.error("Error updating user role:", error);
        Alert.alert(
          "Warning", 
          "Employee updated but failed to update role. Please contact administrator."
        );
      }

      router.back();
    } catch (error) {
      console.error("Error submitting employee:", error);
      Alert.alert(
        "Error", 
        error.response?.data?.message || error.message || "Failed to update employee"
      );
    } finally {
      setLoading(false);
    }
  };

  // Enhanced fetchRoles with better error handling
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch(`${API_CONFIG.API_URL}/api/rolesAndPermission`, {
          headers: { 'x-api-key': API_CONFIG.API_KEY },
        });
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

  // Fetch employee data if only id is passed
  useEffect(() => {
    if (!employeeDataString && employeeIdParam) {
      (async () => {
        try {
          const res = await axios.get(`${API_CONFIG.API_URL}/api/employeeManagement/${employeeIdParam}`, {
            headers: { 'x-api-key': API_CONFIG.API_KEY }
          });
          if (res.data && res.data.success && res.data.employee) {
            setFetchedEmployee(res.data.employee);
            setFormData((prev) => ({
              ...prev,
              ...res.data.employee,
              address: ensureAddress(res.data.employee.address),
            }));
          }
        } catch (e) {
          // Optionally handle error
        }
      })();
    }
  }, [employeeDataString, employeeIdParam]);

  // Update formData when fetchedEmployee is loaded
  useEffect(() => {
    if (fetchedEmployee) {
      setFormData((prev) => ({
        ...prev,
        firstName: fetchedEmployee.firstName || "",
        lastName: fetchedEmployee.lastName || "",
        email: fetchedEmployee.email || "",
        mobileNo: fetchedEmployee.mobileNo || "",
        gender: fetchedEmployee.gender || "",
        dateOfBirth: fetchedEmployee.dateOfBirth ? fetchedEmployee.dateOfBirth.split('T')[0] : "",
        dateOfHiring: fetchedEmployee.dateOfHiring ? fetchedEmployee.dateOfHiring.split('T')[0] : "",
        role: fetchedEmployee.role?._id || fetchedEmployee.role || "",
        department: fetchedEmployee.department?.name || fetchedEmployee.department || "",
        status: fetchedEmployee.status || "active",
        notes: fetchedEmployee.notes || "",
        address: ensureAddress(fetchedEmployee.address),
      }));
    }
  }, [fetchedEmployee]);

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

          <View className="items-center py-6">
            <TouchableOpacity
              className="w-24 h-24 rounded-full bg-gray-200 justify-center items-center mb-2"
              onPress={pickDocument}
            >
              {selectedFile ? (
                <Image
                  source={{ uri: selectedFile.uri }}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <Upload size={24} color="#9CA3AF" />
              )}
            </TouchableOpacity>
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
              />
            </View>
          </View>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Phone Number"
                value={formData.mobileNo}
                onChangeText={(text) => handleInputChange("mobileNo", text)}
                keyboardType="phone-pad"
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
              />
            </View>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Email Id"
                value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
                keyboardType="email-address"
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
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
              />
            </View>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Date of Joining"
                value={formData.dateOfHiring}
                editable={false}
                right={<TextInput.Icon icon={() => <Calendar size={20} color="#9CA3AF" />} onPress={() => showDatePicker("dateOfHiring")} />}
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
              />
            </View>
          </View>


          <View className="space-y-4">
            <TextInput
              mode="outlined"
              label="Department"
              value={formData.department}
              onChangeText={(text) => handleInputChange("department", text)}
              outlineColor="#E5E7EB"
              activeOutlineColor="#DC2626"
            />

            <TextInput
              mode="outlined"
              label="Role"
              value={formData.role}
              onChangeText={(text) => handleInputChange("role", text)}
              outlineColor="#E5E7EB"
              activeOutlineColor="#DC2626"
            />

    
            <View className="relative mt-6">
              <TouchableOpacity
                onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                className="flex-row items-center justify-between bg-gray-100 rounded-lg h-12 px-4 w-full"
              >
                <Text className={`${
                  formData.status ? 
                    formData.status === 'Active' ? 'text-green-600' :
                    formData.status === 'Inactive' ? 'text-red-600' :
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

     
          <View className="mt-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Address</Text>

            <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
              <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
                <TextInput
                  mode="outlined"
                  label="Address Line 1"
                  value={formData.address.addressLine}
                  onChangeText={(text) => handleInputChange("address.addressLine", text)}
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#DC2626"
                />
              </View>
              <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
                <TextInput
                  mode="outlined"
                  label="City"
                  value={formData.address.city}
                  onChangeText={(text) => handleInputChange("address.city", text)}
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#DC2626"
                />
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
                />
              </View>
              <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
                <TextInput
                  mode="outlined"
                  label="State"
                  value={formData.address.state}
                  onChangeText={(text) => handleInputChange("address.state", text)}
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#DC2626"
                />
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
                />
              </View>
              <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
                <TextInput
                  mode="outlined"
                  label="Pin Code"
                  value={formData.address.pincode}
                  onChangeText={(text) => handleInputChange("address.pincode", text)}
                  keyboardType="number-pad"
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#DC2626"
                />
              </View>
            </View>
          </View>

          
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

   
          <Text className="text-base font-semibold text-gray-700 mb-4 mt-5">
          Attachment
          </Text>

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
                onPress={() => setSelectedFile(null)}
              >
                <Text className="text-red-600">Remove</Text>
              </TouchableOpacity>
            </View>
          )}

     
          <View className="flex-row justify-center space-x-6 mt-8 gap-4">
            <TouchableOpacity
              className="bg-gray-100 px-8 py-3 rounded-lg"
              onPress={() => router.back()}
            >
              <Text className="text-gray-600 font-medium">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-red-600 px-8 py-3 rounded-lg"
              onPress={handleSave}
            >
              <Text className="text-white font-medium">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  )
}

export default EditEmployee
