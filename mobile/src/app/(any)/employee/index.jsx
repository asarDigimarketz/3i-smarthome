import { useEffect, useState } from "react"
import { 
  View, 
  Text,
  TouchableOpacity, 
  FlatList, 
  SafeAreaView, 
  Image 
} from "react-native"
import { Phone, Mail, Search, ChevronDown, Plus } from "lucide-react-native"
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { API_CONFIG } from '../../../../config'
import { TextInput } from 'react-native-paper'
import PermissionGuard from '../../../components/Common/PermissionGuard'

// Avatar helper
const fallbackAvatar = 'https://img.heroui.chat/image/avatar?w=200&h=200&u=1';
const getAvatarUrl = (avatar) => {
  if (!avatar) return fallbackAvatar;
  if (avatar.startsWith('http')) {
    try {
      const url = new URL(avatar);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return avatar.replace(`${url.protocol}//${url.hostname}:5000`, API_CONFIG.API_URL);
      }
      return avatar;
    } catch {
      return avatar;
    }
  }
  if (avatar.startsWith('/')) {
    return `${API_CONFIG.API_URL}${avatar}`;
  }
  return avatar;
};

const Employee = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);

  const statusOptions = ["All", "active", "inactive"]
  const departmentOptions = [
    'All',
    'Installation',
    'Service',
    'Sales',
    'Support',
  ];

  const getStatusColor = (status) => {
    const colors = {
      'active': 'text-green-600',
      'inactive': 'text-red-600',
      'All': 'text-gray-600'
    };
    return colors[status] || 'text-gray-600';
  };

  // Add this helper function at the component level
  const getStatusStyle = (status) => {
    const styles = {
      'active': {
        bg: 'bg-green-100',
        text: 'text-green-700'
      },
      'inactive': {
        bg: 'bg-red-100',
        text: 'text-red-700'
      }
    };
    return styles[status] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  };

  const handleMenuPress = () => {
    // This will be handled by the parent layout or navigation
    console.log('Menu pressed');
  };

  useEffect(() => {
    setLoading(true)
    fetch(`${API_CONFIG.API_URL}/api/employeeManagement`, {
      headers: { 'x-api-key': API_CONFIG.API_KEY }
    })
      .then(res => res.json())
      .then(data => setEmployees(data.employees || []))
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false))
  }, [])

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All" || employee.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const renderEmployeeItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status)
    
    return (
      <TouchableOpacity 
        className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-[#DC2626]"
        onPress={() => router.push(`/(any)/employee/${item.employeeId}`)}
      >
        {/* Header: Avatar + Name + Status */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <Image
              source={{ uri: getAvatarUrl(item.avatar) }}
              className="w-12 h-12 rounded-full mr-3"
            />
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">
                {item.firstName} {item.lastName}
              </Text>
            </View>
          </View>
          <View className={`px-3 py-1 rounded-lg ${statusStyle.bg}`}>
            <Text className={`text-sm font-medium ${statusStyle.text}`}>
              {item.status === 'active' ? 'Active' : item.status === 'inactive' ? 'Inactive' : 'Unknown'}
            </Text>
          </View>
        </View>

        {/* Job Title */}
        <Text className="text-gray-600 text-sm mb-3 ml-15">
          {item.role?.role || 'N/A'}
        </Text>

        {/* Employee ID and Department */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-xs text-gray-500 mb-1">Employee ID</Text>
            <Text className="text-sm font-semibold text-gray-900">
              {item.employeeId || 'N/A'}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-gray-500 mb-1">Department</Text>
            <Text className="text-sm font-semibold text-gray-900">
              {item.department?.name || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Contact Information */}
        <View className="space-y-2">
          <View className="flex-row items-center">
            <Phone size={16} color="#DC2626" />
            <Text className="text-sm text-gray-600 ml-2">{item.mobileNo || 'No phone'}</Text>
          </View>
          <View className="flex-row items-center">
            <Mail size={16} color="#DC2626" />
            <Text className="text-sm text-gray-600 ml-2">{item.email || 'No email'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <PermissionGuard page="Employees" action="view">
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 px-4 pt-4">
          {/* Header Row: Title + Filters + Add */}
          <View className="flex-row items-center justify-between mb-2">
            {/* Left: Title */}
            <Text className="text-xl font-bold text-gray-900">Employee Detail</Text>
            {/* Right: Filters + Add */}
            <View className="flex-row items-center space-x-2">
              {/* Status Filter */}
              <View className="relative">
                <TouchableOpacity
                  className="border border-gray-200 rounded-lg px-4 py-2 flex-row items-center"
                  onPress={() => setIsStatusModalVisible(!isStatusModalVisible)}
                >
                  <Text className="mr-1 text-sm">{statusFilter}</Text>
                  <ChevronDown size={14} color="#6B7280" />
                </TouchableOpacity>
                {isStatusModalVisible && (
                  <View className="absolute top-11 right-0 bg-white rounded-lg shadow-xl z-10 w-28">
                    {statusOptions.map((status) => (
                      <TouchableOpacity
                        key={status}
                        className="px-3 py-2 border-b border-gray-100 active:bg-gray-50"
                        onPress={() => {
                          setStatusFilter(status);
                          setIsStatusModalVisible(false);
                        }}
                      >
                        <Text className={`$ {
                          status === statusFilter
                            ? status === 'active' ? 'text-green-600'
                            : status === 'inactive' ? 'text-red-600'
                            : 'text-gray-600'
                        } text-sm font-medium`}>
                          {status}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              
              {/* Department Filter */}
              {/* <View className="relative">
                <TouchableOpacity
                  className="border border-gray-200 rounded-lg px-4 py-2 flex-row items-center"
                  onPress={() => setShowDepartmentFilter(!showDepartmentFilter)}
                >
                  <Text className="mr-2">{selectedDepartment}</Text>
                  <ChevronDown size={16} color="#6B7280" />
                </TouchableOpacity>
                {showDepartmentFilter && (
                  <View className="absolute top-11 right-0 bg-white rounded-lg shadow-xl z-10 w-32">
                    {departmentOptions.map((dept) => (
                      <TouchableOpacity
                        key={dept}
                        className="px-3 py-2 border-b border-gray-100 active:bg-gray-50"
                        onPress={() => {
                          setSelectedDepartment(dept);
                          setShowDepartmentFilter(false);
                        }}
                      >
                        <Text className={`$ {
                          dept === selectedDepartment ? 'text-red-600' : 'text-gray-600'
                        } text-sm font-medium`}>
                          {dept}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View> */}

              {/* Add Button */}
              <TouchableOpacity 
                className="bg-red-600 h-10 px-3 py-2 rounded-lg flex-row items-center ml-2"
                onPress={() => router.push('/(any)/employee/AddEmployee')}
              >
                <Plus size={18} color="white" strokeWidth={2} />
                <Text className="text-white ml-1 font-medium text-sm">Add</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Search Bar Row */}
          <View className="flex-row items-center mb-4">
            <View className="flex-1 relative">
              <TextInput
                mode="outlined"
                placeholder="Search employees..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholderTextColor="#9CA3AF"
                left={<TextInput.Icon icon={() => <Search size={20} color="#6B7280" />} />}
                outlineColor="#e5e7eb"
                activeOutlineColor="#DC2626"
                style={{ backgroundColor: 'white', height: 42, marginBottom: 10, borderRadius: 10}}
              />
            </View>
          </View>

          {/* Employee List */}
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-500 text-sm">Loading employees...</Text>
            </View>
          ) : filteredEmployees.length === 0 ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray-500 text-sm">No employees found.</Text>
            </View>
          ) : (
            <FlatList
              data={filteredEmployees}
              renderItem={renderEmployeeItem}
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={{ paddingBottom: 16 }}
                  showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>
    </PermissionGuard>
  )
}

export default Employee
