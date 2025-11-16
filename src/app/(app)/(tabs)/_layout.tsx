import { Tabs } from "expo-router";
import React from "react";
import AntDesign from '@expo/vector-icons/AntDesign';
import { Image } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useTheme } from "@/lib/contexts/ThemeContext";

function Layout() {
    const { user } = useUser();
    const { theme } = useTheme();

    return (
        <Tabs
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
                    borderTopColor: theme === 'dark' ? '#1f2937' : '#e5e7eb',
                    borderTopWidth: 1,
                },
                tabBarActiveTintColor: '#3b82f6',
                tabBarInactiveTintColor: theme === 'dark' ? '#9ca3af' : '#6b7280',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    headerShown: false,
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="home" size={size} color={color} />
                    )
                }}
            />

            <Tabs.Screen
                name="exercises"
                options={{
                    headerShown: false,
                    title: "Exercises",
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="book" size={size} color={color} />
                    )
                }}
            />

            <Tabs.Screen
                name="workout"
                options={{
                    headerShown: false,
                    title: "Workout",
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="plus-circle" size={size} color={color} />
                    )
                }}
            />

            <Tabs.Screen
                name="active-workout"
                options={{
                    headerShown: false,
                    title: "Active Workout",
                    href: null,
                    tabBarStyle: {
                        display: "none"
                    },
                }}
            />

            <Tabs.Screen
                name="history"
                options={{
                    headerShown: false,
                    title: "History",
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="clock-circle" size={size} color={color} />
                    )
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    headerShown: false,
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <Image 
                        source={{
                            uri: user?.imageUrl ?? user?.externalAccounts[0]?.imageUrl,
                        }}
                        className="rounded-full w-7 h-7"
                        />
                    )
                }}
            />
        </Tabs>
    );
}

export default Layout;