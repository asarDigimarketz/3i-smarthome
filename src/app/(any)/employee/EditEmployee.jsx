import { DateTimePickerAndroid } from "@react-native-community/datetimepicker"
import * as DocumentPicker from "expo-document-picker"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ArrowLeft, Calendar, ChevronDown, Upload } from "lucide-react-native"
import { useState } from "react"
import { Image, Text, TouchableOpacity, useWindowDimensions, View } from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { TextInput } from 'react-native-paper'

const EditEmployee = () => {
  const router = useRouter()
  const { employeeData: employeeDataString } = useLocalSearchParams()
  const { width } = useWindowDimensions()
  const isTablet = width >= 768

  // Parse the received data
  const parsedEmployeeData = employeeDataString ? JSON.parse(employeeDataString) : {}

  // Initialize form data with received employee data
  const [formData, setFormData] = useState({
    firstName: parsedEmployeeData.firstName || "",
    lastName: parsedEmployeeData.lastName || "",
    phoneNumber: parsedEmployeeData.phoneNumber || "",
    emailId: parsedEmployeeData.emailId || "",
    alternativePhoneNumber: parsedEmployeeData.alternativePhoneNumber || "",
    dateOfBirth: parsedEmployeeData.dateOfBirth || "",
    dateOfJoining: parsedEmployeeData.dateOfJoining || "",
    department: parsedEmployeeData.department || "",
    role: parsedEmployeeData.role || "",
    status: parsedEmployeeData.status || "",
    addressLine1: parsedEmployeeData.addressLine1 || "",
    cityTownVillage: parsedEmployeeData.cityTownVillage || "",
    district: parsedEmployeeData.district || "",
    state: parsedEmployeeData.state || "",
    country: parsedEmployeeData.country || "",
    pinCode: parsedEmployeeData.pinCode || "",
    note: parsedEmployeeData.note || "",
  })

  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)


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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
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
                value={formData.phoneNumber}
                onChangeText={(text) => handleInputChange("phoneNumber", text)}
                keyboardType="phone-pad"
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
              />
            </View>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Alternative Phone Number"
                value={formData.alternativePhoneNumber}
                onChangeText={(text) => handleInputChange("alternativePhoneNumber", text)}
                keyboardType="phone-pad"
                outlineColor="#E5E7EB"
                activeOutlineColor="#DC2626"
              />
            </View>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TextInput
                mode="outlined"
                label="Email Id"
                value={formData.emailId}
                onChangeText={(text) => handleInputChange("emailId", text)}
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
                value={formData.dateOfJoining}
                editable={false}
                right={<TextInput.Icon icon={() => <Calendar size={20} color="#9CA3AF" />} onPress={() => showDatePicker("dateOfJoining")} />}
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
                  value={formData.addressLine1}
                  onChangeText={(text) => handleInputChange("addressLine1", text)}
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#DC2626"
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
                />
              </View>
              <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
                <TextInput
                  mode="outlined"
                  label="Pin Code"
                  value={formData.pinCode}
                  onChangeText={(text) => handleInputChange("pinCode", text)}
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
              label="Note"
              value={formData.note}
              onChangeText={(text) => handleInputChange("note", text)}
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
              onPress={() => {
                console.log("Form Data:", formData)
                router.back()
              }}
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
