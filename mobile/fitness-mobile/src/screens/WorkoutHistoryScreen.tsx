import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MyWorkoutsStackParamList } from "../navigation/MyWorkoutsStack";
import { fetchWorkoutHistory } from "../api/workoutHistoryClient";

/* ===================== TYPES ===================== */

type HistoryEntry = {
  id: string;
  workoutId: string;
  name: string;
  date: string;
  durationSeconds: number;
  totalVolume: number;
  completedSets: number;
};

/* ===================== COMPONENT ===================== */

export default function WorkoutHistoryScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MyWorkoutsStackParamList>>();

  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  /* ===================== LOAD ===================== */

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await fetchWorkoutHistory();
        if (mounted) setEntries(data);
      } catch {
        if (mounted) setEntries([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  /* ===================== HELPERS ===================== */

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  /* ===================== RENDER ===================== */

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
        Workout History
      </Text>

      <FlatList
        data={entries}
        keyExtractor={(item, index) =>
          item.id ? String(item.id) : `${item.workoutId}-${item.date}-${index}`
        }
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              if (!item.id) return; // safety: don't navigate with undefined
              navigation.navigate("WorkoutSummary", { sessionId: item.id });
            }}
            style={{
              borderWidth: 1,
              borderRadius: 12,
              padding: 14,
              marginBottom: 12,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <Text style={{ fontWeight: "600", fontSize: 16 }}>
                {item.name}
              </Text>
              <Text style={{ opacity: 0.6 }}>
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>

            {/* Stats */}
            <View style={{ gap: 4 }}>
              <Text>Duration: {formatDuration(item.durationSeconds)}</Text>
              <Text>Total Volume: {item.totalVolume} kg</Text>
              <Text>Completed Sets: {item.completedSets}</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={() => (
          <View style={{ paddingTop: 40 }}>
            <Text style={{ textAlign: "center", opacity: 0.6 }}>
              No workouts recorded yet.
            </Text>
          </View>
        )}
      />
    </View>
  );
}
