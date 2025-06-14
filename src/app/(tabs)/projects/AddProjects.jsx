import React, { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  useWindowDimensions,
} from "react-native";
import { ChevronDown, Calendar, Upload, ArrowLeft } from "lucide-react-native";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";

const AddProject = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const router = useRouter();

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

  const serviceOptions = [
    { value: "Home Cinema", color: "text-purple-600", bg: "bg-purple-50" },
    { value: "Security System", color: "text-cyan-600", bg: "bg-cyan-50" },
    { value: "Home Automation", color: "text-blue-600", bg: "bg-blue-50" },
    { value: "Outdoor Audio", color: "text-pink-600", bg: "bg-pink-50" },
  ];

  // Update the statusOptions array
  const statusOptions = [
    { value: "New", color: "text-blue-600", bg: "bg-blue-100" },
    { value: "InProgress", color: "text-yellow-600", bg: "bg-yellow-100" },
    { value: "Done", color: "text-green-600", bg: "bg-green-100" },
    { value: "Complete", color: "text-purple-600", bg: "bg-purple-100" },
  ];

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

  // First, update the InputField component to match AddProposal's style:
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
  );

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

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={140}
        keyboardOpeningTime={0}
      >
        <View className="p-6">
          {/* Customer Details */}
          <Text className="text-base font-medium text-gray-700 mb-4">
            Customer Details
          </Text>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TouchableOpacity
                onPress={() => setShowStatusDropdown(true)}
                className="relative"
              >
                <InputField
                  placeholder="Customer Name"
                  value={formData.customerName}
                  onChangeText={(text) =>
                    handleInputChange("customerName", text)
                  }
                  hasDropdown
                />
              </TouchableOpacity>
            </View>

            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <InputField
                placeholder="Contact Number"
                value={formData.contactNumber}
                onChangeText={(text) =>
                  handleInputChange("contactNumber", text)
                }
                keyboardType="phone-pad"
                hasDropdown
              />
            </View>
          </View>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <InputField
                placeholder="Email Id"
                value={formData.emailId}
                onChangeText={(text) => handleInputChange("emailId", text)}
                keyboardType="email-address"
              />
            </View>

            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <TouchableOpacity onPress={showDatePicker} className="relative">
                <InputField
                  placeholder="Date of Booking"
                  value={formData.dateOfBooking}
                  editable={false}
                />
                <View className="absolute right-4 top-3.5">
                  <Calendar size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Address Section */}
          <Text className="text-base font-medium text-gray-700 mb-4 mt-6">
            Address
          </Text>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <InputField
                placeholder="Address Line 1"
                value={formData.addressLine1}
                onChangeText={(value) =>
                  handleInputChange("addressLine1", value)
                }
              />
            </View>

            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <InputField
                placeholder="City / Town / Village"
                value={formData.cityTownVillage}
                onChangeText={(value) =>
                  handleInputChange("cityTownVillage", value)
                }
              />
            </View>
          </View>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <InputField
                placeholder="District"
                value={formData.district}
                onChangeText={(value) => handleInputChange("district", value)}
              />
            </View>

            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <InputField
                placeholder="State"
                value={formData.state}
                onChangeText={(value) => handleInputChange("state", value)}
              />
            </View>
          </View>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <InputField
                placeholder="Country"
                value={formData.country}
                onChangeText={(value) => handleInputChange("country", value)}
              />
            </View>

            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <InputField
                placeholder="Pin Code"
                value={formData.pinCode}
                onChangeText={(value) => handleInputChange("pinCode", value)}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Project Details Section */}
          <Text className="text-base font-medium text-gray-700 mb-4 mt-6">
            Project Details
          </Text>

          <View className={`${isTablet ? 'flex-row space-x-4' : ''}`}>
            <View className={`${isTablet ? 'flex-1' : 'mb-4'}`}>
              {/* Service Dropdown */}
              <View className="relative">
                <TouchableOpacity
                  onPress={() => setShowServiceDropdown(!showServiceDropdown)}
                  className="flex-row items-center justify-between bg-gray-100 rounded-lg h-12 px-4 w-full"
                >
                  <Text className={`${
                    formData.service ? 
                      formData.service === 'Home Cinema' ? 'text-purple-600' :
                      formData.service === 'Security System' ? 'text-cyan-600' :
                      formData.service === 'Home Automation' ? 'text-blue-600' :
                      formData.service === 'Outdoor Audio' ? 'text-pink-600' :
                      'text-gray-500'
                    : 'text-gray-500'
                  } text-sm font-medium`}>
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
                        <Text className={`${service.color} text-sm font-medium`}>
                          {service.value}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <InputField
                placeholder="Project Description"
                value={formData.projectDescription}
                onChangeText={(value) =>
                  handleInputChange("projectDescription", value)
                }
              />
            </View>

            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <View className="flex-row">
                <TextInput
                  className="flex-1 h-12 border border-gray-200 rounded-l-full px-4 bg-white text-gray-700"
                  placeholder="Size"
                  value={formData.size}
                  onChangeText={(text) =>
                    setFormData({ ...formData, size: text })
                  }
                  placeholderTextColor="#9CA3AF"
                />
                <View className="h-12 bg-gray-50 border-t border-r border-b border-gray-200 rounded-r-full px-4 justify-center">
                  <Text className="text-gray-500">Sqt</Text>
                </View>
              </View>
            </View>
          </View>

          <View className={`${isTablet ? "flex-row space-x-4" : ""}`}>
            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <View className="relative">
                <InputField
                  placeholder="Project Amount"
                  value={formData.projectAmount}
                  onChangeText={(value) =>
                    handleInputChange("projectAmount", value)
                  }
                  keyboardType="numeric"
                />
                <View className="absolute right-4 top-3">
                  <Text className="text-sm text-gray-500">₹</Text>
                </View>
              </View>
            </View>

            <View className={`${isTablet ? "flex-1" : "mb-4"}`}>
              <View className="relative">
                <TouchableOpacity
                  onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="flex-row items-center justify-between bg-gray-100 rounded-lg h-12 px-4 w-full"
                >
                  <Text className={`${
                    formData.status ? 
                      formData.status === 'New' ? 'text-blue-600' :
                      formData.status === 'InProgress' ? 'text-yellow-600' :
                      formData.status === 'Done' ? 'text-green-600' :
                      formData.status === 'Complete' ? 'text-purple-600' :
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
                        className="px-4 py-3 border-b border-gray-100 active:bg-gray-50"
                        onPress={() => {
                          setFormData({ ...formData, status: status.value });
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
          </View>

          {/* Project Attachment Section */}
          <Text className="text-base font-semibold text-gray-700 mb-4 mt-5">
            Project Attachment
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
          <View className="flex-row justify-center space-x-4 mt-8">
            <TouchableOpacity
              className="bg-gray-100 px-8 py-3 rounded-full"
              onPress={() => router.back()}
            >
              <Text className="text-gray-600 font-medium">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-red-600 px-8 py-3 rounded-full"
              onPress={() => {
                console.log("Form Data:", formData);
                router.back();
              }}
            >
              <Text className="text-white font-medium">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default AddProject;
