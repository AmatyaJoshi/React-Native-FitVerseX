import * as React from 'react'
import { Alert, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/build/Ionicons'
import { useTheme } from '@/lib/contexts/ThemeContext'

export default function SignUpScreen() {
    const { isLoaded, signUp, setActive } = useSignUp()
    const { theme, setThemeMode } = useTheme()
    const [isLoading, setIsLoading] = React.useState(false)
    const router = useRouter()

    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [pendingVerification, setPendingVerification] = React.useState(false)
    const [code, setCode] = React.useState('')

    // Handle submission of sign-up form
    const onSignUpPress = async () => {
        if (!isLoaded) return
        if (!emailAddress || !password) {
            Alert.alert("Error", 'Please fill in all fields');
            return;
        }

        console.log(emailAddress, password)

        // Start sign-up process using email and password provided
        try {
            await signUp.create({
                emailAddress,
                password,
            })

            // Send user an email with verification code
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

            // Set 'pendingVerification' to true to display second form
            // and capture OTP code
            setPendingVerification(true)
        } catch (err) {
            // See https://clerk.com/docs/guides/development/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))
        }
    }

    // Handle submission of verification form
    const onVerifyPress = async () => {
        if (!isLoaded) return
        if (!code) {
            Alert.alert("Error", 'Please enter the verification code');
            return;
        }
        setIsLoading(true);

        try {
            // Use the code the user provided to attempt verification
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code,
            })

            // If verification was completed, set the session to active
            // and redirect the user
            if (signUpAttempt.status === 'complete') {
                await setActive({ session: signUpAttempt.createdSessionId })
                router.replace('/(tabs)')
            } else {
                // If the status is not complete, check why. User may need to
                // complete further steps.
                console.error(JSON.stringify(signUpAttempt, null, 2))
            }
        } catch (err) {
            // See https://clerk.com/docs/guides/development/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))
        } finally {
            setIsLoading(false);
        }
    }

    if (pendingVerification) {
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
                        <View className='flex-1 justify-center'>
                            {/* Logo/Branding */}
                            <View className='items-center mb-8'>
                                <Image
                                    source={theme === 'dark' ? require("../../../images/fit_verse_x_logo_dark.png") : require("../../../images/fit_verse_x_logo.png")}
                                    className="w-48 h-20"
                                    resizeMode="contain"
                                />
                                <Text className={`text-2xl font-black mt-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ letterSpacing: -0.5 }}>
                                    Check your Email
                                </Text>
                                <Text className={`text-base font-black text-center mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} style={{ letterSpacing: -0.3 }}>
                                    We've sent a verification code to{"\n"}
                                    {emailAddress}
                                </Text>
                            </View>
                            {/* Verification Form */}
                            <View className={`rounded-2xl p-6 shadow-sm border ${theme === 'dark' ? 'bg-charcoal border-gray-800' : 'bg-white border-gray-300'} mb-6`}>
                                <Text className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6 text-center`} style={{ letterSpacing: -1 }}>
                                    Enter Verification Code
                                </Text>
                                {/* Verification Input */}
                                <View className='mb-6'>
                                    <Text className={`text-sm font-black mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} style={{ letterSpacing: -0.2 }}>
                                        Verification Code
                                    </Text>
                                    <View className={`flex-row items-center rounded-xl px-4 py-4 border ${theme === 'dark' ? 'bg-charcoal/50 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                        <Ionicons name='key-outline' size={20} color={theme === 'dark' ? '#9CA3AF' : '#6B7280'} />
                                        <TextInput
                                            value={code}
                                            placeholder='Enter 6-digit code'
                                            placeholderTextColor={theme === 'dark' ? '#6B7280' : '#9CA3AF'}
                                            onChangeText={setCode}
                                            className={`flex-1 ml-3 text-center text-lg tracking-widest font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                                            keyboardType='number-pad'
                                            maxLength={6}
                                            editable={!isLoading}
                                        />
                                    </View>
                                </View>

                                {/* Verify Button */}
                                <TouchableOpacity
                                    onPress={onVerifyPress}
                                    disabled={isLoading}
                                    className={`rounded-xl py-4 shadow-sm mb-4 ${isLoading ? 'bg-gray-400' : 'bg-green-600'
                                        }`}
                                    activeOpacity={0.8}
                                >
                                    <View className='flex-row justify-center items-center'>
                                        {isLoading ? (
                                            <Ionicons name='refresh' size={20} color='white' />
                                        ) : (
                                            <Ionicons name='checkmark-circle-outline' size={20} color='white' />
                                        )}
                                        <Text className='text-white text-lg font-black ml-2' style={{ letterSpacing: -0.3 }}>
                                            {isLoading ? 'Verifying...' : 'Verify Email'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                {/* Resend Code */}
                                <TouchableOpacity className='py-2'>
                                    <Text className='text-center text-blue-600 font-black' style={{ letterSpacing: -0.2 }}>
                                        Didn't receive the code? Resend
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Footer */}
                        <View className='pb-6'>
                            <Text className={`text-center text-sm font-black ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`} style={{ letterSpacing: -0.2 }}>
                                Almost there! Just one more step
                            </Text>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        )
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
                    {/* Main */}
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

                        {/* Sign-Up Form */}
                        <View className={`rounded-2xl p-6 shadow-sm border ${theme === 'dark' ? 'bg-charcoal border-gray-800' : 'bg-white border-gray-300'} mb-6`}>
                            <Text className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6 text-center`} style={{ letterSpacing: -1 }}>
                                Create your account
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
                                        value={password}
                                        placeholder='Create a password'
                                        placeholderTextColor={theme === 'dark' ? '#6B7280' : '#9CA3AF'}
                                        secureTextEntry={true}
                                        onChangeText={setPassword}
                                        className={`flex-1 ml-3 font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                                        editable={!isLoading}
                                    />
                                </View>
                                <Text className={`text-xs mt-1 font-black ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} style={{ letterSpacing: -0.1 }}>
                                    Must be at least 8 characters
                                </Text>
                            </View>

                            {/* Sign Up Button */}
                            <TouchableOpacity
                                onPress={onSignUpPress}
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
                                    <Text className='text-white text-lg font-black ml-2' style={{ letterSpacing: -0.3 }}>
                                        {isLoading ? 'Creating Account...' : 'Create Account'}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* Terms */}
                            <Text className={`text-xs text-center mb-4 font-black ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} style={{ letterSpacing: -0.1 }}>
                                By signing up, you agree to our to our Terms of Service and Privacy Policy.
                            </Text>
                        </View>
                        {/* Sign In Link */}
                        <View className='flex-row justify-center items-center'>
                            <Text className={`font-black ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} style={{ letterSpacing: -0.2 }}>Already have an account? </Text>
                            <Link href="/sign-in" asChild>
                                <TouchableOpacity>
                                    <Text className='text-blue-600 font-black' style={{ letterSpacing: -0.2 }}>Sign In</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>

                    {/* Footer */}
                    <View className='pb-6'>
                        <Text className={`text-center text-sm font-black ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`} style={{ letterSpacing: -0.2 }}>
                            Ready to transform your fitness journey?
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView >
    )
}