import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Alert, StatusBar } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router';
import { defineQuery } from 'groq';
import { client } from '@/lib/sanity/client';
import { GetWorkoutRecordQueryResult } from '@/lib/sanity/types';
import { formatDuration } from 'lib/utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/contexts/ThemeContext';

const getWorkoutRecordQuery =
    defineQuery(`*[_type == "workout" && _id == $workoutId][0] {
  _id,
  _type,
  _createdAt,
  date,
  duration,
  exercises[]{
    exercise->{
      _id,
      name,
      description
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

export default function WorkoutRecord() {
    const { workoutId } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [workout, setWorkout] = useState<GetWorkoutRecordQueryResult | null>(null);
    const router = useRouter();
    const { theme } = useTheme();

    useEffect(() => {
        const fetchWorkout = async () => {
            if (!workoutId) return;

            try {
                const result = await client.fetch(getWorkoutRecordQuery, { workoutId });
                setWorkout(result);
            } catch (error) {
                console.error("Error fetching workout record:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkout();
    }, [workoutId]);

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Unknown Date';
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    const formatTime = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    }

    const formatWorkoutDuration = (seconds?: number) => {
        if (!seconds) return 'Duration not recorded';
        return formatDuration(seconds);
    }

    const getTotalSets = () => {
        return (
            workout?.exercises?.reduce((total, exercise) => {
                return total + (exercise.sets?.length || 0);
            }, 0) || 0
        );
    };

    const getTotalVolume = () => {
        let totalVolume = 0;
        let unit = "lbs";

        workout?.exercises?.forEach((exercise) => {
            exercise.sets?.forEach((set) => {
                if (set.weight && set.reps) {
                    totalVolume += set.weight * set.reps;
                    unit = set.weightUnit || "lbs";
                }
            });
        });
        return { volume: totalVolume, unit };
    }

    const handleDeleteWorkout = () => {
        Alert.alert(
            "Delete Workout",
            "Are you sure you want to delete this workout? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: deleteWorkout,
                },
            ]
        );
    };

    const deleteWorkout = async () => {
        if (!workoutId) return;

        setDeleting(true);

        try {
            await fetch('/api/delete-workout', {
                method: 'POST',
                body: JSON.stringify({ workoutId }),
            })
            router.replace('/(app)/(tabs)/history?refresh=true');
        } catch (error) {
            console.error("Error deleting workout:", error);
            Alert.alert(
                "Error",
                "Failed to delete workout. Please try again.",
                [{ text: "OK" }]
            );
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className={`flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`} edges={['top', 'left', 'right']}>
                <View className='flex-1 items-center justify-center'>
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-4`}>Loading workout...</Text>
                </View>
            </SafeAreaView>
        )
    }

    if (!workout) {
        return (
            <SafeAreaView className={`flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`} edges={['top', 'left', 'right']}>
                <View className='flex-1 items-center justify-center'>
                    <Ionicons name='alert-circle-outline' size={64} color='#EF4444' />
                    <Text className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mt-4`}>
                        Workout Not Found
                    </Text>
                    <Text className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-2 text-center text-base font-black`} style={{ letterSpacing: -0.3 }}>
                        This workout record could not be found.
                    </Text>
                    <TouchableOpacity
                        className='bg-blue-600 px-6 py-3 rounded-lg mt-6'
                        onPress={() => router.back()}
                    >
                        <Text className='text-white font-medium'>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }

    const { volume, unit } = getTotalVolume();

    return (
        <View className={`flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
            <ScrollView className='flex-1'>
                <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
                {/* Page Header */}
                <View className={`px-6 pt-6 pb-6 border-b ${theme === 'dark' ? 'border-gray-800 bg-black' : 'border-gray-200 bg-white'}`}>
                    <Text className={`text-5xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-1`} style={{ letterSpacing: -1.5 }}>
                        Summary
                    </Text>
                    <Text className={`text-base font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {formatDate(workout?.date)}
                    </Text>
                </View>

                {/* Workout Summary */}
                <View className={`${theme === 'dark' ? 'bg-charcoal border-gray-800' : 'bg-white border-gray-300'} p-6 border-b`}>
                    <View className='flex-row items-center justify-between mb-4'>
                        <Text className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ letterSpacing: -1 }}>
                            Workout Details
                        </Text>
                        <TouchableOpacity
                            onPress={handleDeleteWorkout}
                            disabled={deleting}
                            className='bg-red-600 px-4 py-2 rounded-lg flex-row items-center'
                        >
                            {deleting ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name='trash-outline' size={16} color='#FFFFFF' />
                                    <Text className='text-white font-medium ml-2'>Delete</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View className='flex-row items-center mb-3'>
                        <Ionicons name='calendar-outline' size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                        <Text className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ml-3 font-medium`}>
                            {formatDate(workout.date)} at {formatTime(workout.date)}
                        </Text>
                    </View>

                    <View className='flex-row items-center mb-3'>
                        <Ionicons name='time-outline' size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                        <Text className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ml-3 font-medium`}>
                            {formatWorkoutDuration(workout.duration)}
                        </Text>
                    </View>

                    <View className='flex-row items-center mb-3'>
                        <Ionicons name='fitness-outline' size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                        <Text className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ml-3 font-medium`}>
                            {workout.exercises?.length || 0} exercises
                        </Text>
                    </View>

                    <View className='flex-row items-center mb-3'>
                        <Ionicons name='bar-chart-outline' size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                        <Text className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ml-3 font-medium`}>
                            {getTotalSets()} sets
                        </Text>
                    </View>

                    <View className='flex-row items-center'>
                        <Ionicons name='barbell-outline' size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                        <Text className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ml-3 font-medium`}>
                            {volume.toLocaleString()} {unit} total volume
                        </Text>
                    </View>
                </View>

                {/* Exercise List */}
                <View className='space-y-4 p-6 gap-4'>
                    {workout.exercises?.map((exerciseData, index) => (
                        <View
                            key={exerciseData._key}
                            className={`${theme === 'dark' ? 'bg-charcoal border-gray-800' : 'bg-white border-gray-300'} rounded-2xl p-6 shadow-sm border`}>
                            {/* Exercise Header */}
                            <View className='flex-row items-center justify-between mb-4'>
                                <View className='flex-1'>
                                    <Text className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        {exerciseData.exercise?.name || "Unknown Exercise"}
                                    </Text>
                                    <Text className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm mt-1`}>
                                        {exerciseData.sets?.length || 0} sets completed
                                    </Text>
                                </View>
                                <View className={`${theme === 'dark' ? 'bg-black' : 'bg-blue-100'} rounded-full w-10 h-10 items-center justify-center`}>
                                    <Text className={`${theme === 'dark' ? 'text-gray-200' : 'text-blue-600'} font-bold`}>
                                        {index + 1}
                                    </Text>
                                </View>
                            </View>

                            {/* Sets List */}
                            <View className='space-y-2'>
                                <Text className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                    Sets:
                                </Text>
                                {exerciseData.sets?.map((set, setIndex) => (
                                    <View
                                        key={set._key}
                                        className={`${theme === 'dark' ? 'bg-charcoal/50' : 'bg-gray-50'} rounded-lg p-3 flex-row items-center justify-between`}
                                    >
                                        <View className='flex-row items-center'>
                                            <View className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full w-6 h-6 items-center justify-center mr-3`}>
                                                <Text className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} font-medium text-xs`}>
                                                    {setIndex + 1}
                                                </Text>
                                            </View>
                                            <Text className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'} font-medium`}>
                                                {set.reps} reps
                                            </Text>
                                        </View>

                                        {set.weight && (
                                            <View className='flex-row items-center'>
                                                <Ionicons name='barbell-outline' size={16} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                                                <Text className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} font-medium ml-2`}>
                                                    {set.weight} {set.weightUnit || 'lbs'}
                                                </Text>
                                            </View>
                                        )}

                                    </View>
                                ))}
                            </View>

                            {/* Exercise Volume Summary */}
                            {exerciseData.sets && exerciseData.sets.length > 0 && (
                                <View className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                                    <View className='flex-row items-center justify-between'>
                                        <Text className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                            Exercise Volume:
                                        </Text>
                                        <Text className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                                            {exerciseData.sets
                                                .reduce((total, set) => {
                                                    return total + ((set.weight || 0) * (set.reps || 0));
                                                }, 0)
                                                .toLocaleString()}{" "}
                                            {exerciseData.sets[0]?.weightUnit || 'lbs'}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    )
}