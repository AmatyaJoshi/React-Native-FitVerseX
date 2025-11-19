import React, { useCallback, useEffect } from 'react'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { useSSO } from '@clerk/clerk-expo'
import { View, Platform } from 'react-native'
import { router } from 'expo-router'
import { TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/lib/contexts/ThemeContext'

// Preloads the browser for Android devices to reduce authentication load time
export const useWarmUpBrowser = () => {
    useEffect(() => {
        if (Platform.OS !== 'android') return
        void WebBrowser.warmUpAsync()
        return () => {
            void WebBrowser.coolDownAsync()
        }
    }, [])
}

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession()

export default function AppleSignIn() {
    useWarmUpBrowser()
    const { theme } = useTheme()

    // Use the `useSSO()` hook to access the `startSSOFlow()` method
    const { startSSOFlow } = useSSO()

    const onPress = useCallback(async () => {
        try {
            // Start the authentication process by calling `startSSOFlow()`
            const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
                strategy: 'oauth_apple',
                redirectUrl: AuthSession.makeRedirectUri(),
            })

            // If sign in was successful, set the active session
            if (createdSessionId) {
                setActive!({
                    session: createdSessionId,
                    navigate: async ({ session }) => {
                        if (session?.currentTask) {
                            console.log(session?.currentTask)
                            router.push('/sign-in/tasks')
                            return
                        }

                        router.push('/')
                    },
                })
            }
        } catch (err) {
            console.error(JSON.stringify(err, null, 2))
        }
    }, [])

    return (
        <TouchableOpacity
            onPress={onPress}
            className={`rounded-xl py-4 shadow-sm flex-1 ${theme === 'dark' ? 'bg-white border border-gray-200' : 'bg-black border border-black'}`}
            activeOpacity={0.8}
        >
            <View className='flex-row items-center justify-center'>
                <Ionicons name='logo-apple' size={22} color={theme === 'dark' ? 'black' : 'white'} />
            </View>
        </TouchableOpacity>
    )
}
