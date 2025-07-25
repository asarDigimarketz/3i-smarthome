import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import axios from 'axios';
import { API_CONFIG } from '../../../config';
import auth from '../../utils/auth';
import { CircleCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';

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
  { label: 'New', value: 'new'},
  { label: 'In Progress', value: 'in-progress'},
  { label: 'Completed', value: 'completed'},
  { label: 'Done', value: 'done'},
  { label: 'Cancelled', value: 'cancelled'},
];

const getStatusDisplay = (status) => {
  const found = statusOptions.find(
    (opt) => opt.value === (status?.toLowerCase?.() || status)
  );
  return found || statusOptions[1]; // default to In Progress
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
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(project.status);

  // Get task summary data
  const taskSummary = getTaskSummary(project);

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      // PATCH request to update status (adjust endpoint as needed)
      const res = await auth.fetchWithAuth(
        `${API_CONFIG.API_URL}/api/projects/${project.id || project._id}/field`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ field: 'projectStatus', value: newStatus })
        }
      );
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.success) {
        setCurrentStatus(newStatus);
        Alert.alert('Success', 'Project status updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update project status');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update project status');
    } finally {
      setStatusLoading(false);
      setShowStatusDropdown(false);
    }
  };

  const statusDisplay = getStatusDisplay(currentStatus);

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
        params: { projectId: project.id, projectName: project.service }
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
        <View className="flex-row justify-between items-start mb-6">
          {/* Service on the left (70%) */}
          <View style={{ width: '60%' }} className="items-start">
            <Text className="text-sm text-white/70 mb-1">Service</Text>
            <Text className="text-lg font-bold text-white">{project.service}</Text>
          </View>
          {/* Status on the right (30%) */}
          <View style={{ width: '40%' }} className="items-end relative">
            <TouchableOpacity
              className="px-4 py-2 rounded-lg flex-row items-center justify-center border border-white/10 text-white bg-opacity-80 bg-white/20"
              style={{ minWidth: 110 }}
              onPress={(e) => {
                e.stopPropagation && e.stopPropagation();
                setShowStatusDropdown((prev) => !prev);
              }}
              disabled={statusLoading}
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
                    disabled={statusLoading}
                  >
                    <Text className="text-sm font-medium flex-1 text-gray-600 gap-1">
                      {opt.label}
                    </Text>
                    {currentStatus?.toLowerCase() === opt.value && (
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