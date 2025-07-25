import { useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { TextInput } from 'react-native-paper'

export default function NotificationConfiguration() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: false
  })

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Setting - Notification Configuration</Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Email Notifications */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Email Notifications</Text>
          <View className="bg-gray-50 p-4 rounded-lg">
            <Text className="text-gray-700 mb-2">Receive notifications via email</Text>
            <TouchableOpacity 
              className={`w-16 h-8 rounded-full ${formData.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'}`}
              onPress={() => setFormData(prev => ({...prev, emailNotifications: !prev.emailNotifications}))}
            >
              <View className={`w-6 h-6 bg-white rounded-full m-1 ${formData.emailNotifications ? 'ml-auto' : 'mr-auto'}`} />
            </TouchableOpacity>
          </View>
        </View>

        {/* SMS Notifications */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">SMS Notifications</Text>
          <View className="bg-gray-50 p-4 rounded-lg">
            <Text className="text-gray-700 mb-2">Receive notifications via SMS</Text>
            <TouchableOpacity 
              className={`w-16 h-8 rounded-full ${formData.smsNotifications ? 'bg-blue-600' : 'bg-gray-300'}`}
              onPress={() => setFormData(prev => ({...prev, smsNotifications: !prev.smsNotifications}))}
            >
              <View className={`w-6 h-6 bg-white rounded-full m-1 ${formData.smsNotifications ? 'ml-auto' : 'mr-auto'}`} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Push Notifications */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Push Notifications</Text>
          <View className="bg-gray-50 p-4 rounded-lg">
            <Text className="text-gray-700 mb-2">Receive push notifications (Currently disabled)</Text>
            <TouchableOpacity 
              className="w-16 h-8 rounded-full bg-gray-300"
              disabled={true}
            >
              <View className="w-6 h-6 bg-white rounded-full m-1 mr-auto" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-center space-x-4 gap-2 mt-6">
          <TouchableOpacity 
            className="bg-blue-600 px-8 py-3 rounded-lg"
            onPress={() => {
              // Handle save
              console.log('Saving notification configuration:', formData)
            }}
          >
            <Text className="text-white font-medium">Save Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-gray-500 px-8 py-3 rounded-lg"
            onPress={() => router.back()}
          >
            <Text className="text-white font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}