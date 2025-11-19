import { Stack } from 'expo-router'
import React from 'react'
import { useTheme } from '@/lib/contexts/ThemeContext';

function Layout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerTintColor: theme === 'dark' ? '#FFFFFF' : '#000000',
        headerStyle: {
          backgroundColor: theme === 'dark' ? '#000000' : '#FFFFFF',
        },
        headerTitleStyle: {
          color: theme === 'dark' ? '#FFFFFF' : '#000000',
          fontWeight: '600',
        },
      }}
    >
        <Stack.Screen
            name="index"
            options={{ headerShown: false }}
        />
        <Stack.Screen 
        name='workout-record' 
        options={{
            headerShown: true,
            headerTitle: "Workout Record",
            headerBackTitle: "History",
        }}
        />
    </Stack>
  );
}

export default Layout