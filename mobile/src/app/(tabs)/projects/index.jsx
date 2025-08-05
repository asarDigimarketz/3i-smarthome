import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronDown,
  Plus,
  RefreshCw,
  CheckCircle
} from 'lucide-react-native';

import { useAuth } from '../../../utils/AuthContext';
import { hasPagePermission, getPageActions } from '../../../utils/permissions';
import PermissionGuard from '../../../components/Common/PermissionGuard';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Button
} from 'react-native';
import FilterTabs from '../../../components/Common/FilterTabs';
import ProjectCard from '../../../components/Common/ProjectCard';
import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../../../../config';
import apiClient from '../../../utils/apiClient';

const Projects = () => {
  const { selectedService } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const actions = getPageActions(user, '/dashboard/projects');
  // State management
  const [selectedFilter, setSelectedFilter] = useState(selectedService || 'All');
    const [selectedStatuses, setSelectedStatuses] = useState(new Set(['New', 'InProgress', 'Done'])); // Default: all except "Completed" and "Cancelled"
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);



  // API Configuration
  const API_BASE_URL = API_CONFIG.API_URL;
  const API_KEY = API_CONFIG.API_KEY;

  const statusOptions = [
    'All Status',
    'New',
    'InProgress',
    'Done',
    'completed',
    'Cancelled'
  ];

  const getStatusColor = (status) => {
    const colors = {
      'All Status': 'text-gray-600',
      'New': 'text-blue-600',
      'InProgress': 'text-yellow-600',
      'Done': 'text-green-600',
      'completed': 'text-purple-600',
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
      'completed': 'completed',
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
      'completed': 'completed',
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
        service: apiProject.service || apiProject.services || 'Unknown',
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
      console.error('Error transforming project data:', error);
      console.error('Project data that caused error:', apiProject);
      return null;
    }
  };

  // Fetch projects from API
  const fetchProjects = async (refresh = false, loadMore = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        setCurrentPage(1);
      } else if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setCurrentPage(1);
      }
      setError(null);

      // Prepare API parameters
      const params = new URLSearchParams();
      
      // Add service filter if not 'All'
      if (selectedFilter && selectedFilter !== 'All') {
        params.append('service', selectedFilter); // Correct parameter name
      }
      
      // Add status filter if not 'Status'
      if (selectedStatuses.size > 0) {
        // Check if "All Status" is selected
        if (selectedStatuses.has('All Status')) {
          // Don't add any status filter - show all
        } else {
          const serverStatuses = Array.from(selectedStatuses).map(mapMobileToServerStatus);
          params.append('status', serverStatuses.join(','));
        }
      }

      // Add pagination parameters for all filters
      const nextPage = loadMore ? currentPage + 1 : 1;
      params.append('page', nextPage.toString());
      params.append('limit', '6'); // Default limit of 6 per page
      
      const url = `/api/projects${params.toString() ? `?${params.toString()}` : ''}`;
      
      

      const response = await apiClient.get(url);


      const data = response.data;
     

      if (data && data.success) {
        // Handle different possible response structures
        const projectsArray = data.data || data.projects || [];
        
       
        
        if (Array.isArray(projectsArray)) {
          const transformedProjects = projectsArray
            .map(transformProjectData)
            .filter(project => project !== null); // Filter out any null transformations
          
          if (loadMore) {
            // Append new projects to existing ones (for all filters with pagination)
            setProjects(prev => [...prev, ...transformedProjects]);
            setCurrentPage(nextPage);
          } else {
            // Replace projects with new ones
            setProjects(transformedProjects);
            setCurrentPage(1);
          }
          
          // Check if there are more pages (for all filters)
          const pagination = data.pagination;
          if (pagination) {
            // For the first page, check if we got a full page of results
            const isFirstPage = pagination.current === 1;
            const gotFullPage = transformedProjects.length === 6;
            
            // If we got a full page on the first page, there might be more
            const hasMoreFromPageSize = isFirstPage && gotFullPage;
            
            // Use pagination.hasNext if available, otherwise use page size logic
            const shouldHaveMore = pagination.hasNext !== undefined ? pagination.hasNext : hasMoreFromPageSize;
            
            setHasMore(shouldHaveMore);
          
         
            
            // Additional check using total count from pagination
            const totalProjects = pagination.count;
            const currentTotal = loadMore ? projects.length + transformedProjects.length : transformedProjects.length;
            const shouldHaveMoreFromTotal = currentTotal < totalProjects;
           
            
            // Use the more accurate determination - prioritize total count over pagination.hasNext
            if (totalProjects > 0) {
              const finalHasMore = shouldHaveMoreFromTotal;
              setHasMore(finalHasMore);
            } else {
              // If no total count, use the page size logic
              setHasMore(shouldHaveMore);
            }
            
            // Fallback: If we got exactly 6 projects on first page, always show Load More
            if (isFirstPage && gotFullPage && !loadMore) {
           
              setHasMore(true);
            }
          } else {
            // If no pagination info, check if we got a full page of results
            const hasMoreResults = transformedProjects.length === 6;
            setHasMore(hasMoreResults);
           
          }
        } else {
          console.warn('⚠️ Projects data is not an array:', projectsArray);
          if (!loadMore) {
            setProjects([]);
          }
        }
      } else {
        console.error('API returned success: false');
        console.error('API response:', data);
        setError(data.message || 'Failed to fetch projects');
        if (!refresh && !loadMore) {
          Alert.alert('Error', data.message || 'Failed to fetch projects');
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      
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
      
      if (!refresh && !loadMore) {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProjects();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (!loading) {
      // Reset pagination state immediately
      setCurrentPage(1);
      setHasMore(true);
      setProjects([]); // Clear existing projects before fetching new ones
      // Fetch projects after state reset
      setTimeout(() => {
        fetchProjects();
      }, 0);
    }
  }, [selectedFilter, selectedStatuses]);

  // Update useEffect to set the filter when selectedService changes
  useEffect(() => {
    if (selectedService) {
      setSelectedFilter(selectedService);
    }
  }, [selectedService]);



  // Load more projects function
  const loadMoreProjects = () => {
    
    if (!loadingMore && hasMore) {
      
      fetchProjects(false, true);
    } else {
      
    }
  };

  // Enhanced project filtering - Now handled by API
  const getFilteredProjects = () => {
    // Return all projects since filtering is now done by API
    return projects;
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
            disabled={!actions.add}
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
            disabled={!actions.add}
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

  if (!hasPagePermission(user, '/dashboard/projects', 'view')) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#c92125', fontSize: 18, textAlign: 'center' }}>
          You do not have permission to view this page.
        </Text>
      </View>
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
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
          
         
          
          if (isCloseToBottom && !loadingMore && hasMore) {
            
            loadMoreProjects();
          }
        }}
        scrollEventThrottle={100}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 py-4 bg-white">
          <Text className="text-xl font-bold text-gray-800">Projects</Text>
          <View className="flex-row items-center space-x-4">
            
            {/* Status Filter Button */}
            <View className="relative mr-1">
              <TouchableOpacity
                onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                className="flex-row items-center justify-between bg-gray-100 rounded-lg h-10 px-3 min-w-32"
              >
                <Text className={`${getStatusColor(selectedStatuses.size === 0 ? 'All Status' : Array.from(selectedStatuses)[0])} text-sm font-medium`}>
                  {selectedStatuses.size === 0 ? 'All Status' : 
                   selectedStatuses.has('All Status') ? 'All Status' :
                   selectedStatuses.size === 1 ? Array.from(selectedStatuses)[0] :
                   `${selectedStatuses.size} Statuses`}
                </Text>
                <ChevronDown size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Add New Button */}
            
            <TouchableOpacity 
              className="bg-red-600 h-10 px-3 rounded-lg flex-row items-center ml-2"
              onPress={() => router.push('/(tabs)/projects/AddProjects')}
              disabled={!actions.add}
            >
              <Plus size={18} color="white" strokeWidth={2} />
              <Text className="text-white ml-1 font-medium text-sm">Add New</Text>
            </TouchableOpacity>
          
          </View>   
        </View>

        {/* Status Dropdown */}
        {showStatusDropdown && (
          <View className="absolute top-14 right-[130px] bg-white rounded-lg shadow-xl z-10 w-32">
            {statusOptions.map((status) => {
              const isSelected = selectedStatuses.has(status);
              return (
                <TouchableOpacity
                  key={status}
                                          className={`px-3 py-2 active:bg-gray-50 flex-row items-center justify-between ${
                          status === statusOptions[statusOptions.length - 1] ? '' : 'border-b border-gray-100'
                        }`}
                  onPress={() => {
                    const newSelectedStatuses = new Set(selectedStatuses);
                    if (status === 'All Status') {
                      // When "All Status" is selected, select all statuses
                      setSelectedStatuses(new Set(['All Status', 'New', 'InProgress', 'Done', 'completed', 'Cancelled']));
                    } else if (newSelectedStatuses.has(status)) {
                      newSelectedStatuses.delete(status);
                      // If "All Status" is selected and we're deselecting a specific status, remove "All Status"
                      if (newSelectedStatuses.has('All Status')) {
                        newSelectedStatuses.delete('All Status');
                      }
                      setSelectedStatuses(newSelectedStatuses);
                    } else {
                      newSelectedStatuses.add(status);
                      // If we're selecting a specific status, remove "All Status"
                      if (newSelectedStatuses.has('All Status')) {
                        newSelectedStatuses.delete('All Status');
                      }
                      setSelectedStatuses(newSelectedStatuses);
                    }
                    setShowStatusDropdown(false);
                  }}
                >
                  <Text className="text-sm text-gray-600 font-medium">
                    {status}
                  </Text>
                  {isSelected && (
                    <CheckCircle size={16} color="#10B981" />
                  )}
                </TouchableOpacity>
              );
            })}
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
            <>
              {filteredProjects.map((project) => (
                <View key={project.id} style={{ marginBottom: 16 }}>
                  <ProjectCard
                    project={project}
                    customer={{
                      name: project.customerName,
                      address: project.address
                    }}
                  />
                </View>
              ))}
              
              {/* Load More Indicator */}
              {loadingMore && (
                <View className="flex-row justify-center items-center py-4">
                  <ActivityIndicator size="small" color="#DC2626" />
                  <Text className="text-gray-500 ml-2">Loading more projects...</Text>
                </View>
              )}
              
              {/* Load More Button */}
              {!loadingMore && hasMore && (
                <TouchableOpacity 
                  className="bg-red-600 rounded-lg py-3 px-4 flex-row justify-center items-center mt-4"
                  onPress={loadMoreProjects}
                >
                  <Text className="text-white font-medium">Load More Projects</Text>
                </TouchableOpacity>
              )}
              
              {/* No More Projects */}
              {!hasMore && filteredProjects.length > 0 && (
                <View className="flex-row justify-center items-center py-4">
                  <Text className="text-gray-500 text-sm">No more projects to load</Text>
                </View>
              )}
            </>
          ) : (
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-gray-500 text-lg">No projects found</Text>
              <Text className="text-gray-400 text-sm mt-2">
                {selectedFilter !== 'All' || selectedStatuses.size > 0 
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

const ProjectsWithPermissions = () => {
  return (
    <PermissionGuard page="Projects" action="view">
      <Projects />
    </PermissionGuard>
  );
};

export default ProjectsWithPermissions;