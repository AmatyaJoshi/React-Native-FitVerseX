import React from "react";
import { ScrollView, Text, View, StatusBar, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/lib/contexts/ThemeContext";

export default function HelpSupportPage() {
  const router = useRouter();
  const { theme } = useTheme();

  const faqs = [
    {
      question: "How do I log a workout?",
      answer: "Go to the Workout tab and tap 'Start Workout' to begin logging your exercise session."
    },
    {
      question: "Can I edit my workouts after logging?",
      answer: "You can view your workout history, but edits need to be done through your profile settings."
    },
    {
      question: "How is my average workout duration calculated?",
      answer: "It's the total time spent working out divided by the number of workouts completed."
    },
    {
      question: "Can I sync my data across devices?",
      answer: "Yes, your data is automatically synced when you log in with the same account."
    },
  ];

  const contactMethods = [
    {
      icon: 'mail-outline',
      label: 'Email Support',
      value: 'support@fitversex.com',
      action: () => Linking.openURL('mailto:support@fitversex.com')
    },
    {
      icon: 'call-outline',
      label: 'Phone Support',
      value: '+91 (8800) 123-4567',
      action: () => Linking.openURL('tel:+918800123-4567')
    },
  ];

  return (
    <SafeAreaView className={`flex flex-1 ${theme === 'dark' ? 'bg-black' : 'bg-gray-50'}`} edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1">
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        
        {/* Header */}
        <View className={`px-6 py-4 flex-row items-center justify-between ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b`}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={theme === 'dark' ? '#F3F4F6' : '#1F2937'} />
          </TouchableOpacity>
          <Text className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Help & Support</Text>
          <View className="w-7" />
        </View>

        {/* Content */}
        <View className="px-6 pt-6">
          {/* Contact Methods */}
          <Text className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>Get in Touch</Text>
          <View className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-300'} rounded-2xl shadow-sm border overflow-hidden mb-8`}>
            {contactMethods.map((method, index) => (
              <TouchableOpacity
                key={index}
                onPress={method.action}
                activeOpacity={0.7}
                className={`px-6 py-4 flex-row items-center justify-between ${
                  index !== contactMethods.length - 1 ? `border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}` : ''
                }`}
              >
                <View className="flex-row items-center flex-1">
                  <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${theme === 'dark' ? 'bg-black' : 'bg-blue-100'}`}>
                    <Ionicons name={method.icon as any} size={20} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{method.label}</Text>
                    <Text className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>{method.value}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme === 'dark' ? '#6B7280' : '#6B7280'} />
              </TouchableOpacity>
            ))}
          </View>

          {/* FAQs */}
          <Text className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>Frequently Asked Questions</Text>
          <View className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-300'} rounded-2xl shadow-sm border overflow-hidden mb-8`}>
            {faqs.map((faq, index) => (
              <View
                key={index}
                className={`px-6 py-4 ${
                  index !== faqs.length - 1 ? `border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}` : ''
                }`}
              >
                <View className="flex-row items-start mb-2">
                  <Ionicons
                    name="help-circle-outline"
                    size={18}
                    color="#3B82F6"
                  />
                  <Text className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex-1 ml-2`}>{faq.question}</Text>
                </View>
                <Text className={`text-sm ml-6 leading-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {faq.answer}
                </Text>
              </View>
            ))}
          </View>

          {/* App Info */}
          <Text className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>App Information</Text>
          <View className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-300'} rounded-2xl shadow-sm border p-6 mb-8`}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className={theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}>App Version</Text>
              <Text className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>1.0.0</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className={theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}>Build Number</Text>
              <Text className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>001</Text>
            </View>
          </View>

          {/* Support Info */}
          <View className={`${theme === 'dark' ? 'bg-green-900' : 'bg-green-50'} rounded-2xl p-4 mb-8 flex-row`}>
            <Ionicons name="checkmark-circle-outline" size={20} color={theme === 'dark' ? '#10B981' : '#10B981'} />
            <View className="flex-1 ml-3">
              <Text className={`text-sm font-medium ${theme === 'dark' ? 'text-green-300' : 'text-green-900'} mb-1`}>We're Here to Help</Text>
              <Text className={`text-sm ${theme === 'dark' ? 'text-green-400' : 'text-green-800'}`}>
                Our support team typically responds within 24 hours.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
