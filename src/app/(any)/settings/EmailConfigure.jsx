import { useRouter } from 'expo-router'
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react-native'
import React, { useState, useEffect } from 'react'
import { Text, TouchableOpacity, View, Alert, ActivityIndicator, ScrollView } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { TextInput, Button } from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import axios from 'axios'
import { API_CONFIG } from '../../../../config'

const emailProviders = [
  { label: "Gmail", value: "gmail", host: "smtp.gmail.com", port: "587" },
  {
    label: "Outlook/Office365",
    value: "outlook",
    host: "smtp.office365.com",
    port: "587",
  },
  {
    label: "Yahoo Mail",
    value: "yahoo",
    host: "smtp.mail.yahoo.com",
    port: "587",
  },
  { label: "Custom SMTP", value: "custom", host: "", port: "" },
]

const EmailProviderInstructions = ({ selectedProvider }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const instructions = {
    gmail: {
      title: "Gmail Setup Guide",
      steps: [
        "1. Enable 2-Step Verification in Google Account Security settings",
        "2. Generate App Password from Security → App Passwords",
        "3. Use smtp.gmail.com, port 587, your Gmail address, and App Password"
      ],
    },
    outlook: {
      title: "Outlook/Office365 Setup Guide",
      steps: [
        "1. Enable 2-Step Verification in Microsoft Account Security",
        "2. Create App Password from Security settings",
        "3. Use smtp.office365.com, port 587, complete email address"
      ],
    },
    yahoo: {
      title: "Yahoo Mail Setup Guide",
      steps: [
        "1. Enable 2-Step Verification in Yahoo Account Security",
        "2. Generate App Password from Security settings",
        "3. Use smtp.mail.yahoo.com, port 587, full Yahoo email"
      ],
    },
  }

  if (!selectedProvider || selectedProvider === "custom") return null
  const guide = instructions[selectedProvider]

  return (
    <View className="mb-4 bg-blue-50 rounded-lg overflow-hidden">
      <TouchableOpacity 
        className="bg-blue-100 p-4 flex-row justify-between items-center"
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View className="flex-row items-center">
          {isExpanded ? (
            <ChevronDown size={16} color="#1e40af" />
          ) : (
            <ChevronRight size={16} color="#1e40af" />
          )}
          <Text className="text-blue-900 font-medium text-base ml-2">{guide.title}</Text>
        </View>
        <Text className="text-blue-600 text-sm">
          {isExpanded ? "Hide" : "Show"}
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <View className="p-4 space-y-2">
          {guide.steps.map((step, index) => (
            <Text key={index} className="text-blue-700 text-sm leading-5 mb-2">
              {step}
            </Text>
          ))}
        </View>
      )}
    </View>
  )
}

