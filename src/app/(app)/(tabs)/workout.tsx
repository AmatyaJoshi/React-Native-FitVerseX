import React, { useRef, useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar, Text, TouchableOpacity, View, ScrollView, Animated } from 'react-native'
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { VideoView, useVideoPlayer } from 'expo-video';

function Workout() {
    const router = useRouter();
    const { theme } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [isPressed, setIsPressed] = useState(false);

    const player = useVideoPlayer(require('../../../../assets/videos/Fit_verse_x.mp4'), (player) => {
        player.loop = true;
        player.play();
    });

    useEffect(() => {
        if (isPressed) {
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 0.95,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
            ]).start();
            setIsPressed(false);
        }
    }, [isPressed]);

    const startWorkout = () => {
        setIsPressed(true);
        setTimeout(() => {
            router.push('/active-workout');
        }, 200);
    }

    return (
        <SafeAreaView className={`flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
            <View className='flex-1 relative'>
                {/* Video Background */}
                <VideoView
                    player={player}
                    contentFit="cover"
                    nativeControls={false}
                    style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}
                />

                {/* Dark Overlay */}
                <View className={`absolute inset-0 ${theme === 'dark' ? 'bg-black/40' : 'bg-black/5'}`} />
                
                {/* Gradient Overlay Top */}
                <View className='absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/50 to-transparent' />
                
                {/* Gradient Overlay Bottom */}
                <View className='absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 via-black/40 to-transparent' />

                {/* Main Content */}
                <View className='flex-1 px-6 justify-between relative z-10'>
                    {/* Header */}
                    <View className='pt-8'>
                        <Text className='text-5xl font-black text-white mb-1' style={{ letterSpacing: -1.5 }}>
                            Workout
                        </Text>
                        <Text className='text-base text-white/70 font-black' style={{ letterSpacing: -0.3 }}>
                            Begin your training session
                        </Text>
                    </View>

                    {/* Start Workout Card - Bottom */}
                    <View className='pb-12'>
                        <TouchableOpacity
                            onPress={startWorkout}
                            activeOpacity={0.7}
                        >
                            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                                <View className={`${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-600'} rounded-2xl p-6 items-center`}>
                                    <View className='flex-row items-center justify-center'>
                                        <Ionicons name='play' size={24} color='white' />
                                        <Text className='text-white font-black text-lg ml-3' style={{ letterSpacing: -0.5 }}>
                                            Start Workout
                                        </Text>
                                    </View>
                                </View>
                            </Animated.View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Workout