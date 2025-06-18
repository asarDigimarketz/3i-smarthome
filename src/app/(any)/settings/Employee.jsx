import { useRouter } from 'expo-router'
import { ArrowLeft, Check, ChevronDown, Eye, PenSquare, Plus, Trash2 } from 'lucide-react-native'
import { useState } from 'react'
import { Text, TouchableOpacity, useWindowDimensions, View } from 'react-native'

const roles = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Manager' },
  { id: 3, name: 'Employee' }
]

// Replace PERMISSION_ACTIONS array with icon mapping
const PERMISSION_ACTIONS = [
  { name: 'view', icon: Eye },
  { name: 'create', icon: Plus },
  { name: 'edit', icon: PenSquare },
  { name: 'delete', icon: Trash2 }
];

const PERMISSIONS = [
  { id: 1, name: 'Home' },
  { id: 2, name: 'Proposal' },
  { id: 3, name: 'Project' },
  { id: 4, name: 'Employee' },
  { id: 5, name: 'Customer' },
  { id: 6, name: 'Settings' }
];

export default function Employee() {
  const { width } = useWindowDimensions()
  const isTablet = width >= 768
  const router = useRouter()
  const [showRoleDropdown, setShowRoleDropdown] = useState(false)
  const [selectedRole, setSelectedRole] = useState('')

  return (
    <View className="flex-1 bg-white">
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

        {/* Permission Title */}
        <Text className="text-xl font-bold text-gray-900 mb-4">Permission</Text>

        {/* Table Header */}
        <View className="mb-4 bg-red-600 rounded-t-xl p-2">
          <View className="flex-row items-center">
            <View className="flex-1 min-w-[32%]">
              <Text className="text-white text-base font-medium">Descriptions</Text>
            </View>
            <View className="flex-row justify-between flex-1 min-w-[68%]">
              {PERMISSION_ACTIONS.map(action => (
                <View key={action.name} className="w-12 items-center">
                  <action.icon size={20} color="white" />
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Table Body */}
        <View className="bg-white rounded-b-xl">
          {PERMISSIONS.map((permission) => (
            <View 
              key={permission.id}
              className="flex-row items-center py-4 border-b border-gray-200"
            >
              <View className="flex-1 min-w-[32%]">
                <Text className="text-gray-800 text-base ml-2">{permission.name}</Text>
              </View>
              <View className="flex-row justify-between flex-1 min-w-[68%]">
                {PERMISSION_ACTIONS.map((action) => (
                  <View key={action.name} className="w-12 items-center">
                    <TouchableOpacity
                      className={`w-6 h-6 rounded border ${
                        false
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300'
                      } items-center justify-center`}
                    >
                      {false && (
                        <Check size={16} color="white" />
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

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
    </View>
  )
}