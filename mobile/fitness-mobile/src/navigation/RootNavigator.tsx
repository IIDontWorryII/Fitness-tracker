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
