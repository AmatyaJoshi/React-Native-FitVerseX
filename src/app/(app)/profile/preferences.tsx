import React, { useState } from "react";
import { ScrollView, Text, View, StatusBar, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/lib/contexts/ThemeContext";

export default function PreferencesPage() {
  const router = useRouter();
  const { theme, themeMode, setThemeMode } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>(themeMode);
  const [selectedUnit, setSelectedUnit] = useState<'kg' | 'lbs'>('kg');

  const themes = [
    { id: 'light', label: 'Light', icon: 'sunny-outline' },
    { id: 'dark', label: 'Dark', icon: 'moon-outline' },
    { id: 'system', label: 'System', icon: 'settings-outline' },
  ];

  const units = [
    { id: 'kg', label: 'Kilograms (kg)' },
    { id: 'lbs', label: 'Pounds (lbs)' },
  ];

  return (
    <SafeAreaView className={`flex flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`} edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1">
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        
        {/* Header */}
        <View className={`px-6 py-4 flex-row items-center justify-between ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b`}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={theme === 'dark' ? '#F3F4F6' : '#1F2937'} />
          </TouchableOpacity>
          <Text className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Preferences</Text>
          <View className="w-7" />
        </View>

        {/* Preferences */}
        <View className="px-6 pt-6">
          {/* Theme Selection */}
          <View className="mb-6">
            <Text className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>Theme</Text>
            <View className="flex-row justify-between gap-3">
              {themes.map((themeOption) => (
                <TouchableOpacity
                  key={themeOption.id}
                  onPress={() => {
                    setSelectedTheme(themeOption.id as any);
                    setThemeMode(themeOption.id as 'light' | 'dark' | 'system');
                  }}
                  activeOpacity={0.8}
                  className={`flex-1 rounded-2xl p-4 items-center border-2 ${
                    selectedTheme === themeOption.id
                      ? `border-blue-600 ${theme === 'dark' ? 'bg-black' : 'bg-blue-50'}`
                      : `${theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`
                  }`}
                >
                  <Ionicons
                    name={themeOption.icon as any}
                    size={24}
                    color={selectedTheme === themeOption.id ? '#3B82F6' : theme === 'dark' ? '#6B7280' : '#6B7280'}
                  />
                  <Text
                    className={`text-sm font-medium mt-2 ${
                      selectedTheme === themeOption.id
                        ? 'text-blue-600'
                        : theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                    }`}
                  >
                    {themeOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Weight Unit Selection */}
          <View className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-300'} rounded-2xl shadow-sm border overflow-hidden mb-6`}>
            <Text className={`px-6 pt-6 pb-4 text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Weight Unit</Text>
            
            {units.map((unit, index) => (
              <TouchableOpacity
                key={unit.id}
                onPress={() => setSelectedUnit(unit.id as any)}
                activeOpacity={0.7}
                className={`px-6 py-4 flex-row items-center justify-between ${
                  index !== units.length - 1 ? `border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}` : ''
                }`}
              >
                <Text className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{unit.label}</Text>
                <View
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    selectedUnit === unit.id
                      ? 'border-blue-600 bg-blue-600'
                      : `${theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'}`
                  }`}
                >
                  {selectedUnit === unit.id && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Privacy Settings */}
          <View className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-300'} rounded-2xl shadow-sm border overflow-hidden mb-6`}>
            <Text className={`px-6 pt-6 pb-4 text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Privacy</Text>
            
            <TouchableOpacity 
              activeOpacity={0.7}
              className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'} flex-row items-center justify-between`}>
              <Text className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? '#6B7280' : '#6B7280'} />
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.7}
              className="px-6 py-4 flex-row items-center justify-between">
              <Text className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Terms of Service</Text>
              <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? '#6B7280' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          {/* Info Box */}
          <View className={`${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-50'} rounded-2xl p-4 mb-8 flex-row`}>
            <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
            <View className="flex-1 ml-3">
              <Text className={`text-sm ${theme === 'dark' ? 'text-blue-200' : 'text-blue-900'}`}>
                Your preferences are saved automatically and will be applied throughout the app.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
