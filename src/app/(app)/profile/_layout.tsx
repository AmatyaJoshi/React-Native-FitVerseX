import { Stack } from 'expo-router'
import React from 'react'

function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="edit-profile"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="preferences"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="help-support"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default Layout
