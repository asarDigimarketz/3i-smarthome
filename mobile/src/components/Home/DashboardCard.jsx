import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from "react-native";
import { projectData } from '../../data/mockData';

// Update the getServiceCount function to use service parameter
const getServiceCount = (serviceType) => {
  return projectData.filter(project => project.service === serviceType).length;
};

const DashboardCard = ({ title, service, count, subtitle, colors }) => {
  const router = useRouter();

  const handleCardPress = () => {
    // Navigate to projects tab and pass the service type as a parameter
    router.push({
      pathname: '/(tabs)/projects',
      params: { selectedService: service } // Use service instead of title
    });
  };

  return (
    <TouchableOpacity 
      onPress={handleCardPress}
      activeOpacity={0.8}
      className="flex-1"
    >
      <LinearGradient
        colors={colors}
        className="p-4 m-1 min-h-[120px] shadow-lg"
        style={{ borderRadius: 16 }}  // equivalent to rounded-2xl (16px)
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
  return (
    <View className="mt-6 ">
      <Text className="text-gray-900 text-xl font-bold mb-4">Dashboard</Text>
      <View className="bg-[#f9f9f9] rounded-3xl p-2">
            <View className="flex-row">
              <DashboardCard {...dashboardData[0]} />
              <DashboardCard {...dashboardData[1]} />
            </View>
            <View className="flex-row mt-2">
              <DashboardCard {...dashboardData[2]} />
              <DashboardCard {...dashboardData[3]} />
            </View>
      </View>
    </View>
  )
}

// Update the dashboardData array with different title but matching service
export const dashboardData = [
  {
    title: "Home Cinema",
    service: "Home Cinema",
    count: getServiceCount("Home Cinema").toString(),
    subtitle: "Projects",
    colors: ["#613eff", "#9cbbff"]
  },
  {
    title: "Security System",
    service: "Security System",
    count: getServiceCount("Security System").toString(),
    subtitle: "Projects",
    colors: ["#014c95", "#36b9f6"]
  },
  {
    title: "Home Automation",
    service: "Home Automation",
    count: getServiceCount("Home Automation").toString(),
    subtitle: "Projects",
    colors: ["#026b87", "#5deaff"]
  },
  {
    title: "Outdoor Audio Solutions",
    service: "Outdoor Audio", 
    count: getServiceCount("Outdoor Audio").toString(),
    subtitle: "Projects",
    colors: ["#df2795", "#eb7ab7"]
  }
];

export default DashboardCard