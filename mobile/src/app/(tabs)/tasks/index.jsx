import * as ImagePicker from 'expo-image-picker';
import { ChevronDown, ChevronUp, RefreshCw, Users } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, ActivityIndicator, Alert, RefreshControl, Button } from 'react-native';
import FilterTabs from '../../../components/Common/FilterTabs';
import AddTaskForm from '../../../components/Tasks/AddTaskForm';
import EditTaskForm from '../../../components/Tasks/EditTaskForm';
import TaskCard from '../../../components/Tasks/TaskCard';
import { employees, proposalData } from '../../../data/mockData';
import { API_CONFIG } from '../../../../config';
import { useAuth } from '../../../utils/AuthContext';
import { hasPagePermission, getPageActions } from '../../../utils/permissions';

export default function Task() {
  const { user } = useAuth();
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

  // Define all available services
  const allServices = ['All', 'Home Cinema', 'Home Automation', 'Security System', 'Outdoor Audio Solution'];

  const statusOptions = [
    { value: "new", color: "text-blue-600", bg: "bg-blue-50", label: "New" },
    { value: "inprogress", color: "text-yellow-600", bg: "bg-yellow-50", label: "In Progress" },
    { value: "completed", color: "text-green-600", bg: "bg-green-50", label: "Done" }
  ];

  // Fetch all projects from API (enhanced from desktop version)
  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await fetch(`${API_CONFIG.API_URL}/api/projects`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        // Transform projects to match component expectations
        const transformedProjects = data.data.map(project => ({
          id: project._id,
          name: `${project.customerName} - ${project.services}`,
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
          { text: 'Retry', onPress: () => fetchProjects() },
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
      const response = await fetch(`${API_CONFIG.API_URL}/api/employeeManagement`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.employees)) {
        // Transform employees for dropdown
        const transformedEmployees = data.employees.map(emp => ({
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
      // Fallback to mock data if API fails
      setEmployeesList(employees.map(emp => ({
        id: emp.id,
        name: emp.name,
        email: emp.email || '',
        firstName: emp.name.split(' ')[0],
        lastName: emp.name.split(' ')[1] || ''
      })));
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  // Fetch tasks for selected project
  const fetchTasks = async (projectId, isRefresh = false) => {
    if (!projectId) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(`${API_CONFIG.API_URL}/api/tasks/project/${projectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

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
          beforeImages: task.beforeAttachments ? task.beforeAttachments.map(att => att.url) : [],
          afterImages: task.afterAttachments ? task.afterAttachments.map(att => att.url) : [],
          beforeAttachments: task.beforeAttachments || [],
          afterAttachments: task.afterAttachments || [],
          attachment: task.beforeAttachments && task.beforeAttachments.length > 0 ? 
                     task.beforeAttachments[0].originalName : 
                     (task.afterAttachments && task.afterAttachments.length > 0 ? 
                      task.afterAttachments[0].originalName : null),
          projectId: task.projectId,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt
        }));

        setTasks(transformedTasks);
      } else {
        console.error('Invalid API response structure:', data);
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert(
        'Network Error', 
        'Failed to fetch tasks. Please check your internet connection and try again.',
        [
          { text: 'Retry', onPress: () => fetchTasks(projectId) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Create new task (enhanced with better FormData handling)
  const createTask = async () => {
    if (!selectedProject || !newTask.title.trim() || !newTask.status) {
      Alert.alert('Validation Error', 'Please fill in all required fields:\n• Task title\n• Status\n• Project must be selected');
      return;
    }

    try {
      setAddingTask(true);

      // Create FormData for file uploads (from desktop version)
      const formData = new FormData();
      formData.append('projectId', selectedProject.projectData._id); // Use actual project ID
      formData.append('title', newTask.title.trim());
      formData.append('comment', newTask.comment || '');
      formData.append('startDate', newTask.startDate.toISOString());
      if (newTask.endDate) {
        formData.append('endDate', newTask.endDate.toISOString());
      }
      formData.append('status', newTask.status);
      if (newTask.assignTo) {
        formData.append('assignedTo', newTask.assignTo);
      }

      // Add before images
      if (newTask.beforeImages && newTask.beforeImages.length > 0) {
        newTask.beforeImages.forEach((imageUri, index) => {
          formData.append('beforeAttachments', {
            uri: imageUri,
            type: 'image/jpeg',
            name: `before-image-${index}-${Date.now()}.jpg`,
          });
        });
      }

      // Add after images
      if (newTask.afterImages && newTask.afterImages.length > 0) {
        newTask.afterImages.forEach((imageUri, index) => {
          formData.append('afterAttachments', {
            uri: imageUri,
            type: 'image/jpeg',
            name: `after-image-${index}-${Date.now()}.jpg`,
          });
        });
      }

      const response = await fetch(`${API_CONFIG.API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'x-api-key': API_CONFIG.API_KEY,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Success', 'Task created successfully');
        setShowAddTaskForm(false);
        setNewTask({
          title: '',
          assignTo: '',
          startDate: new Date(),
          endDate: new Date(),
          status: '',
          beforeImages: [],
          afterImages: [],
          attachment: null,
          comment: '',
          projectId: ''
        });
        // Refresh tasks
        fetchTasks(selectedProject.projectData._id);
      } else {
        Alert.alert('Error', data.message || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    } finally {
      setAddingTask(false);
    }
  };

  // Update existing task (enhanced error handling)
  const updateTask = async (taskId, updatedData) => {
    try {
      setUpdatingTask(true);

      // Prepare form data for file uploads
      const formData = new FormData();
      if (updatedData.title) formData.append('title', updatedData.title.trim());
      if (updatedData.comment !== undefined) formData.append('comment', updatedData.comment);
      if (updatedData.startDate) formData.append('startDate', updatedData.startDate.toISOString());
      if (updatedData.endDate) formData.append('endDate', updatedData.endDate.toISOString());
      if (updatedData.status) formData.append('status', updatedData.status);
      if (updatedData.assignedTo) formData.append('assignedTo', updatedData.assignedTo);

      // Add new before images if any
      if (updatedData.beforeImages && updatedData.beforeImages.length > 0) {
        updatedData.beforeImages.forEach((imageUri, index) => {
          if (typeof imageUri === 'string' && imageUri.startsWith('file://')) {
            formData.append('beforeAttachments', {
              uri: imageUri,
              type: 'image/jpeg',
              name: `before-image-${index}-${Date.now()}.jpg`,
            });
          }
        });
      }

      // Add new after images if any
      if (updatedData.afterImages && updatedData.afterImages.length > 0) {
        updatedData.afterImages.forEach((imageUri, index) => {
          if (typeof imageUri === 'string' && imageUri.startsWith('file://')) {
            formData.append('afterAttachments', {
              uri: imageUri,
              type: 'image/jpeg',
              name: `after-image-${index}-${Date.now()}.jpg`,
            });
          }
        });
      }

      const response = await fetch(`${API_CONFIG.API_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'x-api-key': API_CONFIG.API_KEY,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Success', 'Task updated successfully');
        setShowEditForm(false);
        setEditingTask(null);
        // Refresh tasks
        fetchTasks(selectedProject.projectData._id);
      } else {
        Alert.alert('Error', data.message || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task. Please try again.');
    } finally {
      setUpdatingTask(false);
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
              const response = await fetch(`${API_CONFIG.API_URL}/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': API_CONFIG.API_KEY,
                },
              });

              const data = await response.json();

              if (response.ok && data.success) {
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

    return (
      <View className='px-4 py-2 rounded-lg mb-4 bg-white shadow-sm'>
        {/* Main Card Content */}
        <View className={`mb-4 rounded-xl shadow-xl p-4 ${getBgColor(project.service)}`}>
          {/* Header with Details text and Chevron button */}
          <View className="flex-row justify-between items-center mb-2 px-4">
            <Text className="text-gray-600 text-base font-medium">Project Details</Text>
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
              <Text className="text-gray-900 text-xs font-semibold">{project.customerName}</Text>
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
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                <Text className="text-gray-900 text-xs">Active</Text>
              </View>
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
                <View className="ml-4 pr-4">
                  <Text className="text-gray-600 text-sm mb-1">Attachment</Text>
                  <Text className="text-gray-900 text-xs">{project.attachment}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  // Enhanced project selection with API data
  const handleProjectSelect = (projectId) => {
    const selectedProjectData = projects.find(p => p.id === projectId);
    if (selectedProjectData) {
      setSelectedFilter(selectedProjectData.service);
      setSelectedStatus(selectedProjectData.name);
      setSelectedProject(selectedProjectData);
      setNewTask(prev => ({ ...prev, projectId: selectedProjectData.id }));
      
      // Fetch tasks for the selected project
      fetchTasks(selectedProjectData.projectData._id);
    }
    setShowProposelDropDown(false);
  };

  // Update the pickImages function
  const pickImages = async (type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaType.IMAGE], // Updated API usage
        allowsMultipleSelection: true,
        quality: 1,
        aspect: [4, 3]
      });

      if (!result.canceled) {
        const selectedImages = result.assets.map(asset => asset.uri);
        if (editingTask) {
          setEditingTask(prev => ({
            ...prev,
            [type]: [...prev[type], ...selectedImages]
          }));
        } else {
        setNewTask(prev => ({
          ...prev,
          [type]: [...prev[type], ...selectedImages]
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
  const handleEditTask = (task) => {
    setEditingTask({
      ...task,
      startDate: new Date(task.startDate.split('/').reverse().join('-')), // Convert DD/MM/YYYY to Date
      endDate: task.endDate ? new Date(task.endDate.split('/').reverse().join('-')) : new Date(),
      beforeImages: task.beforeImages || [],
      afterImages: task.afterImages || [],
      status: task.statusValue || task.status.toLowerCase() // Use API status format
    });
    setShowEditForm(true);
  };

  // Add this with other functions
  const handleUpdateTask = (updatedTask) => {
    updateTask(updatedTask.id, {
      title: updatedTask.title,
      comment: updatedTask.note || updatedTask.comment,
      startDate: updatedTask.startDate,
      endDate: updatedTask.endDate,
      status: updatedTask.status,
      assignedTo: updatedTask.assignedTo?._id,
      beforeImages: updatedTask.beforeImages,
      afterImages: updatedTask.afterImages
    });
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
              {employeesList.length > 0 && (
                <View className="flex-row items-center bg-blue-50 px-2 py-1 rounded-full">
                  <Users size={14} color="#3B82F6" />
                  <Text className="text-blue-600 text-xs ml-1">{employeesList.length}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Filter Tabs - Always visible */}
          <FilterTabs 
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
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
                      {projects.length === 0 ? (
                        <View className="px-4 py-6 items-center">
                          <Text className="text-gray-500 text-sm">No projects available</Text>
                          <Text className="text-gray-400 text-xs mt-1">Create a project first</Text>
                        </View>
                      ) : (
                        projects
                          .filter(project => selectedFilter === 'All' || project.service === selectedFilter)
                          .map((project) => (
                      <TouchableOpacity
                              key={project.id}
                        className="px-4 py-3 border-b border-gray-100 flex-row items-center justify-between bg-blue-50"
                              onPress={() => handleProjectSelect(project.id)}
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
                  updating={updatingTask}
                  employees={employeesList}
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
                  {tasks.length === 0 ? (
                    <View className="bg-gray-50 rounded-xl p-8 items-center mb-4">
                      <Text className="text-gray-500 text-center mb-4">
                        No tasks found for this project
                      </Text>
                      <Text className="text-gray-400 text-sm text-center">
                        Create your first task to get started
                      </Text>
                    </View>
                  ) : (
                    tasks.map((task) => (
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
                </View>
                  <TouchableOpacity 
                    onPress={() => setShowAddTaskForm(!showAddTaskForm)}
                  className={`px-4 py-3 rounded-lg ${
                    selectedProject ? 'bg-red-600' : 'bg-gray-400'
                  }`}
                  disabled={!selectedProject}
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
              
              {showAddTaskForm && selectedProject && (
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
                  creating={addingTask}
                  employees={employeesList}
                  />
                )}

              </View>
            </View>
        )}

        {/* No Project Selected State */}
        {!selectedStatus && !loadingProjects && (
          <View className="mx-4 mt-8 bg-white rounded-lg p-8 items-center">
            <Text className="text-lg font-semibold text-gray-900 mb-2">Select a Project</Text>
            <Text className="text-gray-500 text-center mb-4">
              Choose a project from the dropdown above to view and manage its tasks
            </Text>
            <View className="flex-row items-center mb-4">
              <View className="bg-blue-50 px-3 py-2 rounded-lg mr-2">
                <Text className="text-blue-600 text-sm font-medium">{projects.length}</Text>
              </View>
              <Text className="text-gray-600 text-sm">
                project{projects.length !== 1 ? 's' : ''} available
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => setShowProposelDropDown(true)}
              className="bg-red-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-medium">Select Project</Text>
            </TouchableOpacity>
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
