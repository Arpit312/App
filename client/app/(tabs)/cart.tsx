import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import api from '../../services/api';

export default function CartScreen() {
  const { user, cart, clearCart, removeFromCart, formatPrice } = useAuth();
  const router = useRouter();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);

  // Calculate cart total price
  const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  // Handle checkout and place order
  const handlePlaceOrder = async () => {
    if (!user) return;
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add products to your cart before checking out.');
      return;
    }

    const shippingAddress = user.address_book?.[selectedAddressIndex];
    if (!shippingAddress) {
      Alert.alert(
        'Address Required',
        'Please add a shipping address in your Profile tab before checkout.',
        [
          { text: 'Add Address Now', onPress: () => router.push('/(tabs)/profile') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderItems = cart.map((item) => ({
        product_id: item.product._id,
        quantity: item.quantity,
        size: item.size,
      }));

      const response = await api.post('/orders', {
        user_id: user.id,
        items: orderItems,
        shipping_address: {
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.postal_code,
          country: shippingAddress.country,
        },
      });

      setIsPlacingOrder(false);
      if (response.data.success) {
        Alert.alert(
          'Order Placed! 🚀',
          `Thank you for shopping with us! Your order for ${formatPrice(cartTotal)} was placed successfully.`,
          [{ text: 'Great!', onPress: () => clearCart() }]
        );
      }
    } catch (error: any) {
      setIsPlacingOrder(false);
      const errMsg = error.response?.data?.message || 'Error executing checkout.';
      Alert.alert('Checkout Failed', errMsg);
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
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-gray-50 p-5">
      
      {/* Active Shopping Cart */}
      <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
        <Text className="text-lg font-bold text-secondary-dark mb-3">Shopping Cart ({cart.length} items)</Text>
        
        {cart.length === 0 ? (
          <View className="py-10 items-center">
            <Text className="text-gray-400 text-sm mb-4">Your cart is currently empty.</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)')}
              className="bg-primary/10 px-6 py-2.5 rounded-xl"
            >
              <Text className="text-primary font-bold text-xs">Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Cart Item rows */}
            {cart.map((item, index) => (
              <View key={`${item.product._id}-${item.size}-${index}`} className="flex-row justify-between py-3.5 border-b border-gray-100">
                <View className="flex-1 mr-4">
                  <Text className="text-sm font-semibold text-secondary-dark">{item.product.name}</Text>
                  <Text className="text-xs text-gray-400 mt-0.5">Size: {item.size}  |  Brand: {item.product.brand}</Text>
                  <TouchableOpacity
                    onPress={() => removeFromCart(item.product._id, item.size)}
                    className="mt-1"
                  >
                    <Text className="text-[10px] text-red-500 font-bold">🗑 Remove</Text>
                  </TouchableOpacity>
                </View>
                <View className="items-end justify-center">
                  <Text className="text-sm font-bold text-secondary-dark">{formatPrice(item.product.price * item.quantity)}</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</Text>
                </View>
              </View>
            ))}

            {/* Total Price */}
            <View className="flex-row justify-between items-center mt-5 pt-3">
              <Text className="text-base font-bold text-secondary-dark">Total Amount:</Text>
              <Text className="text-xl font-black text-primary">{formatPrice(cartTotal)}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Select Delivery Address */}
      {cart.length > 0 && (
        <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
          <Text className="text-base font-bold text-secondary-dark mb-1">Select Delivery Address</Text>
          <Text className="text-xs text-gray-400 mb-3">Choose where to deliver your parcel:</Text>

          {!user.address_book || user.address_book.length === 0 ? (
            <View className="py-2">
              <Text className="text-xs text-gray-400 mb-3">No address found. Please add a shipping address in your Profile tab first.</Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/profile')}
                className="bg-secondary-dark/10 p-3 rounded-xl items-center"
              >
                <Text className="text-secondary-dark font-bold text-xs">Add Address Book Entry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {user.address_book.map((addr, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedAddressIndex(idx)}
                  className={`p-3 rounded-xl border mb-2 flex-row justify-between items-center ${
                    selectedAddressIndex === idx
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <View className="flex-1">
                    <Text className="text-xs font-semibold text-secondary-dark">{addr.street}</Text>
                    <Text className="text-[10px] text-gray-500 mt-0.5">{addr.city}, {addr.state} {addr.postal_code}</Text>
                  </View>
                  {selectedAddressIndex === idx && (
                    <Text className="text-xs font-bold text-primary">✔</Text>
                  )}
                </TouchableOpacity>
              ))}

              {/* Checkout Action Button */}
              <TouchableOpacity
                onPress={handlePlaceOrder}
                disabled={isPlacingOrder}
                className={`mt-4 bg-primary p-4 rounded-xl items-center justify-center shadow-md shadow-primary/20 ${
                  isPlacingOrder ? 'opacity-80' : ''
                }`}
              >
                {isPlacingOrder ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-sm">Place Order & Checkout</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
