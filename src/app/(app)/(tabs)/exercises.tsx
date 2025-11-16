import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router';
import { defineQuery } from 'groq';
import { client } from '@/lib/sanity/client';
import { Exercise } from '@/lib/sanity/types';
import ExerciseCard from '@/app/components/ExerciseCard';
import { useTheme } from '@/lib/contexts/ThemeContext';

export const exercisesQuery = defineQuery(`*[_type == "exercise"]{...}`);

export default function Exercises() {
    const [searchQuery, setSearchQuery] = useState('');
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const router = useRouter();
    const { theme } = useTheme();
    const [refreshing, setRefreshing] = useState(false);

    const fetchExercises = async () => {
        try {
            // Fetch exercises from Sanity
            const exercises = await client.fetch(exercisesQuery);


            setExercises(exercises);
            setFilteredExercises(exercises);
        } catch (error) {
            console.error('Error fetching exercises:', error);
        }
    };

    useEffect(() => {
        fetchExercises();
    }, []);

    useEffect(() => {
        const filtered = exercises.filter((exercise: Exercise) =>
            exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredExercises(filtered);
    }, [searchQuery, exercises]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchExercises();
        setRefreshing(false);
    };

    return (
        <SafeAreaView className={`flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
                <Text className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Exercise Library
                </Text>
                <Text className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    Discover and master new exercises
                </Text>

                {/* Search Bar */}
                <View className={`flex-row items-center mt-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl px-4 py-3`}>
                    <Ionicons name='search' size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                    <TextInput
                        className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} flex-1 ml-3`}
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

            {/* Exercise List */}
            <FlatList
                data={filteredExercises}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 24 }}
                renderItem={({ item }) => (
                    <ExerciseCard
                        item={item}
                        onPress={() => router.push(`/exercise-detail?id=${item._id}`)}
                    />
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#3B82F6"]} //Android
                        tintColor="#3B82F6" //iOS
                        title='Pull to refresh exercises' //iOS
                        titleColor={theme === 'dark' ? '#D1D5DB' : '#6B7280'} //iOS
                    />
                }
                ListEmptyComponent={
                    <View className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-2xl p-8 items-center`}>
                        <Ionicons name='fitness-outline' size={64} color={theme === 'dark' ? '#6B7280' : '#9CA3AF'} />
                        <Text className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mt-4`}>
                            {searchQuery ? 'No exercises found' : 'Loading exercises...'}
                        </Text>
                        <Text className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2 text-center`}>
                            {searchQuery
                                ? 'Try adjusting your search to find what you are looking for.'
                                : 'Please wait while we load the exercise library for you.'}
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    )
};