import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Alert, ScrollView, StatusBar, Text, TouchableOpacity, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { GetWorkoutsQueryResult } from "@/lib/sanity/types";
import { defineQuery } from "groq";
import { client } from "@/lib/sanity/client";
import { formatDuration } from "lib/utils";
import { useTheme } from "@/lib/contexts/ThemeContext";

export const getProfileWorkoutsQuery =
  defineQuery(`*[_type == "workout" && userId == $userId] | order(date desc){
  _id,
  date,
  duration,
  exercises[]{
    exercise->{
      _id,
      name,
    },
    sets[]{
      reps,
      weight,
      weightUnit,
      _type,
      _key
    },
    _type,
    _key
  }
}`);

export default function ProfilePage() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { theme } = useTheme();
  const [workouts, setWorkouts] = useState<GetWorkoutsQueryResult>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkouts = async () => {
    if (!user?.id) return;

    try {
      const results = await client.fetch(getProfileWorkoutsQuery, { userId: user.id });
      setWorkouts(results);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [user?.id]);

  // Calculate stats
  const totalWorkouts = workouts.length;
  const totalDuration = workouts.reduce((sum, workout) => sum + (workout.duration || 0), 0);
  const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

  // Calculate days since joining (using createdAt from Clerk)
  const joinDate = user?.createdAt ? new Date(user.createdAt) : new Date();
  const daysSinceJoining = Math.floor(
    (new Date().getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className={`flex flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-4`}>Loading Profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`} edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1">
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        {/* Header */}
        <View className="px-6 pt-8 pb-6">
          <Text className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Profile</Text>
          <Text className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            Manage your account and stats
          </Text>
        </View>

        {/* User Info Card */}
        <View className="px-6 mb-6">
          <View className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-300'}`}>
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 bg-blue-600 rounded-full items-center justify-center mr-4">
                <Image
                  source={{
                    uri: user.externalAccounts[0]?.imageUrl ?? user?.imageUrl,
                  }}
                  className="rounded-full w-16 h-16"
                />
              </View>
              <View className="flex-1">
                <Text className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.firstName || "User"}
                </Text>
                <Text className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  {user?.emailAddresses?.[0]?.emailAddress}
                </Text>
                <Text className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                  Member Since {formatJoinDate(joinDate)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Overview */}
        <View className="px-6 mb-6">
          <View className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-300'}`}>
            <Text className={`text-ls font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
              Your Fitness Stats
            </Text>

            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {totalWorkouts}
                </Text>
                <Text className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                  Total{"\n"}Workouts
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {formatDuration(totalDuration)}
                </Text>
                <Text className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                  Total{"\n"}Time
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {daysSinceJoining}
                </Text>
                <Text className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                  Days{"\n"}Since Joining
                </Text>
              </View>
            </View>
            {totalWorkouts > 0 && (
              <View className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                <View className="flex-row items-center justify-between">
                  <Text className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Average workout duration:
                  </Text>
                  <Text className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatDuration(averageDuration)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Account Settings */}
        <View className="px-6 mb-6">
          <Text className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
            Account Settings
          </Text>

          {/* Settings Options */}
          <View className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-sm border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-300'}`}>
            <TouchableOpacity 
              onPress={() => router.push('/(app)/profile/edit-profile')}
              activeOpacity={0.7}
              className={`flex-row items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
              <View className="flex-row items-center">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${theme === 'dark' ? 'bg-black' : 'bg-blue-100'}`}>
                  <Ionicons name="person-outline" size={20} color="#3B82F6" />
                </View>
                <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-medium`}>Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? '#6B7280' : '#6B7280'} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/(app)/profile/notifications')}
              activeOpacity={0.7}
              className={`flex-row items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
              <View className="flex-row items-center">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${theme === 'dark' ? 'bg-black' : 'bg-blue-100'}`}>
                  <Ionicons name="notifications-outline" size={20} color="#3B82F6" />
                </View>
                <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-medium`}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? '#6B7280' : '#6B7280'} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/(app)/profile/preferences')}
              activeOpacity={0.7}
              className={`flex-row items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
              <View className="flex-row items-center">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${theme === 'dark' ? 'bg-black' : 'bg-blue-100'}`}>
                  <Ionicons name="settings-outline" size={20} color="#3B82F6" />
                </View>
                <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-medium`}>Preferences</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? '#6B7280' : '#6B7280'} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/(app)/profile/help-support')}
              activeOpacity={0.7}
              className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${theme === 'dark' ? 'bg-black' : 'bg-blue-100'}`}>
                  <Ionicons name="help-circle-outline" size={20} color="#3B82F6" />
                </View>
                <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-medium`}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? '#6B7280' : '#6B7280'} />
            </TouchableOpacity>

          </View>
        </View>

        {/* Sign Out */}
        <View className="px-6 mb-8">
          <TouchableOpacity
            onPress={handleSignOut}
            className="bg-red-600 rounded-2xl p-4 shadow-sm"
            activeOpacity={0.8}
          >
            <View className='flex-row justify-center items-center'>
              <Ionicons name='log-out-outline' size={20} color='white' />
              <Text className='text-white text-lg font-semibold ml-2'>
                Sign Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}