import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ArrowLeft, ChevronDown, Check } from 'lucide-react-native'

const roles = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Manager' },
  { id: 3, name: 'Employee' }
]

const permissions = [
  { id: 1, name: 'Home' },
  { id: 2, name: 'Proposal' },
  { id: 3, name: 'Project' },
  { id: 4, name: 'Employee' },
  { id: 5, name: 'Customer' },
  { id: 6, name: 'Settings' }
]

export default function Employee() {
  const { width } = useWindowDimensions()
  const isTablet = width >= 768
  const router = useRouter()
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')
  const [permissionMatrix, setPermissionMatrix] = useState({})

  const handlePermissionToggle = (permission, action) => {
    setPermissionMatrix(prev => ({
      ...prev,
      [permission]: {
        ...prev[permission],
        [action]: !prev[permission]?.[action]
      }
    }))
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Setting - Employee</Text>
      </View>

      <View className="flex-1 p-4">
        {/* Role Dropdown */}
        <View className="mb-6">
          <TouchableOpacity
            onPress={() => setShowRoleDropdown(!showRoleDropdown)}
            className="h-12 px-4 border border-gray-200 rounded-full flex-row items-center justify-between"
          >
            <Text className="text-gray-900 text-base">
              {selectedRole || 'Select Role'}
            </Text>
            <ChevronDown size={20} color="#6B7280" />
          </TouchableOpacity>

          {showRoleDropdown && (
            <View className="absolute top-14 left-0 right-0 bg-white rounded-xl shadow-xl z-50 border border-gray-100">
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.id}
                  onPress={() => {
                    setSelectedRole(role.name)
                    setShowRoleDropdown(false)
                  }}
                  className="px-4 py-3 border-b border-gray-100"
                >
                  <Text className="text-gray-900">{role.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Permissions Table */}
        <Text className="text-xl font-bold text-gray-900 mb-4">Permission</Text>
        
        {/* Table Header */}
        <View className={`${isTablet ? "flex-row" : ""} mb-4 bg-red-600 rounded-t-xl p-4`}>
          <View className={`${isTablet ? "flex-1" : "mb-2"}`}>
            <Text className="text-white text-base font-medium">Descriptions</Text>
          </View>
          <View className={`${isTablet ? "flex-row flex-1 justify-between" : "flex-row justify-between"}`}>
            <Text className="text-white text-base font-medium">View</Text>
            <Text className="text-white text-base font-medium">Create</Text>
            <Text className="text-white text-base font-medium">Edit</Text>
            <Text className="text-white text-base font-medium">Delete</Text>
          </View>
        </View>

        {/* Table Body */}
        {permissions.map((permission) => (
          <View 
            key={permission.id}
            className={`${isTablet ? "flex-row" : ""} py-4 border-b border-gray-100`}
          >
            <View className={`${isTablet ? "flex-1" : "mb-2"}`}>
              <Text className="text-gray-900 text-base">{permission.name}</Text>
            </View>
            <View className={`${isTablet ? "flex-row flex-1 justify-between" : "flex-row justify-between"}`}>
              {['view', 'create', 'edit', 'delete'].map((action) => (
                <TouchableOpacity
                  key={action}
                  onPress={() => handlePermissionToggle(permission.name, action)}
                  className={`w-6 h-6 rounded border ${
                    permissionMatrix[permission.name]?.[action] 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300'
                  } items-center justify-center`}
                >
                  {permissionMatrix[permission.name]?.[action] && (
                    <Check size={16} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Action Buttons */}
        <View className="flex-row justify-center space-x-4 mt-8">
          <TouchableOpacity 
            className="bg-red-600 px-8 py-3 rounded-full"
            onPress={() => {/* Handle save */}}
          >
            <Text className="text-white font-medium">Save</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-gray-500 px-8 py-3 rounded-full"
            onPress={() => router.back()}
          >
            <Text className="text-white font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}