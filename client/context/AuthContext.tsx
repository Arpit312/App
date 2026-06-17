import React, { createContext, useState, useContext, ReactNode } from 'react';
import api from '../services/api';
import { Product } from '../hooks/useProducts';

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  address_book: Address[];
  wishlist_ids: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}

export interface Currency {
  code: string;
  symbol: string;
  rate: number;
  label: string;
  flag: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', rate: 1.0, label: 'United States', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', rate: 0.92, label: 'Europe', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', rate: 0.79, label: 'United Kingdom', flag: '🇬🇧' },
  { code: 'INR', symbol: '₹', rate: 83.50, label: 'India', flag: '🇮🇳' },
  { code: 'AED', symbol: 'د.إ', rate: 3.67, label: 'United Arab Emirates', flag: '🇦🇪' }
];

interface AuthContextType {
  user: User | null;
  cart: CartItem[];
  isLoading: boolean;
  selectedCurrency: Currency;
  currencies: Currency[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addToCart: (product: Product, quantity: number, size: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  clearCart: () => void;
  addAddress: (addressData: Omit<Address, 'is_default'>) => Promise<boolean>;
  changeCurrency: (code: string) => void;
  formatPrice: (priceUSD: number) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Authenticate user
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        setUser(response.data.user);
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  // Sign out user
  const logout = () => {
    setUser(null);
    setCart([]);
  };

  // Add item to cart
  const addToCart = (product: Product, quantity: number, size: string) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.product._id === product._id && item.size === size
      );

      if (existingItemIndex > -1) {
        // Increment quantity of existing item
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      } else {
        // Add new item
        return [...prevCart, { product, quantity, size }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId: string, size: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.product._id === productId && item.size === size))
    );
  };

  // Empty out cart
  const clearCart = () => {
    setCart([]);
  };

  // Add new shipping address to user account
  const addAddress = async (addressData: Omit<Address, 'is_default'>): Promise<boolean> => {
    if (!user) return false;
    setIsLoading(true);
    try {
      const response = await api.post('/auth/address', {
        user_id: user.id,
        ...addressData,
        is_default: user.address_book.length === 0,
      });

      if (response.data.success) {
        setUser((prevUser) => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            address_book: response.data.address_book,
          };
        });
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Add address error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES[0]);

  const changeCurrency = (code: string) => {
    const found = CURRENCIES.find((c) => c.code === code);
    if (found) {
      setSelectedCurrency(found);
    }
  };

  const formatPrice = (priceUSD: number): string => {
    const converted = priceUSD * selectedCurrency.rate;
    return `${selectedCurrency.symbol}${converted.toFixed(2)}`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        cart,
        isLoading,
        selectedCurrency,
        currencies: CURRENCIES,
        login,
        logout,
        addToCart,
        removeFromCart,
        clearCart,
        addAddress,
        changeCurrency,
        formatPrice,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
