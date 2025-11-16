import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/contexts/ThemeContext';

function Workout() {
    const router = useRouter();
    const { theme } = useTheme();

    const startWorkout = () => {
        // Navigate to active workout screen
        router.push('/active-workout');
    }

    return (
        <SafeAreaView className={`flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

            {/* Main Start Workout Screen */}
            <View className='flex-1 px-6 '>
                {/* Header */}
                <View className='pt-8 pb-8'>
                    <Text className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                        Ready to Train?
                    </Text>
                    <Text className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Start your workout session
                    </Text>
                </View>
            </View>

            {/* Generic Start Workout Card */}
            <View className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-3xl p-6 shadow-sm border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-300'} mx-6 mb-3`}>
                <View className='flex-row items-center justify-between mb-6'>
                    <View className='flex-row items-center'>
                        <View className={`w-12 h-12 ${theme === 'dark' ? 'bg-black' : 'bg-blue-100'} rounded-full items-center justify-center mr-3`}>
                            <Ionicons name='fitness' size={24} color='#3B82F6' />
                        </View>
                        <View>
                            <Text className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Start Workout
                            </Text>
                            <Text className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Begin your training session</Text>
                        </View>
                    </View>
                    <View className='bg-green-100 px-3 py-1 rounded-full'>
                        <Text className='text-green-700 font-medium text-sm'>Ready</Text>
                    </View>
                </View>

                {/* Start Button */}
                <TouchableOpacity
                    onPress={startWorkout}
                    className='bg-blue-600 rounded-2xl py-4 items-center active:bg-blue-700'
                    activeOpacity={0.8}
                >
                    <View className='flex-row items-center'>
                        <Ionicons name='play' size={20} color='white' className='mr-2' />
                        <Text className='text-white font-semibold text-lg'>
                            Start Workout
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default Workout