import { View, Text, StatusBar, TouchableOpacity, TextInput, FlatList, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useWorkoutStore } from 'store/workout-store';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ExerciseCard from '@/app/components/ExerciseCard';
import { Exercise } from '@/lib/sanity/types';
import { client } from '@/lib/sanity/client';
import { exercisesQuery } from './(tabs)/exercises';
import { useTheme } from '@/lib/contexts/ThemeContext';

export default function ExerciseSelection() {
    const router = useRouter();
    const { addExerciseToWorkout } = useWorkoutStore();
    const { theme } = useTheme();
    const [exercises, setExercises] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredExercises, setFilteredExercises] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchExercises();
    }, []);

    useEffect(() => {
        const filtered = exercises.filter((exercise) =>
            exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredExercises(filtered);
    }, [searchQuery, exercises]);

    const fetchExercises = async () => {
        try {
            const exercises = await client.fetch(exercisesQuery);
            setExercises(exercises);
            setFilteredExercises(exercises);
        } catch (error) {
            console.error('Error fetching exercises:', error);
        }
    };

    const handleExercisePress = (exercise: Exercise) => {
        // Directly add exercise to workout 
        addExerciseToWorkout({ name: exercise.name, sanityId: exercise._id });
        router.back();
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchExercises();
        setRefreshing(false);
    };

    return (
        <SafeAreaView 
            className={`flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}
            edges={['top', 'left', 'right']}
        >
            <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme === 'dark' ? '#000000' : '#ffffff'} />
            
            {/* Header */}
            <View className={`${theme === 'dark' ? 'bg-black border-gray-800' : 'bg-white border-gray-100'} px-4 pt-4 pb-6 shadow-sm border-b`}>
                <View className='flex-row items-center justify-between mb-4'>
                    <Text className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ letterSpacing: -1.2 }}>
                        Add Exercise
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className='w-8 h-8 items-center justify-center'
                    >
                        <Ionicons name='close' size={24} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                    </TouchableOpacity>
                </View>

                <Text className={`text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4 font-black`} style={{ letterSpacing: -0.3 }}>
                    Tap any exercise to add it to your workout
                </Text>

                {/* Search Bar */}
                <View className={`flex-row items-center ${theme === 'dark' ? 'bg-charcoal/50' : 'bg-gray-100'} rounded-xl px-4 py-3`}>
                    <Ionicons name='search' size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                    <TextInput
                        className={`flex-1 ml-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}
                        placeholder='Search exercises...'
                        placeholderTextColor={theme === 'dark' ? '#6B7280' : '#9CA3AF'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name='close-circle' size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Exercises List */}
            <FlatList
                data={filteredExercises}
                renderItem={({ item }) => (
                    <ExerciseCard
                        item={item}
                        onPress={() => handleExercisePress(item)}
                        showChevron={false}
                    />
                )}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: 16,
                    paddingBottom: 32,
                    paddingHorizontal: 16,
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#3B82F6"]} //Android
                        tintColor="3B82F6" //iOS
                    />
                }
                ListEmptyComponent={
                    <View className='flex-1 items-center justify-center py-20'>
                        <Ionicons name='fitness-outline' size={64} color={theme === 'dark' ? '#4B5563' : '#D1D5DB'} />
                        <Text className={`text-base font-black ${theme === 'dark' ? 'text-gray-400' : 'text-gray-300'} mt-4`} style={{ letterSpacing: -0.3 }}>
                            {searchQuery ? 'No exercises found' : 'Loading exercises...'}
                        </Text>
                        <Text className={`text-base font-black ${theme === 'dark' ? 'text-gray-400' : 'text-gray-300'} mt-2`} style={{ letterSpacing: -0.3 }}>
                            {searchQuery
                                ? "Try adjusting your search"
                                : "Please wait a moment"
                            }
                        </Text>
                    </View>
                }
            ></FlatList>
        </SafeAreaView>
    )
}
