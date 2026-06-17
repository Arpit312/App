# E-Commerce Monorepo Boilerplate (React Native & Node.js/Express)

This repository contains a professional-grade boilerplate implementation for a cross-platform e-commerce application selling clothing, shoes, and accessories.

---

## 1. Directory Structure

```
/
├── server/                    # Express.js Backend Server
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js          # MongoDB Mongoose Connection
│   │   ├── models/
│   │   │   ├── User.js        # User Schema Model
│   │   │   ├── Product.js     # Product Schema Model
│   │   │   └── Order.js       # Order Schema Model
│   │   ├── controllers/
│   │   │   ├── authController.js    # Registration logic
│   │   │   ├── productController.js # Product endpoints logic
│   │   │   └── orderController.js   # Order placement logic
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # Auth routing maps
│   │   │   ├── productRoutes.js     # Product routing maps
│   │   │   └── orderRoutes.js       # Order routing maps
│   │   ├── middleware/
│   │   │   └── errorMiddleware.js   # 404 & Global errors handler
│   │   └── server.js          # Main entry file
│   ├── package.json
│   └── .env.example
│
├── client/                    # Expo React Native App
│   ├── app/                   # Expo Router (File-based Routing)
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx    # Tabs layout structure
│   │   │   └── index.tsx      # HomeScreen (Brand Scroll & Product Grid)
│   │   ├── product/
│   │   │   └── [id].tsx       # ProductDetailScreen
│   │   └── _layout.tsx        # Root Router Layout & Query Providers
│   ├── components/
│   │   ├── ProductCard.tsx    # Single Grid Card Item
│   │   └── BrandList.tsx      # Horizontal Brand Selection Row
│   ├── hooks/
│   │   └── useProducts.ts     # React Query fetch hooks
│   ├── services/
│   │   └── api.ts             # Axios configuration instance
│   ├── tailwind.config.js     # Tailwind configurations for NativeWind
│   ├── babel.config.js        # Babel NativeWind plugin register
│   ├── package.json
│   └── .env.example
```

---

## 2. Product Mongoose Schema (`/server/src/models/Product.js`)

Defined inside [Product.js](file:///d:/Desktop/app/server/src/models/Product.js):

```javascript
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  brand: {
    type: String,
    required: [true, 'Brand name is required'],
    trim: true,
    index: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Clothing', 'Shoes', 'Accessories'],
      message: '{VALUE} is not a supported category'
    },
    index: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  stock_quantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  image_urls: [{
    type: String,
    required: [true, 'Product must have at least one image url']
  }],
  specifications: {
    size_guide: [{
      type: String, // e.g. ['S', 'M', 'L', 'XL'] or ['US 8', 'US 9']
    }],
    color: [{
      type: String,
    }],
    material: {
      type: String,
      trim: true,
    }
  }
}, {
  timestamps: true
});

// Setup indexes for sorting/filtering search combinations
productSchema.index({ category: 1, price: 1 });
productSchema.index({ brand: 1, price: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
```

---

## 3. Product Fetching Route & Controller Handler (`/server/src/controllers/productController.js`)

Defined inside [productController.js](file:///d:/Desktop/app/server/src/controllers/productController.js):

```javascript
import Product from '../models/Product.js';

export const getProducts = async (req, res, next) => {
  try {
    const { category, brand, sort, search, page = 1, limit = 10 } = req.query;
    const query = {};

    // 1. Filtering by Category
    if (category) {
      query.category = category;
    }

    // 2. Filtering by Brand
    if (brand) {
      query.brand = brand;
    }

    // 3. Optional Search Query (Regex match on name/description)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 4. Sorting Parameters
    let sortOptions = { createdAt: -1 };
    if (sort) {
      if (sort === 'price_asc') {
        sortOptions = { price: 1 };
      } else if (sort === 'price_desc') {
        sortOptions = { price: -1 };
      } else if (sort === 'name_asc') {
        sortOptions = { name: 1 };
      } else if (sort === 'name_desc') {
        sortOptions = { name: -1 };
      }
    }

    // 5. Pagination Calculation
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Product.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: products.length,
      total: totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      products
    });
  } catch (error) {
    next(error);
  }
};
```

Associated Routing in [productRoutes.js](file:///d:/Desktop/app/server/src/routes/productRoutes.js):
```javascript
import express from 'express';
import { getProducts, getProductById } from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);

export default router;
```

---

## 4. Product Catalog Screen with Brand Scroll & Grid Layout (`/client/app/(tabs)/index.tsx`)

Defined inside [index.tsx](file:///d:/Desktop/app/client/app/%28tabs%29/index.tsx):

```tsx
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

  const filters = {
    category: selectedCategory === 'All' ? undefined : selectedCategory,
    brand: selectedBrand,
    sort: sortBy,
    search: searchQuery || undefined,
  };

  const { data, isLoading, error, refetch } = useProducts(filters);

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

      {/* 2. Search Input */}
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
        </View>
      </View>

      {/* 3. Category selector */}
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
              className={`mr-3 px-6 py-2.5 rounded-xl border \${
                selectedCategory === item
                  ? 'bg-secondary-dark border-secondary-dark'
                  : 'bg-white border-gray-200'
              }`}
            >
              <Text className={`font-semibold text-sm \${selectedCategory === item ? 'text-white' : 'text-secondary'}`}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      {/* 4. Brand List */}
      <BrandList selectedBrand={selectedBrand} onSelectBrand={setSelectedBrand} />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ea580c" />
        </View>
      ) : (
        <FlatList
          data={data?.products || []}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => <ProductCard product={item} />}
          refreshing={isLoading}
          onRefresh={refetch}
        />
      )}
    </SafeAreaView>
  );
}
```

---

## 5. Environment Variables Setup Guide

### 5.1 Backend Setup (`/server/.env`)
Create a `.env` file inside `/server` using [server/.env.example](file:///d:/Desktop/app/server/.env.example):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce_db
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```
- **`PORT`**: The server port (defaults to 5000).
- **`MONGODB_URI`**: Connection URI to your MongoDB instance.
- **`JWT_SECRET`**: Random secret key string used for signing authentication payloads.

### 5.2 Mobile Client Setup (`/client/.env`)
Create a `.env` file inside `/client` using [client/.env.example](file:///d:/Desktop/app/client/.env.example):
```env
EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP_ADDRESS>:5000/api
```
- **`EXPO_PUBLIC_API_URL`**: **Crucial for development.** Do not use `http://localhost:5000/api` because Android Emulators and iOS Physical devices running inside the same Wi-Fi connection cannot resolve `localhost` directly to your local computer server. Instead, identify your machine's local IP address (e.g. `192.168.1.100` via command prompt `ipconfig` or terminal `ifconfig`) and configure it.
