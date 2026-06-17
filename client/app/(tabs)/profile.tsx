import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface OrderItem {
  product_id: {
    _id: string;
    name: string;
    price: number;
    brand: string;
    image_urls: string[];
  };
  quantity: number;
  size: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  total_price: number;
  status: string;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  createdAt: string;
}

export default function ProfileScreen() {
  const { user, addAddress, logout, selectedCurrency, changeCurrency, currencies, formatPrice } = useAuth();

  // Address form states
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);

  // Order history states
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Fetch past orders from backend
  const fetchUserOrders = async () => {
    if (!user) return;
    setIsLoadingOrders(true);
    try {
      const response = await api.get(`/orders/user/${user.id}`);
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  // Handle adding new shipping address
  const handleAddAddress = async () => {
    if (!street || !city || !state || !postalCode || !country) {
      Alert.alert('Required Fields', 'Please fill in all address inputs.');
      return;
    }

    setIsSubmittingAddress(true);
    const success = await addAddress({
      street,
      city,
      state,
      postal_code: postalCode,
      country,
    });

    setIsSubmittingAddress(false);
    if (success) {
      Alert.alert('Success 🎉', 'New shipping address added!');
      setStreet('');
      setCity('');
      setState('');
      setPostalCode('');
      setCountry('');
    } else {
      Alert.alert('Error', 'Failed to add address.');
    }
  };

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-5">
        <ActivityIndicator size="large" color="#ea580c" />
        <Text className="text-sm text-gray-500 mt-2">Connecting session...</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-gray-50">
      
      {/* 1. Profile Banner */}
      <View className="bg-white p-5 border-b border-gray-100 flex-row justify-between items-center">
        <View className="flex-1 mr-4">
          <Text className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Customer Account</Text>
          <Text className="text-2xl font-bold text-secondary-dark">{user.name}</Text>
          <Text className="text-sm text-gray-500">{user.email}</Text>
        </View>
        <TouchableOpacity
          onPress={logout}
          className="bg-red-50 px-4 py-2.5 rounded-xl border border-red-100"
        >
          <Text className="text-xs text-red-500 font-bold">Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Region & Currency Preferences */}
      <View className="bg-white p-5 my-4 border-y border-gray-100">
        <Text className="text-base font-bold text-secondary-dark mb-1">Region & Currency</Text>
        <Text className="text-xs text-gray-400 mb-4">Choose your region and corresponding currency to adjust pricing across the app:</Text>
        
        <View>
          {currencies.map((curr) => {
            const isSelected = selectedCurrency.code === curr.code;
            return (
              <TouchableOpacity
                key={curr.code}
                onPress={() => changeCurrency(curr.code)}
                className={`p-3.5 rounded-xl border flex-row justify-between items-center mb-2.5 ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <View className="flex-row items-center">
                  <Text className="text-xl mr-3">{curr.flag}</Text>
                  <View>
                    <Text className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-secondary-dark'}`}>
                      {curr.label}
                    </Text>
                    <Text className="text-[10px] text-gray-400">Default Currency</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-xs font-black text-secondary-dark mr-2">
                    {curr.code} ({curr.symbol})
                  </Text>
                  {isSelected && (
                    <View className="bg-primary/10 w-5 h-5 rounded-full items-center justify-center">
                      <Text className="text-[10px] text-primary font-bold">✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 3. Order History Section */}
      <View className="bg-white p-5 my-4 border-y border-gray-100">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base font-bold text-secondary-dark">Order History</Text>
          <TouchableOpacity onPress={fetchUserOrders} className="bg-gray-100 px-3 py-1.5 rounded-lg">
            <Text className="text-[10px] font-bold text-gray-600">🔄 Refresh</Text>
          </TouchableOpacity>
        </View>

        {isLoadingOrders ? (
          <ActivityIndicator color="#ea580c" className="my-6" />
        ) : orders.length === 0 ? (
          <View className="py-6 items-center">
            <Text className="text-gray-400 text-xs">You haven't placed any orders yet.</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 mb-3">
              <View className="flex-row justify-between mb-2">
                <Text className="text-xs font-bold text-secondary-dark">Order ID: #{order._id.substring(order._id.length - 6).toUpperCase()}</Text>
                <View className="bg-orange-100 px-2 py-0.5 rounded-full">
                  <Text className="text-[9px] font-bold text-primary uppercase">{order.status}</Text>
                </View>
              </View>

              {/* Items listing */}
              {order.items?.map((item, index) => (
                <View key={index} className="flex-row justify-between py-1.5 border-b border-gray-100/50">
                  <Text className="text-xs text-secondary flex-1 mr-2" numberOfLines={1}>
                    {item.product_id?.name || 'Product'} ({item.size})
                  </Text>
                  <Text className="text-xs text-gray-400">Qty: {item.quantity}</Text>
                </View>
              ))}

              {/* Date & Subtotal */}
              <View className="flex-row justify-between items-center mt-3 pt-2">
                <Text className="text-[10px] text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString()}
                </Text>
                <Text className="text-sm font-black text-secondary-dark">
                  Total: {formatPrice(order.total_price)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* 3. Shipping Address Book */}
      <View className="bg-white p-5 mb-4 border-y border-gray-100">
        <Text className="text-base font-bold text-secondary-dark mb-1">Your Shipping Addresses</Text>
        <Text className="text-xs text-gray-400 mb-3">List of addresses registered to your account:</Text>

        {!user.address_book || user.address_book.length === 0 ? (
          <Text className="text-xs text-gray-400 py-2">No addresses saved yet.</Text>
        ) : (
          user.address_book.map((addr, idx) => (
            <View key={idx} className="p-3.5 rounded-xl border border-gray-100 bg-white mb-2">
              <Text className="text-xs font-bold text-secondary-dark">{addr.street}</Text>
              <Text className="text-[11px] text-gray-500 mt-0.5">{addr.city}, {addr.state} {addr.postal_code}, {addr.country}</Text>
              {addr.is_default && (
                <View className="mt-2 bg-green-50 self-start px-2 py-0.5 rounded-full border border-green-100">
                  <Text className="text-[9px] font-bold text-green-600">★ Default Address</Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      {/* 4. Add Address Form */}
      <View className="bg-white p-5 mb-10 border-t border-gray-100">
        <Text className="text-base font-bold text-secondary-dark mb-3">Add New Address</Text>
        
        <View className="space-y-3">
          <TextInput
            placeholder="Street Address (e.g. 456 Fashion Way)"
            placeholderTextColor="#9ca3af"
            value={street}
            onChangeText={setStreet}
            className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-secondary-dark text-xs mb-2"
          />
          <View className="flex-row justify-between mb-2">
            <TextInput
              placeholder="City"
              placeholderTextColor="#9ca3af"
              value={city}
              onChangeText={setCity}
              className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-secondary-dark text-xs flex-1 mr-2"
            />
            <TextInput
              placeholder="State/Province"
              placeholderTextColor="#9ca3af"
              value={state}
              onChangeText={setState}
              className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-secondary-dark text-xs flex-1"
            />
          </View>
          <View className="flex-row justify-between mb-3">
            <TextInput
              placeholder="Postal Code"
              placeholderTextColor="#9ca3af"
              value={postalCode}
              onChangeText={setPostalCode}
              className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-secondary-dark text-xs flex-1 mr-2"
            />
            <TextInput
              placeholder="Country"
              placeholderTextColor="#9ca3af"
              value={country}
              onChangeText={setCountry}
              className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-secondary-dark text-xs flex-1"
            />
          </View>

          <TouchableOpacity
            onPress={handleAddAddress}
            disabled={isSubmittingAddress}
            className="bg-secondary-dark p-3.5 rounded-xl items-center justify-center"
          >
            {isSubmittingAddress ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-xs">Add Shipping Address</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

    </ScrollView>
  );
}
