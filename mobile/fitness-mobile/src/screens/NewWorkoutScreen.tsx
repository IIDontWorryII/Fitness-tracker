import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MyWorkoutsStackParamList } from "../navigation/MyWorkoutsStack";
import { api } from "../api/client";

/* ===================== TYPES ===================== */

type WorkoutExercise = {
  id: string; // IMPORTANT: this is the normalized exercise id (slug ?? _id)
  sets: { weight: number | null; reps: number }[];
};

type ExerciseMeta = {
  _id: string;
  slug?: string;
  name: string;
  muscle: string;
  thumbnail?: string | null;
};

/* ===================== COMPONENT ===================== */

export default function NewWorkoutScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MyWorkoutsStackParamList>>();

  const route = useRoute();
  const { selectedExercises } = (route.params ?? {}) as {
    selectedExercises?: string[];
  };

  const [workoutName, setWorkoutName] = useState("");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [exerciseMap, setExerciseMap] = useState<Record<string, ExerciseMeta>>(
    {}
  );

  /* ===================== LOAD EXERCISE METADATA (ONCE) ===================== */

  useEffect(() => {
    let mounted = true;

    async function load() {
      const res = await api.get<ExerciseMeta[]>("/api/exercises");

      // ✅ KEY FIX: normalize map keys exactly like ExerciseListScreen
      const map: Record<string, ExerciseMeta> = {};

      res.data.forEach((ex) => {
        const normalizedId = ex.slug ?? ex._id;

        // Primary key = normalized id (slug preferred)
        map[normalizedId] = ex;

        // Also store by _id as fallback (useful if some screens still use _id)
        map[ex._id] = ex;
      });

      if (mounted) setExerciseMap(map);
    }

    load().catch(() => {
      if (mounted) setExerciseMap({});
    });

    return () => {
      mounted = false;
    };
  }, []);

  /* ===================== HANDLE RETURN FROM EXERCISE LIST ===================== */

  useEffect(() => {
    if (!selectedExercises || selectedExercises.length === 0) return;

    setExercises((prev) => {
      const existing = new Set(prev.map((e) => e.id));

      return [
        ...prev,
        ...selectedExercises
          .filter((id) => !existing.has(id))
          .map((id) => ({
            id,
            sets: [
              { weight: null, reps: 10 },
              { weight: null, reps: 10 },
              { weight: null, reps: 10 },
            ],
          })),
      ];
    });

    // prevent re-triggering when returning again
    navigation.setParams({ selectedExercises: undefined });
  }, [selectedExercises, navigation]);

  /* ===================== ACTIONS ===================== */

  const openExerciseList = () => {
    navigation.navigate("ExerciseList", {
      selected: exercises.map((e) => e.id),
      returnTo: "NewWorkout",
    });
  };

  const removeExercise = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const saveWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert("Please enter a workout name");
      return;
    }

    if (exercises.length === 0) {
      Alert.alert("Please select at least one exercise");
      return;
    }

    await api.post("/api/workouts", {
      name: workoutName.trim(),
      exercises,
    });

    // Always return to MyWorkouts list
    navigation.popToTop();
  };

  /* ===================== DERIVED ===================== */

  // (Optional) if you ever want to show “unknown ids” for debugging
  const missingMetaCount = useMemo(() => {
    return exercises.filter((ex) => !exerciseMap[ex.id]).length;
  }, [exercises, exerciseMap]);

  /* ===================== RENDER ===================== */

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>
        Create New Workout
      </Text>

      <TextInput
        placeholder="Workout title…"
        value={workoutName}
        onChangeText={setWorkoutName}
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
        }}
      />

      <Pressable
        onPress={openExerciseList}
        style={{
          padding: 14,
          borderWidth: 1,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text>+ Add Exercises</Text>
      </Pressable>

      {exercises.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: "600" }}>Selected Exercises</Text>

          {/* If something is still mismatched, this makes it obvious in UI */}
          {missingMetaCount > 0 && (
            <Text style={{ opacity: 0.5, fontSize: 12 }}>
              Some items missing metadata: {missingMetaCount}
            </Text>
          )}

          {exercises.map((ex) => {
            const meta = exerciseMap[ex.id];

            // If meta is missing, still render something (so it never “disappears”)
            if (!meta) {
              return (
                <View
                  key={ex.id}
                  style={{
                    flexDirection: "row",
                    gap: 12,
                    padding: 12,
                    borderWidth: 1,
                    borderRadius: 10,
                    alignItems: "center",
                    opacity: 0.7,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      backgroundColor: "#eee",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 10, opacity: 0.6 }}>IMG</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600" }}>{ex.id}</Text>
                    <Text style={{ opacity: 0.6 }}>{ex.sets.length} sets</Text>
                  </View>

                  <Pressable
                    onPress={() => removeExercise(ex.id)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderWidth: 1,
                      borderRadius: 8,
                    }}
                  >
                    <Text>✕</Text>
                  </Pressable>
                </View>
              );
            }

            return (
              <View
                key={ex.id}
                style={{
                  flexDirection: "row",
                  gap: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                {meta.thumbnail ? (
                  <Image
                    source={{ uri: meta.thumbnail }}
                    style={{ width: 48, height: 48, borderRadius: 8 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      backgroundColor: "#eee",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 10, opacity: 0.6 }}>IMG</Text>
                  </View>
                )}

                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "600" }}>{meta.name}</Text>
                  <Text style={{ opacity: 0.6 }}>
                    {ex.sets.length} sets • {meta.muscle}
                  </Text>
                </View>

                <Pressable
                  onPress={() => removeExercise(ex.id)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderWidth: 1,
                    borderRadius: 8,
                  }}
                >
                  <Text>✕</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      <Pressable
        onPress={saveWorkout}
        style={{
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
          backgroundColor: "#000",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>Save Workout</Text>
      </Pressable>
    </ScrollView>
  );
}
