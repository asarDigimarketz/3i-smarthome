import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronDown,
  Plus,
  RefreshCw
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import FilterTabs from '../../../components/Common/FilterTabs';
import ProjectCard from '../../../components/Common/ProjectCard';

const Projects = () => {
  const { selectedService } = useLocalSearchParams();
  const router = useRouter();
  
  // State management
  const [selectedFilter, setSelectedFilter] = useState(selectedService || 'All');
  const [selectedStatus, setSelectedStatus] = useState('Status');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // API Configuration
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
  const API_KEY = process.env.EXPO_PUBLIC_API_KEY;



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

  // Helper function to map mobile status to server status
  const mapMobileToServerStatus = (mobileStatus) => {
    const statusMap = {
      'New': 'new',
      'InProgress': 'in-progress',
      'Complete': 'completed',
      'Done': 'done',
      'Cancelled': 'cancelled'
    };
    return statusMap[mobileStatus] || 'new';
  };

  // Helper function to map server status to mobile status
  const mapServerToMobileStatus = (serverStatus) => {
    const statusMap = {
      'new': 'New',
      'in-progress': 'InProgress',
      'completed': 'Complete',
      'done': 'Done',
      'cancelled': 'Cancelled'
    };
    return statusMap[serverStatus] || 'New';
  };

  // Helper function to transform API data to mobile format
  const transformProjectData = (apiProject) => {
    if (!apiProject) {
      console.warn('⚠️ Received null/undefined project data');
      return null;
    }

    try {
      return {
        id: apiProject._id || apiProject.id || Math.random().toString(),
        customerName: apiProject.customerName || 'Unknown Customer',
        address: typeof apiProject.address === 'object'
          ? `${apiProject.address.addressLine || ''}, ${apiProject.address.city || ''}, ${apiProject.address.district || ''}, ${apiProject.address.state || ''}, ${apiProject.address.country || ''} - ${apiProject.address.pincode || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '').trim()
          : apiProject.address || 'No address provided',
        service: apiProject.services || 'Unknown',
        amount: `₹${apiProject.projectAmount?.toLocaleString('en-IN') || '0'}`,
        date: apiProject.projectDate 
          ? new Date(apiProject.projectDate).toLocaleDateString('en-IN') 
          : (apiProject.createdAt ? new Date(apiProject.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')),
        status: mapServerToMobileStatus(apiProject.projectStatus || 'new'),
        progress: `${apiProject.completedTasks || 0}/${apiProject.totalTasks || 0}`,
        description: apiProject.projectDescription || '',
        size: apiProject.size || '',
        contactNumber: apiProject.contactNumber || '',
        email: apiProject.email || '',
        comment: apiProject.comment || '',
        attachment: apiProject.attachment || null,
        assignedEmployees: apiProject.assignedEmployees || [],
        createdAt: apiProject.createdAt || new Date().toISOString(),
        updatedAt: apiProject.updatedAt || new Date().toISOString(),
      };
    } catch (error) {
      console.error('🚨 Error transforming project data:', error);
      console.error('🚨 Project data that caused error:', apiProject);
      return null;
    }
  };

  // Fetch projects from API
  const fetchProjects = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Prepare API parameters
      const params = new URLSearchParams();
      
      // Add service filter if not 'All'
      if (selectedFilter && selectedFilter !== 'All') {
        params.append('services', selectedFilter);
      }
      
      // Add status filter if not 'Status'
      if (selectedStatus && selectedStatus !== 'Status') {
        params.append('projectStatus', mapMobileToServerStatus(selectedStatus));
      }

      const url = `${API_BASE_URL}/api/projects${params.toString() ? `?${params.toString()}` : ''}`;
      
      console.log('📤 Fetching projects from:', url);
      console.log('🔑 API Key:', API_KEY ? 'Set' : 'Not Set');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
      });

      console.log('📥 Response Status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📥 Response Data:', data);
      console.log('📥 Response Type:', typeof data);
      console.log('📥 Response Keys:', Object.keys(data || {}));

      if (data && data.success) {
        // Handle different possible response structures
        const projectsArray = data.projects || data.data || [];
        console.log('📊 Raw projects data:', projectsArray);
        
        if (Array.isArray(projectsArray)) {
          const transformedProjects = projectsArray
            .map(transformProjectData)
            .filter(project => project !== null); // Filter out any null transformations
          console.log('✅ Projects fetched successfully:', transformedProjects.length, 'items');
          setProjects(transformedProjects);
        } else {
          console.warn('⚠️ Projects data is not an array:', projectsArray);
          setProjects([]);
        }
      } else {
        console.error('❌ API returned success: false');
        setError(data.message || 'Failed to fetch projects');
        if (!refresh) {
          Alert.alert('Error', data.message || 'Failed to fetch projects');
        }
      }
    } catch (error) {
      console.error('🚨 Error fetching projects:', error);
      
      let errorMessage = 'An unexpected error occurred';
      if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Unauthorized. Please check your API configuration.';
      } else if (error.message.includes('404')) {
        errorMessage = 'API endpoint not found. Please check server configuration.';
      } else {
        errorMessage = error.message || 'Failed to fetch projects';
      }
      
      setError(errorMessage);
      
      if (!refresh) {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('🏁 Fetch operation completed');
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProjects();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (!loading) {
      fetchProjects();
    }
  }, [selectedFilter, selectedStatus]);

  // Update useEffect to set the filter when selectedService changes
  useEffect(() => {
    if (selectedService) {
      setSelectedFilter(selectedService);
    }
  }, [selectedService]);

  const getFilteredProjects = () => {
    return projects.filter(project => {
      // Filter by service type
      const serviceFilter = selectedFilter === 'All' || project.service === selectedFilter;
      
      // Filter by status
      const statusFilter = selectedStatus === 'Status' || project.status === selectedStatus;
      
      return serviceFilter && statusFilter;
    });
  };

  const onRefresh = () => {
    fetchProjects(true);
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row justify-between items-center px-5 py-4 bg-white">
          <Text className="text-xl font-bold text-gray-800">Projects</Text>
          <TouchableOpacity 
            className="bg-red-600 h-10 px-3 rounded-lg flex-row items-center ml-2"
            onPress={() => router.push('/(tabs)/projects/AddProjects')}
          >
            <Plus size={18} color="white" strokeWidth={2} />
            <Text className="text-white ml-1 font-medium text-sm">Add New</Text>
          </TouchableOpacity>
        </View>
        
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#DC2626" />
          <Text className="text-gray-500 mt-4">Loading projects...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !refreshing && projects.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row justify-between items-center px-5 py-4 bg-white">
          <Text className="text-xl font-bold text-gray-800">Projects</Text>
          <TouchableOpacity 
            className="bg-red-600 h-10 px-3 rounded-lg flex-row items-center ml-2"
            onPress={() => router.push('/(tabs)/projects/AddProjects')}
          >
            <Plus size={18} color="white" strokeWidth={2} />
            <Text className="text-white ml-1 font-medium text-sm">Add New</Text>
          </TouchableOpacity>
        </View>
        
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-red-500 text-lg font-medium mb-2">Error</Text>
          <Text className="text-gray-600 text-center mb-4">{error}</Text>
          <TouchableOpacity 
            className="bg-red-600 px-6 py-3 rounded-lg flex-row items-center"
            onPress={() => fetchProjects()}
          >
            <RefreshCw size={16} color="white" />
            <Text className="text-white ml-2 font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const filteredProjects = getFilteredProjects();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
                <Text className={`${getStatusColor(selectedStatus)} text-sm font-medium`}>
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
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                customer={{
                  name: project.customerName,
                  address: project.address
                }}
                onRefresh={onRefresh}
              />
            ))
          ) : (
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-gray-500 text-lg">No projects found</Text>
              <Text className="text-gray-400 text-sm mt-2">
                {selectedFilter !== 'All' || selectedStatus !== 'Status' 
                  ? 'Try adjusting your filters' 
                  : 'Create your first project'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Projects;