import * as ImagePicker from 'expo-image-picker';
import { ChevronDown, ChevronUp, Users, Edit, FileText, FileImage, Eye } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, ActivityIndicator, Alert, RefreshControl, Button, Linking } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import FilterTabs from '../../../components/Common/FilterTabs';
import AddTaskForm from '../../../components/Tasks/AddTaskForm';
import EditTaskForm from '../../../components/Tasks/EditTaskForm';
import TaskCard from '../../../components/Tasks/TaskCard';
import { API_CONFIG } from '../../../../config';
import { useAuth } from '../../../utils/AuthContext';
import { hasPagePermission, getPageActions } from '../../../utils/permissions';
import PermissionGuard from '../../../components/Common/PermissionGuard';
import apiClient from '../../../utils/apiClient';

function Task() {
  const { user } = useAuth();
  const { projectId: urlProjectId, refresh } = useLocalSearchParams();
  const actions = getPageActions(user, '/dashboard/tasks');
  const [state, setState] = useState(false); // Example, add all your hooks here
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showProposelDropDown, setShowProposelDropDown] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    assignTo: '',
    startDate: new Date(),
    endDate: new Date(),
    status: '',
    beforeImages: [], // Change from beforeImage to beforeImages array
    afterImages: [],  // Change from afterImage to afterImages array
    attachment: null,
    comment: '', // Add comment field for API
    projectId: '' // Add projectId for API
  });
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDateField, setActiveDateField] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // API Integration States
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [addingTask, setAddingTask] = useState(false);
  const [updatingTask, setUpdatingTask] = useState(false);

  // Enhanced states from desktop version
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [employeesList, setEmployeesList] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // Add direct project fetching like web version
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectError, setProjectError] = useState(null);

  // Define all available services
  const allServices = ['All', 'Home Cinema', 'Home Automation', 'Security System', 'Outdoor Audio Solution'];

  const statusOptions = [
    { value: "new", color: "text-blue-600", bg: "bg-blue-50", label: "New" },
    { value: "inprogress", color: "text-yellow-600", bg: "bg-yellow-50", label: "In Progress" },
    { value: "completed", color: "text-green-600", bg: "bg-green-50", label: "Done" }
  ];

  // Web-style service filter change handler
  const handleServiceChange = (service) => {
    console.log('🔄 Filter changed from', selectedFilter, 'to', service);
    console.log('📊 Current selectedProject:', selectedProject?.service, 'Project ID:', selectedProject?.id);
    
    setSelectedFilter(service);
    // Close task form when service filter changes (web behavior)
    setShowAddTaskForm(false);
    setShowEditForm(false);
    
    // Clear selected project when filter changes (web behavior)
    // Only clear if switching to a specific service that doesn't match current project
    if (selectedProject && service !== 'All' && selectedProject.service !== service) {
      console.log('🗑️ Clearing selected project due to filter change');
      console.log('❌ Project service:', selectedProject.service, 'New filter:', service);
      setSelectedProject(null);
      setSelectedStatus('');
      setNewTask(prev => ({ ...prev, projectId: '' }));
      setTasks([]); // Clear tasks when project is cleared
    } else {
      console.log('✅ Keeping selected project - no need to clear');
      console.log('✅ Project service:', selectedProject?.service, 'New filter:', service);
    }
    
    // Refetch projects with new filter (web behavior)
    console.log('📡 Refetching projects with filter:', service);
    fetchProjects(service);
  };

  // Web-style project validation function
  const shouldAllowTaskActions = () => {
    if (!selectedProject) return false;
    if (selectedFilter === "All") return true;
    return selectedProject.service === selectedFilter;
  };

  // Web-style task filtering logic
  const shouldShowTasks = () => {
    const result = !selectedProject ? false : 
                   selectedFilter === "All" ? true : 
                   selectedProject.service === selectedFilter;
    console.log('👁️ shouldShowTasks:', result, 'Project:', selectedProject?.service, 'Filter:', selectedFilter);
    return result;
  };

  // Web-style filtered tasks (client-side filtering like web)
  const filteredTasks = shouldShowTasks() ? tasks : [];

  // Web-style add task handler
  const handleAddTask = () => {
    if (!selectedProject) {
      Alert.alert(
        "Select a Project",
        "Please select a project first to add a task"
      );
      return;
    }

    if (!shouldAllowTaskActions()) {
      Alert.alert(
        "Project Service Mismatch",
        `Please select a ${selectedFilter} project to add ${selectedFilter} tasks`
      );
      return;
    }

    // Check permissions (mobile equivalent of web permission check)
    if (!hasPagePermission(user, '/dashboard/tasks', 'create')) {
      Alert.alert(
        "Access Denied",
        "You don't have permission to add tasks"
      );
      return;
    }
    setShowAddTaskForm(!showAddTaskForm);
  };

  // Web-style edit task handler
  const handleEditTask = (task) => {
    setEditingTask({
      ...task,
      startDate: new Date(task.startDate.split('/').reverse().join('-')),
      endDate: task.endDate ? new Date(task.endDate.split('/').reverse().join('-')) : new Date(),
      beforeImages: [],
      afterImages: [],
      status: task.statusValue || task.status.toLowerCase()
    });
    setShowEditForm(true);
  };

  // Web-style refresh tasks function
  const refreshTasks = () => {
    if (selectedProject) {
      fetchTasks(selectedProject.id);
    }
  };

  // Fetch projects with server-side filtering like web version
  const fetchProjects = async (filter = "All") => {
    try {
      setLoadingProjects(true);
      
      // Build query parameters like web ProjectCards.jsx
      const buildQueryParams = () => {
        const params = [];
        if (filter && filter !== "All") {
          params.push(`service=${encodeURIComponent(filter)}`);
        }
        params.push(`limit=100`); // Get more projects for mobile
        return params.length ? `?${params.join("&")}` : `?limit=100`;
      };

      const query = buildQueryParams();
      const response = await apiClient.get(`/api/projects${query}`);

      const data = response.data;

      if (data.success && Array.isArray(data.data)) {
        // Transform projects to match component expectations
        const transformedProjects = data.data.map(project => ({
          id: project._id,
          name: `${project.customerName} - ${project.services}`,
          status: project.projectStatus,
          customerName: project.customerName,
          service: project.services,
          address: project.fullAddress || `${project.address?.addressLine || ''}, ${project.address?.city || ''}`,
          email: project.email,
          phone: project.contactNumber,
          amount: project.formattedProjectAmount || `₹${project.projectAmount?.toLocaleString('en-IN') || '0'}`,
          date: project.projectDate ? new Date(project.projectDate).toLocaleDateString('en-IN') : 'Not set',
          description: project.projectDescription || 'No description',
          size: project.size || 'Not specified',
          attachment: project.attachment?.originalName || null,
          projectData: project // Keep full project data for API calls
        }));

        setProjects(transformedProjects);
        console.log(`✅ Loaded ${data.data.length} projects for filter: ${filter}`);
      } else {
        console.error('Invalid projects API response:', data);
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      Alert.alert(
        'Network Error', 
        'Failed to fetch projects. Please check your internet connection.',
        [
          { text: 'Retry', onPress: () => fetchProjects(selectedFilter) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoadingProjects(false);
    }
  };

  // Fetch employees from API (from desktop version)
  const fetchEmployees = async () => {
    try {
      setLoadingEmployees(true);
      const response = await apiClient.get('/api/employeeManagement');

      const data = response.data;

      if (data.success && Array.isArray(data.employees)) {
        // Filter only active employees and transform for dropdown
        const activeEmployees = data.employees.filter(emp => emp.status === 'active');
        const transformedEmployees = activeEmployees.map(emp => ({
          id: emp._id,
          name: `${emp.firstName} ${emp.lastName}`,
          email: emp.email,
          firstName: emp.firstName,
          lastName: emp.lastName
        }));

        setEmployeesList(transformedEmployees);
      } else {
        console.error('Invalid employees API response:', data);
        setEmployeesList([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployeesList([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Direct project fetching like web version
  const fetchProjectDetails = async (projectId) => {
    if (!projectId) {
      setProjectLoading(false);
      return;
    }

    try {
      setProjectLoading(true);
      setProjectError(null);
      
      const response = await apiClient.get(`/api/projects/${projectId}`);

      if (response.data.success) {
        const projectData = response.data.data;
        
        // Transform the project data to match mobile format
        const transformedProject = {
          id: projectData._id,
          name: `${projectData.customerName} - ${projectData.services}`,
          status: projectData.projectStatus,
          customerName: projectData.customerName,
          service: projectData.services,
          address: projectData.fullAddress || `${projectData.address?.addressLine || ''}, ${projectData.address?.city || ''}`,
          email: projectData.email,
          phone: projectData.contactNumber,
          amount: projectData.formattedProjectAmount || `₹${projectData.projectAmount?.toLocaleString('en-IN') || '0'}`,
          date: projectData.projectDate ? new Date(projectData.projectDate).toLocaleDateString('en-IN') : 'Not set',
          description: projectData.projectDescription || 'No description',
          size: projectData.size || 'Not specified',
          attachment: projectData.attachment?.originalName || null,
          projectData: projectData // Keep full project data for API calls
        };
        
        setSelectedProject(transformedProject);
        setSelectedStatus(transformedProject.name);
        setSelectedFilter(transformedProject.service);
        setNewTask(prev => ({ 
          ...prev, 
          projectId: projectData._id || projectId
        }));
        
        // Fetch tasks for the project
        await fetchTasks(projectData._id || projectId);
        
        console.log('✅ Project details loaded successfully:', transformedProject.name);
      } else {
        console.error('❌ Failed to fetch project details:', response.data.message);
        setProjectError(response.data.message || 'Failed to fetch project details');
        Alert.alert('Error', response.data.message || 'Failed to fetch project details');
      }
    } catch (error) {
      console.error('❌ Error fetching project details:', error);
      
      let errorMessage = 'Failed to fetch project details';
      if (error.message.includes('Network request failed')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Project not found.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Authentication failed. Please restart the app.';
      }
      
      setProjectError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setProjectLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchProjects(selectedFilter);
    fetchEmployees();
  }, []);

  // Refetch projects when filter changes
  useEffect(() => {
    fetchProjects(selectedFilter);
  }, [selectedFilter]);

  // Update selectedProject when projects are refreshed
  useEffect(() => {
    if (selectedProject && projects.length > 0) {
      const updatedProject = projects.find(p => p.id === selectedProject.id);
      if (updatedProject && JSON.stringify(updatedProject) !== JSON.stringify(selectedProject)) {
        console.log('🔄 Updating selected project with refreshed data');
        setSelectedProject(updatedProject);
      }
    }
  }, [projects]);

  // Refetch tasks when selected project changes (web behavior)
  useEffect(() => {
    if (selectedProject) {
      const shouldShow = selectedFilter === "All" || selectedProject.service === selectedFilter;
      if (shouldShow) {
        console.log('🔄 Selected project changed, refetching tasks');
        const projectId = selectedProject.projectData?._id || selectedProject.id;
        fetchTasks(projectId);
      }
    }
  }, [selectedProject, selectedFilter]);

  // Clear selected project when filter changes (like web version)
  // This useEffect is now handled in handleServiceChange to prevent conflicts

  // Handle URL projectId parameter
  useEffect(() => {
    if (urlProjectId) {
      // Use direct project fetching like web version
      fetchProjectDetails(urlProjectId);
    }
  }, [urlProjectId]); // Remove projects.length and refresh dependencies

  // Refresh project data when user navigates back to this screen
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Task page focused - refreshing project data');
      
      // Always refresh projects to get latest data
      fetchProjects(selectedFilter);
      
      // If a project is selected, refresh project details and tasks
      if (selectedProject) {
        const projectId = selectedProject.projectData?._id || selectedProject.id;
        fetchProjectDetails(projectId);
      }
    }, [selectedFilter, selectedProject?.id]) // Add selectedProject.id to prevent unnecessary refreshes
  );

  // Fetch tasks for selected project
  const fetchTasks = useCallback(async (projectId, isRefresh = false) => {
    if (!projectId) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log('📤 Fetching tasks for project:', projectId);

      const response = await apiClient.get(`/api/tasks/project/${projectId}`);
      console.log('🔍 kansha:', response.data);
      const data = response.data;

      if (data.success && Array.isArray(data.data)) {
        // Transform API data to match component expectations
        const transformedTasks = data.data.map(task => ({
          id: task._id,
          title: task.title,
          assignee: task.assignedTo ? task.assignedTo.name || `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : 'Unassigned',
          assignedTo: task.assignedTo,
          startDate: new Date(task.startDate).toLocaleDateString('en-GB'),
          endDate: task.endDate ? new Date(task.endDate).toLocaleDateString('en-GB') : '',
          status: task.status === 'new' ? 'New' : task.status === 'inprogress' ? 'In Progress' : 'Done',
          statusValue: task.status, // Keep original status for API calls
          note: task.comment || '',
          comment: task.comment || '',
          // Keep full attachment objects for proper handling
          beforeAttachments: task.beforeAttachments || [],
          afterAttachments: task.afterAttachments || [],
          attachements: task.attachements || [], // General attachments
          // For backward compatibility, also provide image arrays
          beforeImages: task.beforeAttachments ? task.beforeAttachments.map(att => att.url) : [],
          afterImages: task.afterAttachments ? task.afterAttachments.map(att => att.url) : [],
          projectId: task.projectId,
          // Add project service information for filtering (like web version)
          projectService: null, // Will be set after tasks are loaded
          project: null, // Will be set after tasks are loaded
          createdAt: task.createdAt,
          updatedAt: task.updatedAt
        }));

        // Add project service information to tasks after loading
        const tasksWithProjectInfo = transformedTasks.map(task => ({
          ...task,
          projectService: selectedProject?.service || null,
          project: selectedProject ? {
            services: selectedProject.service
          } : null,
        }));
        
        setTasks(tasksWithProjectInfo);
        console.log('✅ Tasks loaded successfully:', tasksWithProjectInfo.length);
      } else {
        console.error('Invalid API response structure:', data);
        setTasks([]);
      }
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
      
      // Enhanced error handling with specific messages
      let errorMessage = 'Failed to fetch tasks.';
      if (error.message.includes('Network request failed')) {
        errorMessage = 'Network connection failed. Please check your internet connection.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error occurred. Please try again later.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Tasks not found for this project.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Authentication failed. Please restart the app.';
      }
      
      Alert.alert(
        'Network Error', 
        errorMessage,
        [
          { text: 'Retry', onPress: () => fetchTasks(projectId, isRefresh) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []); // Empty dependency array since it doesn't depend on any props or state

  // Create new task (enhanced with better FormData handling)
  const createTask = async () => {
    // This function is now called by AddTaskForm after successful submission
    // Just refresh the tasks list
    if (selectedProject) {
      const projectIdForTasks = selectedProject.projectData?._id || selectedProject.id;
      await fetchTasks(projectIdForTasks);
    }
  };

  // Update existing task (now just a callback to refresh tasks)
  const updateTask = async () => {
    // This function is now called by EditTaskForm after successful submission
    // Just refresh the tasks list
    if (selectedProject) {
      const projectIdForTasks = selectedProject.projectData?._id || selectedProject.id;
      await fetchTasks(projectIdForTasks);
    }
  };

  // Delete task (enhanced with better confirmation)
  const deleteTask = async (taskId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiClient.delete(`/api/tasks/${taskId}`);

              const data = response.data;

              if (data.success) {
                Alert.alert('Success', 'Task deleted successfully');
                // Refresh tasks
                fetchTasks(selectedProject.projectData._id);
              } else {
                Alert.alert('Error', data.message || 'Failed to delete task');
              }
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    if (selectedProject) {
      fetchTasks(selectedProject.projectData._id, true);
    }
  };

  // Toggle function for expandable cards
  const toggleCardExpand = (proposalId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [proposalId]: !prev[proposalId],
    }));
  };

  // Update the getBgColor function to match proposal styling
  const getBgColor = (service) => {
    switch (service) {
      case "Home Cinema":
        return "bg-services-cinema-light border-b-2 border-services-cinema-border";
      case "Home Automation":
        return "bg-services-automation-light border-b-2 border-services-automation-border";
      case "Security System":
        return "bg-services-security-light border-b-2 border-services-security-border";
      case "Outdoor Audio Solution":
        return "bg-services-audio-light border-b-2 border-services-audio-border";
      default:
        return "bg-services-default-light border-b-2 border-services-default-border";
    }
  };

  // Enhanced project details rendering
  const renderProjectDetails = (project) => {
    if (!project) return null;

    // Show loading state for project details
    if (projectLoading) {
      return (
        <View className='px-4 py-2 rounded-lg mb-4 bg-white shadow-sm'>
          <View className="mb-4 rounded-xl shadow-xl p-4 bg-gray-50">
            <View className="flex-row justify-between items-center mb-2 px-4">
              <View className="flex-row items-center gap-1">
                <View className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                <View className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
              </View>
            </View>
            <View className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <View key={i} className="flex-row justify-between">
                  <View className="flex-1 ml-4 pr-4">
                    <View className="w-16 h-3 bg-gray-200 rounded animate-pulse mb-1" />
                    <View className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                  </View>
                  <View className="flex-1 pl-2">
                    <View className="w-12 h-3 bg-gray-200 rounded animate-pulse mb-1" />
                    <View className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      );
    }

    // Show error state for project details
    if (projectError) {
      return (
        <View className='px-4 py-2 rounded-lg mb-4 bg-white shadow-sm'>
          <View className="mb-4 rounded-xl shadow-xl p-4 bg-red-50 border border-red-200">
            <View className="flex-row justify-between items-center mb-2 px-4">
              <Text className="text-red-800 text-base font-medium">Project Details</Text>
            </View>
            <View className="px-4">
              <Text className="text-red-600 text-sm mb-3">{projectError}</Text>
              <TouchableOpacity 
                className="bg-red-600 px-4 py-2 rounded-lg"
                onPress={() => {
                  setProjectError(null);
                  if (selectedProject) {
                    const projectId = selectedProject.projectData?._id || selectedProject.id;
                    fetchProjectDetails(projectId);
                  }
                }}
              >
                <Text className="text-white text-sm font-medium">Retry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View className='px-4 py-2 rounded-lg mb-4 bg-white shadow-sm'>
        {/* Main Card Content */}
        <View className={`mb-4 rounded-xl shadow-xl p-4 ${getBgColor(project.service)}`}>
          {/* Header with Details text and Chevron button */}
          <View className="flex-row justify-between items-center mb-2 px-4">
            <View className="flex-row items-center gap-1">
              <TouchableOpacity
                className="p-2"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => handleEditProject(project)}
                disabled={!actions.edit}
              >
                <Edit size={20} color="#c00509" />
              </TouchableOpacity>
              <Text className="text-gray-600 text-base font-medium">Project Details</Text>
            </View>
            <TouchableOpacity
              className="p-2"
              onPress={() => toggleCardExpand(project.id)}
            >
              
              {expandedCards[project.id] ? (
                <ChevronUp size={20} color="#6B7280" />
              ) : (
                <ChevronDown size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between mb-3">
            <View className="flex-1 ml-4 pr-4">
              <Text className="text-gray-600 text-sm mb-1">Customer</Text>
              <Text className="text-gray-900 text-xs font-semibold">{project.name}</Text>
            </View>
            <View className="flex-1 pl-2">
              <Text className="text-gray-600 text-sm mb-1">Service</Text>
              <Text className="text-gray-900 text-xs">{project.service}</Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-3">
            <View className="flex-1 ml-4 pr-4">
              <Text className="text-gray-600 text-sm mb-1">Amount</Text>
              <Text className="text-gray-900 text-xs font-semibold">{project.amount}</Text>
            </View>
            <View className="flex-1 pl-2">
              <Text className="text-gray-600 text-sm mb-1">Status</Text>
              <Text className="text-gray-900 text-xs">{project.status}</Text>
            </View>
          </View>

          {/* Expandable Content */}
          {expandedCards[project.id] && (
            <View className="mt-2 pt-4 border-t border-gray-200">
              <View className="flex-row justify-between mb-3">
                <View className="flex-1 ml-4 pr-4">
                  <Text className="text-gray-600 text-sm mb-1">Address</Text>
                  <Text className="text-gray-900 text-xs">{project.address}</Text>
                </View>
                <View className="flex-1 pl-2">
                  <Text className="text-gray-600 text-sm mb-1">Email</Text>
                  <Text className="text-gray-900 text-xs">{project.email}</Text>
                </View>
              </View>

              <View className="flex-row justify-between mb-3">
                <View className="flex-1 ml-4 pr-4">
                  <Text className="text-gray-600 text-sm mb-1">Phone</Text>
                  <Text className="text-gray-900 text-xs">{project.phone}</Text>
                </View>
                <View className="flex-1 pl-2">
                  <Text className="text-gray-600 text-sm mb-1">Size</Text>
                  <Text className="text-gray-900 text-xs">{project.size}</Text>
                </View>
              </View>

              <View className="flex-row justify-between mb-3">
                <View className="flex-1 ml-4 pr-4">
                  <Text className="text-gray-600 text-sm mb-1">Description</Text>
                  <Text className="text-gray-900 text-xs">{project.description}</Text>
                </View>
                <View className="flex-1 pl-2">
                  <Text className="text-gray-600 text-sm mb-1">Date</Text>
                  <Text className="text-gray-900 text-xs">{project.date}</Text>
                </View>
              </View>

              {project.attachment && (
                <View className="flex-row items-center justify-between ml-4 pr-4">
                  <View style={{ flex: 1 }}>
                    <Text className="text-gray-600 text-sm mb-1">Attachment</Text>
                    <Text className="text-gray-900 text-xs">{project.attachment}</Text>
                  </View>
                </View>
              )}

              {/* Project Attachments Section */}
              {project.projectData?.attachments && Array.isArray(project.projectData.attachments) && project.projectData.attachments.length > 0 && (
                <View className="mt-3 pt-3 border-t border-gray-200">
                  <Text className="text-gray-600 text-sm mb-2 ml-4">Attachments ({project.projectData.attachments.length})</Text>
                  <View className="ml-4 pr-4">
                    {project.projectData.attachments.map((attachment, index) => {
                      // Extract data from Mongoose document if needed
                      const attachmentData = attachment._doc || attachment;
                      const fileName = attachmentData.originalName || attachmentData.filename || attachmentData.url?.split('/').pop();
                      const fileType = attachmentData.mimetype || getMimeTypeFromUrl(attachmentData.url);
                      const isImage = fileType?.startsWith('image/') || fileName?.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/);
                      
                      return (
                        <TouchableOpacity
                          key={attachmentData._id || attachmentData.url || index}
                          className="flex-row items-center justify-between bg-gray-50 p-3 rounded-lg mb-2"
                          onPress={() => handleViewAttachment(attachmentData)}
                        >
                          <View className="flex-row items-center flex-1 gap-2">
                            <View className={`p-2 rounded-lg ${isImage ? 'bg-green-100' : 'bg-blue-100'}`}>
                              {isImage ? (
                                <FileImage size={16} color="#10B981" />
                              ) : (
                                <FileText size={16} color="#3B82F6" />
                              )}
                            </View>
                            <View className="flex-1">
                              <Text className={`text-xs font-medium ${isImage ? 'text-green-600' : 'text-blue-600'}`} numberOfLines={1}>
                                {fileName || 'Attachment'}
                              </Text>
                              <Text className="text-gray-500 text-xs">
                                {fileType || 'Unknown type'}
                              </Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            className="p-1"
                            onPress={() => handleViewAttachment(attachmentData)}
                          >
                            <Eye size={16} color="#6B7280" />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  // Handle project selection with service filtering
  const handleProjectSelect = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      setSelectedStatus(project.name);
      setShowProposelDropDown(false);
      
      // Set the service filter to match the selected project
      if (selectedFilter !== 'All' && project.service !== selectedFilter) {
        setSelectedFilter(project.service);
      }
      
      setNewTask(prev => ({ 
        ...prev, 
        projectId: project.projectData?._id || project.id
      }));
      
      // Fetch tasks for the selected project
      const projectIdForTasks = project.projectData?._id || project.id;
      fetchTasks(projectIdForTasks);
    }
  };

  // Enhanced project filtering - Now handled by API
  const getFilteredProjects = () => {
    // Return all projects since filtering is now done by API
    return projects;
  };

  // Check if current project should be shown based on service filter
  const shouldShowProject = () => {
    if (!selectedProject) return false;
    if (selectedFilter === 'All') return true;
    return selectedProject.service === selectedFilter;
  };

  // Enhanced project selection with validation
  const handleProjectSelection = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // Check if project service matches current filter
    if (selectedFilter !== 'All' && project.service !== selectedFilter) {
      Alert.alert(
        'Service Mismatch',
        `This project (${project.service}) doesn't match the current filter (${selectedFilter}). Would you like to switch to ${project.service} filter?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Switch Filter', 
            onPress: () => {
              setSelectedFilter(project.service);
              handleProjectSelect(projectId);
            }
          }
        ]
      );
      return;
    }

    handleProjectSelect(projectId);
  };

  // Update the pickImages function
  const pickImages = async (type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
        aspect: [4, 3]
      });

      if (!result.canceled) {
        const selectedImages = result.assets.map(asset => asset.uri);
        if (editingTask) {
          setEditingTask(prev => ({
            ...prev,
            [type]: [...(prev[type] || []), ...selectedImages]
          }));
        } else {
        setNewTask(prev => ({
          ...prev,
          [type]: [...(prev[type] || []), ...selectedImages]
        }));
        }
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  };

  const removeImage = (type, index) => {
    if (editingTask) {
      setEditingTask(prev => ({
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index)
      }));
    } else {
    setNewTask(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
    }
  };

  // Add this with other functions
  const handleUpdateTask = () => {
    updateTask();
  };

  // Project Edit Functions
  const handleEditProject = (project) => {
    // Navigate to EditProject page with project ID
    const projectData = project.projectData || project;
    const projectId = projectData._id || project.id;
    router.push(`/projects/edit/${projectId}`);
  };

  // Attachment handling functions
  const getFullUrl = (url) => {
    if (!url) return '';
    let fullUrl;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      fullUrl = url.replace('http://localhost:5000', API_CONFIG.API_URL)
                   .replace('https://localhost:5000', API_CONFIG.API_URL);
    } else if (url.startsWith('/')) {
      fullUrl = `${API_CONFIG.API_URL}${url}`;
    } else {
      fullUrl = `${API_CONFIG.API_URL}/${url}`;
    }
    return fullUrl;
  };

  const handleViewAttachment = async (attachment) => {
    try {
      if (!attachment) { 
        Alert.alert('Error', 'Invalid attachment'); 
        return; 
      }
      
      const fileUrl = attachment.url || attachment.attachmentUrl || `/${attachment.filename}`;
      const fileName = attachment.originalName || attachment.filename;
      const fullUrl = getFullUrl(fileUrl);
      
      // Open all files directly in browser
      const supported = await Linking.canOpenURL(fullUrl);
      if (supported) {
        await Linking.openURL(fullUrl);
      } else {
        Alert.alert('Error', 'Cannot open this file type. Please try opening in browser manually.');
      }
    } catch (error) {
      console.error('Error viewing attachment:', error);
      Alert.alert('Error', 'Failed to open attachment. Please try again.');
    }
  };

  const getMimeTypeFromUrl = (url) => {
    if (!url) return 'application/octet-stream';
    const extension = url.split('.').pop()?.toLowerCase();
    const mimeTypes = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png',
      'gif': 'image/gif', 'bmp': 'image/bmp', 'webp': 'image/webp',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain', 'rtf': 'application/rtf'
    };
    return mimeTypes[extension] || 'application/octet-stream';
  };

  // Loading skeleton for projects
  const renderProjectsLoading = () => (
    <View className="px-4 py-3">
      <View className="bg-gray-100 rounded-lg h-12 px-4 justify-center">
        <View className="flex-row items-center">
          <ActivityIndicator size="small" color="#6B7280" />
          <Text className="text-gray-500 text-sm ml-2">Loading projects...</Text>
        </View>
      </View>
    </View>
  );

  const router = useRouter();

  if (!hasPagePermission(user, '/dashboard/tasks', 'view')) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#c92125', fontSize: 18, textAlign: 'center' }}>
          You do not have permission to view this page.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#DC2626']}
            tintColor="#DC2626"
            title="Pull to refresh tasks"
            titleColor="#DC2626"
          />
        }
      >
        {/* Fixed Header Section */}
        <View className="bg-white">
          {/* Header Title */}
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-100">
            <Text className="text-xl font-bold text-gray-800">Task Management</Text>
            <View className="flex-row items-center">
              {loading && (
                <ActivityIndicator size="small" color="#DC2626" className="mr-2" />
              )}
            </View>
          </View>

          {/* Filter Tabs - Always visible */}
          <FilterTabs 
            selectedFilter={selectedFilter}
            onFilterChange={handleServiceChange}
            filters={allServices}
          />

          {/* Projects Dropdown - Enhanced with API data */}
          {loadingProjects ? renderProjectsLoading() : (
          <View className="px-4 py-3">
            <View className="relative">
              <TouchableOpacity
                onPress={() => setShowProposelDropDown(!showProposelDropDown)}
                className="flex-row items-center justify-between bg-gray-100 rounded-lg h-12 px-4"
              >
                <Text className={`${
                  selectedStatus ? 'text-blue-600' : 'text-gray-500'
                } text-sm font-medium`}>
                    {selectedStatus || 'Select Project'}
                </Text>
                <ChevronDown size={16} color="#6B7280" />
              </TouchableOpacity>
              
              {showProposelDropDown && (
                  <View className="absolute top-14 left-0 bg-white rounded-lg shadow-xl z-10 w-full max-h-60">
                    <ScrollView showsVerticalScrollIndicator={false}>
                      {getFilteredProjects().length === 0 ? (
                        <View className="px-4 py-6 items-center">
                          <Text className="text-gray-500 text-sm">
                            {selectedFilter === 'All' 
                              ? 'No projects available' 
                              : `No ${selectedFilter} projects available`}
                          </Text>
                          <Text className="text-gray-400 text-xs mt-1">
                            {selectedFilter === 'All' 
                              ? 'Create a project first' 
                              : `Create a ${selectedFilter} project first`}
                          </Text>
                        </View>
                      ) : (
                        getFilteredProjects().map((project) => (
                      <TouchableOpacity
                              key={project.id}
                        className="px-4 py-3 border-b border-gray-100 flex-row items-center justify-between bg-blue-50"
                              onPress={() => handleProjectSelection(project.id)}
                      >
                              <View className="flex-1">
                        <Text className="text-blue-600 text-sm font-medium">
                                  {project.customerName}
                                </Text>
                                <Text className="text-blue-400 text-xs">
                                  {project.service} • {project.amount}
                        </Text>
                              </View>
                              {selectedStatus === project.name && (
                          <View className="w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </TouchableOpacity>
                          ))
                      )}
                    </ScrollView>
                </View>
              )}
            </View>
          </View>
          )}
        </View>

        {/* Project Details - Only show when project is selected */}
        {selectedStatus && selectedProject && (
          <View className="mt-4">
            {shouldShowProject() ? (
              <>
                {renderProjectDetails(selectedProject)}
                  
                <View className="mx-4 mt-4 bg-white rounded-lg p-4">
                  {/* Task Board Header */}
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-bold text-gray-900">Task Board</Text>
                  <View className="flex-row items-center">
                    <Text className="text-sm text-gray-500 mr-3">
                      {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                    </Text>
                    {tasks.length > 0 && (
                      <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-full">
                        <View className="w-2 h-2 rounded-full bg-green-500 mr-1" />
                        <Text className="text-green-600 text-xs">
                          {tasks.filter(t => t.status === 'Done').length} completed
                        </Text>
                      </View>
                    )}
                  </View>
                  </View>
                  
                  {/* Edit Task Form - New Section */}
                  {showEditForm && (
                    <EditTaskForm 
                      editingTask={editingTask}
                      setEditingTask={setEditingTask}
                      showDatePicker={showDatePicker}
                      setShowDatePicker={setShowDatePicker}
                      activeDateField={activeDateField}
                      setActiveDateField={setActiveDateField}
                      showStatusDropdown={showStatusDropdown}
                      setShowStatusDropdown={setShowStatusDropdown}
                      statusOptions={statusOptions}
                      pickImages={pickImages}
                      removeImage={removeImage}
                      setShowEditForm={setShowEditForm}
                      onUpdateTask={handleUpdateTask}
                      employees={employeesList}
                      projectId={selectedProject?.projectData?._id || selectedProject?.id}
                    />
                  )}

                {/* Loading State */}
                {loading ? (
                  <View className="flex-1 justify-center items-center py-20">
                    <ActivityIndicator size="large" color="#DC2626" />
                    <Text className="text-gray-600 mt-4">Loading tasks...</Text>
                  </View>
                ) : (
                  /* Task List */
                  <>
                    {!selectedProject ? (
                      <View className="bg-gray-50 rounded-xl p-8 items-center mb-4">
                        <Text className="text-gray-500 text-center mb-4">
                          No project selected
                        </Text>
                        <Text className="text-gray-400 text-sm text-center">
                          Please select a project to view tasks
                        </Text>
                      </View>
                    ) : !shouldShowTasks() ? (
                      <View className="bg-gray-50 rounded-xl p-8 items-center mb-4">
                        <Text className="text-gray-500 text-center mb-4">
                          {selectedFilter !== "All" 
                            ? `No ${selectedFilter} project selected`
                            : "Project doesn't match filter"}
                        </Text>
                        <Text className="text-gray-400 text-sm text-center">
                          Please select a {selectedFilter} project to view tasks
                        </Text>
                      </View>
                    ) : filteredTasks.length === 0 ? (
                      <View className="bg-gray-50 rounded-xl p-8 items-center mb-4">
                        <Text className="text-gray-500 text-center mb-4">
                          {selectedFilter === "All"
                            ? "No tasks found"
                            : `No ${selectedFilter} tasks found`}
                        </Text>
                        <Text className="text-gray-400 text-sm text-center">
                          {selectedFilter === "All"
                            ? "Create a new task to get started"
                            : `Create a new ${selectedFilter} task or select a different service filter`}
                        </Text>
                      </View>
                    ) : (
                      filteredTasks.map((task) => (
                        <View key={task.id} className="mb-4">
                      <TaskCard 
                        task={task}
                            employees={employeesList}
                        handleEditTask={handleEditTask}
                            onDeleteTask={() => deleteTask(task.id)}
                      />
                    </View>
                      ))
                    )}
                  </>
                )}

                {/* Add Task Section */}
                  <View className="flex-row justify-between items-center mb-4 p-4 bg-gray-100 rounded-lg">
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-900">Add Task</Text>
                    {!selectedProject && (
                      <Text className="text-gray-500 text-sm mt-1">Select a project first</Text>
                    )}
                    {selectedProject && !shouldAllowTaskActions() && (
                      <Text className="text-yellow-600 text-sm mt-1">
                        Project service ({selectedProject.service}) doesn't match filter ({selectedFilter})
                      </Text>
                    )}
                  </View>
                    <TouchableOpacity 
                      onPress={handleAddTask}
                    className={`px-4 py-3 rounded-lg ${
                      selectedProject && shouldAllowTaskActions() ? 'bg-red-600' : 'bg-gray-400'
                    }`}
                    disabled={!selectedProject || !shouldAllowTaskActions() || !actions.add}
                    >
                      <Text className="text-white font-medium">
                        {showAddTaskForm ? 'Cancel' : 'Add Task'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                {!selectedProject && (
                  <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <Text className="text-yellow-800 text-sm text-center">
                      Please select a project first to add tasks
                    </Text>
                  </View>
                )}

                {selectedProject && !shouldAllowTaskActions() && (
                  <View className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                    <Text className="text-orange-800 text-sm text-center">
                      Please select a {selectedFilter} project to add {selectedFilter} tasks
                    </Text>
                  </View>
                )}
                
                {showAddTaskForm && selectedProject && shouldAllowTaskActions() && (
                    <AddTaskForm 
                      newTask={newTask}
                      setNewTask={setNewTask}
                      showDatePicker={showDatePicker}
                      setShowDatePicker={setShowDatePicker}
                      activeDateField={activeDateField}
                      setActiveDateField={setActiveDateField}
                      showStatusDropdown={showStatusDropdown}
                      setShowStatusDropdown={setShowStatusDropdown}
                      statusOptions={statusOptions}
                      pickImages={pickImages}
                      removeImage={removeImage}
                      setShowAddTaskForm={setShowAddTaskForm}
                      onCreateTask={createTask}
                      employees={employeesList}
                      projectId={selectedProject?.projectData?._id || selectedProject?.id}
                    />
                  )}

                </View>
              </>
            ) : (
              // Service mismatch warning - similar to client-side
              <View className="mx-4 mt-4 bg-white rounded-lg p-4">
                <View className="p-4 text-center">
                  <Text className="text-lg font-semibold text-gray-900 mb-2">
                    {!selectedProject 
                      ? "No Project Selected"
                      : `No ${selectedFilter} Project Selected`}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {!selectedProject
                      ? "Please select a project from the dropdown above"
                      : `Please select a ${selectedFilter} project from the dropdown above`}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* No Project Selected State */}
        {!selectedStatus && !loadingProjects && (
          <View className="mx-4 mt-8 bg-white rounded-lg p-8 items-center">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              {selectedFilter === 'All' ? 'Select a Project' : `Select a ${selectedFilter} Project`}
            </Text>
            <Text className="text-gray-500 text-center mb-4">
              {selectedFilter === 'All' 
                ? 'Choose a project from the dropdown above to view and manage its tasks'
                : `Choose a ${selectedFilter} project from the dropdown above to view and manage its tasks`}
            </Text>
            <View className="flex-row items-center mb-4">
              <View className="bg-blue-50 px-3 py-2 rounded-lg mr-2">
                <Text className="text-blue-600 text-sm font-medium">
                  {getFilteredProjects().length}
                </Text>
              </View>
              <Text className="text-gray-600 text-sm">
                {selectedFilter === 'All' 
                  ? `project${getFilteredProjects().length !== 1 ? 's' : ''} available`
                  : `${selectedFilter} project${getFilteredProjects().length !== 1 ? 's' : ''} available`}
              </Text>
            </View>
            {getFilteredProjects().length === 0 ? (
              <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <Text className="text-yellow-800 text-sm text-center">
                  {selectedFilter === 'All' 
                    ? 'No projects available. Create a project first.'
                    : `No ${selectedFilter} projects available. Create a ${selectedFilter} project first.`}
                </Text>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={() => setShowProposelDropDown(true)}
                className="bg-red-600 px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-medium">Select Project</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Pull to Refresh Instruction */}
        {refreshing && (
          <View className="items-center py-4">
            <Text className="text-gray-500 text-sm">Refreshing tasks...</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const TaskWithPermissions = () => {
  return (
    <PermissionGuard page="Tasks" action="view">
      <Task />
    </PermissionGuard>
  );
};

export default TaskWithPermissions;