export default function EmailConfiguration() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [selectedProvider, setSelectedProvider] = useState("custom")
  const [showProviderDropdown, setShowProviderDropdown] = useState(false)
  
  const [formData, setFormData] = useState({
    smtpHost: '',
    smtpPort: '',
    smtpUsername: '',
    smtpPassword: '',
    senderEmail: ''
  })

  const [testData, setTestData] = useState({
    email: '',
    message: ''
  })

  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [error, setError] = useState(null)

  // API configuration
  const { API_URL, API_KEY } = API_CONFIG

  useEffect(() => {
    fetchEmailConfig()
  }, [])

  const fetchEmailConfig = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${API_URL}/api/settings/emailConfiguration`,
        {
          headers: {
            "x-api-key": API_KEY,
          },
        }
      )
      if (response.data.success && response.data.emailConfig) {
        setFormData(response.data.emailConfig)
      }
    } catch (err) {
      setError(err.message || "Failed to load email configuration")
    } finally {
      setLoading(false)
    }
  }

  const handleProviderChange = (provider) => {
    setSelectedProvider(provider.value)
    setShowProviderDropdown(false)
    
    if (provider.value !== "custom") {
      setFormData(prev => ({
        ...prev,
        smtpHost: provider.host,
        smtpPort: provider.port,
      }))
    }
  }

  const handleSave = async () => {
    try {
      setSaveLoading(true)
      setError(null)
      
      const response = await axios.post(
        `${API_URL}/api/settings/emailConfiguration`,
        formData,
        {
          headers: {
            "x-api-key": API_KEY,
          },
        }
      )
      
      if (response.data.success) {
        Alert.alert("Success", "Email configuration saved successfully")
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to save settings"
      setError(errorMessage)
      Alert.alert("Error", errorMessage)
    } finally {
      setSaveLoading(false)
    }
  }

  const handleTestEmail = async () => {
    if (!testData.email || !testData.email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address")
      return
    }

    try {
      setTestLoading(true)
      setError(null)
      
      const response = await axios.put(
        `${API_URL}/api/settings/emailConfiguration`,
        {
          testEmail: testData.email,
          message: testData.message || "This is a test email from your email configuration.",
        },
        {
          headers: {
            "x-api-key": API_KEY,
          },
        }
      )
      
      if (response.data.success) {
        Alert.alert("Success", "Test email sent successfully")
        setTestData({ email: '', message: '' })
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.details || err.message || "Failed to send test email"
      setError(errorMessage)
      Alert.alert("Error", errorMessage)
    } finally {
      setTestLoading(false)
    }
  }

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#DC2626" />
        <Text className="mt-4 text-gray-600">Loading email configuration...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Email Configuration</Text>
      </View>

      <KeyboardAwareScrollView 
        className="flex-1 p-4"
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={160}
      >
        {/* Error Display */}
        {error && (
          <View className="bg-red-50 p-4 rounded-lg mb-4 border border-red-200">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}

        {/* Email Provider Selection */}
        <View className="mb-6">
          <Text className="text-base font-medium text-gray-900 mb-2">Email Provider</Text>
          <TouchableOpacity
            className="border border-gray-300 rounded-lg p-4 flex-row justify-between items-center bg-white"
            onPress={() => setShowProviderDropdown(!showProviderDropdown)}
          >
            <Text className="text-gray-900">
              {emailProviders.find(p => p.value === selectedProvider)?.label || "Select Provider"}
            </Text>
            <ChevronDown size={20} color="#6B7280" />
          </TouchableOpacity>

          {showProviderDropdown && (
            <View className="border border-gray-300 rounded-lg mt-1 bg-white">
              {emailProviders.map((provider) => (
                <TouchableOpacity
                  key={provider.value}
                  className="p-4 border-b border-gray-100 last:border-b-0"
                  onPress={() => handleProviderChange(provider)}
                >
                  <Text className={`${selectedProvider === provider.value ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                    {provider.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Provider Instructions */}
        <EmailProviderInstructions selectedProvider={selectedProvider} />

        {/* SMTP Configuration Form */}
        <View className="space-y-4">
          {/* SMTP Host */}
          <View className="mb-4">
            <TextInput
              mode="outlined"
              label="SMTP Host"
              placeholder="smtp.gmail.com"
              value={formData.smtpHost}
              onChangeText={(text) => setFormData({...formData, smtpHost: text})}
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>

          {/* SMTP Port */}
          <View className="mb-4">
            <TextInput
              mode="outlined"
              label="SMTP Port"
              placeholder="587"
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
              placeholder="your.email@gmail.com"
              value={formData.smtpUsername}
              onChangeText={(text) => setFormData({...formData, smtpUsername: text})}
              keyboardType="email-address"
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>

          {/* SMTP Password */}
          <View className="mb-4">
            <TextInput
              mode="outlined"
              label="SMTP Password"
              placeholder="App Password or Email Password"
              value={formData.smtpPassword}
              onChangeText={(text) => setFormData({...formData, smtpPassword: text})}
              secureTextEntry
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>

          {/* Sender Email */}
          <View className="mb-4">
            <TextInput
              mode="outlined"
              label="Sender Email"
              placeholder="noreply@example.com"
              value={formData.senderEmail}
              onChangeText={(text) => setFormData({...formData, senderEmail: text})}
              keyboardType="email-address"
              outlineColor="#d1d5db"
              activeOutlineColor="#DC2626"
            />
          </View>
        </View>

        {/* Email Verification Section */}
        <View className="mt-8 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            Test Email Configuration
          </Text>

          <View className="space-y-4">
            {/* Test Email */}
            <View className="mb-4">
              <TextInput
                mode="outlined"
                label="Test Email Address"
                placeholder="test@example.com"
                value={testData.email}
                onChangeText={(text) => setTestData({...testData, email: text})}
                keyboardType="email-address"
                outlineColor="#d1d5db"
                activeOutlineColor="#DC2626"
              />
            </View>

            {/* Test Message */}
            <View className="mb-4">
              <TextInput
                mode="outlined"
                label="Test Message (Optional)"
                placeholder="Enter test message"
                value={testData.message}
                onChangeText={(text) => setTestData({...testData, message: text})}
                multiline
                numberOfLines={3}
                outlineColor="#d1d5db"
                activeOutlineColor="#DC2626"
              />
            </View>

            {/* Test Button */}
            <Button
              mode="contained"
              onPress={handleTestEmail}
              loading={testLoading}
              disabled={testLoading}
              buttonColor="#DC2626"
              className="mb-4"
            >
              {testLoading ? "Sending Test Email..." : "Send Test Email"}
            </Button>
          </View>
        </View>

        {/* Action Buttons */}
        <View 
          className="flex-row justify-center space-x-4 my-6 gap-4"
          style={{ paddingBottom: insets.bottom + 20 }}
        >
          <Button
            mode="contained"
            onPress={handleSave}
            loading={saveLoading}
            disabled={saveLoading}
            buttonColor="#DC2626"
            className="flex-1"
          >
            {saveLoading ? "Saving..." : "Save Configuration"}
          </Button>

          <Button
            mode="outlined"
            onPress={() => router.back()}
            textColor="#6B7280"
            className="flex-1"
          >
            Cancel
          </Button>
        </View>
      </KeyboardAwareScrollView>
    </View>
  )
}