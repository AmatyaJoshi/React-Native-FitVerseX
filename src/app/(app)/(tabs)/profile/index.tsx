import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Alert, ScrollView, StatusBar, Text, TouchableOpacity, View, Image, RefreshControl, Modal, TextInput, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { GetWorkoutsQueryResult } from "@/lib/sanity/types";
import { defineQuery } from "groq";
import { client } from "@/lib/sanity/client";
import { formatDuration } from "lib/utils";
import { useTheme } from "@/lib/contexts/ThemeContext";

export const getProfileWorkoutsQuery =
  defineQuery(`*[_type == "workout" && userId == $userId] | order(date desc){
  _id,
  date,
  duration,
  exercises[]{
    exercise->{
      _id,
      name,
    },
    sets[]{
      reps,
      weight,
      weightUnit,
      _type,
      _key
    },
    _type,
    _key
  }
}`);

export default function ProfilePage() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { theme } = useTheme();
  const [workouts, setWorkouts] = useState<GetWorkoutsQueryResult>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMeasurementsModal, setShowMeasurementsModal] = useState(false);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [heightValue, setHeightValue] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [weightValue, setWeightValue] = useState('');

  const fetchWorkouts = async () => {
    if (!user?.id) return;

    try {
      const results = await client.fetch(getProfileWorkoutsQuery, { userId: user.id });
      setWorkouts(results);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWorkouts();
    setRefreshing(false);
  };

  // Calculate stats
  const totalWorkouts = workouts.length;
  const totalDuration = workouts.reduce((sum, workout) => sum + (workout.duration || 0), 0);
  const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

  // Format time as MM:SS or HH:MM with units
  const formatTimeDisplay = (seconds: number) => {
    if (!seconds || seconds === 0) {
      return { main: '00m', sub: '00s' };
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return { main: String(hours).padStart(2, '0') + 'h', sub: String(minutes).padStart(2, '0') + 'm' };
    } else {
      return { main: String(minutes).padStart(2, '0') + 'm', sub: String(secs).padStart(2, '0') + 's' };
    }
  };

  // Calculate days since joining (using createdAt from Clerk)
  const joinDate = user?.createdAt ? new Date(user.createdAt) : new Date();
  const daysSinceJoining = Math.floor(
    (new Date().getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSignOut = () => {
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

  const saveMeasurements = () => {
    const heightDisplay = heightUnit === 'cm' ? `${heightValue} cm` : `${heightFeet}' ${heightInches}"`;
    const weightDisplay = `${weightValue} ${weightUnit}`;
    
    if (!heightValue && (!heightFeet || !heightInches) && !weightValue) {
      Alert.alert("Error", "Please enter at least height or weight");
      return;
    }

    Alert.alert("Success", `Measurements saved!\nHeight: ${heightDisplay}\nWeight: ${weightDisplay}`, [
      {
        text: "OK",
        onPress: () => {
          setShowMeasurementsModal(false);
          // Reset form
          setHeightValue('');
          setHeightFeet('');
          setHeightInches('');
          setWeightValue('');
        }
      }
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className={`flex flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-4`}>Loading Profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`} edges={['top', 'left', 'right']}>
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
            title='Pull to refresh'
            titleColor={theme === 'dark' ? '#D1D5DB' : '#6B7280'}
          />
        }
      >
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        {/* Header */}
        <View className="px-6 pt-8 pb-6 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className={`text-5xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-1`} style={{ letterSpacing: -1.5 }}>
              Profile
            </Text>
            <Text className={`text-base font-black ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} style={{ letterSpacing: -0.3 }}>
              Manage your account and stats
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowMeasurementsModal(true)}
            className={`w-12 h-12 rounded-full items-center justify-center ${theme === 'dark' ? 'bg-blue-600/20 border border-blue-600' : 'bg-blue-100 border border-blue-400'}`}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* User Info Card */}
        <View className="px-6 mb-6">
          <View className={`${theme === 'dark' ? 'bg-charcoal' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-300'}`}>
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 bg-blue-600 rounded-full items-center justify-center mr-4">
                <Image
                  source={{
                    uri: user.externalAccounts[0]?.imageUrl ?? user?.imageUrl,
                  }}
                  className="rounded-full w-16 h-16"
                />
              </View>
              <View className="flex-1">
                <Text className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ letterSpacing: -0.5 }}>
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.firstName || "User"}
                </Text>
                <Text className={`text-base font-black ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-1`} style={{ letterSpacing: -0.3 }}>
                  {user?.emailAddresses?.[0]?.emailAddress}
                </Text>
                <Text className={`text-sm font-black ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} mt-2`} style={{ letterSpacing: -0.2 }}>
                  Member Since {formatJoinDate(joinDate)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Overview */}
        <View className="px-6 mb-6">
          <View className={`${theme === 'dark' ? 'bg-charcoal' : 'bg-white'} rounded-2xl p-6 shadow-sm border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-300'}`}>
            <Text className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`} style={{ letterSpacing: -0.5 }}>
              Your Fitness Stats
            </Text>

            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text style={{ fontSize: 48, fontWeight: '900', letterSpacing: -1.5 }} className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {totalWorkouts}
                </Text>
                <Text className={`text-base font-black mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-center`} style={{ letterSpacing: -0.4 }}>
                  Total{"\n"}Workouts
                </Text>
              </View>
              <View className="items-center flex-1">
                <View>
                  <Text style={{ fontSize: 28, fontWeight: '900', letterSpacing: -1, textAlign: 'center' }} className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatTimeDisplay(totalDuration).main}
                  </Text>
                  <Text style={{ fontSize: 28, fontWeight: '900', letterSpacing: -1, textAlign: 'center' }} className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {formatTimeDisplay(totalDuration).sub}
                  </Text>
                </View>
                <Text className={`text-base font-black mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-center`} style={{ letterSpacing: -0.4 }}>
                  Total{"\n"}Time
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text style={{ fontSize: 48, fontWeight: '900', letterSpacing: -1.5 }} className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {daysSinceJoining}
                </Text>
                <Text className={`text-base font-black mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-center`} style={{ letterSpacing: -0.4 }}>
                  Days{"\n"}Since Joining
                </Text>
              </View>
            </View>
            {totalWorkouts > 0 && (
              <View className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                <View className="flex-row items-center justify-between">
                  <Text className={`text-base font-black ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} style={{ letterSpacing: -0.3 }}>
                    Average Duration
                  </Text>
                  <Text className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ letterSpacing: -0.3 }}>
                    {averageDuration === 0 ? '00s' : formatDuration(averageDuration)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Account Settings */}
        <View className="px-6 mb-6">
          <Text className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`} style={{ letterSpacing: -1.2 }}>
            Account Settings
          </Text>

          {/* Settings Options */}
          <View className={`${theme === 'dark' ? 'bg-charcoal' : 'bg-white'} rounded-2xl shadow-sm border ${theme === 'dark' ? 'border-gray-800' : 'border-gray-300'}`}>
            <TouchableOpacity 
              onPress={() => router.push('/(app)/profile/edit-profile')}
              activeOpacity={0.7}
              className={`flex-row items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
              <View className="flex-row items-center">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${theme === 'dark' ? 'bg-black' : 'bg-blue-100'}`}>
                  <Ionicons name="person-outline" size={20} color="#3B82F6" />
                </View>
                <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-medium`}>Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? '#6B7280' : '#6B7280'} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/(app)/profile/notifications')}
              activeOpacity={0.7}
              className={`flex-row items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
              <View className="flex-row items-center">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${theme === 'dark' ? 'bg-black' : 'bg-blue-100'}`}>
                  <Ionicons name="notifications-outline" size={20} color="#3B82F6" />
                </View>
                <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-medium`}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? '#6B7280' : '#6B7280'} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/(app)/profile/preferences')}
              activeOpacity={0.7}
              className={`flex-row items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
              <View className="flex-row items-center">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${theme === 'dark' ? 'bg-black' : 'bg-blue-100'}`}>
                  <Ionicons name="settings-outline" size={20} color="#3B82F6" />
                </View>
                <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-medium`}>Preferences</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? '#6B7280' : '#6B7280'} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/(app)/profile/help-support')}
              activeOpacity={0.7}
              className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${theme === 'dark' ? 'bg-black' : 'bg-blue-100'}`}>
                  <Ionicons name="help-circle-outline" size={20} color="#3B82F6" />
                </View>
                <Text className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-medium`}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? '#6B7280' : '#6B7280'} />
            </TouchableOpacity>

          </View>
        </View>

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
      </ScrollView>

      {/* Measurements Modal */}
      <Modal
        visible={showMeasurementsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMeasurementsModal(false)}
      >
        <View className={`flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}
          style={{
            paddingTop: Platform.OS === "ios" ? 55 : StatusBar.currentHeight || 0,
          }}
        >
          {/* Header */}
          <View className={`flex-row items-center justify-between px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
            <Text className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ letterSpacing: -0.5 }}>
              My Measurements
            </Text>
            <TouchableOpacity onPress={() => setShowMeasurementsModal(false)}>
              <Ionicons name="close" size={24} color={theme === 'dark' ? 'white' : 'black'} />
            </TouchableOpacity>
          </View>

          <ScrollView className={`flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
            {/* Height Section */}
            <View className="mb-8">
              <Text className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`} style={{ letterSpacing: -0.5 }}>
                Height
              </Text>
              
              {/* Unit Toggle */}
              <View className="flex-row gap-3 mb-4">
                <TouchableOpacity
                  onPress={() => setHeightUnit('cm')}
                  className={`flex-1 py-3 rounded-xl items-center border-2 ${heightUnit === 'cm' 
                    ? 'bg-blue-600 border-blue-600' 
                    : theme === 'dark' ? 'bg-charcoal border-gray-600' : 'bg-white border-gray-300'}`}
                  activeOpacity={0.7}
                >
                  <Text className={`font-black ${heightUnit === 'cm' ? 'text-white' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    cm
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setHeightUnit('ft')}
                  className={`flex-1 py-3 rounded-xl items-center border-2 ${heightUnit === 'ft' 
                    ? 'bg-blue-600 border-blue-600' 
                    : theme === 'dark' ? 'bg-charcoal border-gray-600' : 'bg-white border-gray-300'}`}
                  activeOpacity={0.7}
                >
                  <Text className={`font-black ${heightUnit === 'ft' ? 'text-white' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    ft/in
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Height Input */}
              {heightUnit === 'cm' ? (
                <TextInput
                  value={heightValue}
                  onChangeText={setHeightValue}
                  placeholder="Enter height in cm"
                  placeholderTextColor={theme === 'dark' ? '#6B7280' : '#D1D5DB'}
                  keyboardType="numeric"
                  className={`w-full px-4 py-3 rounded-xl border-2 font-black ${theme === 'dark' ? 'bg-charcoal border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              ) : (
                <View className="flex-row gap-3">
                  <TextInput
                    value={heightFeet}
                    onChangeText={setHeightFeet}
                    placeholder="Feet"
                    placeholderTextColor={theme === 'dark' ? '#6B7280' : '#D1D5DB'}
                    keyboardType="numeric"
                    className={`flex-1 px-4 py-3 rounded-xl border-2 font-black ${theme === 'dark' ? 'bg-charcoal border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  <TextInput
                    value={heightInches}
                    onChangeText={setHeightInches}
                    placeholder="Inches"
                    placeholderTextColor={theme === 'dark' ? '#6B7280' : '#D1D5DB'}
                    keyboardType="numeric"
                    className={`flex-1 px-4 py-3 rounded-xl border-2 font-black ${theme === 'dark' ? 'bg-charcoal border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </View>
              )}
            </View>

            {/* Weight Section */}
            <View className="mb-8">
              <Text className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`} style={{ letterSpacing: -0.5 }}>
                Weight
              </Text>
              
              {/* Unit Toggle */}
              <View className="flex-row gap-3 mb-4">
                <TouchableOpacity
                  onPress={() => setWeightUnit('kg')}
                  className={`flex-1 py-3 rounded-xl items-center border-2 ${weightUnit === 'kg' 
                    ? 'bg-blue-600 border-blue-600' 
                    : theme === 'dark' ? 'bg-charcoal border-gray-600' : 'bg-white border-gray-300'}`}
                  activeOpacity={0.7}
                >
                  <Text className={`font-black ${weightUnit === 'kg' ? 'text-white' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    kg
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setWeightUnit('lbs')}
                  className={`flex-1 py-3 rounded-xl items-center border-2 ${weightUnit === 'lbs' 
                    ? 'bg-blue-600 border-blue-600' 
                    : theme === 'dark' ? 'bg-charcoal border-gray-600' : 'bg-white border-gray-300'}`}
                  activeOpacity={0.7}
                >
                  <Text className={`font-black ${weightUnit === 'lbs' ? 'text-white' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    lbs
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Weight Input */}
              <TextInput
                value={weightValue}
                onChangeText={setWeightValue}
                placeholder={`Enter weight in ${weightUnit}`}
                placeholderTextColor={theme === 'dark' ? '#6B7280' : '#D1D5DB'}
                keyboardType="numeric"
                className={`w-full px-4 py-3 rounded-xl border-2 font-black ${theme === 'dark' ? 'bg-charcoal border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={saveMeasurements}
              className="bg-blue-600 py-4 rounded-xl items-center"
              activeOpacity={0.7}
            >
              <Text className="text-white font-black text-lg" style={{ letterSpacing: -0.3 }}>
                Save Measurements
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}