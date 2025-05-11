import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/HapticTab';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function TabLayout() {
  const colorScheme = useColorScheme() || 'light'; // Provide 'light' as the default
  const backgroundColor = useThemeColor({}, 'background');
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarStyle: { backgroundColor },
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => <Ionicons 
            size={focused ? 28 : 24} 
            name={focused ? "car" : "car-outline"} 
            color={color}
          />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, focused }) => <Ionicons 
            size={focused ? 28 : 24} 
            name={focused ? "stats-chart" : "stats-chart-outline"} 
            color={color}
          />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Marketplace',
          tabBarIcon: ({ color, focused }) => <Ionicons 
            size={focused ? 28 : 24} 
            name={focused ? "analytics" : "analytics-outline"} 
            color={color}
          />,
        }}
      />
    </Tabs>
  );
}
