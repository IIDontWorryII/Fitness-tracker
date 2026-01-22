import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
import { useEffect, useState } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MyWorkoutsStackParamList } from "../navigation/MyWorkoutsStack";
import { fetchWorkoutHistoryById } from "../api/workoutHistoryClient";

/* ===================== TYPES ===================== */

type RouteParams = {
  sessionId: string;
};

type HistoryEntry = {
  _id: string;
  workoutId: string;
  name: string;
  date: string;
  durationSeconds: number;
  totalVolume: number;
  completedSets: number;
  exercises: {
    id: string;
    name: string;
    muscle: string;
    sets: {
      weight: number;
      reps: number;
      volume: number;
    }[];
  }[];
};

/* ===================== COMPONENT ===================== */

export default function WorkoutSummaryScreen() {
  const route = useRoute();
  const navigation =
    useNavigation<NativeStackNavigationProp<MyWorkoutsStackParamList>>();
  const { sessionId } = route.params as RouteParams;

  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState<HistoryEntry | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchWorkoutHistoryById(sessionId);
        setEntry(data as any);
      } catch {
        setEntry(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [sessionId]);

  /* ===================== RENDER ===================== */

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={{ padding: 16 }}>
        <Text>Session not found.</Text>
      </View>
    );
  }

  const minutes = Math.floor(entry.durationSeconds / 60);
  const seconds = entry.durationSeconds % 60;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>
        {entry.name} — Summary
      </Text>

      {/* Stats */}
      <View style={{ gap: 6 }}>
        <Text>Date: {new Date(entry.date).toLocaleString()}</Text>
        <Text>
          Duration: {minutes}:{String(seconds).padStart(2, "0")}
        </Text>
        <Text>Total Volume: {entry.totalVolume} kg</Text>
        <Text>Completed Sets: {entry.completedSets}</Text>
      </View>

      {/* Exercises */}
      <View style={{ gap: 12 }}>
        {entry.exercises.map((ex, index) => (
          <View
            key={`${entry._id}-${ex.id}-${index}`}
            style={{
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
              gap: 6,
            }}
          >
            <Text style={{ fontWeight: "600" }}>{ex.name}</Text>
            <Text style={{ opacity: 0.7 }}>{ex.muscle}</Text>

            {ex.sets.map((s, i) => (
              <Text key={`${ex.id}-set-${i}`}>
                {s.weight} kg × {s.reps} reps
              </Text>
            ))}
          </View>
        ))}
      </View>

      {/* Back */}
      <Pressable
        onPress={() => navigation.popToTop()}
        style={{
          marginTop: 20,
          padding: 14,
          borderWidth: 1,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "600" }}>Back to Workouts</Text>
      </Pressable>
    </ScrollView>
  );
}
