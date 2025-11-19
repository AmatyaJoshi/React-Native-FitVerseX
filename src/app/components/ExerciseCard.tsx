import { View, Text, TouchableOpacity, Image } from 'react-native'
import { Exercise } from '@/lib/sanity/types'
import React from 'react'
import { urlFor } from '@/lib/sanity/client';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/contexts/ThemeContext';

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

interface ExerciseCardProps {
    item: Exercise;
    onPress?: () => void;
    showChevron?: boolean;
}

export default function ExerciseCard({
    item,
    onPress,
    showChevron = false,
}: ExerciseCardProps) {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            onPress={onPress}
            className={`${theme === 'dark' ? 'bg-charcoal border-gray-800' : 'bg-white border-gray-300'} rounded-2xl mb-4 shadow-sm border`}>
            <View className="flex-row p-6">
                <View className={`w-20 h-20 ${theme === 'dark' ? 'bg-charcoal/50' : 'bg-gray-100'} rounded-xl mr-4 overflow-hidden`}>
                    {item.image ? (
                        <Image
                            source={{ uri: urlFor(item.image?.asset?._ref).url()}}
                            className='w-full h-full'
                            resizeMode='contain'
                        />
                    ): (
                        <View className='w-full h-full bg-gradient-to-br from-blue-400 
                        to-purple-500 items-center justify-center'>
                            <Ionicons name='fitness' size={24} color='white' />
                        </View>
                    )}
                </View>

                <View className='flex-1 justify-between'>
                    <View>
                        <Text className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-1`} style={{ letterSpacing: -0.4 }}>
                            {item.name}
                        </Text>
                        <Text className={`text-base font-black ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`} numberOfLines={2} style={{ letterSpacing: -0.3 }}>
                            {item.description || "No description available."}
                        </Text>
                    </View>

                    <View className='flex-row items-center justify-between'>
                        <View className={`px-3 py-1 rounded-full ${getDifficultyColor(item.difficulty)}`}>
                            <Text className='text-xs font-semibold text-white'>
                                {getDifficultyText(item.difficulty)}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}