import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from 'react';
import { API_CONFIG } from '../../../config';
import auth from "../../utils/auth";
import apiClient from "../../utils/apiClient";

const SERVICE_CARDS = [
  {
    title: "Home Cinema",
    service: "Home Cinema",
    colors: ["#613eff", "#9cbbff"]
  },
  {
    title: "Home Automation",
    service: "Home Automation",
    colors: ["#026b87", "#5deaff"]
  },
  {
    title: "Security System",
    service: "Security System",
    colors: ["#014c95", "#36b9f6"]
  },
  {
    title: "Outdoor Audio Solution",
    service: "Outdoor Audio Solution",
    colors: ["#df2795", "#eb7ab7"]
  }
];

const DashboardCard = ({ title, service, count, subtitle, colors, onPress }) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-1"
    >
      <LinearGradient
        colors={colors}
        className="p-4 m-1 min-h-[120px] shadow-lg"
        style={{ borderRadius: 16 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text className="text-white text-base font-medium mb-2">{title}</Text>
        <View className="flex-row items-end mb-2">
          <Text className="text-white text-3xl font-bold">{count}</Text>
          <Text className="text-white/80 text-sm ml-2 mb-1">{subtitle}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

export const DashboardSection = () => {
  const router = useRouter();
  const [serviceStats, setServiceStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/api/projects/stats');
        const data = response.data;
        if (data && data.success && data.data && data.data.serviceBreakdown) {
          setServiceStats(data.data.serviceBreakdown);
        } else {
          setServiceStats([]);
        }
      } catch (err) {
        setServiceStats([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Helper to get count for a service
  const getServiceCount = (serviceType) => {
    if (!serviceStats) return '0';
    const found = serviceStats.find(s => s._id === serviceType);
    return found ? found.count.toString() : '0';
  };

  if (loading) {
    return (
      <View className="mt-6 justify-center items-center min-h-[160px]">
        <ActivityIndicator size="large" color="#613eff" />
        <Text className="text-gray-500 mt-2">Loading service stats...</Text>
      </View>
    );
  }

  return (
    <View className="mt-6 ">
      <Text className="text-gray-900 text-xl font-bold mb-4">Dashboard</Text>
      <View className="bg-[#f9f9f9] rounded-3xl p-2">
        <View className="flex-row">
          <DashboardCard {...SERVICE_CARDS[0]} count={getServiceCount(SERVICE_CARDS[0].service)} subtitle="Projects" onPress={() => router.push({ pathname: '/(tabs)/projects', params: { selectedService: SERVICE_CARDS[0].service } })} />
          <DashboardCard {...SERVICE_CARDS[1]} count={getServiceCount(SERVICE_CARDS[1].service)} subtitle="Projects" onPress={() => router.push({ pathname: '/(tabs)/projects', params: { selectedService: SERVICE_CARDS[1].service } })} />
        </View>
        <View className="flex-row mt-2">
          <DashboardCard {...SERVICE_CARDS[2]} count={getServiceCount(SERVICE_CARDS[2].service)} subtitle="Projects" onPress={() => router.push({ pathname: '/(tabs)/projects', params: { selectedService: SERVICE_CARDS[2].service } })} />
          <DashboardCard {...SERVICE_CARDS[3]} count={getServiceCount(SERVICE_CARDS[3].service)} subtitle="Projects" onPress={() => router.push({ pathname: '/(tabs)/projects', params: { selectedService: SERVICE_CARDS[3].service } })} />
        </View>
      </View>
    </View>
  )
}

export default DashboardCard;