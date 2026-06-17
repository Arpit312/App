import { useState, useEffect } from 'react';
import api from '../services/api';
import { Product } from './useProducts';

export interface QuickLink {
  label: string;
  query: string;
}

export interface SearchSuggestionsResponse {
  success: boolean;
  results: Product[];
  quickLinks: QuickLink[];
}

export const useSearchSuggestions = (query: string) => {
  const [results, setResults] = useState<Product[]>([]);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim() === '') {
      setResults([]);
      setQuickLinks([]);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const handler = setTimeout(async () => {
      try {
        const { data } = await api.get<SearchSuggestionsResponse>('/products/suggestions', {
          params: { q: query.trim() }
        });
        if (isMounted) {
          setResults(data.results || []);
          setQuickLinks(data.quickLinks || []);
        }
      } catch (error) {
        console.error('Failed to fetch search suggestions:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }, 200); // 200ms debounce for live suggestions

    return () => {
      isMounted = false;
      clearTimeout(handler);
    };
  }, [query]);

  return { results, quickLinks, isLoading };
};
