import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import MyWorkoutsScreen from "../screens/MyWorkoutsScreen";
import ExercisesScreen from "../screens/ExercisesScreen";
import ReportStack from "./ReportStack";
import ProfileScreen from "../screens/ProfileScreen";
import MyWorkoutsStack from "./MyWorkoutsStack";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<
            typeof MaterialCommunityIcons
          >["name"];

          switch (route.name) {
            case "MyWorkouts":
              iconName = "dumbbell";
              break;
            case "Exercises":
              iconName = "format-list-bulleted";
              break;
            case "Report":
              iconName = "chart-bar";
              break;
            case "Profile":
              iconName = "account";
              break;
            default:
              iconName = "circle";
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: "#7C3AED", // purple accent
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="MyWorkouts"
        component={MyWorkoutsStack}
        options={{ title: "Workouts" }}
      />
      <Tab.Screen name="Exercises" component={ExercisesScreen} />
      <Tab.Screen
        name="Report"
        component={ReportStack}
        options={{ title: "Report" }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
