import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, User2 } from 'lucide-react-native';

const notificationsData = [
  {
    id: 'PROJ01',
    title: 'Project Status Changed - PROJ01',
    description: '#Arun- Site Visit - Completed',
    time: '10:30 AM',
    type: 'status'
  },
  {
    id: 'PROJ05',
    title: 'New Project Created - PROJ05',
    description: '#Admin- Home Automation Project Created',
    time: '09:45 AM',
    type: 'new'
  },
  {
    id: 'PROJ03',
    title: 'Project Status Changed - PROJ03',
    description: '#Bala-Has been marked as Complete.',
    time: '09:15 AM',
    type: 'status'
  },
  {
    id: 'PROJ02',
    title: 'Employee Status Changed - EMP001',
    description: '#HR- Arun marked as Active',
    time: '08:45 AM',
    type: 'status'
  },
  {
    id: 'PROJ04',
    title: 'New Employee Added - EMP005',
    description: '#Admin- Kumar P has been added to the team',
    time: '08:15 AM',
    type: 'new'
  }
];

const NotificationItem = ({ title, description, time, type }) => (
  <TouchableOpacity className="bg-gray-200 rounded-2xl p-4 mb-3 shadow-lg">
    <View className="flex-row items-start">
      {/* Avatar */}
      <View className={`w-12 h-12 rounded-full ${type === 'new' ? 'bg-red-600' : 'bg-gray-900'} items-center justify-center`}>
        <User2 size={24} color="white" />
      </View>

      {/* Content */}
      <View className="flex-1 ml-3">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-2">
            <Text className="text-gray-900 font-semibold text-base">{title}</Text>
            <Text className="text-gray-500 mt-1 text-sm">{description}</Text>
          </View>
          <Text className="text-gray-500 text-sm">{time}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Notifications</Text>
          </View>
        </View>

        {/* Notifications List */}
        <ScrollView 
          className="flex-1 px-4 pt-3" 
          showsVerticalScrollIndicator={false}
        >
          {notificationsData.map((notification) => (
            <NotificationItem key={notification.id} {...notification} />
          ))}
        </ScrollView>
    </View>
  );
}