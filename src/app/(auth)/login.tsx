import { useRouter } from 'expo-router'
import { Eye, EyeOff, Home, Lock } from 'lucide-react-native'
import { useState, useEffect } from 'react'
import { Image, Text, TouchableOpacity, View, Platform, ActivityIndicator } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { TextInput } from 'react-native-paper'
import { LinearGradient } from 'expo-linear-gradient'
import axios from 'axios'
import { API_CONFIG } from '../../../config'

export default function Login() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // Fetch logo from API
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        setLoading(true)
        console.log('🔄 Fetching logo from API for Login...')
        
        const response = await axios.get(
          `${API_CONFIG.API_URL}/api/settings/general`,
          {
            headers: {
              'x-api-key': API_CONFIG.API_KEY,
            },
            timeout: 10000,
          }
        )

        if (response.data.success && response.data.generalData) {
          const generalData = response.data.generalData
          const rawLogoUrl = generalData.logoUrl || generalData.logo
          
          if (rawLogoUrl) {
            // Handle different URL formats and fix localhost issue
            let fullLogoUrl
            if (rawLogoUrl.startsWith('http://') || rawLogoUrl.startsWith('https://')) {
              fullLogoUrl = rawLogoUrl.replace('http://localhost:5000', API_CONFIG.API_URL)
                                     .replace('https://localhost:5000', API_CONFIG.API_URL)
            } else if (rawLogoUrl.startsWith('/')) {
              fullLogoUrl = `${API_CONFIG.API_URL}${rawLogoUrl}`
            } else {
              fullLogoUrl = `${API_CONFIG.API_URL}/${rawLogoUrl}`
            }
            
            console.log('✅ Login Logo URL found:', fullLogoUrl)
            setLogoUrl(fullLogoUrl)
          }
        }
      } catch (error) {
        console.error('❌ Error fetching logo for Login:', error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLogo()
  }, [])

  return (
    <LinearGradient
      colors={["#030303", "#4d0f10"]}
      style={{ flex: 1 }}
    >
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={Platform.OS === 'ios' ? 100 : 0}
        enableOnAndroid={true}
      >
        <View className="flex-1 justify-center items-center px-6">
          {/* Logo */}
          <View className="items-center mb-6">
            {loading ? (
              <View className="w-[220px] h-[90px] items-center justify-center">
                <ActivityIndicator size="large" color="white" />
              </View>
            ) : (
              <Image 
                source={
                  logoUrl 
                    ? { uri: logoUrl }
                    : require('../../../assets/icons/image15.png')
                }
                className="w-[220px] h-[90px]"
                resizeMode="contain"
                onError={() => {
                  console.log('❌ Failed to load logo in Login, using fallback')
                }}
              />
            )}
          </View>

          {/* Form Container */}
          <View className="w-full bg-transparent p-6  mb-6">
            <Text className="text-[28px] font-bold text-gray-200 mb-1 text-start">
              Login
            </Text>
            <Text className="text-base text-gray-300 mb-2 text-start">
              Welcome to the 3i Smart Home App!
            </Text>

            {/* Login Form */}
            <View className="space-y-4">
              <View className={`${focusedInput === 'email' || formData.email ? 'bg-white rounded-lg p-2 mb-2' : 'bg-transparent'}`}>
                <TextInput
                  mode="outlined"
                  label="Email Id"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  left={<TextInput.Icon icon={() => <Home size={20} color="#272523" />} />}
                  outlineStyle={{ borderRadius: 10 }}
                  outlineColor="#272523"
                  activeOutlineColor="#c92125"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{ marginBottom: 10 }}
                />
              </View>
              <View className={`${focusedInput === 'password' || formData.password ? 'bg-white rounded-lg p-2' : 'bg-transparent'}`}>
                <TextInput
                  mode="outlined"
                  label="Password"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  secureTextEntry={!showPassword}
                  left={<TextInput.Icon icon={() => <Lock size={20} color="#272523" />} />}
                  right={
                    <TextInput.Icon
                      icon={() => showPassword ?
                        <EyeOff size={20} color="#272523" /> :
                        <Eye size={20} color="#272523" />
                      }
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  outlineStyle={{ borderRadius: 10 }}
                  outlineColor="#272523"
                  activeOutlineColor="#c92125"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Forgot Password */}
            <View className="flex-row justify-between items-center mt-4 mb-4">
              <Text className="text-gray-300 text-sm">Forgot your password?</Text>
              <TouchableOpacity>
                <Text className="text-[#c92125] font-medium text-sm">Change password</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className="bg-[#c92125] h-13 rounded-lg items-center justify-center mt-2 shadow-md p-4"
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.85}
            >
              <Text className="text-white text-lg font-semibold">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </LinearGradient>
  )
}