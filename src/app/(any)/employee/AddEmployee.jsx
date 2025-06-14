"use client"

import React, { useState } from "react"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { View, Text, TextInput, TouchableOpacity, useWindowDimensions, Image } from "react-native"
import { ChevronDown, Calendar, Upload, ArrowLeft } from "lucide-react-native"
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker"
import { useRouter } from "expo-router"
import * as DocumentPicker from "expo-document-picker"

const AddEmployee = () => {
  const { width } = useWindowDimensions()
  const isTablet = width >= 768
  const router = useRouter()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    emailId: "",
    alternativePhoneNumber: "",
    dateOfBirth: "",
    dateOfJoining: "",
    department: "",
    role: "",
    status: "",
    addressLine1: "",
    cityTownVillage: "",
    district: "",
    state: "",
    country: "",
    pinCode: "",
    note: "",
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

  const InputField = ({
    placeholder,
    value,
    onChangeText,
    hasDropdown = false,
    keyboardType = "default",
  }) => (
    <View className="relative">
      <TextInput
        className="h-12 border border-gray-200 rounded-full px-4 bg-white text-gray-700 text-base"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor="#9CA3AF"
      />
      {hasDropdown && (
        <View className="absolute right-4 top-3.5">
          <ChevronDown size={20} color="#9CA3AF" />
        </View>
      )}
    </View>
  )

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
      {/* Header */}
      <View className="bg-white p-4 shadow-sm flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-3" onPress={() => router.back()}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Add Employee</Text>
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

          {/* Personal Details */}
          <Text className="text-base font-medium text-gray-700 mb-4">
            Personal Details
          </Text>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <InputField
                placeholder="First Name"
                value={formData.firstName}
                onChangeText={(text) => handleInputChange("firstName", text)}
              />
            </View>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <InputField
                placeholder="Last Name"
                value={formData.lastName}
                onChangeText={(text) => handleInputChange("lastName", text)}
              />
            </View>
          </View>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <InputField
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChangeText={(text) => handleInputChange("phoneNumber", text)}
                keyboardType="phone-pad"
              />
            </View>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <InputField
                placeholder="Alternative Phone Number"
                value={formData.alternativePhoneNumber}
                onChangeText={(text) => handleInputChange("alternativePhoneNumber", text)}
                keyboardType="phone-pad"
              />
            </View>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <InputField
                placeholder="Email Id"
                value={formData.emailId}
                onChangeText={(text) => handleInputChange("emailId", text)}
                keyboardType="email-address"
              />
            </View>
          </View>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TouchableOpacity
                onPress={() => showDatePicker("dateOfBirth")}
                className="h-12 border border-gray-200 rounded-full px-4 bg-white flex-row items-center"
              >
                <Text className="flex-1 text-base text-gray-900">
                  {formData.dateOfBirth
                    ? formData.dateOfBirth
                    : "Date of Birth"}
                </Text>
                <Calendar size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TouchableOpacity
                onPress={() => showDatePicker("dateOfJoining")}
                className="h-12 border border-gray-200 rounded-full px-4 bg-white flex-row items-center"
              >
                <Text className="flex-1 text-base text-gray-900">
                  {formData.dateOfJoining
                    ? formData.dateOfJoining
                    : "Date of Joining"}
                </Text>
                <Calendar size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Department, Role & Status Section */}
          <View className="space-y-4">
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <InputField
                placeholder="Department"
                value={formData.department}
                onChangeText={(text) => handleInputChange("department", text)}
              />
            </View>

            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <InputField
                placeholder="Role"
                value={formData.role}
                onChangeText={(text) => handleInputChange("role", text)}
              />
            </View>

            {/* Status Dropdown */}
            <View className="relative">
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
                } text-sm font-medium`}>
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
                      <Text className={`${status.color} text-sm font-medium`}>
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
            <Text className="text-lg font-semibold text-gray-900 mb-4">Address</Text>

            <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
              {/* First Row */}
              <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
                <TextInput
                  className="h-12 border border-gray-200 rounded-full px-4 text-base text-gray-900"
                  placeholder="Address Line 1"
                  value={formData.addressLine1}
                  onChangeText={(text) => handleInputChange("addressLine1", text)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
                <TextInput
                  className="h-12 border border-gray-200 rounded-full px-4 text-base text-gray-900"
                  placeholder="City / Town / Village"
                  value={formData.cityTownVillage}
                  onChangeText={(text) => handleInputChange("cityTownVillage", text)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
              {/* Second Row */}
              <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
                <TextInput
                  className="h-12 border border-gray-200 rounded-full px-4 text-base text-gray-900"
                  placeholder="District"
                  value={formData.district}
                  onChangeText={(text) => handleInputChange("district", text)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
                <TextInput
                  className="h-12 border border-gray-200 rounded-full px-4 text-base text-gray-900"
                  placeholder="State"
                  value={formData.state}
                  onChangeText={(text) => handleInputChange("state", text)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
              {/* Third Row */}
              <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
                <TextInput
                  className="h-12 border border-gray-200 rounded-full px-4 text-base text-gray-900"
                  placeholder="Country"
                  value={formData.country}
                  onChangeText={(text) => handleInputChange("country", text)}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
                <TextInput
                  className="h-12 border border-gray-200 rounded-full px-4 text-base text-gray-900"
                  placeholder="Pin Code"
                  value={formData.pinCode}
                  onChangeText={(text) => handleInputChange("pinCode", text)}
                  keyboardType="number-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          {/* Note Section */}
          <View className="mb-6">
            <TextInput
              className="border border-gray-200 rounded-lg p-4 text-base text-gray-900 h-32"
              placeholder="Note"
              value={formData.note}
              onChangeText={(text) => handleInputChange("note", text)}
              multiline
              numberOfLines={4}
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
          </View>

          {/* Attachment Section */}
          <Text className="text-base font-semibold text-gray-700 mb-4 mt-5">
          Attachment
          </Text>

          <TouchableOpacity
            className="bg-red-600 h-12 rounded-full flex-row items-center justify-center mb-2"
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

          {/* Action Buttons */}
          <View className="flex-row justify-center space-x-6 mt-8"> {/* Changed space-x-4 to space-x-6 */}
            <TouchableOpacity
              className="bg-gray-100 px-8 py-3 rounded-full"
              onPress={() => router.back()}
            >
              <Text className="text-gray-600 font-medium">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-red-600 px-8 py-3 rounded-full"
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

export default AddEmployee
