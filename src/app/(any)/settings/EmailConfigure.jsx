import { useRouter } from 'expo-router'
import { ArrowLeft, ChevronDown } from 'lucide-react-native'
import { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { TextInput } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const encryptionOptions = [
  { value: 'TLS', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { value: 'SSL', color: 'text-green-600', bgColor: 'bg-green-50' },
  { value: 'None', color: 'text-gray-600', bgColor: 'bg-gray-50' }
];

export default function EmailConfiguration() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [showEncryptionDropdown, setShowEncryptionDropdown] = useState(false)
  
  const [formData, setFormData] = useState({
    serverAddress: '',
    smtpPort: '',
    smtpUsername: '',
    smtpPassword: '',
    encryption: '',
    senderEmail: '',
    testMessage: ''
  })

  const handleEncryptionSelect = (option) => {
    setFormData(prev => ({ ...prev, encryption: option.value }));
    setShowEncryptionDropdown(false);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Setting - Email Configuration</Text>
      </View>

      <KeyboardAwareScrollView 
        className="flex-1 p-4"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={160}
      >
        {/* SMTP Configuration Form */}
        <View className="space-y-4">
          {/* SMTP Server */}
          <View className="mb-4">
            <TextInput
              mode="outlined"
              label="SMTP Server"
              placeholder="Enter Server Address"
              value={formData.serverAddress}
              onChangeText={(text) => setFormData({...formData, serverAddress: text})}
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>

          {/* SMTP Port */}
          <View className="mb-4">
            <TextInput
              mode="outlined"
              label="SMTP Port"
              placeholder="Enter SMTP Port"
              value={formData.smtpPort}
              onChangeText={(text) => setFormData({...formData, smtpPort: text})}
              keyboardType="number-pad"
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>

          {/* SMTP Username */}
          <View className="mb-4">
            <TextInput
              mode="outlined"
              label="SMTP Username"
              placeholder="Enter SMTP Username"
              value={formData.smtpUsername}
              onChangeText={(text) => setFormData({...formData, smtpUsername: text})}
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>

          {/* SMTP Password */}
          <View className="mb-4">
            <TextInput
              mode="outlined"
              label="SMTP Password"
              placeholder="Enter SMTP Password"
              value={formData.smtpPassword}
              onChangeText={(text) => setFormData({...formData, smtpPassword: text})}
              secureTextEntry
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>

          {/* Encryption Dropdown */}
          <View className="relative z-50">
            <Text className="text-gray-600 mb-2 text-base">Encryption</Text>
            <TouchableOpacity
              onPress={() => setShowEncryptionDropdown(!showEncryptionDropdown)}
              className="h-12 px-4 border border-gray-200 rounded-lg flex-row items-center justify-between"
            >
              <Text className={`${
                formData.encryption ? 
                  encryptionOptions.find(opt => opt.value === formData.encryption)?.color || 
                  'text-gray-500' : 
                  'text-gray-500'
              } text-base font-medium`}>
                {formData.encryption || 'Select Encryption'}
              </Text>
              <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>

            {showEncryptionDropdown && (
              <View className="absolute top-24 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-100">
                {encryptionOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleEncryptionSelect(option)}
                    className={`px-4 py-3 border-b border-gray-100 flex-row items-center justify-between ${option.bgColor}`}
                  >
                    <Text className={`${option.color} text-base font-medium`}>
                      {option.value}
                    </Text>
                    {formData.encryption === option.value && (
                      <View className={`w-2 h-2 rounded-full ${option.color.replace('text', 'bg')}`} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-center space-x-4 my-6 gap-2">
          <TouchableOpacity 
            className="bg-red-600 px-8 py-3 rounded-lg"
            onPress={() => {/* Handle save */}}
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

        {/* Email Verification Section */}
        <View 
          className="mt-6"
          style={{ paddingBottom: insets.bottom + 20 }}
        >
          <Text className="text-xl font-bold text-gray-900 mb-6">
            Email Configuration Verification
          </Text>

          <View className="space-y-4">
            {/* Sender Email */}
            <View className="mb-4">
              <TextInput
                mode="outlined"
                label="Sender Email"
                placeholder="Email Address"
                value={formData.senderEmail}
                onChangeText={(text) => setFormData({...formData, senderEmail: text})}
                keyboardType="email-address"
                outlineColor="#d1d5db"
                activeOutlineColor="#DC2626"
              />
            </View>

            {/* Test Mail */}
            <View className="flex-row items-center space-x-4 gap-2">
              <View className="flex-1">
                <TextInput
                  mode="outlined"
                  label="Test Mail"
                  placeholder="Test Message"
                  value={formData.testMessage}
                  onChangeText={(text) => setFormData({...formData, testMessage: text})}
                  outlineColor="#d1d5db"
                  activeOutlineColor="#DC2626"
                />
              </View>
              <TouchableOpacity 
                className="bg-red-600 h-12 px-6 rounded-lg items-center justify-center self-end"
                onPress={() => {/* Handle verify */}}
              >
                <Text className="text-white font-medium">Verify</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  )
}