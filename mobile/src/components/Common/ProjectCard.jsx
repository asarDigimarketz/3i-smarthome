import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { API_CONFIG } from '../../../config';
import { CircleCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../utils/apiClient';
import { getPageActions } from '../../utils/permissions';
import { useAuth } from '../../utils/AuthContext';

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

const statusOptions = [
  { label: 'New', value: 'New'},
  { label: 'In Progress', value: 'InProgress'},
  { label: 'Done', value: 'Done'},
  { label: 'Completed', value: 'Completed'},
  { label: 'Cancelled', value: 'Cancelled'},
];

const getStatusDisplay = (status) => {
  // Map server status to display status (matching client logic)
  const statusMap = {
    'new': 'New',
    'in-progress': 'InProgress', 
    'completed': 'Completed',
    'done': 'Done',
    'cancelled': 'Cancelled',
    // Also handle mobile format
    'New': 'New',
    'InProgress': 'InProgress',
    'Completed': 'Completed', 
    'Done': 'Done',
    'Cancelled': 'Cancelled'
  };
  
  const displayStatus = statusMap[status] || 'New';
  
  const found = statusOptions.find(
    (opt) => opt.value === displayStatus
  );
  return found || statusOptions[0]; // default to New
};

const getProgressPercent = (progress, completedTasks, totalTasks) => {
  if (typeof progress === 'string' && progress.includes('%')) {
    return parseFloat(progress.replace('%', '')) / 100;
  }
  if (typeof progress === 'string' && progress.includes('/')) {
    const [current, total] = progress.split('/').map(Number);
    return total > 0 ? current / total : 0;
  }
  if (typeof completedTasks === 'number' && typeof totalTasks === 'number') {
    return totalTasks > 0 ? completedTasks / totalTasks : 0;
  }
  return 0;
};

// Helper function to extract task counts from various data formats
const getTaskSummary = (project) => {
  // First, try to get from direct properties
  if (typeof project.completedTasks === 'number' && typeof project.totalTasks === 'number') {
    return {
      completed: project.completedTasks,
      total: project.totalTasks
    };
  }
  
  // Try to extract from progress string (e.g., "2/5")
  if (typeof project.progress === 'string' && project.progress.includes('/')) {
    const [current, total] = project.progress.split('/').map(Number);
    if (!isNaN(current) && !isNaN(total)) {
      return {
        completed: current,
        total: total
      };
    }
  }
  
  // Try alternative property names that might exist
  if (typeof project.completed_tasks === 'number' && typeof project.total_tasks === 'number') {
    return {
      completed: project.completed_tasks,
      total: project.total_tasks
    };
  }
  
  // Check if tasks array exists and calculate from there
  if (Array.isArray(project.tasks)) {
    const completed = project.tasks.filter(task => 
      task.status === 'completed' || task.status === 'done'
    ).length;
    return {
      completed: completed,
      total: project.tasks.length
    };
  }
  
  // Fallback to zeros
  return {
    completed: 0,
    total: 0
  };
};

  const ProjectCard = ({ project, customer }) => {
  const router = useRouter();
  const { user } = useAuth();
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  
  // Map server status to display status
  const statusMap = {
    'new': 'New',
    'in-progress': 'InProgress', 
    'completed': 'Completed',
    'done': 'Done',
    'cancelled': 'Cancelled'
  };
  
  const [currentStatus, setCurrentStatus] = useState(statusMap[project.status] || project.status);
  const actions = getPageActions(user, '/dashboard/projects');
  // Get task summary data
  const taskSummary = getTaskSummary(project);

  // Get status display
  const statusDisplay = getStatusDisplay(currentStatus || project.status);

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      // Convert mobile status to server status
      const serverStatusMap = {
        'New': 'new',
        'InProgress': 'in-progress',
        'Done': 'done',
        'Completed': 'completed',
        'Cancelled': 'cancelled'
      };
      
      const serverStatus = serverStatusMap[newStatus] || newStatus;
      
      // PATCH request to update status (adjust endpoint as needed)
      const res = await apiClient.patch(
        `/api/projects/${project.id || project._id}/field`,
        { field: 'projectStatus', value: serverStatus }
      );

      const data = res.data;
 
      
      if (data.success) {
        setCurrentStatus(newStatus);
        setShowStatusDropdown(false);
      } else {
        Alert.alert('Error', data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      Alert.alert('Error', 'Failed to update project status');
    } finally {
      setStatusLoading(false);
    }
  };

  const getServiceGradient = (service) => {
    switch (service) {
      case 'Home Cinema':
        return ['#613eff', '#9cbbff'];
      case 'Home Automation':
        return ['#026b87', '#5deaff'];
      case 'Security System':
        return ['#014c95', '#36b9f6'];
      case 'Outdoor Audio Solution':
        return ['#df2795', '#eb7ab7'];
      default:
        return ['#4F46E5', '#06B6D4'];
    }
  };

  return (
    <TouchableOpacity
      onPress={() => router.push({
        pathname: '/(tabs)/tasks',
        params: { 
          projectId: project.id, 
          projectName: project.service,
          refresh: Date.now() // Add timestamp to force refresh
        }
      })}
      activeOpacity={0.85}
      className="rounded-xl shadow-sm mb-4 overflow-hidden"
    >
      <LinearGradient
        colors={getServiceGradient(project.service)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-6"
      >
        {/* Status and Service Section */}
        <View className="flex-row justify-between items-center mb-6">
          {/* Service on the left (60%) */}
          <View style={{ width: '60%' }} className="items-start">
            <Text className="text-sm text-white/70 mb-1">Service</Text>
            <Text className="text-lg font-bold text-white">{project.service}</Text>
          </View>
          {/* Status on the right (40%) */}
          <View style={{ width: '40%' }} className="items-end relative">
            <TouchableOpacity
              className="px-4 py-2 rounded-lg flex-row items-center justify-center border border-white/10 text-white bg-opacity-80 bg-white/20"
              style={{ minWidth: 110 }}
              onPress={(e) => {
                e.stopPropagation && e.stopPropagation();
                setShowStatusDropdown((prev) => !prev);
              }}
              disabled={statusLoading || !actions.edit}
            >
              <Text className="text-sm font-semibold text-white">
                {statusLoading ? 'Updating...' : statusDisplay.label}
              </Text>
            </TouchableOpacity>
            {showStatusDropdown && (
              <View className="absolute top-12 right-0 bg-white rounded-lg shadow-xl z-10 w-44 border border-gray-200">
                {statusOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    className="px-4 py-3 border-b border-gray-100 active:bg-gray-50 flex-row items-center"
                    onPress={() => handleStatusChange(opt.value)}
                    disabled={statusLoading || !actions.edit  }
                  >
                    <Text className="text-sm font-medium flex-1 text-gray-600 gap-1">
                      {opt.label}
                    </Text>
                    {(currentStatus === opt.value || statusMap[project.status] === opt.value) && (
                      <CircleCheck size={20} className='text-gray-600' />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
        </View>
        {/* Customer Info Section */}
        <View className="flex-row justify-between">
          <View className="flex-1 pr-4">
            <View className="flex-row items-center mb-3">
              <Text className="text-xl font-bold text-white mr-3">{customer.name}</Text>
            </View>
            <Text className="text-base text-white/70 leading-5">{customer.address}</Text>
          </View>
          {/* Amount and Date Section */}
          <View className="items-end">
            <View className="mb-4">
              <Text className="text-sm text-white/70 mb-1">Amount</Text>
              <Text className="text-lg font-bold text-white">{project.amount}</Text>
            </View>
            <View>
              <Text className="text-sm text-white/70 mb-1">Date</Text>
              <Text className="text-lg font-bold text-white">{project.date}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
      {/* Progress Bar Section */}
      <View className="bg-white p-4">
        <View className="flex-row justify-between items-center">
          {/* Avatars */}
          <View className="flex-row">
            {(Array.isArray(project.assignedEmployees) && project.assignedEmployees.length > 0
              ? project.assignedEmployees.slice(0, 3)
              : [null, null, null]
            ).map((emp, idx) => (
              <View
                key={idx}
                className={`w-10 h-10 rounded-full border-2 border-white overflow-hidden${idx > 0 ? ' -ml-3' : ''}`}
              >
                <Image
                  source={{ uri: getAvatarUrl(emp?.avatar) }}
                  className="w-full h-full rounded-full"
                />
              </View>
            ))}
          </View>
          {/* Progress Bar */}
          <View className="flex-1 mx-4 justify-center">
            <View className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <ProgressBar
                progress={Math.max(0, Math.min(1, getProgressPercent(project.progress, taskSummary.completed, taskSummary.total) || 0))}
                color="#DC2626"
                style={{ height: 8, backgroundColor: 'transparent' }}
              />
            </View>
          </View>
          {/* Task Summary */}
          <View className="items-end">
            <Text className="text-xl font-bold text-gray-900">
              {taskSummary.completed} / {taskSummary.total}
            </Text>
            {/* {taskSummary.total > 0 && (
              <Text className="text-xs text-gray-500 mt-1">
                {Math.round((taskSummary.completed / taskSummary.total) * 100)}% complete
              </Text>
            )} */}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProjectCard;