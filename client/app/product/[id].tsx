import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useProductDetails } from '../../hooks/useProducts';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Selected size state hook
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  // Selected color index indicator
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);

  const { data, isLoading, error } = useProductDetails(id as string);

  const product = data?.product;

  const handleAddToCart = () => {
    if (!product) return;

    if (product.specifications?.size_guide?.length && !selectedSize) {
      Alert.alert('Selection Required', 'Please select a size before adding to cart.');
      return;
    }

    Alert.alert(
      'Success 🎉',
      `${product.name} (${selectedSize || 'Standard Size'}) has been added to your cart!`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'Go to Cart', onPress: () => router.push('/(tabs)') }
      ]
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#ea580c" />
        <Text className="text-sm text-gray-500 mt-2 font-medium">Fetching details...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-4 text-center">
        <Text className="text-3xl mb-2">❌</Text>
        <Text className="text-base font-bold text-secondary-dark mb-1">
          Product Details Error
        </Text>
        <Text className="text-xs text-gray-400 mb-4 text-center">
          {error?.message || 'The product details could not be parsed.'}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary px-6 py-2.5 rounded-lg"
        >
          <Text className="text-white font-bold">Back to Catalog</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const mainImageUrl = product.image_urls?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff';
  const sizeList = product.specifications?.size_guide || [];
  const colorList = product.specifications?.color || [];

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* 1. Hero Image */}
        <View className="bg-gray-100 relative">
          <Image
            source={{ uri: mainImageUrl }}
            className="w-full h-96"
            resizeMode="cover"
          />
          {/* Brand sticker badge */}
          <View className="absolute bottom-4 left-4 bg-white/95 px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
            <Text className="text-xs font-bold text-secondary-dark uppercase tracking-widest">
              {product.brand}
            </Text>
          </View>
        </View>

        {/* 2. Detail Body */}
        <View className="p-5">
          {/* Header Row */}
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1 mr-4">
              <Text className="text-2xl font-bold text-secondary-dark tracking-tight leading-7">
                {product.name}
              </Text>
              <Text className="text-sm font-semibold text-primary mt-1">
                {product.category}
              </Text>
            </View>
            <Text className="text-2xl font-black text-secondary-dark">
              ${product.price.toFixed(2)}
            </Text>
          </View>

          {/* Stock Availability indicator */}
          <View className="flex-row items-center mb-5">
            <View
              className={`w-2.5 h-2.5 rounded-full mr-2 ${
                product.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <Text className="text-xs font-medium text-gray-500">
              {product.stock_quantity > 0
                ? `In Stock (${product.stock_quantity} available)`
                : 'Out of Stock'}
            </Text>
          </View>

          {/* Description Section */}
          <View className="mb-6">
            <Text className="text-base font-bold text-secondary-dark mb-2">
              Product Description
            </Text>
            <Text className="text-sm text-gray-500 leading-6">
              {product.description}
            </Text>
          </View>

          {/* Colors Specification Section (if items defined) */}
          {colorList.length > 0 && (
            <View className="mb-5">
              <Text className="text-sm font-bold text-secondary-dark mb-2">
                Available Colors
              </Text>
              <View className="flex-row">
                {colorList.map((color, index) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColorIndex(index)}
                    className={`mr-3 px-4 py-2 rounded-lg border ${
                      selectedColorIndex === index
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200'
                    }`}
                  >
                    <Text className="text-xs font-semibold text-secondary">{color}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Sizes Specification Selector */}
          {sizeList.length > 0 && (
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm font-bold text-secondary-dark">Select Size</Text>
                <Text className="text-xs text-gray-400 font-bold underline">Size Guide</Text>
              </View>
              <View className="flex-row flex-wrap">
                {sizeList.map((size) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    className={`mr-2.5 mb-2.5 w-12 h-12 rounded-xl items-center justify-center border ${
                      selectedSize === size
                        ? 'bg-secondary-dark border-secondary-dark'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-sm font-bold ${
                        selectedSize === size ? 'text-white' : 'text-secondary'
                      }`}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 3. Bottom Sticky Action Panel */}
      <View className="border-t border-gray-100 p-5 bg-white flex-row items-center">
        <TouchableOpacity
          className="border border-gray-200 p-4 rounded-2xl mr-4"
          onPress={() => Alert.alert('Liked 🧡', 'Added to Wishlist')}
        >
          <Text className="text-lg">🧡</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleAddToCart}
          disabled={product.stock_quantity === 0}
          className={`flex-1 p-4 rounded-2xl items-center justify-center ${
            product.stock_quantity > 0 ? 'bg-primary' : 'bg-gray-300'
          }`}
        >
          <Text className="text-white text-base font-bold">
            {product.stock_quantity > 0 ? 'Add to Cart' : 'Sold Out'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
