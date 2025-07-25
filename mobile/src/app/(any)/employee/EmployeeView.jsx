import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, FileText, Mail, Phone } from 'lucide-react-native'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { API_CONFIG } from '../../../../config'
import auth from '../../../utils/auth'

export default function EmployeeDetail() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const [employeeData, setEmployeeData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    auth.fetchWithAuth(`${API_CONFIG.API_URL}/api/employeeManagement/${id}`, {
      method: 'GET'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.employee) {
          // Transform the data to match the expected format for EditEmployee
          const emp = data.employee;
          const transformedEmployee = {
            id: emp.employeeId || emp._id,
            firstName: emp.firstName || "",
            lastName: emp.lastName || "",
            email: emp.email || "",
            mobileNo: emp.mobileNo || "",
            gender: emp.gender || "",
            dateOfBirth: emp.dateOfBirth || "",
            dateOfHiring: emp.dateOfHiring || "",
            role: emp.role?._id || emp.role || "",
            department: emp.department?.name || emp.department || "",
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
            image: emp.avatar || null,
            phone: emp.mobileNo || "",
            name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
            roleName: emp.role?.role || "N/A",
            departmentName: emp.department?.name || "N/A",
            dateOfJoining: emp.dateOfHiring || "",
            note: emp.notes || "",
            attachment: emp.documents?.[0] || { name: "No attachment", size: "0 KB" },
            stats: {
              completed: 20, // Mock data
              ongoing: 1, // Mock data
              projects: 2, // Mock data
            },
            originalData: emp,
          };
          setEmployeeData(transformedEmployee);
        } else {
          setEmployeeData(null);
        }
      })
      .catch(() => setEmployeeData(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500 text-sm">Loading employee details...</Text>
      </View>
    )
  }

  if (!employeeData) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500 text-sm">Employee not found.</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">Profile</Text>
        </View>
        <TouchableOpacity 
          className="bg-red-600 px-6 py-2 rounded-lg"
          onPress={() => router.push({
            pathname: '/employee/EditEmployee',
            params: { employeeData: JSON.stringify(employeeData) }
          })}
        >
          <Text className="text-white font-medium">Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View className="items-center py-6">
          <Image 
            source={{ uri: employeeData.image }}
            className="w-32 h-32 rounded-full mb-4"
          />
          <Text className="text-2xl font-bold text-gray-900">{employeeData.name}</Text>
          <Text className="text-lg text-gray-500 mt-1">{employeeData.roleName}</Text>
        </View>

        {/* Stats */}
        <View className="flex-row justify-around bg-red-50 mx-4 p-6 rounded-xl">
          <View className="items-center">
            <Text className="text-2xl font-bold">{employeeData.stats.completed}</Text>
            <Text className="text-gray-500">Completed</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold">{employeeData.stats.ongoing}</Text>
            <Text className="text-gray-500">Ongoing</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold">{employeeData.stats.projects}</Text>
            <Text className="text-gray-500">Project</Text>
          </View>
        </View>

        {/* Details */}
        <View className="px-4 py-6">
          <View className="mb-6">
            <Text className="text-gray-500 mb-1">Employee ID</Text>
            <Text className="text-xl font-semibold">{employeeData.id}</Text>
          </View>

          <View className="mb-6">
            <Text className="text-gray-500 mb-1">Department</Text>
            <Text className="text-xl font-semibold">{employeeData.departmentName}</Text>
          </View>

          {/* Contact Info */}
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <Phone size={20} color="#DC2626" />
              <Text className="text-lg ml-2">{employeeData.phone}</Text>
            </View>
            <View className="flex-row items-center">
              <Mail size={20} color="#DC2626" />
              <Text className="text-lg ml-2">{employeeData.email}</Text>
            </View>
          </View>

          {/* Dates */}
          <View className="mb-6">
            <Text className="text-gray-500 mb-1">Date of Birth</Text>
            <Text className="text-xl font-semibold">{employeeData.dateOfBirth}</Text>
          </View>

          <View className="mb-6">
            <Text className="text-gray-500 mb-1">Date of Joining</Text>
            <Text className="text-xl font-semibold">{employeeData.dateOfJoining}</Text>
          </View>

          {/* Attachment */}
          <View className="mb-6">
            <Text className="text-gray-500 mb-3">Attachment</Text>
            <View className="flex-row items-center bg-gray-50 p-3 rounded-lg">
              <FileText size={20} color="#4B5563" />
              <View className="ml-2">
                <Text className="font-medium">{employeeData.attachment.name}</Text>
                <Text className="text-gray-500 text-sm">{employeeData.attachment.size}</Text>
              </View>
            </View>
          </View>

          {/* Note */}
          <View>
            <Text className="text-gray-500 mb-2">Note</Text>
            <Text className="text-gray-900">{employeeData.note}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}