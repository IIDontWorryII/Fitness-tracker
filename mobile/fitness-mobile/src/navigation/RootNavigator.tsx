/*
  ============================================================
  Datei: RootNavigator.tsx (Mobile App)

  Rolle im Projekt:
  Diese Datei ist der Einstiegspunkt der Navigation
  fuer die gesamte Mobile App.

  Zweck:
  - Entscheidet, welche Navigation angezeigt wird
  - Trennt Authentifizierungs-Screens von App-Screens
  - Reagiert auf den globalen Auth-Zustand

  Kernidee:
  - Wenn Benutzer eingeloggt ist → AppTabs
  - Wenn nicht eingeloggt → Login / Signup Screens

  Abhaengigkeiten:
  - AuthContext (useAuth)
  - React Navigation
  ============================================================
*/
import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "../context/AuthContext";
import AppTabs from "./AppTabs";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";

export default function RootNavigator() {
  const { user, isLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (user) {
    return (
      <NavigationContainer>
        <AppTabs />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      {mode === "login" ? (
        <LoginScreen onSignup={() => setMode("signup")} />
      ) : (
        <SignupScreen onBackToLogin={() => setMode("login")} />
      )}
    </NavigationContainer>
  );
}
