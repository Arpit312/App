import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function WishlistScreen() {
  const { user, formatPrice } = useAuth();
  const router = useRouter();

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-gray-50 p-5">
      <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 items-center justify-center my-6">
        <Text className="text-5xl mb-4">🧡</Text>
        <Text className="text-xl font-bold text-secondary-dark mb-1">Your Wishlist is Empty</Text>
        <Text className="text-xs text-gray-400 text-center mb-6 px-4">
          Save your favorite products here to monitor stock availability and buy them later.
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)')}
          className="bg-primary px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-bold text-sm">Explore Products</Text>
        </TouchableOpacity>
      </View>

      {/* Suggested Products Header */}
      <Text className="text-base font-bold text-secondary-dark mb-3">Trending Deals For You</Text>
      
      {/* Static Mock suggestions */}
      <View className="flex-row justify-between mb-8">
        <View className="bg-white rounded-xl p-3 w-[48%] border border-gray-100 shadow-xs">
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff' }}
            className="w-full h-32 rounded-lg mb-2"
          />
          <Text className="text-xs font-bold text-secondary-dark" numberOfLines={1}>Nike Air Zoom</Text>
          <Text className="text-xs text-primary font-bold mt-1">{formatPrice(129.99)}</Text>
        </View>
        <View className="bg-white rounded-xl p-3 w-[48%] border border-gray-100 shadow-xs">
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083' }}
            className="w-full h-32 rounded-lg mb-2"
          />
          <Text className="text-xs font-bold text-secondary-dark" numberOfLines={1}>Gucci Sunglasses</Text>
          <Text className="text-xs text-primary font-bold mt-1">{formatPrice(350.00)}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
