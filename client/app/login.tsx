import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in both email and password.');
      return;
    }

    const success = await login(email, password);
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Authentication Failed', 'Invalid email or password. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-6 py-10">
          
          {/* Brand Logo Banner */}
          <View className="items-center mb-10">
            <Image
              source={require('../assets/images/logo.png')}
              className="w-24 h-24 rounded-3xl mb-4 border border-gray-100"
              resizeMode="contain"
            />
            <Text className="text-3xl font-black text-secondary-dark tracking-tight">
              VELOCITY<Text className="text-primary">.SHOP</Text>
            </Text>
            <Text className="text-sm text-gray-400 mt-2 text-center">
              Your favorite clothing & lifestyle brands in one place.
            </Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-4 mb-6">
            <View>
              <Text className="text-xs font-bold text-gray-500 uppercase mb-2">Email Address</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-secondary-dark text-sm"
                placeholder="Enter your email"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View className="mt-4">
              <Text className="text-xs font-bold text-gray-500 uppercase mb-2">Password</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-secondary-dark text-sm"
                placeholder="Enter your password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className={`w-full bg-primary p-4.5 rounded-2xl items-center justify-center shadow-md shadow-primary/20 ${
              isLoading ? 'opacity-80' : ''
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-bold">Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Seeding Instructions Helper */}
          <View className="mt-10 bg-orange-50 border border-orange-100 rounded-2xl p-4">
            <Text className="text-xs font-bold text-primary uppercase mb-1">Demo Credentials</Text>
            <Text className="text-xs text-secondary-light leading-5">
              The backend automatically seeds a default user when launched. Use the credentials below:
            </Text>
            <View className="mt-2 flex-row justify-between">
              <Text className="text-xs font-semibold text-secondary-dark">Email: demo@example.com</Text>
              <Text className="text-xs font-semibold text-secondary-dark">Password: password123</Text>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
