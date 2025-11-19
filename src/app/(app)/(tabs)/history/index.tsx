import { client } from "@/lib/sanity/client";
import { GetWorkoutsQueryResult, Workout } from "@/lib/sanity/types";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { defineQuery } from "groq";
import { formatDuration } from "lib/utils";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/lib/contexts/ThemeContext";

export const getWorkoutsQuery =
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

export default function HistoryPage() {
  const { user } = useUser();
  const [workouts, setWorkouts] = useState<GetWorkoutsQueryResult>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { refresh } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  const fetchWorkouts = async () => {
    if (!user?.id) return;

    try {
      const results = await client.fetch(getWorkoutsQuery, { userId: user.id });
      setWorkouts(results);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [user?.id]);

  // Handle refresh parameter from deleted workout
  useEffect(() => {
    if (refresh === 'true') {
      fetchWorkouts();
      // Clear the refresh parameter from the URL
      router.replace('/(app)/(tabs)/history');
    }
  }, [refresh]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWorkouts();
  }

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

  const formatWorkoutDuration = (seconds?: number) => {
    if (!seconds) return "Duration not recorded";
    return formatDuration(seconds)
  };

  const getTotalSets = (workout: GetWorkoutsQueryResult[number]) => {
    return (
      workout.exercises?.reduce((total, exercise) => {
        return total + (exercise.sets?.length || 0);
      }, 0) || 0
    );
  };

  const getExerciseNames = (workout: GetWorkoutsQueryResult[number]) => {
    return (
      workout.exercises?.map((ex) => ex.exercise?.name).filter(Boolean) || []
    );
  };

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`} edges={['top', 'left', 'right']}>
        <View className={`px-6 py-4 ${theme === 'dark' ? 'bg-charcoal border-gray-800' : 'bg-white border-gray-200'} border-b`}>
          <Text className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Workout History
          </Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-4`}>Loading your workouts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      {/* Header */}
      <View className={`px-6 pt-6 pb-4 border-b ${theme === 'dark' ? 'border-gray-800 bg-black' : 'border-gray-200 bg-white'}`}>
        <Text className={`text-5xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-1`} style={{ letterSpacing: -1.5 }}>
          History
        </Text>
        <Text className={`${workouts.some(w => !w.duration) ? 'text-sm' : 'text-base'} font-black ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} style={{ letterSpacing: -0.3 }}>
          {workouts.length} workout{workouts.length !== 1 ? 's' : ''} completed
        </Text>
      </View>

      {/* Workouts List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
            title='Pull to refresh'
            titleColor={theme === 'dark' ? '#D1D5DB' : '#6B7280'}
          />
        }
      >
        {workouts.length === 0 ? (
          <View className={`${theme === 'dark' ? 'bg-charcoal' : 'bg-white'} rounded-2xl p-8 items-center`}>
            <Ionicons name="barbell-outline" size={64} color={theme === 'dark' ? '#6B7280' : '#9CA3AF'} />
            <Text className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mt-4`} style={{ letterSpacing: -1 }}>
              No workouts yet
            </Text>
          <Text className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-4 text-center text-base font-black`} style={{ letterSpacing: -0.3 }}>
              Your completed workouts will appear here
            </Text>
          </View>
        ) : (
          <View className="space-y-4 gap-4">
            {workouts.map((workout) => (
              <TouchableOpacity
                key={workout._id}
                className={`${theme === 'dark' ? 'bg-charcoal border-gray-800' : 'bg-white border-gray-300'} rounded-2xl p-6 shadow-sm border`}
                activeOpacity={0.7}
                onPress={() => {
                  router.push({
                    pathname: '/history/workout-record',
                    params: {
                      workoutId: workout._id
                    },
                  });
                }}
              >
                {/* Workout Header */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-1">
                    <Text className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(workout.date || "")}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="time-outline" size={16} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                      <Text className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} ml-2`}>
                        {formatWorkoutDuration(workout.duration)}
                      </Text>
                    </View>
                  </View>
                  <View className={`${theme === 'dark' ? 'bg-black' : 'bg-blue-100'} rounded-full w-12 h-12 items-center justify-center`}>
                    <Ionicons
                      name="fitness-outline"
                      size={24}
                      color="#3B82F6" />
                  </View>
                </View>

                {/* Workout Stats */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <View className={`${theme === 'dark' ? 'bg-charcoal/50' : 'bg-gray-100'} rounded-lg px-3 py-2 mr-3`}>
                      <Text className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} font-medium text-sm`}>
                        {workout.exercises?.length || 0} exercises
                      </Text>
                    </View>
                    <View className={`${theme === 'dark' ? 'bg-charcoal/50' : 'bg-gray-100'} rounded-lg px-3 py-2`}>
                      <Text className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} font-medium text-sm`}>
                        {getTotalSets(workout)} sets
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Exercise List */}
                {workout.exercises && workout.exercises.length > 0 && (
                  <View>
                    <Text className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Exercises:
                    </Text>
                    <View className="flex-row flex-wrap">
                      {getExerciseNames(workout)
                        .slice(0, 3)
                        .map((name, index) => (
                          <View
                            key={index}
                            className={`${theme === 'dark' ? 'bg-black' : 'bg-blue-50'} rounded-lg px-3 py-1 mr-2 mb-2`}
                          >
                            <Text className={`${theme === 'dark' ? 'text-gray-200' : 'text-blue-700'} text-sm font-medium`}>
                              {name}
                            </Text>
                          </View>
                        ))
                      }
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView >
  );
}