import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"

const ActivityItem = ({ icon, title, description, time, iconBg }) => {
  return (
    <View className="bg-white rounded-xl p-4 mb-3 flex-row items-center">
      <View className={`w-10 h-10 rounded-full ${iconBg} items-center justify-center mr-3`}>
        <MaterialIcons name={icon} size={20} color="white" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-semibold text-base">{title}</Text>
        <Text className="text-gray-600 text-sm mt-1">{description}</Text>
      </View>
      <Text className="text-gray-500 text-sm">{time}</Text>
    </View>
  )
}

export const activitiesData = [
  {
    icon: "person-add",
    title: "New Customer Created",
    description: "James Wilson has been added as a new customer.",
    time: "10:30 AM",
    iconBg: "bg-red-500",
  },
  {
    icon: "inventory",
    title: "Inventory Updated",
    description: "Received 20 new units of Sonos Beam Soundbar.",
    time: "09:45 AM",
    iconBg: "bg-red-500",
  },
  {
    icon: "check-circle",
    title: "Project Status Changed",
    description: "Project #PRJ-1234 has been marked as Complete.",
    time: "09:15 AM",
    iconBg: "bg-gray-800",
  },
  {
    icon: "engineering",
    title: "Installation Scheduled",
    description: "New installation scheduled for Theater Room Setup.",
    time: "08:30 AM",
    iconBg: "bg-blue-500",
  },
  {
    icon: "payment",
    title: "Payment Received",
    description: "Payment of $2,500 received for Project #PRJ-1234.",
    time: "Yesterday",
    iconBg: "bg-green-500",
  }
]

export const ActivitiesSection = () => {
  const router = useRouter();
  const recentActivities = activitiesData.slice(0, 3); 

  return (
    <View className="mt-8">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-gray-900 text-xl font-bold">Recent Activities</Text>
        <MaterialIcons name="chevron-right" size={24} color="#6b7280" />
      </View>
      <LinearGradient
        colors={["#DC2626", "#111827"]}
        style={{ borderRadius: 16 }}
        className="p-4"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View>
          {recentActivities.map((activity, index) => (
            <ActivityItem key={index} {...activity} />
          ))}
          
          <TouchableOpacity 
            onPress={() => router.push("/notifications")}
            className="bg-white/10 rounded-xl p-4 items-center"
          >
            <Text className="text-white font-medium">See More</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  )
}

export default ActivityItem