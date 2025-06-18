import * as DocumentPicker from 'expo-document-picker'
import { useRouter } from 'expo-router'
import { ArrowLeft, X } from 'lucide-react-native'
import { useState } from 'react'
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { TextInput } from 'react-native-paper'

export default function NotificationConfiguration() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    projectId: '',
    serviceFile: null
  })
  const [showSample, setShowSample] = useState(false)

  const sampleJson = `{
    "type": "service_account",
    "project_id": "",
    "private_key_id": "",
    "private_key": "-----BEGIN PRIVATE KEY----------END PRIVATE KEY-----\\n",
    "client_email": "",
    "client_id": "",
    "auth_uri": "",
    "token_uri": "",
    "auth_provider_x509_cert_url": "",
    "client_x509_cert_url": "",
    "universe_domain": "googleapis.com"
  }`

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
          <TextInput
            mode="outlined"
            label="Firebase Project Id"
            placeholder="Enter Project Id"
            value={formData.projectId}
            onChangeText={(text) => setFormData(prev => ({...prev, projectId: text}))}
            outlineColor="#E5E7EB"
            activeOutlineColor="#DC2626"
          />
        </View>

        {/* Firebase Service File Upload */}
        <View className="mb-6">
          <View className="flex-row items-center space-x-4 gap-2">
            <TextInput
              mode="outlined"
              label="Firebase Service File"
              placeholder="Upload Json File Only"
              value={formData.serviceFile?.name || ''}
              editable={false}
              outlineColor="#E5E7EB"
              activeOutlineColor="#DC2626"
            />
            <TouchableOpacity 
              className="bg-red-600 h-12 px-6 rounded-lg items-center justify-center"
              onPress={pickDocument}
            >
              <Text className="text-white font-medium">Upload</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sample Service File Link */}
        <TouchableOpacity 
          className="mb-8"
          onPress={() => setShowSample(true)}
        >
          <Text className="text-red-600 text-base">Sample Service File</Text>
        </TouchableOpacity>

        {/* Sample JSON Modal */}
        <Modal
          visible={showSample}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSample(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center p-4">
            <View className="bg-white w-full max-w-lg rounded-xl p-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-gray-900">Sample Service Account JSON</Text>
                <TouchableOpacity 
                  onPress={() => setShowSample(false)}
                  className="p-2"
                >
                  <X size={24} color="#111827" />
                </TouchableOpacity>
              </View>
              <ScrollView 
                className="bg-gray-50 rounded-lg p-4"
                showsVerticalScrollIndicator={false}
              >
                <Text className="text-gray-700 font-mono">{sampleJson}</Text>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Action Buttons */}
        <View className="flex-row justify-center space-x-4 gap-2">
          <TouchableOpacity 
            className="bg-red-600 px-8 py-3 rounded-lg"
            onPress={() => {
              // Handle save
              console.log('Saving configuration:', formData)
            }}
          >
            <Text className="text-white font-medium">Save</Text>
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