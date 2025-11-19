import React from "react";
import { ScrollView, Text, View, StatusBar, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useTheme } from "@/lib/contexts/ThemeContext";

export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useUser();
  const { theme } = useTheme();

  return (
    <SafeAreaView className={`flex flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`} edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1">
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        
        {/* Header */}
        <View className={`px-6 py-4 flex-row items-center justify-between ${theme === 'dark' ? 'bg-charcoal border-gray-800' : 'bg-white border-gray-200'} border-b`}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={theme === 'dark' ? '#F3F4F6' : '#1F2937'} />
          </TouchableOpacity>
          <Text className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Edit Profile</Text>
          <View className="w-7" />
        </View>

        {/* Profile Content */}
        <View className="px-6 pt-6">
          <View className={`${theme === 'dark' ? 'bg-charcoal border-gray-800' : 'bg-white border-gray-300'} rounded-2xl p-6 shadow-sm border mb-6`}>
            <Text className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`} style={{ letterSpacing: -1.2 }}>Profile Information</Text>
            
            {/* First Name */}
            <View className="mb-4">
              <Text className={`text-base font-black ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`} style={{ letterSpacing: -0.3 }}>First Name</Text>
              <View className={`border ${theme === 'dark' ? 'border-gray-700 bg-charcoal/50' : 'border-gray-300 bg-gray-50'} rounded-lg px-4 py-3`}>
                <Text className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>{user?.firstName || "N/A"}</Text>
              </View>
            </View>

            {/* Last Name */}
            <View className="mb-4">
              <Text className={`text-base font-black ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`} style={{ letterSpacing: -0.3 }}>Last Name</Text>
              <View className={`border ${theme === 'dark' ? 'border-gray-700 bg-charcoal/50' : 'border-gray-300 bg-gray-50'} rounded-lg px-4 py-3`}>
                <Text className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>{user?.lastName || "N/A"}</Text>
              </View>
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className={`text-base font-black ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`} style={{ letterSpacing: -0.3 }}>Email Address</Text>
              <View className={`border ${theme === 'dark' ? 'border-gray-700 bg-charcoal/50' : 'border-gray-300 bg-gray-50'} rounded-lg px-4 py-3`}>
                <Text className={theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}>{user?.emailAddresses?.[0]?.emailAddress || "N/A"}</Text>
              </View>
            </View>

            {/* Phone */}
            <View>
              <Text className={`text-base font-black ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`} style={{ letterSpacing: -0.3 }}>Phone Number</Text>
              <View className={`border ${theme === 'dark' ? 'border-gray-700 bg-charcoal/50' : 'border-gray-300 bg-gray-50'} rounded-lg px-4 py-3`}>
                <Text className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Not set</Text>
              </View>
            </View>
          </View>

          {/* Info Box */}
          <View className={`${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-50'} rounded-2xl p-4 mb-8 flex-row`}>
            <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
            <View className="flex-1 ml-3">
              <Text className={`text-base font-black ${theme === 'dark' ? 'text-blue-200' : 'text-blue-900'}`} style={{ letterSpacing: -0.3 }}>
                To update your profile details, please log in to your Clerk account settings.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
