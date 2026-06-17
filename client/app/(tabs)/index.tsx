import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../../components/ProductCard';
import BrandList from '../../components/BrandList';

const CATEGORIES = ['All', 'Clothing', 'Shoes', 'Accessories'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'createdAt_desc' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' }
];

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('createdAt_desc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Setup reactive parameters for TanStack query hook
  const filters = {
    category: selectedCategory === 'All' ? undefined : selectedCategory,
    brand: selectedBrand,
    sort: sortBy,
    search: searchQuery || undefined,
  };

  const { data, isLoading, error, refetch } = useProducts(filters);

  // Render header component for FlatList (incorporates brand selector, searches, and categories)
  const renderHeader = () => (
    <View className="bg-gray-50 pb-2">
      {/* 1. App Title Bar */}
      <View className="px-4 pt-4 pb-2 flex-row justify-between items-center">
        <View>
          <Text className="text-xs text-gray-500 font-bold uppercase tracking-widest">
            Welcome to
          </Text>
          <Text className="text-2xl font-black text-secondary-dark tracking-tight">
            VELOCITY<Text className="text-primary">.SHOP</Text>
          </Text>
        </View>
        <TouchableOpacity className="bg-white p-2.5 rounded-full border border-gray-100">
          <Text className="text-lg">🛒</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Search Input box */}
      <View className="px-4 my-2">
        <View className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex-row items-center">
          <Text className="text-gray-400 mr-2 text-base">🔍</Text>
          <TextInput
            placeholder="Search clothing, shoes, brands..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-secondary-dark text-sm p-0"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text className="text-gray-400 font-bold">✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* 3. Category Select Tabs */}
      <View className="my-2">
        <Text className="text-lg font-bold text-secondary-dark px-4 mb-2">
          Categories
        </Text>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item)}
              className={`mr-3 px-6 py-2.5 rounded-xl border ${
                selectedCategory === item
                  ? 'bg-secondary-dark border-secondary-dark'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`font-semibold text-sm ${
                  selectedCategory === item ? 'text-white' : 'text-secondary'
                }`}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      {/* 4. Brand Horizontal List */}
      <BrandList selectedBrand={selectedBrand} onSelectBrand={setSelectedBrand} />

      {/* 5. Sort Bar & Total Count */}
      <View className="px-4 py-2 flex-row justify-between items-center bg-gray-50 border-t border-gray-100">
        <Text className="text-xs font-semibold text-gray-500">
          {data?.products?.length || 0} items found
        </Text>
        <View className="flex-row items-center">
          <Text className="text-xs text-gray-400 mr-1.5 font-medium">Sort by:</Text>
          <FlatList
            data={SORT_OPTIONS}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSortBy(item.value)}
                className="ml-2"
              >
                <Text
                  className={`text-xs font-bold ${
                    sortBy === item.value ? 'text-primary' : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.value}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ea580c" />
          <Text className="text-sm text-gray-500 mt-2 font-medium">Loading catalog...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-4 text-center">
          <Text className="text-3xl mb-2">⚠️</Text>
          <Text className="text-base font-bold text-secondary-dark mb-1">Could not fetch products</Text>
          <Text className="text-xs text-gray-400 text-center mb-4">
            {error.message || 'Please check your connection and try again.'}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-primary px-6 py-2.5 rounded-lg"
          >
            <Text className="text-white font-bold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={data?.products || []}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => <ProductCard product={item} />}
          ListEmptyComponent={
            <View className="py-12 justify-center items-center">
              <Text className="text-4xl mb-2">🔍</Text>
              <Text className="text-base font-bold text-secondary-dark mb-1">
                No Products Found
              </Text>
              <Text className="text-xs text-gray-400">
                Try adjustment of filters or search terms
              </Text>
            </View>
          }
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}
    </SafeAreaView>
  );
}
