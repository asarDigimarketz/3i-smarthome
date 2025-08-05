import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../../utils/AuthContext';
import { API_CONFIG } from '../../../config';
import { getAccessibleRoutes } from '../../utils/permissions';
import { cn } from '../../utils/cn';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const router = useRouter();
  const { login } = useAuth();

  // Fetch logo from API
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch(`${API_CONFIG.API_URL}/api/settings/general`, {
          headers: { 'x-api-key': API_CONFIG.API_KEY }
        });
        
        if (response.ok) {
          const data = await response.json();
          const rawLogoUrl = data?.generalData?.logo;
          
          if (rawLogoUrl) {
            // Handle different URL formats and fix localhost issue
            let fullLogoUrl;
            if (rawLogoUrl.startsWith('http://') || rawLogoUrl.startsWith('https://')) {
              fullLogoUrl = rawLogoUrl.replace('http://localhost:5000', API_CONFIG.API_URL)
                                     .replace('https://localhost:5000', API_CONFIG.API_URL);
            } else if (rawLogoUrl.startsWith('/')) {
              fullLogoUrl = `${API_CONFIG.API_URL}${rawLogoUrl}`;
            } else {
              fullLogoUrl = `${API_CONFIG.API_URL}/${rawLogoUrl}`;
            }
            
            setLogoUrl(fullLogoUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching logo:', error);
      }
    };

    fetchLogo();
  }, []);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const result = await login(email.trim(), password);
      
      // Handle navigation based on user type and permissions
      if (result && result.user) {
        const user = result.user;
        console.log('👤 User login successful:', { 
          email: user.email, 
          isAdmin: user.isAdmin, 
        });
        
        const accessibleRoutes = getAccessibleRoutes(user);
        console.log('🛣️ Accessible routes count:', accessibleRoutes.length);
        
        // Permission-based navigation logic
        if (user.isAdmin || user.role === 'hotel admin') {
          // Admin users - go to tabs
          console.log('🔄 Redirecting admin user to tabs');
          setTimeout(() => {
            try {
              router.replace('/(tabs)' as any);
            } catch (error) {
              console.error('Navigation error:', error);
              // Fallback to splash screen which will handle navigation
              router.replace('/' as any);
            }
          }, 1000);
        } else {
          // Employee users - redirect to first accessible route
          if (accessibleRoutes.length > 0) {
            // Use the first accessible route from getAccessibleRoutes
            const firstRoute = accessibleRoutes[0];
            console.log(`🎯 First accessible route: ${firstRoute}`);
            
            // Map the route to the correct mobile path
            let targetRoute = null;
            
            switch (firstRoute) {
              case '/':
                targetRoute = '/(tabs)';
                break;
              case '/proposal':
                targetRoute = '/(tabs)/proposal';
                break;
              case '/projects':
                targetRoute = '/(tabs)/projects';
                break;
              case '/tasks':
                targetRoute = '/(tabs)/tasks';
                break;
              case '/customer':
                targetRoute = '/(tabs)/customer';
                break;
              case '/employee':
                targetRoute = '/(any)/employee';
                break;
              case '/notifications':
                targetRoute = '/(any)/notifications';
                break;
              case '/settings':
                targetRoute = '/(any)/settings';
                break;
              default:
                targetRoute = '/(tabs)';
            }
            
            console.log(`🚀 Navigating employee to: ${targetRoute}`);
            setTimeout(() => {
              try {
                router.replace(targetRoute as any);
              } catch (error) {
                console.error('Navigation error:', error);
                // Fallback to splash screen which will handle navigation
                router.replace('/' as any);
              }
            }, 1000);
          } else {
            // No accessible routes, redirect to login
            console.log('⚠️ No accessible routes, redirecting to login');
            setTimeout(() => {
              try {
                router.replace('/(auth)/login' as any);
              } catch (error) {
                console.error('Navigation error:', error);
                // Fallback to splash screen which will handle navigation
                router.replace('/' as any);
              }
            }, 1000);
          }
        }
      } else {
        console.error('❌ Invalid login result:', result);
        Alert.alert('Login Failed', 'Invalid response from server');
      }
      
    } catch (error: any) {
      console.error('Login error:', error.message);
      
      // Show user-friendly error messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message.includes('Invalid email or password')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.message.includes('Server error')) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#111827", "#DC2626"]}
      className="flex-1 justify-center items-center"
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{ width: '100%' }}
        extraScrollHeight={40}
      >
        {/* Logo at the top */}
        <View className="mb-8 items-center">
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              className="w-48 h-16 mb-6"
              resizeMode="contain"
              onError={() => {
                console.log('Failed to load logo, using fallback');
              }}
            />
          ) : (
            <Image
              source={require('../../../assets/icons/image15.png')}
              className="w-48 h-16 mb-6"
              resizeMode="contain"
            />
          )}
        </View>

        <View className="w-[90%] bg-white/95 p-6 shadow-2xl items-start rounded-2xl">  
          <Text className="text-3xl font-bold text-gray-800 mb-1 items-start">Login</Text>
          <Text className="text-base text-gray-500 mb-6">Welcome to the 3i Smart Home App!</Text>

          <View className="w-full mb-4">
            <TextInput
              mode="outlined"
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon={() => <Mail size={20} color="#000" />} />}
              outlineColor="#e5e7eb"
              activeOutlineColor="#DC2626"
            />
          </View>

          <View className="w-full mb-4">
            <TextInput
              mode="outlined"
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              left={<TextInput.Icon icon={() => <Lock size={20} color="#000" />} />}
              right={
                <TextInput.Icon 
                  icon={() => showPassword ? <EyeOff size={20} color="#000" /> : <Eye size={20} color="#000" />} 
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              outlineColor="#e5e7eb"
              activeOutlineColor="#DC2626"
            />
          </View>

          <TouchableOpacity className="self-end mb-4" onPress={() => router.push('/(auth)/forgot-password')}>
            <Text className="text-red-600 font-medium">Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className={cn(
              "bg-[#c00509] rounded-xl py-3.5 items-center w-full mt-2",
              loading && "bg-gray-400"
            )} 
            onPress={handleSubmit} 
            disabled={loading}
          >
            <Text className="text-white text-lg font-bold">
              {loading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
}