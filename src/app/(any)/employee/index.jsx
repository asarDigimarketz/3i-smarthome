import { useState } from "react"
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
import { employees } from "../../../data/mockData"

const Employee = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false)

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

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = 
      statusFilter === "All" || 
      employee.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const renderEmployeeItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/employee/EmployeeView?employee=${JSON.stringify(item)}`)}
      className="bg-gray-50 rounded-lg p-4 mb-4"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center mb-4">
        {item.image ? (
          <Image 
            source={item.image}
            className="w-16 h-16 rounded-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center">
            <Text className="text-2xl text-gray-400">
              {item.name.charAt(0)}
            </Text>
          </View>
        )}
        
        <View className="flex-1 px-4">
          <Text className="text-xl font-semibold text-gray-900">{item.name}</Text>
          <Text className="text-sm text-gray-500">{item.role}</Text>
        </View>

        <View className={`${getStatusStyle(item.status).bg} px-3 py-1 rounded-full`}>
          <Text className={`text-sm font-medium ${getStatusStyle(item.status).text}`}>
            {item.status}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between mb-4 py-3">
        <View className="flex-1">
          <Text className="text-sm text-gray-500">Employee ID</Text>
          <Text className="text-base font-semibold text-gray-900">{item.id}</Text>
        </View>

        <View className="flex-1 items-end">
          <Text className="text-sm text-gray-500">Department</Text>
          <Text className="text-base font-semibold text-gray-900">
            {item.department.toLowerCase()}
          </Text>
        </View>
      </View>
      
      <View className="flex-row justify-between">
        
        <View className="flex-row items-center gap-2">
          <Phone size={16} color="#DC2626" />
          <Text className="text-sm text-gray-900">{item.phone}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Mail size={16} color="#DC2626" />
          <Text className="text-sm text-gray-900">{item.email}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
  return (
    <View className="flex-1 bg-white">
      <View className="flex-row justify-between items-center px-5 py-4 bg-white">
        <Text className="text-xl font-bold text-gray-800">Employee</Text>
        <View className="flex-row items-center space-x-4">
          {/* Status Filter Button */}
          <View className="relative">
            <TouchableOpacity
              onPress={() => setIsStatusModalVisible(!isStatusModalVisible)}
              className="flex-row items-center bg-gray-100 rounded-lg h-10 px-3 min-w-[60]"
            >
              <Text className={`${getStatusColor(statusFilter)} text-sm font-medium`}>
                {statusFilter}
              </Text>
              <ChevronDown size={16} color="#6B7280" className="ml-1" />
            </TouchableOpacity>
          </View>

          {/* Add New Button */}
          <TouchableOpacity 
            className="bg-red-600 h-10 px-3 rounded-lg flex-row items-center ml-2"
            onPress={() => router.push('/employee/AddEmployee')}
          >
            <Plus size={18} color="white" strokeWidth={2} />
            <Text className="text-white ml-1 font-medium text-sm">Add New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Dropdown */}
      {isStatusModalVisible && (
        <View className="absolute top-14 right-24 bg-white rounded-lg shadow-xl z-10 w-32">
          {statusOptions.map((status) => (
            <TouchableOpacity
              key={status}
              className="px-3 py-2 border-b border-gray-100 active:bg-gray-50"
              onPress={() => {
                setStatusFilter(status);
                setIsStatusModalVisible(false);
              }}
            >
              <Text className={`text-sm ${
                status === statusFilter ? getStatusColor(status) + ' font-medium' : 'text-gray-600'
              }`}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Search Bar */}
      <View className="px-4 mb-4">
        <View className="flex-row items-center bg-red-50 rounded-lg px-3">
          <Search size={20} color="#9CA3AF" className="mr-2" />
          <TextInput
            className="flex-1 py-3 text-base text-gray-900"
            placeholder="Search Employees"
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Employee List */}
      <FlatList
        data={filteredEmployees}
        renderItem={renderEmployeeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
      />
    </View>
  )
}

export default Employee
