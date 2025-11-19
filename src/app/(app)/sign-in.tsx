import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import GoogleSignIn from '../components/GoogleSignIn'
import AppleSignIn from '../components/AppleSignIn'
import { useTheme } from '@/lib/contexts/ThemeContext'

export default function Page() {
    const { signIn, setActive, isLoaded } = useSignIn()
    const { theme, setThemeMode } = useTheme()
    const [isLoading, setIsLoading] = React.useState(false)
    const router = useRouter()

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')

    // Handle the submission of the sign-in form
    const onSignInPress = async () => {
        if (!isLoaded) return;
        if (!emailAddress || !password) {
            Alert.alert("Error", 'Please fill in all fields');
            return;
        }

        // Start the sign-in process using the email and password provided
        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            })

            // If sign-in process is complete, set the created session as active
            // and redirect the user
            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId })
                router.replace('/(tabs)')
            } else {
                // If the status isn't complete, check why. User might need to
                // complete further steps.
                console.error(JSON.stringify(signInAttempt, null, 2))
            }
        } catch (err) {
            // See https://clerk.com/docs/guides/development/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <SafeAreaView className={`flex flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className='flex-1'
            >
                <View className={`flex-1 px-6 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
                    {/* Theme Toggle Button - Absolute Positioned */}
                    <View className="absolute top-4 right-6 z-10">
                        <TouchableOpacity 
                            onPress={() => setThemeMode(theme === 'dark' ? 'light' : 'dark')}
                            activeOpacity={0.7}
                            className={`w-10 h-10 items-center justify-center rounded-full ${theme === 'dark' ? 'bg-charcoal' : 'bg-gray-100'}`}
                        >
                            <Ionicons 
                                name={theme === 'dark' ? 'moon' : 'sunny'} 
                                size={20} 
                                color={theme === 'dark' ? 'white' : 'black'} 
                            />
                        </TouchableOpacity>
                    </View>
                    {/* Header Section */}
                    <View className='flex-1 justify-center'>
                        {/* Logo/Branding */}
                        <View className='items-center mb-8'>
                            <Image
                                source={theme === 'dark' ? require("../../../images/fit_verse_x_logo_dark.png") : require("../../../images/fit_verse_x_logo.png")}
                                className="w-48 h-20"
                                resizeMode="contain"
                            />
                            <Text className={`text-base font-black text-center mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} style={{ letterSpacing: -0.3 }}>
                                The extended universe of fitness{"\n"} to reach your goals
                            </Text>
                        </View>


                        {/* Sign-In Form */}
                        <View className={`rounded-2xl p-6 shadow-sm border ${theme === 'dark' ? 'bg-charcoal border-gray-800' : 'bg-white border-gray-300'} mb-6`}>
                            <Text className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6 text-center`} style={{ letterSpacing: -1 }}>
                                Welcome Back
                            </Text>

                            {/* Email Input */}
                            <View className='mb-4'>
                                <Text className={`text-sm font-black mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} style={{ letterSpacing: -0.2 }}>
                                    Email
                                </Text>
                                <View className={`flex-row items-center rounded-xl px-4 py-4 border ${theme === 'dark' ? 'bg-charcoal/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                    <Ionicons name='mail-outline' size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                                    <TextInput
                                        autoCapitalize='none'
                                        value={emailAddress}
                                        placeholder='Enter your email'
                                        placeholderTextColor={theme === 'dark' ? '#6B7280' : '#9CA3AF'}
                                        onChangeText={setEmailAddress}
                                        className={`flex-1 ml-3 font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                                        editable={!isLoading}
                                    />
                                </View>
                            </View>

                            {/* Password Input */}
                            <View className='mb-4'>
                                <Text className={`text-sm font-black mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} style={{ letterSpacing: -0.2 }}>
                                    Password
                                </Text>
                                <View className={`flex-row items-center rounded-xl px-4 py-4 border ${theme === 'dark' ? 'bg-charcoal/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                    <Ionicons name='lock-closed-outline' size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                                    <TextInput
                                        autoCapitalize='none'
                                        value={password}
                                        placeholder='Enter your password'
                                        placeholderTextColor={theme === 'dark' ? '#6B7280' : '#9CA3AF'}
                                        secureTextEntry={true}
                                        onChangeText={setPassword}
                                        className={`flex-1 ml-3 font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                                        editable={!isLoading}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Sign In Button */}
                        <TouchableOpacity
                            onPress={onSignInPress}
                            disabled={isLoading}
                            className={`rounded-xl py-4 shadow-sm mb-4 ${isLoading ? 'bg-gray-400' : 'bg-blue-600'
                                }`}
                            activeOpacity={0.8}
                        >
                            <View className='flex-row justify-center items-center'>
                                {isLoading ? (
                                    <Ionicons name='refresh' size={20} color='white' />
                                ) : (
                                    <Ionicons name='log-in-outline' size={20} color='white' />
                                )}
                                <Text className='text-white text-lg font-semibold ml-2'>
                                    {isLoading ? 'Signing In...' : 'Sign In'}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View className='flex-row items-center my-4'>
                            <View className={`flex-1 h-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
                            <Text className={`px-4 text-sm font-black ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`} style={{ letterSpacing: -0.2 }}>or</Text>
                            <View className={`flex-1 h-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
                        </View>

                        {/* Apple and Google Sign In Buttons */}
                        <View className='flex-row gap-3 mb-4'>
                            <AppleSignIn />
                            <GoogleSignIn />
                        </View>

                        {/* Sign Up Link */}
                        <View className='flex-row justify-center items-center mt-4'>
                            <Text className={`font-black ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} style={{ letterSpacing: -0.2 }}>Don't have an account? </Text>
                            <Link href="/sign-up" asChild>
                                <TouchableOpacity>
                                    <Text className='text-blue-600 font-black' style={{ letterSpacing: -0.2 }}>Sign Up</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>

                    {/* Footer Section */}
                    <View className='pb-6'>
                        <Text className={`text-center text-sm font-black ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`} style={{ letterSpacing: -0.2 }}>
                            Start your fitness journey today
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView >
    )
}