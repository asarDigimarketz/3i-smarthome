import { View, Text } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

const DashboardCard = ({ title, count, subtitle, colors }) => {
  return (
    <LinearGradient
      colors={colors}
      className="flex-1 p-4 m-1 min-h-[120px]"
      style={{ borderRadius: 16 }}  // equivalent to rounded-2xl (16px)
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <Text className="text-white text-base font-medium mb-2">{title}</Text>
      <View className="flex-row items-end mb-2">
        <Text className="text-white text-3xl font-bold">{count}</Text>
        <Text className="text-white/80 text-sm ml-2 mb-1">{subtitle}</Text>
      </View>
    </LinearGradient>
  )
}

export const DashboardSection = () => {
  return (
    <View className="mt-6 ">
      <Text className="text-gray-900 text-xl font-bold mb-4">Dashboard</Text>
      <View className="bg-gray-200 rounded-3xl p-2">
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

export const dashboardData = [
  {
    title: "Home Cinema",
    count: "24",
    subtitle: "Projects",
    colors: ["#613eff", "#9cbbff"]
  },
  {
    title: "Security System",
    count: "31",
    subtitle: "Projects",
    colors: ["#026b87", "#5deaff"]
  },
  {
    title: "Home Automation",
    count: "18",
    subtitle: "Projects",
    colors: ["#014c95", "#36b9f6"]
  },
  {
    title: "Outdoor Audio Solution",
    count: "3",
    subtitle: "Projects",
    colors: ["#df2795", "#eb7ab7"]
  }
]

export default DashboardCard