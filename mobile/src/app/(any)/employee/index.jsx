import { useEffect, useState } from "react"
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView,
  Image 
} from "react-native"
import { Phone, Mail, Search, ChevronDown, Plus } from "lucide-react-native"
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { API_CONFIG } from '../../../../config'
import EmployeeHeader from '../../../components/Header/EmployeeHeader'
import PermissionGuard from '../../../components/Common/PermissionGuard'

const Employee = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)

  const statusOptions = ["All", "Active", "Inactive"]

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'text-green-600',
      'Inactive': 'text-red-600',
      'All': 'text-gray-600'
    };
    return colors[status] || 'text-gray-600';
  };

  // Add this helper function at the component level
  const getStatusStyle = (status) => {
    const styles = {
      'Active': {
        bg: 'bg-green-100',
        text: 'text-green-700'
      },
      'Inactive': {
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
        className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
        onPress={() => router.push(`/(any)/employee/${item._id}`)}
    >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center mr-3">
              <Text className="text-gray-600 font-semibold text-lg">
                {item.firstName?.charAt(0)?.toUpperCase() || 'E'}
            </Text>
          </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-base">
                {item.firstName} {item.lastName}
          </Text>
              <Text className="text-gray-500 text-sm mt-1">{item.email}</Text>
              <View className="flex-row items-center mt-1">
                <Phone size={14} color="#6B7280" />
                <Text className="text-gray-500 text-sm ml-1">{item.phone || 'No phone'}</Text>
        </View>
      </View>
        </View>
          <View className={`px-3 py-1 rounded-full ${statusStyle.bg}`}>
            <Text className={`text-sm font-medium ${statusStyle.text}`}>
              {item.status || 'Unknown'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
  }

  return (
    <PermissionGuard page="Employees" action="view">
      <SafeAreaView className="flex-1 bg-gray-50">
        <EmployeeHeader onMenuPress={handleMenuPress} />
        
        <View className="flex-1 px-4 pt-4">
          {/* Search and Filter Section */}
          <View className="flex-row items-center mb-4">
            <View className="flex-1 relative">
              <Search size={20} color="#6B7280" className="absolute left-3 top-3 z-10" />
              <TextInput
                className="bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-900"
                placeholder="Search employees..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            
            <TouchableOpacity
              className="ml-3 bg-white border border-gray-200 rounded-lg px-4 py-3 flex-row items-center"
              onPress={() => setIsStatusModalVisible(!isStatusModalVisible)}
            >
              <Text className="text-gray-900 mr-2">{statusFilter}</Text>
              <ChevronDown size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Status Filter Dropdown */}
      {isStatusModalVisible && (
            <View className="absolute top-16 right-4 bg-white rounded-lg shadow-xl z-10 w-32">
          {statusOptions.map((status) => (
            <TouchableOpacity
              key={status}
              className="px-3 py-2 border-b border-gray-100 active:bg-gray-50"
              onPress={() => {
                setStatusFilter(status);
                setIsStatusModalVisible(false);
              }}
            >
                  <Text className={`${
                    status === statusFilter
                      ? status === 'Active' ? 'text-green-600'
                      : status === 'Inactive' ? 'text-red-600'
                      : 'text-gray-600'
                    : 'text-gray-600'
                  } text-sm font-medium`}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

          {/* Add New Button */}
          <TouchableOpacity 
            className="bg-red-600 h-12 px-4 rounded-lg flex-row items-center justify-center mb-4"
            onPress={() => router.push('/(any)/employee/AddEmployee')}
          >
            <Plus size={20} color="white" strokeWidth={2} />
            <Text className="text-white ml-2 font-medium">Add Employee</Text>
          </TouchableOpacity>

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
