import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, ScrollView, Text, View, RefreshControl, TouchableOpacity } from "react-native";
import { RefreshCw } from 'lucide-react-native';
import ProjectCard from "../../components/Common/ProjectCard";
import { ActivitiesSection } from "../../components/Home/ActivityItem";
import { DashboardSection } from "../../components/Home/DashboardCard";
import { useAuth } from '../../utils/AuthContext';
import { hasPagePermission } from '../../utils/permissions';
import { API_CONFIG } from '../../../config';
import PermissionGuard from '../../components/Common/PermissionGuard';
import auth from '../../utils/auth';
import apiClient from '../../utils/apiClient';

// Helper function to map server status to mobile status
const mapServerToMobileStatus = (serverStatus: any): string => {
  const statusMap: { [key: string]: string } = {
    'new': 'New',
    'in-progress': 'InProgress',
    'completed': 'Complete',
    'done': 'Done',
    'cancelled': 'Cancelled'
  };
  return statusMap[serverStatus] || 'New';
};

// Helper function to transform API data to mobile format
const transformProjectData = (apiProject: any): any => {
  if (!apiProject) return null;
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
    return null;
  }
};

export default function Index() {
  const { user } = useAuth();
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [refreshingProjects, setRefreshingProjects] = useState<boolean>(false);

  const API_BASE_URL = API_CONFIG.API_URL;
  const API_KEY = API_CONFIG.API_KEY;

  const fetchRecentProjects = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
      const response = await apiClient.get('/api/projects?limit=5&sort=-projectDate');
        const data = response.data as any;
        if (data && data.success) {
          const projectsArray = data.projects || data.data || [];
          const transformed = projectsArray
            .map(transformProjectData)
            .filter((p: any) => p !== null)
            .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
          setRecentProjects(transformed);
        } else {
          setRecentProjects([]);
        }
      } catch (err) {
        setError('Failed to load recent projects' as string);
        setRecentProjects([]);
      } finally {
        setLoading(false);
      }
  }, []);

  const refreshRecentProjects = useCallback(async () => {
    setRefreshingProjects(true);
    setError(null);
    try {
      const response = await apiClient.get('/api/projects?limit=5&sort=-projectDate');
      const data = response.data as any;
      if (data && data.success) {
        const projectsArray = data.projects || data.data || [];
        const transformed = projectsArray
          .map(transformProjectData)
          .filter((p: any) => p !== null)
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        setRecentProjects(transformed);
      } else {
        setRecentProjects([]);
      }
    } catch (err) {
      setError('Failed to load recent projects' as string);
      setRecentProjects([]);
    } finally {
      setRefreshingProjects(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRecentProjects();
    setRefreshing(false);
  }, [fetchRecentProjects]);

  useEffect(() => {
    fetchRecentProjects();
  }, [fetchRecentProjects]);

  if (!hasPagePermission(user, '/dashboard', 'view')) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#c92125', fontSize: 18, textAlign: 'center' }}>
          You do not have permission to view this page.
        </Text>
      </View>
    );
  }

  return (
    <>
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView 
          className="flex-1 px-4"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#DC2626']}
              tintColor="#DC2626"
            />
          }
        >
          <PermissionGuard page="Dashboard" action="view">
            <DashboardSection />
          </PermissionGuard>
          <ActivitiesSection />
          {/* Recent Projects Section */}
          <View className="mb-2">
            <View className="flex-row items-center justify-between my-4">
              <Text className="text-xl font-bold text-gray-600">Recent Projects</Text>
              <TouchableOpacity 
                onPress={refreshRecentProjects}
                disabled={refreshingProjects}
                className="p-2"
              >
                <RefreshCw 
                  size={18} 
                  color="#DC2626" 
                  className={refreshingProjects ? 'animate-spin' : ''}
                />
              </TouchableOpacity>
            </View>
            {loading ? (
              <Text className="text-gray-500">Loading...</Text>
            ) : error ? (
              <Text className="text-red-500">{error}</Text>
            ) : (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                className="mx-[-16px]"
              >
                <View className="flex-row px-6 space-x-4 gap-4">
                  {recentProjects.map((project: any) => (
                    <View key={project.id} className="w-[320px]">
                      <ProjectCard
                        project={project}
                        customer={{
                          name: project.customerName,
                          address: project.address
                        }}
                      />
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>

          {/* <View className="h-3" />  */}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
