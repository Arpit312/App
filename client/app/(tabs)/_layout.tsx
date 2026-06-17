import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ea580c', // Orange primary color
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#111827',
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Shop',
          tabBarLabel: 'Shop',
          // Quick fallback rendering for custom tab icons since we avoid installing extra vector icon library bloat
          tabBarIcon: ({ color }) => (
            <View className="items-center justify-center">
              <Text style={{ color, fontSize: 18, fontWeight: 'bold' }}>🛍️</Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
