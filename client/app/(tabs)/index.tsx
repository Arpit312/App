import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Dimensions,
  StyleSheet,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../../components/ProductCard';
import BrandList from '../../components/BrandList';
import SideDrawer from '../../components/SideDrawer';

const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Clothing', 'Shoes', 'Accessories'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'createdAt_desc' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' }
];

// Mock Banners for the carousel
const BANNERS = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1200',
    title: 'END OF SEASON SALE',
    subtitle: 'Up to 50% Off Top Brands'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200',
    title: 'NEW ARRIVALS',
    subtitle: 'Step into the future of footwear'
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200',
    title: 'PREMIUM COLLECTION',
    subtitle: 'Discover luxury fashion'
  }
];

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Carousel State
  const [activeSlide, setActiveSlide] = useState(0);

  const handleLogoTap = () => {
    setIsDrawerOpen(true);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !user) {
      const timer = setTimeout(() => {
        router.replace('/login');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMounted, user]);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('createdAt_desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const filters = {
    category: selectedCategory === 'All' ? undefined : selectedCategory,
    brand: selectedBrand,
    sort: sortBy,
    search: debouncedSearch || undefined,
  };

  const { data, isLoading, error, refetch } = useProducts(filters);

  const handleScroll = (event: any) => {
    const slide = Math.ceil(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
    if (slide !== activeSlide) {
      setActiveSlide(slide);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* 1. App Title Bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <TouchableOpacity onPress={handleLogoTap} activeOpacity={0.7}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.greetingText}>
              Hello, {user?.name || 'User'} 👋
            </Text>
            <Text style={styles.brandTitle}>
              VELOCITY<Text style={styles.brandTitleHighlight}>.SHOP</Text>
            </Text>
          </View>
        </View>
        <View style={styles.topRight}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/cart')} style={styles.iconButton}>
            <Text style={styles.iconText}>🛒</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.iconButton}>
            <Text style={styles.iconText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Sliding Promotional Banners */}
      <View style={styles.carouselContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {BANNERS.map((banner) => (
            <View key={banner.id} style={styles.bannerWrapper}>
              <Image source={{ uri: banner.image }} style={styles.bannerImage} />
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.pagination}>
          {BANNERS.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, activeSlide === index ? styles.activeDot : styles.inactiveDot]}
            />
          ))}
        </View>
      </View>

      {/* 3. Search Input box */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search clothing, shoes, brands..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* 4. Category Select Tabs */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item)}
              style={[
                styles.categoryButton,
                selectedCategory === item ? styles.categoryButtonActive : styles.categoryButtonInactive
              ]}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === item ? styles.categoryTextActive : styles.categoryTextInactive
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      {/* 5. Brand Horizontal List */}
      <View style={{ marginBottom: 8 }}>
        <BrandList selectedBrand={selectedBrand} onSelectBrand={setSelectedBrand} />
      </View>

      {/* 6. Sort Bar & Total Count */}
      <View style={styles.sortBar}>
        <Text style={styles.itemCountText}>
          {data?.products?.length || 0} items found
        </Text>
        <View style={styles.sortOptionsWrapper}>
          <Text style={styles.sortByText}>Sort by:</Text>
          <FlatList
            data={SORT_OPTIONS}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setSortBy(item.value)} style={{ marginLeft: 12 }}>
                <Text style={[styles.sortOptionText, sortBy === item.value ? styles.sortOptionActive : null]}>
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
    <SafeAreaView style={styles.safeArea}>
      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#ea580c" />
          <Text style={styles.loadingText}>Loading premium catalog...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={{ fontSize: 40, marginBottom: 8 }}>⚠️</Text>
          <Text style={styles.errorTitle}>Could not fetch products</Text>
          <Text style={styles.errorSubtitle}>
            {error.message || 'Please check your connection and try again.'}
          </Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={data?.products || []}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => <ProductCard product={item} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>🔍</Text>
              <Text style={styles.errorTitle}>No Products Found</Text>
              <Text style={styles.errorSubtitle}>Try adjusting your filters or search terms</Text>
            </View>
          }
          refreshing={isLoading}
          onRefresh={refetch}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  headerContainer: { backgroundColor: '#f9fafb', paddingBottom: 8 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  topLeft: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 44, height: 44, borderRadius: 12, marginRight: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f3f4f6' },
  greetingText: { fontSize: 12, color: '#6b7280', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  brandTitle: { fontSize: 22, fontWeight: '900', color: '#111827', letterSpacing: -0.5 },
  brandTitleHighlight: { color: '#ea580c' },
  topRight: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { backgroundColor: '#ffffff', padding: 10, borderRadius: 99, borderWidth: 1, borderColor: '#f3f4f6', marginLeft: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  iconText: { fontSize: 18 },
  carouselContainer: { position: 'relative', marginBottom: 16 },
  bannerWrapper: { width: width, height: 180 },
  bannerImage: { width: width - 32, height: 180, marginHorizontal: 16, borderRadius: 20 },
  bannerOverlay: { position: 'absolute', top: 0, left: 16, width: width - 32, height: 180, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  bannerTitle: { color: '#fff', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 4, letterSpacing: 1 },
  bannerSubtitle: { color: '#f3f4f6', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  pagination: { position: 'absolute', bottom: 12, width: '100%', flexDirection: 'row', justifyContent: 'center' },
  dot: { height: 6, borderRadius: 3, marginHorizontal: 3 },
  activeDot: { width: 18, backgroundColor: '#ea580c' },
  inactiveDot: { width: 6, backgroundColor: 'rgba(255,255,255,0.7)' },
  searchContainer: { paddingHorizontal: 16, marginBottom: 16 },
  searchInputWrapper: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  searchIcon: { color: '#9ca3af', marginRight: 8, fontSize: 16 },
  searchInput: { flex: 1, color: '#111827', fontSize: 14, padding: 0 },
  clearIcon: { color: '#9ca3af', fontWeight: 'bold' },
  categoriesContainer: { marginBottom: 16 },
  categoryButton: { marginRight: 12, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 99, borderWidth: 1 },
  categoryButtonActive: { backgroundColor: '#111827', borderColor: '#111827', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  categoryButtonInactive: { backgroundColor: '#ffffff', borderColor: '#e5e7eb' },
  categoryText: { fontWeight: '700', fontSize: 14 },
  categoryTextActive: { color: '#ffffff' },
  categoryTextInactive: { color: '#6b7280' },
  sortBar: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f3f4f6' },
  itemCountText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  sortOptionsWrapper: { flexDirection: 'row', alignItems: 'center' },
  sortByText: { fontSize: 12, color: '#9ca3af', fontWeight: '500' },
  sortOptionText: { fontSize: 12, fontWeight: '700', color: '#9ca3af' },
  sortOptionActive: { color: '#ea580c' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { fontSize: 14, color: '#6b7280', marginTop: 8, fontWeight: '600' },
  errorTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  errorSubtitle: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginBottom: 16 },
  retryButton: { backgroundColor: '#ea580c', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryButtonText: { color: '#fff', fontWeight: 'bold' },
  productRow: { justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 16 },
  emptyContainer: { paddingVertical: 48, justifyContent: 'center', alignItems: 'center' }
});
