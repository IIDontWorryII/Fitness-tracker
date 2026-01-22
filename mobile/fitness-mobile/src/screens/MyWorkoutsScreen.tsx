import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { fetchWorkouts, Workout } from "../api/workoutsClient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MyWorkoutsStackParamList } from "../navigation/MyWorkoutsStack";

export default function MyWorkoutsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MyWorkoutsStackParamList>>();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ===================== LOAD ON FOCUS ===================== */
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        setLoading(true);
        setError(null);

        try {
          const data = await fetchWorkouts();
          if (active) setWorkouts(data);
        } catch (err) {
          if (active) setError("Failed to load workouts");
        } finally {
          if (active) setLoading(false);
        }
      };

      load();

      return () => {
        active = false;
      };
    }, [])
  );

  /* ===================== STATES ===================== */

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={workouts}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      ListEmptyComponent={
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <Text>No workouts yet</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() =>
            navigation.navigate("WorkoutDetail", { workoutId: item._id })
          }
          style={{
            padding: 16,
            borderWidth: 1,
            borderRadius: 12,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.name}</Text>
        </Pressable>
      )}
      ListFooterComponent={
        <Pressable
          onPress={() =>
            navigation.navigate("NewWorkout", { selectedExercises: [] })
          }
          style={{
            padding: 16,
            borderWidth: 1,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "600" }}>+ Create New Workout</Text>
        </Pressable>
      }
    />
  );
}
