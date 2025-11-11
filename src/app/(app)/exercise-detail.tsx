import { View, Image, StatusBar, TouchableOpacity, ScrollView, Text, Linking, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Exercise } from '@/lib/sanity/types'
import { client, urlFor } from '@/lib/sanity/client'
import { defineQuery } from 'groq'
import Markdown from 'react-native-markdown-display'

export const singleExerciseQuery = defineQuery(`*[_type == "exercise" && _id == $id][0]`);

const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
        case 'beginner': return 'bg-green-500';
        case 'intermediate': return 'bg-yellow-500';
        case 'advanced': return 'bg-red-500';
        default: return 'bg-gray-500';
    }
};

const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
        case 'beginner': return 'Beginner';
        case 'intermediate': return 'Intermediate';
        case 'advanced': return 'Advanced';
        default: return 'Unknown';
    }
};

export default function ExerciseDetail() {
    const router = useRouter();
    const [exercise, setExercise] = useState<Exercise>(null);
    const [loading, setLoading] = useState(true);
    const [aiGuidance, setAiGuidance] = useState<string>('');
    const [aiLoading, setAiLoading] = useState(false);

    const { id } = useLocalSearchParams<{
        id: string;
    }>();

    useEffect(() => {
        // Fetch exercise details based on the id
        const fetchExercise = async () => {
            if (!id) return;
            try {
                const exerciseData = await client.fetch(singleExerciseQuery, { id });
                setExercise(exerciseData);
            } catch (error) {
                console.error('Error fetching exercise details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchExercise();
    }, [id]);

    const getAiGuidance = async () => {
        if (!exercise) return;
        setAiLoading(true);

        try {
            const prompt = `Provide detailed guidance on how to perform the "${exercise.name}" exercise correctly. Include:
1. Proper form and technique
2. Common mistakes to avoid
3. Tips for maximizing effectiveness
4. Breathing tips
Keep it concise but informative.`;

            const response = await fetch("/api/ai", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt,
                    exerciseData: {
                        name: exercise.name,
                        difficulty: exercise.difficulty,
                        description: exercise.description,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch AI guidance");
            }

            const data = await response.json();
            setAiGuidance(data.guidance);
        } catch (error) {
            console.error("Error fetching AI guidance:", error);
            setAiGuidance("Sorry, there was an error getting AI guidance. Please try again.");
        } finally {
            setAiLoading(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className='flex-1 bg-white'>
                <View className='flex-1 items-center justify-center'>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text className='text-gray-500'>Loading exercise...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!exercise) {
        return (
            <SafeAreaView className='flex-1 bg-white'>
                <View className='flex-1 items-center justify-center'>
                    <Text className='text-gray-500'>Exercise not found: {id}</Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className='mt-4 bg-blue-500 px-6 py-3 rounded-lg'
                    >
                        <Text className='text-white font-semibold'>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className='flex-1 bg-white'>
            <StatusBar barStyle='light-content' backgroundColor='#000' />

            {/* Header with close button */}
            <View className='absolute top-12 left-0 right-0 z-10 px-4'>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className='w-10 h-10 bg-black/20 rounded-full items-center
                    justify-center backdrop-blur-sm'
                >
                    <Ionicons name='close' size={24} color='white' />
                </TouchableOpacity>
            </View>

            <ScrollView
                className='flex-1'
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Image */}
                <View className='h-80 bg-white relative'>
                    {exercise?.image ? (
                        <Image
                            source={{ uri: urlFor(exercise.image?.asset?._ref).url() }}
                            className='w-full h-full'
                            resizeMode='contain'
                        />
                    ) : (
                        <View className='w-full h-full bg-gradient-to-br from-blue-400 
                        to-purple-500 items-center justify-center'>
                            <Ionicons name='fitness' size={80} color='white' />
                        </View>
                    )}

                    {/* Gradient overlay */}
                    <View className='absolute bottom-0 left-0 right-0 h-20
                    bg-gradient-to-t from-black/60 to-transparent'/>
                </View>

                {/* Content */}
                <View className='px-6 py-6'>
                    {/* Title and difficulty */}
                    <View className='flex-row items-start justify-between mb-4'>
                        <View className='flex-1 mr-4'>
                            <Text className='text-3xl font-bold text-gray-800 mb-2'>
                                {exercise?.name}
                            </Text>
                            <View
                                className={`self-start px-4 py-2 rounded-full
                            ${getDifficultyColor(exercise?.difficulty)}`}
                            >
                                <Text className='text-sm font-semibold text-white'>
                                    {getDifficultyText(exercise.difficulty)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Description */}
                    <View className='mb-6'>
                        <Text className='text-xl font-semibold text-gray-800 mb-3'>
                            Description
                        </Text>
                        <Text className='text-gray-600 text-base leading-6'>
                            {exercise.description || 'No description available for this exercise.'}
                        </Text>
                    </View>

                    {/* Video Section */}
                    {exercise?.videoUrl && (
                        <View className='mb-6'>
                            <Text className='text-xl font-semibold text-gray-800 mb-3'>
                                Video Tutorial
                            </Text>
                            <TouchableOpacity
                                className='bg-red-500 rounded-xl p-4 flex-row items-center'
                                onPress={() => Linking.openURL(exercise.videoUrl)}
                            >
                                <View className='w-12 h-12 bg-white rounded-full items-center 
                                justify-center mr-4'>
                                    <Ionicons name='play' size={20} color='#EF4444' />
                                </View>
                                <View>
                                    <Text className='text-white font-semibold text-lg'>
                                        Watch Tutorial
                                    </Text>
                                    <Text className='text-red-100 text-sm'>
                                        Learn proper form
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* AI Guidance */}
                    {(aiGuidance || aiLoading) && (
                        <View className='mb-6'>
                            <View className='flex-row items-center mb-3'>
                                <Ionicons name='fitness' size={24} color='#3B82F6' />
                                <Text className='text-xl font-semibold text-gray-800 ml-2'>
                                    AI Coach says...
                                </Text>
                            </View>

                            {aiLoading ? (
                                <View className='bg-gray-50 rounded-xl p-4 items-center'>
                                    <ActivityIndicator size="small" color="#3B82F6" />
                                    <Text className='text-gray-600 mt-2'>
                                        Generating personalized guidance...
                                    </Text>
                                </View>
                            ) : (
                                <View className='bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500'>
                                    <Markdown
                                        style={
                                            {
                                                body: {
                                                    paddingBottom: 20,
                                                },
                                                heading2: {
                                                    fontSize: 18,
                                                    fontWeight: "bold",
                                                    color: "#1f2937",
                                                    marginTop: 12,
                                                    marginBottom: 6,
                                                },
                                                heading3: {
                                                    fontSize: 16,
                                                    fontWeight: "600",
                                                    color: "#374151",
                                                    marginTop: 8,
                                                    marginBottom: 4,
                                                }
                                            }
                                        }
                                    >
                                        {aiGuidance}
                                    </Markdown>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View className='mt-8 gap-2'>
                        {/* AI Coach Button */}
                        <TouchableOpacity
                            className={`rounded-xl py-4 items-center ${aiLoading
                                ? 'bg-gray-400'
                                : aiGuidance
                                    ? 'bg-green-500'
                                    : 'bg-blue-500'
                                }`}
                            onPress={getAiGuidance}
                            disabled={aiLoading}
                        >
                            {aiLoading ? (
                                <View className='flex-row items-center'>
                                    <ActivityIndicator size="small" color="white" />
                                    <Text className='text-white font-bold text-lg ml-2'>
                                        Loading...
                                    </Text>
                                </View>
                            ) : (
                                <Text className='text-white font-bold text-lg'>
                                    {aiGuidance
                                        ? 'Regenerate AI Guidance'
                                        : 'Get AI Guidance on Form & Technique'}
                                </Text>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            className='bg-gray-200 rounded-xl py-4 items-center'
                            onPress={() => router.back()}
                        >
                            <Text className='text-gray-800 font-bold text-lg'>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}