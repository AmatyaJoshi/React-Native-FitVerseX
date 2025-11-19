import { WorkoutData } from '@/app/api/save-workout+api';
import { client } from '@/lib/sanity/client';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { defineQuery } from 'groq';
import React, { useState, useEffect, useRef } from 'react'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View, Animated } from 'react-native'
import { exercise } from 'sanity/schemaTypes/exercise';
import { useWorkoutStore, WorkoutSet } from 'store/workout-store';
import { useTheme } from '@/lib/contexts/ThemeContext';

// Query to find exercise by name
const findExerciseQuery =
    defineQuery(`*[_type == "exercise" && name == $name][0]{_id, name}`);

export default function ActiveWorkout() {
    const { user } = useUser();
    const { theme } = useTheme();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [onBreak, setOnBreak] = useState(false);
    const [breakTimeRemaining, setBreakTimeRemaining] = useState(0);
    const [workoutStarted, setWorkoutStarted] = useState(false);
    const {
        workoutExercises,
        setWorkoutExercises,
        resetWorkout,
        weightUnit,
        setWeightUnit,
    } = useWorkoutStore();
    const [timerStarted, setTimerStarted] = useState(false);
    const [totalSeconds, setTotalSeconds] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const breakIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate minutes, seconds, hours from totalSeconds
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Timer effect - Main workout timer
    useEffect(() => {
        // Stop timer if paused or on break
        if (isPaused || onBreak) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Only start timer if not already running
        if (intervalRef.current) {
            return;
        }

        intervalRef.current = setInterval(() => {
            setTotalSeconds((prev) => prev + 1);
        }, 1000);

        // Cleanup on unmount or when dependencies change
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isPaused, onBreak]);

    // Break Timer Effect - Dedicated and separate
    useEffect(() => {
        if (!onBreak) {
            if (breakIntervalRef.current) {
                clearInterval(breakIntervalRef.current);
                breakIntervalRef.current = null;
            }
            return;
        }

        // Clear any existing interval
        if (breakIntervalRef.current) {
            clearInterval(breakIntervalRef.current);
            breakIntervalRef.current = null;
        }

        // Set up new interval for break countdown
        breakIntervalRef.current = setInterval(() => {
            setBreakTimeRemaining((prev) => {
                if (prev <= 1) {
                    if (breakIntervalRef.current) {
                        clearInterval(breakIntervalRef.current);
                        breakIntervalRef.current = null;
                    }
                    // End break and resume workout on next tick
                    setOnBreak(false);
                    setIsPaused(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Cleanup
        return () => {
            if (breakIntervalRef.current) {
                clearInterval(breakIntervalRef.current);
                breakIntervalRef.current = null;
            }
        };
    }, [onBreak]);

    // Reset timer when screen is focused and no active workout (fresh start)
    useFocusEffect(
        React.useCallback(() => {
            // Only reset if we have no exercises (indicates a fresh start after ending workout)
            if (workoutExercises.length === 0 && !timerStarted) {
                setTimerStarted(true);
                setTotalSeconds(0);
            }
        }, [workoutExercises.length, timerStarted]
        ));

    const getWorkoutDuration = () => {
        return `${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`;
    };

    const endWorkout = async () => {
        // Stop the timer
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (breakIntervalRef.current) {
            clearInterval(breakIntervalRef.current);
            breakIntervalRef.current = null;
        }
        setIsPaused(true);
        setOnBreak(false);

        const saved = await saveWorkoutToDatabase();

        if (saved) {
            Alert.alert("Workout Saved", "Your workout has been saved successfully!");
            // Reset the workout and timer
            resetWorkout();
            setTotalSeconds(0);
            setIsPaused(false);
            setOnBreak(false);
            setWorkoutStarted(false);

            router.replace("/(app)/(tabs)/history?refresh=true");
        }
    };

    const saveWorkoutToDatabase = async () => {
        // Check if already saving to prevent multiple attempts
        if (isSaving) return false;

        setIsSaving(true);

        try {
            // Implement saving
            // Use stopwatch total seconds for duration
            const durationInSeconds = totalSeconds;

            // Transform exercises data to match Sanity Schema
            const exerciseForSanity = await Promise.all(
                workoutExercises.map(async (exercise) => {
                    // Find the exercise document in Sanity to get by name
                    const exerciseDoc = await client.fetch(findExerciseQuery, {
                        name: exercise.name,
                    });

                    if (!exerciseDoc) {
                        throw new Error(
                            `Exercise "${exercise.name}" not found in database.`
                        )
                    }

                    // Transform sets to match schema (only completed sets, convert to numbers)
                    const setsForSanity = exercise.sets
                        .filter((set) => set.isCompleted && set.reps && set.weight)
                        .map((set) => ({
                            _type: "set",
                            _key: Math.random().toString(36).substring(2, 9),
                            reps: parseInt(set.reps, 10) || 0,
                            weight: parseFloat(set.weight) || 0,
                            weightUnit: set.weightUnit,
                        }));

                    return {
                        _type: "workoutExercise",
                        _key: Math.random().toString(36).substring(2, 9),
                        exercise: {
                            _type: "reference",
                            _ref: exerciseDoc._id,
                        },
                        sets: setsForSanity,
                    };
                })
            );

            // Filter out exercises with no completed sets
            const validExercises = exerciseForSanity.filter(
                (exercise) => exercise.sets.length > 0
            );

            if (validExercises.length === 0) {
                Alert.alert(
                    "No Completed Sets",
                    "Please complete at least one set before saving the workout."
                );
                return false;
            }

            // Create the workout document
            const workoutData: WorkoutData = {
                _type: "workout",
                userId: user.id,
                date: new Date().toISOString(),
                duration: durationInSeconds,
                exercises: validExercises,
            }

            // Save to Sanity via API
            const result = await fetch("/api/save-workout", {
                method: "POST",
                body: JSON.stringify({ workoutData }),
            });

            return true;
        } catch (error) {
            console.error("Error saving workout:", error);
            Alert.alert("Save Failed", "Failed to save workout. Please try again.");
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const saveWorkout = () => {
        // Are you sure you want to complete the workout?
        Alert.alert(
            "Complete Workout",
            "Are you sure you want to complete the workout?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Complete", onPress: async () => await endWorkout() },
            ]
        );
    };

    const cancelWorkout = () => {
        Alert.alert(
            "Cancel Workout",
            "Are you sure you want to cancel the workout?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "End Workout",
                    onPress: () => {
                        resetWorkout();
                        router.back();
                    },
                },
            ]
        );
    };

    const addExercise = () => {
        router.push('exercise-selection');
    };

    const handlePause = () => {
        if (isPaused) {
            setIsPaused(false);
            setWorkoutStarted(true);  // Mark workout as started when resuming
        } else {
            setIsPaused(true);
        }
    };

    const handleRestart = () => {
        Alert.alert(
            "Restart Workout",
            "Are you sure you want to restart the workout? This will reset the timer to 0:00",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Restart",
                    onPress: () => {
                        // Reset the timer and pause it
                        setTotalSeconds(0);
                        setIsPaused(true);
                        setOnBreak(false);
                        setWorkoutStarted(false);  // Reset to show "Start" button
                    },
                },
            ]
        );
    };

    const handleTakeBreak = () => {
        setOnBreak(true);
        setIsPaused(true);
        setBreakTimeRemaining(30);  // 30 seconds break
        // Break timer will be handled by the Break Timer Effect useEffect
    };

    const toggleWeightUnit = () => {
        const newUnit = weightUnit === 'lbs' ? 'kg' : 'lbs';
        setWeightUnit(newUnit);
        
        // Convert all weight values when toggling units
        setWorkoutExercises((exercises) =>
            exercises.map((exercise) => ({
                ...exercise,
                sets: exercise.sets.map((set) => {
                    let convertedWeight = set.weight;
                    
                    if (set.weight && !isNaN(Number(set.weight))) {
                        if (newUnit === 'kg') {
                            // Convert lbs to kg (divide by 2.20462)
                            convertedWeight = (Number(set.weight) / 2.20462).toFixed(2);
                        } else {
                            // Convert kg to lbs (multiply by 2.20462)
                            convertedWeight = (Number(set.weight) * 2.20462).toFixed(2);
                        }
                    }
                    
                    return {
                        ...set,
                        weight: convertedWeight,
                        weightUnit: newUnit,
                    };
                })
            }))
        );
    };

    const formatBreakTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const deleteExercise = (exerciseId: string) => {
        setWorkoutExercises((exercises) =>
            exercises.filter((exercise) => exercise.id !== exerciseId)
        );
    };

    const addNewSet = (exerciseId: string) => {
        const newSet: WorkoutSet = {
            id: Math.random().toString(),
            reps: "",
            weight: "",
            weightUnit: weightUnit,
            isCompleted: false,
        };

        setWorkoutExercises((exercises) =>
            exercises.map((exercise) =>
                exercise.id === exerciseId
                    ? { ...exercise, sets: [...exercise.sets, newSet] }
                    : exercise
            )
        );
    };

    const updateSet = (
        exerciseId: string,
        setId: string,
        field: "reps" | "weight",
        value: string
    ) => {
        setWorkoutExercises((exercises) =>
            exercises.map((exercise) =>
                exercise.id === exerciseId
                    ? {
                        ...exercise,
                        sets: exercise.sets.map((set) =>
                            set.id === setId ? { ...set, [field]: value } : set
                        ),
                    }
                    : exercise
            )
        );
    };

    const deleteSet = (exerciseId: string, setId: string) => {
        setWorkoutExercises((exercises) =>
            exercises.map((exercise) =>
                exercise.id === exerciseId
                    ? {
                        ...exercise,
                        sets: exercise.sets.filter((set) => set.id !== setId),
                    }
                    : exercise
            )
        );
    };

    const toggleSetCompletion = (exerciseId: string, setId: string) => {
        setWorkoutExercises((exercises) =>
            exercises.map((exercise) =>
                exercise.id === exerciseId
                    ? {
                        ...exercise,
                        sets: exercise.sets.map((set) =>
                            set.id === setId
                                ? { ...set, isCompleted: !set.isCompleted }
                                : set
                        ),
                    }
                    : exercise
            )
        );
    };

    return (
        <View className='flex-1'>
            <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

            {/* Top Safe Area */}
            <View className={`${theme === 'dark' ? 'bg-black' : 'bg-white'}`}
                style={{
                    paddingTop: Platform.OS === "ios" ? 55 : StatusBar.currentHeight || 0,
                }}
            />

            {/* Header - Timer Section */}
            <View className={`${theme === 'dark' ? 'bg-black' : 'bg-white'} px-6 pt-8 pb-6`}>
                {/* Main Timer Display */}
                <View className='mb-8 items-center'>
                    <Text style={{ fontSize: 72, fontWeight: '900', letterSpacing: -2 }} className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-center`}>
                        {onBreak ? formatBreakTime(breakTimeRemaining) : getWorkoutDuration()}
                    </Text>
                    <Text className={`text-base font-black mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} style={{ letterSpacing: -0.3 }}>
                        {onBreak ? 'Take a Break' : 'Keep Going'}
                    </Text>
                </View>

                {/* Quick Stats Row */}
                <View className='flex-row justify-around mb-6'>
                    <View className='items-center'>
                        <Text className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ letterSpacing: -0.5 }}>
                            {workoutExercises.length}
                        </Text>
                        <Text className={`text-xs font-black mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} style={{ letterSpacing: -0.2 }}>
                            Exercises
                        </Text>
                    </View>
                    <View className='items-center'>
                        <Text className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ letterSpacing: -0.5 }}>
                            {workoutExercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.isCompleted).length, 0)}
                        </Text>
                        <Text className={`text-xs font-black mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} style={{ letterSpacing: -0.2 }}>
                            Sets Done
                        </Text>
                    </View>
                    <View className='items-center'>
                        <TouchableOpacity
                            onPress={toggleWeightUnit}
                            activeOpacity={0.7}
                            className={`rounded-lg px-3 py-1 ${theme === 'dark' ? 'bg-blue-600/20 border border-blue-600' : 'bg-blue-100 border border-blue-400'}`}
                        >
                            <Text className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ letterSpacing: -0.5 }}>
                                {weightUnit}
                            </Text>
                        </TouchableOpacity>
                        <Text className={`text-xs font-black mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} style={{ letterSpacing: -0.2 }}>
                            Weight Unit
                        </Text>
                    </View>
                </View>

                {/* Control Buttons - Grid */}
                <View className='flex-row gap-2 mb-6'>
                    {/* Pause/Resume/Start */}
                    <TouchableOpacity
                        onPress={handlePause}
                        disabled={onBreak}
                        className={`flex-1 py-3 rounded-xl items-center justify-center ${isPaused ? 'bg-gray-700' : 'bg-gray-600'} ${onBreak ? 'opacity-30' : ''}`}
                        activeOpacity={0.7}
                    >
                        <Ionicons name={isPaused ? 'play' : 'pause'} size={20} color='white' />
                        <Text className='text-white font-black text-xs mt-1' style={{ letterSpacing: -0.2 }}>
                            {isPaused ? (workoutStarted ? 'Resume' : 'Start') : 'Pause'}
                        </Text>
                    </TouchableOpacity>

                    {/* Break */}
                    <TouchableOpacity
                        onPress={handleTakeBreak}
                        disabled={onBreak || isPaused}
                        className={`flex-1 py-3 rounded-xl items-center justify-center bg-gray-600 ${(onBreak || isPaused) ? 'opacity-30' : ''}`}
                        activeOpacity={0.7}
                    >
                        <Ionicons name='cafe' size={20} color='white' />
                        <Text className='text-white font-black text-xs mt-1' style={{ letterSpacing: -0.2 }}>
                            Break
                        </Text>
                    </TouchableOpacity>

                    {/* Restart */}
                    <TouchableOpacity
                        onPress={handleRestart}
                        disabled={onBreak}
                        className={`flex-1 py-3 rounded-xl items-center justify-center bg-gray-600 ${onBreak ? 'opacity-30' : ''}`}
                        activeOpacity={0.7}
                    >
                        <Ionicons name='refresh' size={20} color='white' />
                        <Text className='text-white font-black text-xs mt-1' style={{ letterSpacing: -0.2 }}>
                            Restart
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* End Workout Button */}
                <TouchableOpacity
                    onPress={cancelWorkout}
                    className='bg-red-600 py-3 rounded-xl items-center'
                    activeOpacity={0.7}
                >
                    <Text className='text-white font-black' style={{ letterSpacing: -0.3 }}>
                        End Workout
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Divider */}
            <View className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} h-px`} />

            {/* Content Area */}
            <View className={`flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                    className='flex-1'
                >
                    <ScrollView 
                        className='flex-1 px-6'
                        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps='handled'
                    >
                        {workoutExercises.length === 0 ? (
                            // Empty State - Tappable to Add Exercise
                            <Pressable 
                                onPress={() => {
                                    router.push('exercise-selection');
                                }}
                                className='flex-1 items-center justify-center py-20'
                            >
                                <Ionicons name='barbell-outline' size={56} color={theme === 'dark' ? '#4B5563' : '#D1D5DB'} />
                                <Text className={`text-2xl font-black mt-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} style={{ letterSpacing: -0.5 }}>
                                    No exercises yet
                                </Text>
                                <Text className={`text-base font-black mt-2 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} style={{ letterSpacing: -0.3 }}>
                                    Tap here to add exercises
                                </Text>
                            </Pressable>
                        ) : (
                            // Exercises List
                            <>
                                {workoutExercises.map((exercise, exerciseIndex) => (
                                    <View key={exercise.id} className='mb-6'>
                                        {/* Exercise Title with Progress */}
                                        <Pressable
                                            onPress={() => {
                                                router.push('exercise-selection');
                                            }}
                                            className='flex-row items-start justify-between mb-3'
                                        >
                                            <View className='flex-1'>
                                                <Text className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ letterSpacing: -0.5 }}>
                                                    {exerciseIndex + 1}. {exercise.name}
                                                </Text>
                                                <Text className={`text-xs font-black mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} style={{ letterSpacing: -0.2 }}>
                                                    {exercise.sets.filter((set) => set.isCompleted).length} of {exercise.sets.length} sets
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => deleteExercise(exercise.id)}
                                                className='w-8 h-8 rounded-lg items-center justify-center bg-red-600'
                                            >
                                                <Ionicons name='trash' size={16} color='white' />
                                            </TouchableOpacity>
                                        </Pressable>

                                        {/* Sets - Minimalistic Cards */}
                                        <View className='gap-2'>
                                            {exercise.sets.length === 0 ? (
                                                <Text className={`text-sm font-black text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} style={{ letterSpacing: -0.2 }}>
                                                    No sets yet
                                                </Text>
                                            ) : (
                                                <>
                                                    {/* Header Row */}
                                                    <View className='flex-row items-center px-3 pb-2 gap-2'>
                                                        <Text className={`w-6 text-center text-xs font-black ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} style={{ letterSpacing: -0.2 }}>
                                                            Set
                                                        </Text>
                                                        <View className='flex-1 mx-2'>
                                                            <Text className={`text-center text-xs font-black ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} style={{ letterSpacing: -0.2 }}>
                                                                Reps
                                                            </Text>
                                                        </View>
                                                        <View className='flex-1 mx-2'>
                                                            <Text className={`text-center text-xs font-black ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} style={{ letterSpacing: -0.2 }}>
                                                                {weightUnit}
                                                            </Text>
                                                        </View>
                                                        <View className='w-8' />
                                                        <View className='w-6' />
                                                    </View>
                                                    {exercise.sets.map((set, setIndex) => (
                                                    <View
                                                        key={set.id}
                                                        className={`flex-row items-center p-3 rounded-xl border ${set.isCompleted
                                                            ? theme === 'dark' ? 'bg-green-600/20 border-green-600' : 'bg-green-100 border-green-600'
                                                            : theme === 'dark' ? 'bg-charcoal border-gray-600' : 'bg-white border-gray-300'
                                                        }`}
                                                    >
                                                        {/* Set Number */}
                                                        <Text className={`w-6 text-center font-black ${set.isCompleted ? 'text-green-600' : theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} style={{ letterSpacing: -0.2 }}>
                                                            {setIndex + 1}
                                                        </Text>

                                                        {/* Reps Input */}
                                                        <View className='flex-1 mx-2'>
                                                            <TextInput
                                                                value={set.reps}
                                                                onChangeText={(value) => updateSet(exercise.id, set.id, "reps", value)}
                                                                onSubmitEditing={() => {}}
                                                                placeholder='Reps'
                                                                placeholderTextColor={theme === 'dark' ? '#6B7280' : '#D1D5DB'}
                                                                keyboardType='numeric'
                                                                returnKeyType='done'
                                                                editable={!set.isCompleted}
                                                                className={`text-center font-black text-sm py-1 px-2 rounded-lg border-2 ${set.isCompleted
                                                                    ? theme === 'dark' ? 'bg-green-600/10 text-green-600 border-black' : 'bg-green-50 text-green-700 border-black'
                                                                    : theme === 'dark' ? 'bg-charcoal/50 text-white border-black' : 'bg-gray-100 text-gray-900 border-black'
                                                                }`}
                                                                style={{ letterSpacing: -0.2 }}
                                                            />
                                                        </View>

                                                        {/* Weight Input */}
                                                        <View className='flex-1 mx-2'>
                                                            <TextInput
                                                                value={set.weight}
                                                                onChangeText={(value) => updateSet(exercise.id, set.id, "weight", value)}
                                                                onSubmitEditing={() => {}}
                                                                placeholder={weightUnit}
                                                                placeholderTextColor={theme === 'dark' ? '#6B7280' : '#D1D5DB'}
                                                                keyboardType='numeric'
                                                                returnKeyType='done'
                                                                editable={!set.isCompleted}
                                                                className={`text-center font-black text-sm py-1 px-2 rounded-lg border-2 ${set.isCompleted
                                                                    ? theme === 'dark' ? 'bg-green-600/10 text-green-600 border-black' : 'bg-green-50 text-green-700 border-black'
                                                                    : theme === 'dark' ? 'bg-charcoal/50 text-white border-black' : 'bg-gray-100 text-gray-900 border-black'
                                                                }`}
                                                                style={{ letterSpacing: -0.2 }}
                                                            />
                                                        </View>

                                                        {/* Complete Toggle */}
                                                        <TouchableOpacity
                                                            onPress={() => toggleSetCompletion(exercise.id, set.id)}
                                                            className={`w-8 h-8 rounded-full items-center justify-center ml-2 border-2 ${set.isCompleted ? 'bg-green-600 border-green-700' : theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-300 border-gray-400'}`}
                                                        >
                                                            {set.isCompleted && <Ionicons name='checkmark' size={16} color='white' />}
                                                        </TouchableOpacity>

                                                        {/* Delete Set */}
                                                        <TouchableOpacity
                                                            onPress={() => deleteSet(exercise.id, set.id)}
                                                            className='w-6 h-6 rounded items-center justify-center ml-2 bg-red-600'
                                                        >
                                                            <Ionicons name='close' size={14} color='white' />
                                                        </TouchableOpacity>
                                                    </View>
                                                    ))}
                                                </>
                                            )}
                                        </View>

                                        {/* Add Set Button */}
                                        <TouchableOpacity
                                            onPress={() => addNewSet(exercise.id)}
                                            className={`mt-2 py-2 rounded-lg items-center ${theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-100'}`}
                                        >
                                            <View className='flex-row items-center'>
                                                <Ionicons name='add' size={14} color='#3B82F6' />
                                                <Text className='text-blue-600 font-black text-xs ml-1' style={{ letterSpacing: -0.2 }}>
                                                    Add Set
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                ))}

                                {/* Complete Workout Button */}
                                <TouchableOpacity
                                    onPress={saveWorkout}
                                    className={`py-3 rounded-xl items-center ${isSaving ||
                                        workoutExercises.length === 0 ||
                                        workoutExercises.some((exercise) =>
                                            exercise.sets.some((set) => !set.isCompleted)
                                        )
                                        ? theme === 'dark' ? 'bg-gray-800' : 'bg-gray-300'
                                        : 'bg-blue-600'
                                    }`}
                                    disabled={
                                        isSaving ||
                                        workoutExercises.length === 0 ||
                                        workoutExercises.some((exercise) =>
                                            exercise.sets.some((set) => !set.isCompleted)
                                        )
                                    }
                                    activeOpacity={0.7}
                                >
                                    {isSaving ? (
                                        <View className='flex-row items-center'>
                                            <ActivityIndicator size='small' color='white' />
                                            <Text className='text-white font-black ml-2' style={{ letterSpacing: -0.3 }}>
                                                Saving...
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text className={`font-black ${isSaving || workoutExercises.length === 0 || workoutExercises.some((exercise) => exercise.sets.some((set) => !set.isCompleted)) ? 'text-gray-500' : 'text-white'}`} style={{ letterSpacing: -0.3 }}>
                                            Complete Workout
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>

            {/* Break Modal */}
            <Modal
                visible={onBreak}
                transparent
                animationType='fade'
                hardwareAccelerated
            >
                <View className='flex-1 bg-black/50 items-center justify-center'>
                    <View className={`${theme === 'dark' ? 'bg-black border-gray-700' : 'bg-white border-gray-300'} rounded-2xl p-8 items-center w-4/5 shadow-lg border-2`}>
                        <Text className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-2xl font-black mb-6`} style={{ letterSpacing: -0.5 }}>
                            Take a Break!
                        </Text>

                        {/* Rotating Timer Circle */}
                        <View className='relative w-40 h-40 items-center justify-center mb-8'>
                            {/* Background Circle */}
                            <View className={`absolute w-40 h-40 rounded-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`} />
                            
                            {/* Progress Ring (simplified with circles) */}
                            <View className='absolute w-40 h-40 rounded-full border-8 border-blue-600' style={{
                                borderRightColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
                                borderBottomColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
                                transform: [{ rotate: `${(30 - breakTimeRemaining) / 30 * 360}deg` }]
                            }} />

                            {/* Timer Text */}
                            <Text className='text-5xl font-black text-blue-600' style={{ letterSpacing: -2 }}>
                                {breakTimeRemaining}
                            </Text>
                            <Text className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm font-black mt-1`} style={{ letterSpacing: -0.2 }}>
                                seconds
                            </Text>
                        </View>

                        {/* Info Text */}
                        <Text className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-center text-sm mb-6`} style={{ letterSpacing: -0.1 }}>
                            Your break will end automatically when the timer reaches 0
                        </Text>

                        {/* Skip Button */}
                        <TouchableOpacity
                            onPress={() => {
                                setOnBreak(false);
                                setIsPaused(false);
                                setBreakTimeRemaining(0);
                            }}
                            className='bg-gray-600 px-8 py-2 rounded-lg'
                            activeOpacity={0.7}
                        >
                            <Text className='text-white font-black text-sm' style={{ letterSpacing: -0.2 }}>
                                Skip Break
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    )
}
