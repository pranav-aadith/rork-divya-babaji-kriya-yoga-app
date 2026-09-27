import { Tabs } from "expo-router";
import { Sparkles, GraduationCap, Calendar, Heart } from "lucide-react-native";
import React from "react";
import { Platform, type ColorValue } from "react-native";
import Svg, { Path } from "react-native-svg";

import Colors from "@/constants/colors";

function LotusIcon({ size, color }: { size: number; color: ColorValue }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 3.2c-1.9 2.5-2.8 5.3-2.4 8 .3 1.7 1.1 2.9 2.4 3.7 1.3-.8 2.1-2 2.4-3.7.4-2.7-.5-5.5-2.4-8z" />
      <Path d="M5.9 6c-.6 3.2.2 6 2.3 7.9.9.8 2.1 1.3 3.4 1.4-.4-2.8-1.8-5.2-4.2-7-.5-.4-1-.9-1.5-2.3z" />
      <Path d="M18.1 6c.6 3.2-.2 6-2.3 7.9-.9.8-2.1 1.3-3.4 1.4.4-2.8 1.8-5.2 4.2-7 .5-.4 1-.9 1.5-2.3z" />
      <Path d="M2.3 9.9c.8 2.9 2.5 4.9 5.1 6 1.3.5 2.6.6 4.1.4-1.5-2.3-3.6-4-6.3-4.9-1-.4-2-.8-2.9-1.5z" />
      <Path d="M21.7 9.9c-.8 2.9-2.5 4.9-5.1 6-1.3.5-2.6.6-4.1.4 1.5-2.3 3.6-4 6.3-4.9 1-.4 2-.8 2.9-1.5z" />
      <Path d="M3.2 15.6c2.5 2.3 5.5 3.4 8.8 3.4s6.3-1.1 8.8-3.4c-2.7 1-5.7 1.5-8.8 1.5s-6.1-.5-8.8-1.5z" />
    </Svg>
  );
}

const GOLD = "#C9921B";
const BROWN = "#8A6A4F";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: GOLD,
        tabBarInactiveTintColor: BROWN,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#FBF3E2",
          borderTopColor: "rgba(201, 146, 27, 0.18)",
          paddingTop: 8,
          height: Platform.OS === "ios" ? 76 : 60,
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
          fontWeight: "400" as const,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <LotusIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="programs"
        options={{
          title: "Programs",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <GraduationCap size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="knowledge"
        options={{
          title: "Wisdom",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Sparkles size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
