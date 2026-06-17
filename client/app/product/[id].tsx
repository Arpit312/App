import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useProductDetails, useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../context/AuthContext';
import SideDrawer from '../../components/SideDrawer';

const { width } = Dimensions.get('window');

// A simple Product Card for the "Similar Products" section
const SimilarProductCard = ({ product, onPress }: { product: any; onPress: () => void }) => {
  const imageUrl = product.image_urls?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff';
  return (
    <TouchableOpacity 
      onPress={onPress} 
      className="w-40 mr-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <Image source={{ uri: imageUrl }} style={{ width: '100%', height: 160 }} resizeMode="cover" />
      <View className="p-3">
        <Text className="text-xs font-bold text-gray-500 uppercase mb-1">{product.brand}</Text>
        <Text className="text-sm font-bold text-secondary-dark" numberOfLines={1}>{product.name}</Text>
        <Text className="text-sm font-black text-primary mt-1">${product.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addToCart, formatPrice } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // States
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  const [activeSlide, setActiveSlide] = useState(0);

  // Data Hooks
  const { data, isLoading, error } = useProductDetails(id as string);
  const product = data?.product;

  const { data: similarData } = useProducts({ 
    category: product?.category, 
    limit: 5 
  });
  
  // Filter out the current product from similar products
  const similarProducts = similarData?.products?.filter(p => p._id !== id) || [];

  const handleAddToCart = () => {
    if (!product) return;
    if (product.specifications?.size_guide?.length && !selectedSize) {
      Alert.alert('Selection Required', 'Please select a size before adding to cart.');
      return;
    }
    const selectedSizeName = selectedSize || 'Standard';
    addToCart(product, 1, selectedSizeName);
    Alert.alert(
      'Success 🎉',
      `${product.name} (${selectedSizeName}) has been added to your cart!`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'Go to Cart & Checkout', onPress: () => router.push('/(tabs)/profile') }
      ]
    );
  };

  const handleScroll = (event: any) => {
    const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
    if (slide !== activeSlide) {
      setActiveSlide(slide);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#ea580c" />
        <Text className="text-sm text-gray-500 mt-2 font-medium">Loading premium features...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-4 text-center">
        <Text className="text-3xl mb-2">❌</Text>
        <Text className="text-base font-bold text-secondary-dark mb-1">Product Details Error</Text>
        <Text className="text-xs text-gray-400 mb-4 text-center">
          {error?.message || 'The product details could not be loaded.'}
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-primary px-6 py-2.5 rounded-lg mt-4">
          <Text className="text-white font-bold">Back to Catalog</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Fallback to array with 1 image if only 1 image exists, just to show how it works
  const images = product.image_urls?.length > 0 ? product.image_urls : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff'];
  const sizeList = product.specifications?.size_guide || [];
  const colorList = product.specifications?.color || [];

  return (
    <View className="flex-1 bg-white">
      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerTitle: '',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.headerButton}
            >
              <Text className="text-xl font-bold text-secondary-dark">←</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => setIsDrawerOpen(true)} 
              style={styles.headerButtonRight}
            >
              <Text className="text-xl">🍔</Text>
            </TouchableOpacity>
          )
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} bounces={false}>
        
        {/* Promotional Banner */}
        <View style={styles.promoBanner}>
          <Text className="text-white text-xs font-bold uppercase tracking-widest text-center">
            ✨ Premium Brands - Free Shipping on Orders Over $100 ✨
          </Text>
        </View>

        {/* 1. Image Carousel */}
        <View style={{ backgroundColor: '#f9fafb', position: 'relative' }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={{ width: '100%', height: 450 }}
          >
            {images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                style={{ width, height: 450 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          
          {/* Pagination Dots */}
          {images.length > 1 && (
            <View style={styles.paginationContainer}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    activeSlide === index ? styles.activeDot : styles.inactiveDot
                  ]}
                />
              ))}
            </View>
          )}

          {/* Brand sticker badge */}
          <View style={styles.brandBadge}>
            <Text className="text-xs font-black text-secondary-dark uppercase tracking-widest">
              {product.brand}
            </Text>
          </View>
        </View>

        {/* 2. Detail Body */}
        <View style={styles.detailsContainer}>
          {/* Header Row */}
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1 mr-4">
              <Text className="text-3xl font-black text-secondary-dark tracking-tight leading-9">
                {product.name}
              </Text>
              <Text className="text-base font-bold text-gray-400 mt-1 uppercase tracking-wider">
                {product.category}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-3xl font-black text-primary">
                {formatPrice(product.price)}
              </Text>
              <View className="flex-row items-center mt-1">
                <Text className="text-xs text-green-500 font-bold">★ 4.9</Text>
                <Text className="text-xs text-gray-400 ml-1">(120)</Text>
              </View>
            </View>
          </View>

          {/* Stock Availability indicator */}
          <View className="flex-row items-center bg-gray-50 px-3 py-2 rounded-lg self-start mb-6">
            <View
              style={[styles.statusDot, product.stock_quantity > 0 ? { backgroundColor: '#22c55e' } : { backgroundColor: '#ef4444' }]}
            />
            <Text className="text-xs font-bold text-secondary-dark uppercase tracking-wide">
              {product.stock_quantity > 0
                ? `In Stock • ${product.stock_quantity} left`
                : 'Out of Stock'}
            </Text>
          </View>

          {/* Description Section */}
          <View className="mb-8">
            <Text className="text-lg font-black text-secondary-dark mb-3">
              The Details
            </Text>
            <Text className="text-sm text-gray-500 leading-relaxed font-medium">
              {product.description}
            </Text>
          </View>

          {/* Colors Specification Section */}
          {colorList.length > 0 && (
            <View className="mb-8">
              <Text className="text-lg font-black text-secondary-dark mb-3">
                Color <Text className="text-gray-400 font-medium text-sm">({colorList[selectedColorIndex]})</Text>
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {colorList.map((color, index) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColorIndex(index)}
                    className={`mr-4 px-6 py-3 rounded-full border-2 ${
                      selectedColorIndex === index
                        ? 'border-primary bg-white'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Text className={`text-sm font-bold ${selectedColorIndex === index ? 'text-primary' : 'text-gray-600'}`}>
                      {color}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Sizes Specification Selector */}
          {sizeList.length > 0 && (
            <View className="mb-8">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-black text-secondary-dark">Size</Text>
                <TouchableOpacity>
                  <Text className="text-sm text-primary font-bold underline">Size Guide</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row flex-wrap">
                {sizeList.map((size) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    className={`mr-3 mb-3 w-14 h-14 rounded-full items-center justify-center border-2 ${
                      selectedSize === size
                        ? 'bg-secondary-dark border-secondary-dark'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-sm font-black ${
                        selectedSize === size ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Similar Products Section */}
          {similarProducts.length > 0 && (
            <View className="mt-4 mb-8">
              <Text className="text-xl font-black text-secondary-dark mb-4">
                You Might Also Like
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row pb-4">
                {similarProducts.map((simProduct) => (
                  <SimilarProductCard 
                    key={simProduct._id} 
                    product={simProduct} 
                    onPress={() => router.push(`/product/${simProduct._id}`)}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 3. Bottom Sticky Action Panel - Premium */}
      <View style={styles.bottomBar}>
        <View className="flex-1 mr-4">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Price</Text>
          <Text className="text-2xl font-black text-secondary-dark">{formatPrice(product.price)}</Text>
        </View>
        
        <TouchableOpacity
          onPress={handleAddToCart}
          disabled={product.stock_quantity === 0}
          style={[styles.addToCartButton, product.stock_quantity > 0 ? styles.addToCartActive : styles.addToCartDisabled]}
        >
          <Text className="text-white text-lg font-black mr-2">
            {product.stock_quantity > 0 ? 'Add to Cart' : 'Sold Out'}
          </Text>
          {product.stock_quantity > 0 && <Text className="text-white text-xl">🛍️</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginLeft: 16,
    marginTop: 8,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButtonRight: {
    marginRight: 16,
    marginTop: 8,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promoBanner: {
    backgroundColor: '#111827', // primary-dark
    paddingTop: 56,
    paddingBottom: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 24,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#ea580c', // primary
  },
  inactiveDot: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  brandBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 10,
  },
  addToCartButton: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addToCartActive: {
    backgroundColor: '#ea580c', // primary
  },
  addToCartDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
  }
});
