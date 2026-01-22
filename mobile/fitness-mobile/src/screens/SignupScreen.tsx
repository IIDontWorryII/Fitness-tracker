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

export default function SignupScreen({
  onBackToLogin,
}: {
  onBackToLogin?: () => void;
}) {
  const { signup, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await signup(email.trim(), password, name.trim());
    } catch (e: any) {
      setError(e?.message || "Signup failed.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

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

      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.button} onPress={onSubmit} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.buttonText}>Sign up</Text>
        )}
      </Pressable>
      {onBackToLogin && (
        <Pressable onPress={onBackToLogin}>
          <Text style={{ textAlign: "center", marginTop: 12, opacity: 0.7 }}>
            Already have an account? Sign in
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, gap: 12 },
  title: { fontSize: 26, fontWeight: "700", textAlign: "center" },
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
