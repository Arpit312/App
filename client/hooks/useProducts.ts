import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export interface Product {
  _id: string;
  name: string;
  brand: string;
  category: 'Clothing' | 'Shoes' | 'Accessories';
  price: number;
  stock_quantity: number;
  description: string;
  image_urls: string[];
  specifications?: {
    size_guide?: string[];
    color?: string[];
    material?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface FetchProductsResponse {
  success: boolean;
  count: number;
  total: number;
  currentPage: number;
  totalPages: number;
  products: Product[];
}

interface FetchProductDetailResponse {
  success: boolean;
  product: Product;
}

interface ProductsFilterParams {
  category?: string;
  brand?: string;
  sort?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Hook to fetch products with queries and filters.
 */
export const useProducts = (filters: ProductsFilterParams = {}) => {
  return useQuery<FetchProductsResponse, Error>({
    queryKey: ['products', filters],
    queryFn: async () => {
      const { data } = await api.get<FetchProductsResponse>('/products', {
        params: filters,
      });
      return data;
    },
  });
};

/**
 * Hook to fetch single product details by ID.
 */
export const useProductDetails = (id: string) => {
  return useQuery<FetchProductDetailResponse, Error>({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get<FetchProductDetailResponse>(`/products/${id}`);
      return data;
    },
    enabled: !!id, // Only query if id is truthy
  });
};
