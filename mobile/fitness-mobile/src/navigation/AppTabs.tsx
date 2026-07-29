/*
  ============================================================
  Datei: AppTabs.tsx (Mobile App)

  Rolle im Projekt:
  Diese Datei definiert die Haupt-Navigation der Mobile App
  in Form einer Bottom Tab Navigation.

  Zweck:
  - Ermöglicht den Wechsel zwischen Hauptbereichen der App
  - Stellt dauerhaft sichtbare Navigation bereit
  - Kapselt die globale App-Struktur

  Enthaltene Tabs:
  - MyWorkouts (Workout Verwaltung)
  - Exercises (Uebungsliste)
  - Report (Auswertungen und Statistiken)
  - Profile (Benutzerprofil)

  Architekturentscheidung:
  - Bottom Tabs fuer Hauptbereiche
  - Stack Navigation innerhalb einzelner Tabs
  - Trennung von Navigation und Screen-Logik

  Abhaengigkeiten:
  - React Navigation (Bottom Tabs)
  - Expo Vector Icons fuer Icons
  ============================================================
*/
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

/*
  Import der Screens und Stacks,
  die in den Tabs angezeigt werden.
*/
import MyWorkoutsScreen from "../screens/MyWorkoutsScreen";
import ExercisesScreen from "../screens/ExercisesScreen";
import ReportStack from "./ReportStack";
import ProfileScreen from "../screens/ProfileScreen";
import MyWorkoutsStack from "./MyWorkoutsStack";

/*
  Erstellung des Tab Navigators.

  Dieser Navigator verwaltet:
  - Tabs
  - aktive Route
  - Icons
  - Styling der Tab Bar
*/
const Tab = createBottomTabNavigator();

/*
  ============================================================
  AppTabs Komponente
  ============================================================

  Diese Komponente wird nach erfolgreicher Authentifizierung
  angezeigt und bildet das Hauptgeruest der App.
*/
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
