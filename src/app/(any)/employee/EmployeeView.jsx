import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, FileText, Mail, Phone } from 'lucide-react-native'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'

export default function EmployeeDetail() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  
  // Mock data - replace with actual data fetch
  const employeeData = {
    id: "EMP-001",
    name: "Arun R",
    role: "Installation Specialist",
    image: require("../../../../assets/icons/Frame01.png"),
    stats: {
      completed: 20,
      ongoing: 1,
      projects: 2
    },
    department: "Installation",
    phoneNumber: "+91 87541 486311",
    email: "vinoth@gmail.com",
    dateOfBirth: "09/04/1996",
    dateOfJoining: "20/06/2023",
    attachment: {
      name: "aadharid.pdf",
      size: "156 KB"
    },
    note: "All rounder -Installation, electrician, Service technician"
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
            source={employeeData.image}
            className="w-32 h-32 rounded-full mb-4"
          />
          <Text className="text-2xl font-bold text-gray-900">{employeeData.name}</Text>
          <Text className="text-lg text-gray-500 mt-1">{employeeData.role}</Text>
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
            <Text className="text-xl font-semibold">{employeeData.department}</Text>
          </View>

          {/* Contact Info */}
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <Phone size={20} color="#DC2626" />
              <Text className="text-lg ml-2">{employeeData.phoneNumber}</Text>
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