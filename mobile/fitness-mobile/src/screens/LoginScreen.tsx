import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ onSignup }: { onSignup?: () => void }) {
  const { login, isLoading, refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (e: any) {
      // Our axios interceptor throws response.data sometimes
      const msg =
        typeof e?.message === "string"
          ? e.message
          : typeof e?.message === "object"
          ? JSON.stringify(e.message)
          : e?.message || e?.error || "Login failed";
      setError(typeof msg === "string" ? msg : "Login failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fitness Tracker</Text>
      <Text style={styles.subtitle}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={onSubmit} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.buttonText}>Sign in</Text>
        )}
      </Pressable>
      {onSignup && (
        <Pressable onPress={onSignup}>
          <Text style={{ textAlign: "center", marginTop: 12, opacity: 0.7 }}>
            Create an account
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, gap: 12 },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center" },
  subtitle: { fontSize: 18, textAlign: "center", marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16 },
  button: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  buttonText: { fontSize: 16, fontWeight: "600" },
  error: { color: "red", textAlign: "center" },
});
