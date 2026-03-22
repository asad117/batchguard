import { Tabs } from 'expo-router';
import { LayoutDashboard, ScanLine } from 'lucide-react-native';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF', headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Scan Inventory',
          tabBarIcon: ({ color }) => <ScanLine size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}