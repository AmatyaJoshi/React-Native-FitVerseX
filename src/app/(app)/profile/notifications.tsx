import React, { useState } from "react";
import { ScrollView, Text, View, StatusBar, TouchableOpacity, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/lib/contexts/ThemeContext";

export default function NotificationsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [achievementAlerts, setAchievementAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);

  return (
    <SafeAreaView className={`flex flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`} edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1">
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        
        {/* Header */}
        <View className={`px-6 py-4 flex-row items-center justify-between ${theme === 'dark' ? 'bg-charcoal border-gray-800' : 'bg-white border-gray-200'} border-b`}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={theme === 'dark' ? '#F3F4F6' : '#1F2937'} />
          </TouchableOpacity>
          <Text className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Notifications</Text>
          <View className="w-7" />
        </View>

        {/* Notification Settings */}
        <View className="px-6 pt-6">
          <View className={`${theme === 'dark' ? 'bg-charcoal border-gray-800' : 'bg-white border-gray-300'} rounded-2xl shadow-sm border overflow-hidden mb-6`}>
            <Text className={`px-6 pt-6 pb-4 text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ letterSpacing: -1.2 }}>Push Notifications</Text>
            
            {/* Workout Reminders */}
            <View className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'} flex-row items-center justify-between`}>
              <View className="flex-1">
                <Text className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Workout Reminders</Text>
                <Text className={`text-base font-black ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-1`} style={{ letterSpacing: -0.3 }}>Get reminded to exercise</Text>
              </View>
              <Switch
                value={workoutReminders}
                onValueChange={setWorkoutReminders}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor={workoutReminders ? 'white' : '#9CA3AF'}
              />
            </View>

            {/* Achievement Alerts */}
            <View className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'} flex-row items-center justify-between`}>
              <View className="flex-1">
                <Text className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Achievement Alerts</Text>
                <Text className={`text-base font-black ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-1`} style={{ letterSpacing: -0.3 }}>Celebrate your milestones</Text>
              </View>
              <Switch
                value={achievementAlerts}
                onValueChange={setAchievementAlerts}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor={achievementAlerts ? 'white' : '#9CA3AF'}
              />
            </View>

            {/* Push Notifications */}
            <View className={`px-6 py-4 flex-row items-center justify-between`}>
              <View className="flex-1">
                <Text className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>All Push Notifications</Text>
                <Text className={`text-base font-black ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-1`} style={{ letterSpacing: -0.3 }}>Enable all push alerts</Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor={pushNotifications ? 'white' : '#9CA3AF'}
              />
            </View>
          </View>

          {/* Email Notifications */}
          <View className={`${theme === 'dark' ? 'bg-charcoal border-gray-800' : 'bg-white border-gray-300'} rounded-2xl shadow-sm border overflow-hidden mb-6`}>
            <Text className={`px-6 pt-6 pb-4 text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ letterSpacing: -1.2 }}>Email Notifications</Text>
            
            <View className={`px-6 py-4 flex-row items-center justify-between`}>
              <View className="flex-1">
                <Text className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Email Updates</Text>
                <Text className={`text-base font-black ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-1`} style={{ letterSpacing: -0.3 }}>Receive updates via email</Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor={emailNotifications ? 'white' : '#9CA3AF'}
              />
            </View>
          </View>

          {/* Info Box */}
          <View className={`${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-50'} rounded-2xl p-4 mb-8 flex-row`}>
            <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
            <View className="flex-1 ml-3">
              <Text className={`text-base font-black ${theme === 'dark' ? 'text-blue-200' : 'text-blue-900'}`} style={{ letterSpacing: -0.3 }}>
                Notification settings are saved automatically. You can manage these preferences at any time.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
