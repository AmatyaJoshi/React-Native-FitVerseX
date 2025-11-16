import React, { useEffect, useState } from "react";
import { ScrollView, Text, View, Image, StatusBar, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { GetWorkoutsQueryResult } from "@/lib/sanity/types";
import { defineQuery } from "groq";
import { client } from "@/lib/sanity/client";
import { formatDuration } from "lib/utils";
import { useTheme } from "@/lib/contexts/ThemeContext";

export const getHomeWorkoutsQuery =
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

export default function HomePage() {
  const { user } = useUser();
  const router = useRouter();
  const { theme, setThemeMode } = useTheme();
  const [workouts, setWorkouts] = useState<GetWorkoutsQueryResult>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkouts = async () => {
    if (!user?.id) return;

    try {
      const results = await client.fetch(getHomeWorkoutsQuery, { userId: user.id });
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const firstName = user?.firstName || "Friend";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  }

  const getTotalSets = (workout: GetWorkoutsQueryResult[number]) => {
    return (
      workout.exercises?.reduce((total, exercise) => {
        return total + (exercise.sets?.length || 0);
      }, 0) || 0
    );
  };

  const lastWorkout = workouts.length > 0 ? workouts[0] : null;
  return (
    <SafeAreaView className={`flex flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`} edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1">
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        {/* Header with Logo and Theme Toggle */}
        <View className="flex-row items-center justify-between px-6 pt-2">
          <View className="flex-1">
            <Image
              source={theme === 'dark' ? require("../../../../images/fit_verse_x_logo_dark.png") : require("../../../../images/fit_verse_x_logo.png")}
              className="w-40 h-16"
              resizeMode="contain"
            />
          </View>
          {/* Dark/Light Mode Toggle */}
          <TouchableOpacity 
            onPress={() => setThemeMode(theme === 'dark' ? 'light' : 'dark')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={theme === 'dark' ? 'moon' : 'sunny'} 
              size={24} 
              color={theme === 'dark' ? 'white' : 'black'} 
            />
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View className="px-6 pt-6 pb-6">
          <Text className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{getGreeting()}, {firstName}!</Text>
          <Text className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Let's crush your fitness goals today</Text>
        </View>

        {/* Your Stats */}
        <View className="px-6 mb-6">
          <View className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-300'}`}>
            <Text className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
              Your Stats
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
                  {totalWorkouts > 0 ? formatDuration(averageDuration) : "-"}
                </Text>
                <Text className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                  Average{"\n"}Duration
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Text className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3`}>Quick Actions</Text>
          
          {/* Start Workout - Featured */}
          <TouchableOpacity 
            onPress={() => router.push('/(app)/(tabs)/workout')}
            activeOpacity={0.8}
          >
            <View className="bg-blue-600 rounded-2xl p-4 mb-3 shadow-sm flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 bg-blue-500 rounded-lg items-center justify-center mr-4">
                  <Ionicons name="play" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-lg">Start Workout</Text>
                  <Text className="text-blue-100 text-sm">Begin your training session</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="white" />
            </View>
          </TouchableOpacity>

          {/* Other Actions */}
          <View className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-sm border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-300'} overflow-hidden`}>
            {/* Browse Exercises */}
            <TouchableOpacity 
              onPress={() => router.push('/(app)/(tabs)/exercises')}
              activeOpacity={0.7}
            >
              <View className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'} flex-row items-center justify-between`}>
                <View className="flex-row items-center flex-1">
                  <View className={`w-12 h-12 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg items-center justify-center mr-4`}>
                    <Ionicons name="book" size={24} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  </View>
                  <View>
                    <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold`}>Browse Exercises</Text>
                    <Text className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Find new movements</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? '#4B5563' : '#D1D5DB'} />
              </View>
            </TouchableOpacity>

            {/* View History */}
            <TouchableOpacity 
              onPress={() => router.push('/(app)/(tabs)/history')}
              activeOpacity={0.7}
            >
              <View className="px-6 py-4 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className={`w-12 h-12 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg items-center justify-center mr-4`}>
                    <Ionicons name="bar-chart" size={24} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                  </View>
                  <View>
                    <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold`}>View History</Text>
                    <Text className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>Track progress</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? '#4B5563' : '#D1D5DB'} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Motivation Card */}
        <View className="px-6 mb-8">
          <View className={`${theme === 'dark' ? 'bg-gray-100' : 'bg-gray-900'} rounded-2xl p-6 overflow-hidden border ${theme === 'dark' ? 'border-gray-200' : 'border-gray-900'}`}>
            <Text className={`${theme === 'dark' ? 'text-gray-900' : 'text-white'} text-lg font-bold mb-2`}>Tip of the Day</Text>
            <Text className={`${theme === 'dark' ? 'text-gray-700' : 'text-gray-300'} text-sm leading-6`}>
              Consistency beats perfection. Small daily efforts compound into remarkable results over time.
            </Text>
          </View>
        </View>

        {/* Last Workout */}
        {lastWorkout && (
          <View className="px-6 mb-8">
            <Text className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-3`}>Last Workout</Text>
            <View className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-300'}`}>
              {/* Workout Header */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                  <Text className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatDate(lastWorkout.date || "")}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="time-outline" size={16} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                    <Text className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} ml-2`}>
                      {formatDuration(lastWorkout.duration || 0)}
                    </Text>
                  </View>
                </View>
                <View className={`${theme === 'dark' ? 'bg-black' : 'bg-blue-100'} rounded-full w-12 h-12 items-center justify-center`}>
                  <Ionicons name="fitness-outline" size={24} color="#3B82F6" />
                </View>
              </View>

              {/* Workout Stats */}
              <View className="flex-row items-center">
                <View className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg px-3 py-2 mr-3`}>
                  <Text className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} font-medium text-sm`}>
                    {lastWorkout.exercises?.length || 0} exercises
                  </Text>
                </View>
                <View className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg px-3 py-2`}>
                  <Text className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} font-medium text-sm`}>
                    {getTotalSets(lastWorkout)} sets
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}