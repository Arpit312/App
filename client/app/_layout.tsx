import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Create a client for fetching data
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: '#111827',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerShadowVisible: false,
          }}
        >
          {/* Main Tab Route group */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Product Detail Route page */}
          <Stack.Screen 
            name="product/[id]" 
            options={{ 
              title: 'Product Details',
              headerBackTitle: 'Back',
            }} 
          />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
