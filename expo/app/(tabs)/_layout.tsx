import { Tabs } from "expo-router";
import { Home, Sparkles, GraduationCap, Calendar } from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";

import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textLight,
        tabBarStyle: {
          backgroundColor: Colors.light.cardBackground,
          borderTopColor: Colors.light.border,
          paddingTop: 8,
          height: Platform.OS === "ios" ? 88 : 68,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500" as const,
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: Colors.light.background,
        },
        headerTitleStyle: {
          color: Colors.light.text,
          fontWeight: "600" as const,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="programs"
        options={{
          title: "Programs",
          tabBarIcon: ({ color, size }) => <GraduationCap size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="knowledge"
        options={{
          title: "Wisdom",
          tabBarIcon: ({ color, size }) => <Sparkles size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
