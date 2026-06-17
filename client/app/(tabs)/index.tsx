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
  ScrollView,
  Keyboard,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../hooks/useProducts';
import { useSearchSuggestions } from '../../hooks/useSearchSuggestions';
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

const AI_PLACEHOLDERS = [
  "✨ Ask AI to find 'Summer Outfits'",
  "✨ Search 'Nike Air Max'...",
  "✨ Find 'Black Leather Jackets'...",
  "✨ Discover trending fashion..."
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

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Highlighting text utility
const HighlightedText = ({ text, highlight }: { text: string, highlight: string }) => {
  if (!highlight || !highlight.trim()) return <Text>{text}</Text>;
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <Text>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <Text key={i} style={{ fontWeight: 'bold', color: '#ea580c' }}>{part}</Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      )}
    </Text>
  );
};

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Carousel & AI State
  const [activeSlide, setActiveSlide] = useState(0);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const searchInputRef = useRef<TextInput>(null);
  
  const insets = useSafeAreaInsets();

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

  // Auto-scroll banner effect
  useEffect(() => {
    const timer = setInterval(() => {
      const nextSlide = (activeSlide + 1) % BANNERS.length;
      scrollViewRef.current?.scrollTo({ x: nextSlide * width, animated: true });
    }, 4000); // 4 seconds interval
    return () => clearInterval(timer);
  }, [activeSlide]);

  // AI Placeholder cycle effect
  useEffect(() => {
    const aiTimer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % AI_PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(aiTimer);
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('createdAt_desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [submittedSearch, setSubmittedSearch] = useState<string>('');

  const filters = {
    category: selectedCategory === 'All' ? undefined : selectedCategory,
    brand: selectedBrand,
    sort: sortBy,
    search: submittedSearch || undefined,
  };

  const { data, isLoading, error, refetch } = useProducts(filters);
  const { results: searchSuggestions, quickLinks, isLoading: isSearchLoading } = useSearchSuggestions(searchQuery);

  const handleSearchChange = (text: string) => {
    if ((text.length > 0 && searchQuery.length === 0) || (text.length === 0 && searchQuery.length > 0)) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setSearchQuery(text);
  };

  const executeSearch = () => {
    setSubmittedSearch(searchQuery);
    setSelectedCategory('All');
    setSelectedBrand(undefined);
    Keyboard.dismiss();
  };

  const clearSearch = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSearchQuery('');
    setSubmittedSearch('');
    Keyboard.dismiss();
  };

  const handleScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
    if (slide !== activeSlide && slide >= 0 && slide < BANNERS.length) {
      setActiveSlide(slide);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      
      {/* 1. Combined Header Row (Menu + AI Search + Cart) */}
      <View style={styles.topCombinedRow}>
        
        {/* Three Dots Menu */}
        <TouchableOpacity onPress={handleLogoTap} style={styles.menuButton}>
          <Text style={styles.threeDotsText}>⋮</Text>
        </TouchableOpacity>

        {/* AI Powered Search Bar */}
        <View style={styles.aiSearchWrapper}>
          <TextInput
            ref={searchInputRef}
            placeholder={AI_PLACEHOLDERS[placeholderIndex]}
            placeholderTextColor="#9ca3af" // Subtle gray tint to match page styling
            value={searchQuery}
            onChangeText={handleSearchChange}
            style={styles.aiSearchInput}
            returnKeyType="search"
            onSubmitEditing={executeSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => searchInputRef.current?.focus()} style={styles.searchActionButton}>
              <Text style={styles.searchActionIcon}>🔍</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Cart Icon */}
        <TouchableOpacity onPress={() => router.push('/(tabs)/cart')} style={styles.cartIconButton}>
          <Text style={styles.iconText}>🛒</Text>
        </TouchableOpacity>
      </View>

      {/* AI Predictive Dropdown */}
      {searchQuery.trim().length > 0 && (
        <View style={styles.dropdownContainer}>
          {isSearchLoading ? (
            <ActivityIndicator size="small" color="#ea580c" style={{ padding: 24 }} />
          ) : searchSuggestions.length > 0 || quickLinks.length > 0 ? (
            <>
              {quickLinks.length > 0 && (
                <View style={styles.quickLinksContainer}>
                  {quickLinks.map((link, i) => (
                    <TouchableOpacity 
                      key={i} 
                      style={styles.quickLinkPill}
                      onPress={() => {
                        setSearchQuery(link.query);
                        setSubmittedSearch(link.query);
                        Keyboard.dismiss();
                      }}
                    >
                      <Text style={styles.quickLinkText}>✨ {link.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {searchSuggestions.map((product) => (
                <TouchableOpacity 
                  key={product._id} 
                  style={styles.suggestionRow}
                  onPress={() => {
                    Keyboard.dismiss();
                    router.push(`/product/${product._id}`);
                  }}
                >
                  <Image source={{ uri: product.image_urls[0] }} style={styles.suggestionImage} />
                  <View style={styles.suggestionInfo}>
                    <Text style={styles.suggestionName} numberOfLines={1}>
                      <HighlightedText text={product.name} highlight={searchQuery} />
                    </Text>
                    <Text style={styles.suggestionCategory}>
                      {product.category} {product.gender && product.gender !== 'Unisex' ? `· ${product.gender}` : ''}
                    </Text>
                  </View>
                  <Text style={styles.suggestionPrice}>${product.price.toFixed(2)}</Text>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <View style={styles.emptySearchContainer}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🕵️</Text>
              <Text style={styles.emptySearchTitle}>No exact matches found</Text>
              <Text style={styles.emptySearchSub}>Try adjusting your spelling or use a broader term.</Text>
            </View>
          )}
        </View>
      )}

      {/* 2. Sliding Promotional Banners (Auto-Scrolling) */}
      <View style={styles.carouselContainer}>
        <ScrollView
          ref={scrollViewRef}
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

      {/* 3. Category Select Tabs */}
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

      {/* 4. Brand Horizontal List */}
      <View style={{ marginBottom: 8 }}>
        <BrandList selectedBrand={selectedBrand} onSelectBrand={setSelectedBrand} />
      </View>

      {/* 5. Sort Bar & Total Count */}
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
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
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
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          ListHeaderComponent={renderHeader()}
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
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  headerContainer: { backgroundColor: '#f9fafb', paddingBottom: 8 },
  
  // Combined Row Styles
  topCombinedRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, justifyContent: 'space-between' },
  
  menuButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  threeDotsText: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginTop: -4 },
  
  aiSearchWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 99, marginHorizontal: 12, paddingLeft: 16, paddingRight: 6, height: 44, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  aiSearchInput: { flex: 1, fontSize: 13, fontWeight: '600', color: '#111827', padding: 0, height: '100%' },
  clearButton: { padding: 8 },
  clearIcon: { color: '#ea580c', fontWeight: 'bold' },
  searchActionButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#ea580c', alignItems: 'center', justifyContent: 'center' },
  searchActionIcon: { color: '#ffffff', fontSize: 14 },
  
  // Dropdown Styles
  dropdownContainer: { backgroundColor: '#ffffff', marginHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, marginBottom: 16, overflow: 'hidden' },
  quickLinksContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  quickLinkPill: { backgroundColor: '#fff7ed', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, marginRight: 8, borderWidth: 1, borderColor: '#ffedd5' },
  quickLinkText: { color: '#ea580c', fontSize: 12, fontWeight: '600' },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  suggestionImage: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#f3f4f6', marginRight: 12 },
  suggestionInfo: { flex: 1, marginRight: 12 },
  suggestionName: { fontSize: 14, color: '#111827', marginBottom: 2 },
  suggestionCategory: { fontSize: 11, color: '#6b7280' },
  suggestionPrice: { fontSize: 14, fontWeight: '700', color: '#111827' },
  emptySearchContainer: { padding: 24, alignItems: 'center', justifyContent: 'center' },
  emptySearchTitle: { fontSize: 15, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  emptySearchSub: { fontSize: 13, color: '#6b7280', textAlign: 'center' },

  cartIconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  iconText: { fontSize: 18 },
  
  // Rest of styles
  carouselContainer: { position: 'relative', marginBottom: 16 },
  bannerWrapper: { width: width, height: 180 },
  bannerImage: { width: width - 32, height: 180, marginHorizontal: 16, borderRadius: 12 },
  bannerOverlay: { position: 'absolute', top: 0, left: 16, width: width - 32, height: 180, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  bannerTitle: { color: '#fff', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 4, letterSpacing: 1 },
  bannerSubtitle: { color: '#f3f4f6', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  pagination: { position: 'absolute', bottom: 12, width: '100%', flexDirection: 'row', justifyContent: 'center' },
  dot: { height: 6, borderRadius: 3, marginHorizontal: 3 },
  activeDot: { width: 18, backgroundColor: '#ea580c' },
  inactiveDot: { width: 6, backgroundColor: 'rgba(255,255,255,0.7)' },
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
