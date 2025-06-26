import { useRouter } from 'expo-router'
import { ArrowLeft, Check, ChevronDown, Eye, PenSquare, Plus, Trash2 } from 'lucide-react-native'
import { useState } from 'react'
import { Text, TouchableOpacity, useWindowDimensions, View } from 'react-native'
import { DataTable } from 'react-native-paper'

const roles = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Manager' },
  { id: 3, name: 'Employee' }
]

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
  const [checked, setChecked] = useState({}); // { [permissionId_actionName]: true }

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
            className="h-12 px-4 border border-gray-200 rounded-lg flex-row items-center justify-between"
          >
            <Text className="text-gray-900 text-base">
              {selectedRole || 'Select Role'}
            </Text>
            <ChevronDown size={20} color="#6B7280" />
          </TouchableOpacity>

          {showRoleDropdown && (
            <View className="absolute top-14 left-0 right-0 bg-white rounded-lg shadow-xl z-50 border border-gray-100">
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

        {/* Permissions Table using react-native-paper */}
        <DataTable style={{ borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: '#c92125', marginBottom: 16 }}>
          <DataTable.Header style={{ backgroundColor: '#c92125' }}>
            <DataTable.Title style={{ flex: 2 }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Descriptions</Text>
            </DataTable.Title>
            {PERMISSION_ACTIONS.map(action => (
              <DataTable.Title key={action.name} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontWeight: 'extrabold', textTransform: 'capitalize', textAlign: 'center' }}>
                  {action.name}
                </Text>
              </DataTable.Title>
            ))}
          </DataTable.Header>

          {PERMISSIONS.map((permission) => (
            <DataTable.Row key={permission.id}>
              <DataTable.Cell style={{ flex: 2 }}>
                <Text style={{ color: '#111827' }}>{permission.name}</Text>
              </DataTable.Cell>
              {PERMISSION_ACTIONS.map((action) => {
                const key = `${permission.id}_${action.name}`;
                const isChecked = checked[key];
                return (
                  <DataTable.Cell
                    key={action.name}
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        setChecked((prev) => ({
                          ...prev,
                          [key]: !prev[key],
                        }))
                      }
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isChecked ? '#4ade80' : 'white', // bg-green-400
                        borderWidth: 1,
                        borderColor: isChecked ? '#4ade80' : '#d1d5db', // gray-300
                      }}
                    >
                      {isChecked ? (
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>✓</Text>
                      ) : null}
                    </TouchableOpacity>
                  </DataTable.Cell>
                );
              })}
            </DataTable.Row>
          ))}
        </DataTable>

        {/* Action Buttons */}
        <View className="flex-row justify-center space-x-4 mt-8 gap-4">
          <TouchableOpacity 
            className="bg-[#c92125] px-8 py-3 rounded-lg"
            onPress={() => {/* Handle save */}}
          >
            <Text className="text-white font-medium">Save</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-gray-500 px-8 py-3 rounded-lg"
            onPress={() => router.back()}
          >
            <Text className="text-white font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}