import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ArrowLeft, Upload } from 'lucide-react-native'
import * as DocumentPicker from 'expo-document-picker'

export default function NotificationConfiguration() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    projectId: '',
    serviceFile: null
  })

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json'
      })
      
      if (result.type === 'success') {
        setFormData(prev => ({
          ...prev,
          serviceFile: result
        }))
      }
    } catch (err) {
      console.log('Document picking error:', err)
    }
  }

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
        {/* Firebase Project ID */}
        <View className="mb-6">
          <Text className="text-gray-600 mb-2 text-base">Firebase Project Id</Text>
          <TextInput
            className="h-12 px-4 border border-gray-200 rounded-full text-gray-900"
            placeholder="Enter Project Id"
            value={formData.projectId}
            onChangeText={(text) => setFormData(prev => ({...prev, projectId: text}))}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Firebase Service File Upload */}
        <View className="mb-6">
          <Text className="text-gray-600 mb-2 text-base">Firebase Service File</Text>
          <View className="flex-row items-center space-x-4 gap-2">
            <TextInput
              className="flex-1 h-12 px-4 border border-gray-200 rounded-full text-gray-900"
              placeholder="Upload Json File Only"
              value={formData.serviceFile?.name || ''}
              editable={false}
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity 
              className="bg-red-600 h-12 px-6 rounded-full items-center justify-center"
              onPress={pickDocument}
            >
              <Text className="text-white font-medium">Upload</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sample Service File Link */}
        <TouchableOpacity className="mb-8">
          <Text className="text-red-600 text-base">Sample Service File</Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View className="flex-row justify-center space-x-4 gap-2">
          <TouchableOpacity 
            className="bg-red-600 px-8 py-3 rounded-full"
            onPress={() => {
              // Handle save
              console.log('Saving configuration:', formData)
            }}
          >
            <Text className="text-white font-medium">Save</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-gray-500 px-8 py-3 rounded-full"
            onPress={() => router.back()}
          >
            <Text className="text-white font-medium">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}