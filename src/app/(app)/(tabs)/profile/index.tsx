import React from "react";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfilePage() {

  const handleSignOut = () => {
    const { signOut } = useAuth();

    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex flex-1">
      <Text>Profile</Text>

      {/* Sign Out */}
      <View className="px-6 mb-8">
        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-red-600 rounded-2xl p-4 shadow-sm"
          activeOpacity={0.8}
        >
          <View className='flex-row justify-center items-center'>
            <Ionicons name='log-out-outline' size={20} color='white' />
            <Text className='text-white text-lg font-semibold ml-2'>
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}