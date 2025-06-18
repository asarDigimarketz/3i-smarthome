import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronDown,
  Plus,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FilterTabs from '../../../components/Common/FilterTabs';
import ProjectCard from '../../../components/Common/ProjectCard';
import { projectData } from '../../../data/mockData';

const Projects = () => {
  const { selectedService } = useLocalSearchParams();
  const router = useRouter();
  // Initialize selectedFilter with the passed service if available
  const [selectedFilter, setSelectedFilter] = useState(selectedService || 'All');
  const [selectedStatus, setSelectedStatus] = useState('Status');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const statusOptions = [
    'Status',
    'New',
    'InProgress',
    'Done',
    'Complete',
    'Cancelled'
  ];

  const getStatusColor = (status) => {
    const colors = {
      'New': 'text-blue-600',
      'InProgress': 'text-yellow-600',
      'Done': 'text-green-600',
      'Complete': 'text-purple-600',
      'Cancelled': 'text-red-600',
      'Status': 'text-gray-600'
    };
    return colors[status] || 'text-gray-600';
  };

  const getFilteredProjects = () => {
    return projectData.filter(project => {
      // Filter by service type
      const serviceFilter = selectedFilter === 'All' || project.service === selectedFilter;
      
      // Filter by status
      const statusFilter = selectedStatus === 'Status' || project.status === selectedStatus;
      
      return serviceFilter && statusFilter;
    });
  };

  // Update useEffect to set the filter when selectedService changes
  useEffect(() => {
    if (selectedService) {
      setSelectedFilter(selectedService);
    }
  }, [selectedService]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 py-4 bg-white">
          <Text className="text-xl font-bold text-gray-800">Projects</Text>
          <View className="flex-row items-center space-x-4">
            {/* Status Filter Button */}
            <View className="relative">
              <TouchableOpacity
                onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                className="flex-row items-center bg-gray-100 rounded-lg h-10 px-3 min-w-[60]"
              >
                <Text className={`${
                  selectedStatus === 'New' ? 'text-blue-600' :
                  selectedStatus === 'InProgress' ? 'text-yellow-600' :
                  selectedStatus === 'Done' ? 'text-green-600' :
                  selectedStatus === 'Complete' ? 'text-purple-600' :
                  selectedStatus === 'Cancelled' ? 'text-red-600' :
                  'text-gray-500'
                } text-sm font-medium`}>
                  {selectedStatus}
                </Text>
                <ChevronDown size={16} color="#6B7280" className="ml-1" />
              </TouchableOpacity>
            </View>

            {/* Add New Button */}
            <TouchableOpacity 
              className="bg-red-600 h-10 px-3 rounded-lg flex-row items-center ml-2"
              onPress={() => router.push('/(tabs)/projects/AddProjects')}
            >
              <Plus size={18} color="white" strokeWidth={2} />
              <Text className="text-white ml-1 font-medium text-sm">Add New</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Dropdown */}
        {showStatusDropdown && (
          <View className="absolute top-14 right-24 bg-white rounded-lg shadow-xl z-10 w-32">
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status}
                className="px-3 py-2 border-b border-gray-100 active:bg-gray-50"
                onPress={() => {
                  setSelectedStatus(status);
                  setShowStatusDropdown(false);
                }}
              >
                <Text className={`text-sm ${
                  status === selectedStatus ? getStatusColor(status) + ' font-medium' : 'text-gray-600'
                }`}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Filter Tabs */}
        <FilterTabs 
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />

        {/* Project Cards */}
        <View className="p-5">
          {getFilteredProjects().map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              customer={{
                name: project.customerName,
                address: project.address
              }}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Projects;