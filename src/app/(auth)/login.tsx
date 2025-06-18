import { useRouter } from 'expo-router'
import { Eye, EyeOff, Home, Lock } from 'lucide-react-native'
import { useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { TextInput } from 'react-native-paper'

export default function Login() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  return (
    <View className="flex-1 bg-white p-4 px-4">
      {/* Logo */}
      <View className="items-center mb-12 mt-20">
        <Image 
          source={require('../../../assets/icons/image16.png')}
          className="w-[280px] h-[120px]"
          resizeMode="contain"
        />
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled" 
        contentContainerStyle={{ flexGrow: 1 }}
        extraScrollHeight={100}
        enableOnAndroid={true}
      >
            {/* Login Text */}
      <Text className="text-3xl font-bold text-gray-900 mb-2">Login</Text>
      <Text className="text-lg text-gray-600 mb-8">Welcome to the 3i Smart Home App!</Text>

      {/* Login Form */}
      <View className="space-y-4">
        <View className="mb-4">
          <TextInput
            mode="outlined"
            label="Email Id"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            left={<TextInput.Icon icon={() => <Home size={20} color="#666666" />} />}
            outlineStyle={{ borderRadius: 10 }}
            outlineColor="#272523"
            activeOutlineColor="#c92125"
          />
        </View>
        <View className="mb-4">
        <TextInput
          mode="outlined"
          label="Password"
          value={formData.password}
          onChangeText={(text) => setFormData({...formData, password: text})}
          secureTextEntry={!showPassword}
          left={<TextInput.Icon icon={() => <Lock size={20} color="#666666" />} />}
          right={
            <TextInput.Icon 
              icon={() => showPassword ? 
                <EyeOff size={20} color="#666666" /> : 
                <Eye size={20} color="#666666" />
              } 
              onPress={() => setShowPassword(!showPassword)}
            />
          }
          outlineStyle={{ borderRadius: 10 }}
          outlineColor="#272523"
          activeOutlineColor="#c92125"
        />
        </View>
      </View>

      {/* Forgot Password */}
      <View className="flex-row items-center justify-between mt-4 mb-8">
        <Text className="text-gray-600">Forgot your password?</Text>
        <TouchableOpacity>
          <Text className="text-[#c92125] font-medium">change password</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        className="bg-[#272523] h-14 rounded-full items-center justify-center"
        onPress={() => router.push('/(tabs)')}  // Changed from '/(tabs)/home' to '/(tabs)'
      >
        <Text className="text-white text-lg font-medium">Login</Text>
      </TouchableOpacity>
      </KeyboardAwareScrollView>  
    </View>
  )
}