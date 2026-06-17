import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Product } from '../hooks/useProducts';

import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product;
}

const { width } = Dimensions.get('window');
// Calculate card size for 2 columns grid with margins/paddings
const cardWidth = (width - 40) / 2;

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { formatPrice } = useAuth();

  // Fallback image if first item is missing
  const imageUrl = product.image_urls?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/product/${product._id}`)}
      style={{ width: cardWidth }}
      className="bg-white rounded-2xl p-3 mb-4 shadow-sm border border-gray-100"
    >
      {/* Product Image */}
      <View className="bg-gray-50 rounded-xl overflow-hidden mb-3 relative">
        <Image
          source={{ uri: imageUrl }}
          className="h-40 w-full"
          resizeMode="cover"
        />
        {/* Category Label badge */}
        <View className="absolute top-2 left-2 bg-white/95 px-2 py-0.5 rounded-full">
          <Text className="text-[10px] font-bold text-primary uppercase">
            {product.category}
          </Text>
        </View>
      </View>

      {/* Brand Name */}
      <Text className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wider">
        {product.brand}
      </Text>

      {/* Product Name */}
      <Text className="text-sm font-semibold text-secondary-dark mb-1.5 h-10" numberOfLines={2}>
        {product.name}
      </Text>

      {/* Product Price & Cart trigger row */}
      <View className="flex-row items-center justify-between mt-auto">
        <Text className="text-base font-bold text-primary">
          {formatPrice(product.price)}
        </Text>
        <View className="bg-primary/10 p-1.5 rounded-lg">
          <Text className="text-xs text-primary font-bold">＋ Add</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
