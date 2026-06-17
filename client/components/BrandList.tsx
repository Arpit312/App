import React from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';

interface BrandListProps {
  selectedBrand?: string;
  onSelectBrand: (brand: string | undefined) => void;
}

const BRANDS = ['Nike', 'Adidas', 'Puma', 'Zara', 'Gucci', 'New Balance'];

export default function BrandList({ selectedBrand, onSelectBrand }: BrandListProps) {
  return (
    <View className="my-4">
      <Text className="text-lg font-bold text-secondary-dark px-4 mb-2">
        Featured Brands
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {/* "All" button */}
        <TouchableOpacity
          onPress={() => onSelectBrand(undefined)}
          className={`mr-3 px-5 py-2.5 rounded-full border ${
            selectedBrand === undefined
              ? 'bg-primary border-primary'
              : 'bg-white border-gray-200'
          }`}
        >
          <Text
            className={`font-semibold text-sm ${
              selectedBrand === undefined ? 'text-white' : 'text-secondary'
            }`}
          >
            All
          </Text>
        </TouchableOpacity>

        {/* Brand buttons */}
        {BRANDS.map((brand) => (
          <TouchableOpacity
            key={brand}
            onPress={() => onSelectBrand(brand)}
            className={`mr-3 px-5 py-2.5 rounded-full border ${
              selectedBrand === brand
                ? 'bg-primary border-primary'
                : 'bg-white border-gray-200'
            }`}
          >
            <Text
              className={`font-semibold text-sm ${
                selectedBrand === brand ? 'text-white' : 'text-secondary'
              }`}
            >
              {brand}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
