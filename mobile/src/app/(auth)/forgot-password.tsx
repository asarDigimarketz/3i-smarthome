import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Mail, KeyRound, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { cn } from '../../utils/cn';

// Password validation function similar to client
const validatePassword = (password: string) => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Requirement item component
const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
  <View className="flex-row items-center gap-1.5">
    <View className={`h-1.5 w-1.5 rounded-full ${met ? "bg-green-400" : "bg-red-400"}`} />
    <Text className={`text-xs ${met ? "text-green-400" : "text-red-400"}`}>{text}</Text>
  </View>
);

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const handlePasswordChange = (password: string) => {
    setNewPassword(password);
    const { errors } = validatePassword(password);
    setPasswordErrors(errors);
  };

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (process.env.EXPO_PUBLIC_API_KEY) {
        headers['x-api-key'] = process.env.EXPO_PUBLIC_API_KEY;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/mobile-forgot-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'OTP sent to your email successfully');
        setStep(2);
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (process.env.EXPO_PUBLIC_API_KEY) {
        headers['x-api-key'] = process.env.EXPO_PUBLIC_API_KEY;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/mobile-verify-otp`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          email: email.trim(),
          otp: otp.trim() 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTempToken(data.tempToken);
        setStep(3);
      } else {
        Alert.alert('Error', data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    const { isValid } = validatePassword(newPassword);
    if (!isValid) {
      Alert.alert('Invalid Password', 'Please ensure your password meets all requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (process.env.EXPO_PUBLIC_API_KEY) {
        headers['x-api-key'] = process.env.EXPO_PUBLIC_API_KEY;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/mobile-reset-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          tempToken,
          newPassword: newPassword.trim() 
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Password reset successfully', [
          {
            text: 'OK',
            onPress: () => router.replace('/login')
          }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View className="flex-1 justify-center px-6">
      <View className="mb-8">
        <Text className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</Text>
        <Text className="text-gray-600 text-base">
          Enter your email address and we'll send you an OTP to reset your password.
        </Text>
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 font-medium mb-2">Email Address</Text>
        <TextInput
          mode="outlined"
          label="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          left={<TextInput.Icon icon={() => <Mail size={20} color="#000" />} />}
          outlineColor="#e5e7eb"
          activeOutlineColor="#DC2626"
          style={{ backgroundColor: 'white' }}
        />
      </View>

      <TouchableOpacity
        className={cn(
          "w-full py-3 rounded-lg",
          loading ? "bg-gray-400" : "bg-red-600"
        )}
        onPress={handleSendOTP}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold text-lg">
          {loading ? 'Sending...' : 'Send OTP'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4 py-3"
        onPress={() => router.back()}
      >
        <Text className="text-red-600 text-center font-medium">
          Back to Login
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View className="flex-1 justify-center px-6">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Enter OTP</Text>
        <Text className="text-gray-600 text-base">
          We've sent a 6-digit OTP to {email}. Please enter it below.
        </Text>
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 font-medium mb-2">OTP Code</Text>
        <TextInput
          mode="outlined"
          label="Enter OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
          maxLength={6}
          left={<TextInput.Icon icon={() => <KeyRound size={20} color="#000" />} />}
          outlineColor="#e5e7eb"
          activeOutlineColor="#DC2626"
          style={{ backgroundColor: 'white' }}
          contentStyle={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', letterSpacing: 8 }}
        />
      </View>

      <TouchableOpacity
        className={cn(
          "w-full py-3 rounded-lg",
          loading ? "bg-gray-400" : "bg-red-600"
        )}
        onPress={handleVerifyOTP}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold text-lg">
          {loading ? 'Verifying...' : 'Verify OTP'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4 py-3"
        onPress={() => setStep(1)}
      >
        <Text className="text-red-600 text-center font-medium">
          Back to Email
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View className="flex-1 justify-center px-6">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-gray-900 mb-2">New Password</Text>
        <Text className="text-gray-600 text-base">
          Enter your new password below.
        </Text>
      </View>

      <View className="mb-4">
        <Text className="text-gray-700 font-medium mb-2">New Password</Text>
        <TextInput
          mode="outlined"
          label="Enter new password"
          value={newPassword}
          onChangeText={handlePasswordChange}
          secureTextEntry={!showNewPassword}
          left={<TextInput.Icon icon={() => <Lock size={20} color="#000" />} />}
          right={
            <TextInput.Icon 
              icon={() => showNewPassword ? <EyeOff size={20} color="#000" /> : <Eye size={20} color="#000" />} 
              onPress={() => setShowNewPassword(!showNewPassword)}
            />
          }
          outlineColor="#e5e7eb"
          activeOutlineColor="#DC2626"
          style={{ backgroundColor: 'white' }}
        />
        {newPassword && (
          <View className="mt-2">
            <Text className="text-xs text-gray-600 mb-2">Password Requirements:</Text>
            <View className="space-y-1">
              <RequirementItem met={newPassword.length >= 8} text="8+ characters" />
              <RequirementItem met={/[A-Z]/.test(newPassword)} text="Uppercase letter" />
              <RequirementItem met={/[a-z]/.test(newPassword)} text="Lowercase letter" />
              <RequirementItem met={/\d/.test(newPassword)} text="Number" />
              <RequirementItem met={/[@$!%*?&]/.test(newPassword)} text="Special character" />
            </View>
          </View>
        )}
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 font-medium mb-2">Confirm Password</Text>
        <TextInput
          mode="outlined"
          label="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          left={<TextInput.Icon icon={() => <Lock size={20} color="#000" />} />}
          right={
            <TextInput.Icon 
              icon={() => showConfirmPassword ? <EyeOff size={20} color="#000" /> : <Eye size={20} color="#000" />} 
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          }
          outlineColor="#e5e7eb"
          activeOutlineColor="#DC2626"
          style={{ backgroundColor: 'white' }}
        />
      </View>

      <TouchableOpacity
        className={cn(
          "w-full py-3 rounded-lg",
          loading ? "bg-gray-400" : "bg-red-600"
        )}
        onPress={handleResetPassword}
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold text-lg">
          {loading ? 'Resetting...' : 'Reset Password'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4 py-3"
        onPress={() => setStep(2)}
      >
        <Text className="text-red-600 text-center font-medium">
          Back to OTP
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={["#111827", "#DC2626"]}
      className="flex-1"
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAwareScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 pt-12 justify-center items-center">
            <View className="w-[90%] bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl mx-auto">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </View>
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
};

export default ForgotPasswordScreen; 