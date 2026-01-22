import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";

/* ===================== COMPONENT ===================== */

export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) return null;

  /* ===================== RENDER ===================== */

  return (
    <View style={{ flex: 1, padding: 16, gap: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>My Profile</Text>

      {/* BASIC INFO */}
      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 16 }}>
          <Text style={{ fontWeight: "600" }}>Name:</Text> {user.name}
        </Text>
        <Text style={{ fontSize: 16 }}>
          <Text style={{ fontWeight: "600" }}>Email:</Text> {user.email}
        </Text>
      </View>

      {/* AUTH METHODS */}
      <View style={{ gap: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>
          Authentication methods
        </Text>

        <View style={{ gap: 6 }}>
          <Text>• Password ✅</Text>
          <Text>• Google {user.googleConnected ? "✅" : "❌"}</Text>
          <Text>• GitHub {user.githubConnected ? "✅" : "❌"}</Text>
          <Text>
            • Passkeys{" "}
            {user.passkeysCount > 0 ? `✅ (${user.passkeysCount})` : "❌"}
          </Text>
        </View>

        <Text style={{ opacity: 0.6, fontSize: 13 }}>
          Authentication methods are managed on the web version of the app.
        </Text>
      </View>

      {/* LOGOUT */}
      <Pressable
        onPress={logout}
        style={{
          marginTop: 20,
          padding: 14,
          borderRadius: 12,
          backgroundColor: "#000",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>Log Out</Text>
      </Pressable>
    </View>
  );
}
