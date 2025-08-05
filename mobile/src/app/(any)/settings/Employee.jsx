import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Eye, PenSquare, Plus, Trash2 } from 'lucide-react-native';
import { Text, TouchableOpacity, useWindowDimensions, View, ScrollView, Alert } from 'react-native';
import { DataTable } from 'react-native-paper';
import { TextInput } from 'react-native-paper';
import { createRole, updateRole, deleteRole } from '../../../utils/roles';
import apiClient from '../../../utils/apiClient';

const PERMISSION_ACTIONS = [
  { name: 'view', icon: Eye },
  { name: 'create', icon: Plus },
  { name: 'edit', icon: PenSquare },
  { name: 'delete', icon: Trash2 },
];

const PERMISSIONS = [
  { id: 1, name: 'Dashboard', page: 'Dashboard' },
  { id: 2, name: 'Proposal', page: 'Proposals' },
  { id: 3, name: 'Project', page: 'Projects' },
  { id: 4, name: 'Task', page: 'Tasks' },
  { id: 5, name: 'Customer', page: 'Customers' },
  { id: 6, name: 'Employee', page: 'Employees' },
];

export default function Employee() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const router = useRouter();
  const [checked, setChecked] = useState({}); // { [permissionId_actionName]: true }
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editRoleId, setEditRoleId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch roles from backend
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/rolesAndPermission');
      const data = res.data;
      // Filter out invalid role objects
      const validRoles = (data.roles || []).filter(role => 
        role && typeof role === 'object' && role._id && role.role
      );
      setRoles(validRoles);
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch roles');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Map checked state to backend payload
  const buildRolePayload = () => {
    return {
      role: selectedRole,
      permissions: PERMISSIONS.map((perm) => {
        const actions = {};
        PERMISSION_ACTIONS.forEach((action) => {
          actions[action.name] = !!checked[`${perm.id}_${action.name}`];
        });
        return {
          page: perm.page,
          url: perm.page === 'Dashboard' ? '/dashboard' : `/dashboard/${perm.page.toLowerCase()}`,
          actions,
        };
      }).filter((perm) => Object.values(perm.actions).some(Boolean)),
    };
  };

  // Handle Save (Add or Update)
  const handleSave = async () => {
    if (!selectedRole.trim()) {
      Alert.alert('Validation', 'Role name is required');
      return;
    }
    const payload = buildRolePayload();
    if (!payload.permissions.length) {
      Alert.alert('Validation', 'Select at least one permission');
      return;
    }
    setLoading(true);
    try {
      if (isEditing && editRoleId) {
        await updateRole(editRoleId, payload);
        Alert.alert('Success', 'Role updated');
      } else {
        await createRole(payload);
        Alert.alert('Success', 'Role created');
      }
      fetchRoles();
      resetForm();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit
  const handleEdit = (role) => {
    if (!role || typeof role !== 'object') {
      console.error('Invalid role object:', role);
      return;
    }
    setSelectedRole(role.role || '');
    setEditRoleId(role._id);
    setIsEditing(true);
    // Map backend permissions to checked state
    const newChecked = {};
    (role.permissions || []).forEach((perm) => {
      PERMISSION_ACTIONS.forEach((action) => {
        if (perm.actions && perm.actions[action.name]) {
          const permObj = PERMISSIONS.find((p) => p.page === perm.page);
          if (permObj) newChecked[`${permObj.id}_${action.name}`] = true;
        }
      });
    });
    setChecked(newChecked);
  };

  // Handle Delete
  const handleDelete = (roleId) => {
    Alert.alert('Delete Role', 'Are you sure you want to delete this role?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setLoading(true);
          try {
            await deleteRole(roleId);
            Alert.alert('Deleted', 'Role deleted');
            fetchRoles();
            resetForm();
          } catch (e) {
            Alert.alert('Error', e.message || 'Failed to delete role');
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  // Reset form
  const resetForm = () => {
    setSelectedRole('');
    setChecked({});
    setIsEditing(false);
    setEditRoleId(null);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Roles & Permissions</Text>
      </View>
      <ScrollView className="flex-1 p-4">
        {/* Role Input */}
        <View className="mb-6">
          <Text className="mb-2 text-gray-900 font-semibold">Role Name</Text>
          <TextInput
            mode="outlined"
            label="Role Name"
            value={selectedRole}
            onChangeText={setSelectedRole}
            placeholder="Enter role name"
            style={{ backgroundColor: 'white' }}
            outlineColor="#c92125"
            activeOutlineColor="#c92125"
          />
        </View>
        {/* Permission Title */}
        <Text className="text-xl font-bold text-gray-900 mb-4">Permission</Text>
        {/* Permissions Table */}
        <DataTable style={{ borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: '#c92125', marginBottom: 16 }}>
          <DataTable.Header style={{ backgroundColor: '#c92125' }}>
            <DataTable.Title style={{ flex: 2 }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Descriptions</Text>
            </DataTable.Title>
            {PERMISSION_ACTIONS.map(action => (
              <DataTable.Title key={action.name} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontWeight: 'bold', textTransform: 'capitalize', textAlign: 'center' }}>
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
                      onPress={() => {
                        setChecked((prev) => {
                          const newChecked = { ...prev };
                          const viewKey = `${permission.id}_view`;
                          if (action.name === 'view') {
                            // Unchecking view unchecks all others
                            if (prev[viewKey]) {
                              PERMISSION_ACTIONS.forEach((a) => {
                                newChecked[`${permission.id}_${a.name}`] = false;
                              });
                            } else {
                              newChecked[viewKey] = true;
                            }
                          } else {
                            // Checking edit/add/delete auto-checks view
                            newChecked[key] = !prev[key];
                            if (!prev[key]) {
                              newChecked[viewKey] = true;
                            }
                          }
                          return newChecked;
                        });
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isChecked ? '#4ade80' : 'white',
                        borderWidth: 1,
                        borderColor: isChecked ? '#4ade80' : '#d1d5db',
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
            onPress={handleSave}
            disabled={loading}
          >
            <Text className="text-white font-medium">{isEditing ? 'Update' : 'Save'}</Text>
          </TouchableOpacity>
          {isEditing && (
            <TouchableOpacity
              className="bg-gray-500 px-8 py-3 rounded-lg"
              onPress={resetForm}
              disabled={loading}
            >
              <Text className="text-white font-medium">Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Roles List */}
        <Text className="text-lg font-bold text-gray-900 mt-8 mb-2">Existing Roles</Text>
        {roles.map((role) => {
          // Safety check to ensure role is a valid object
          if (!role || typeof role !== 'object') {
            console.error('Invalid role object:', role);
            return null;
          }
          
          return (
            <View
              key={role._id || Math.random()}
              className="w-[95%] self-center bg-gray-50 shadow-xl rounded-xl mb-4 p-4"
            >
              <View>
                <Text className="font-bold text-[#c92125]">{role.role || 'Unknown Role'}</Text>
                <Text className="text-[#555] text-xs mb-3">
                  {Array.isArray(role.permissions) 
                    ? role.permissions
                        .map(
                          (p) =>
                            `${p.page}: ${Object.entries(p.actions || {})
                              .filter(([, v]) => v)
                              .map(([k]) => k)
                              .join(', ')}`
                        )
                        .join(' | ')
                    : 'No permissions'
                  }
                </Text>
                <View className="flex-row justify-start space-x-4 mt-4 gap-4">
                  <TouchableOpacity onPress={() => handleEdit(role)}>
                    <PenSquare size={20} color="#4ade80" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(role._id)}>
                    <Trash2 size={20} color="#c92125" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}