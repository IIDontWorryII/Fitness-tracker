import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import { api } from "../api/client";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MyWorkoutsStackParamList } from "../navigation/MyWorkoutsStack";

/* ===================== TYPES ===================== */

type RouteParams = {
  workoutId: string;
};

type SessionSet = {
  weight: number;
  reps: number;
  done: boolean;
};

type SessionExercise = {
  id: string;
  name: string;
  muscle: string;
  sets: SessionSet[];
};

/* ===================== COMPONENT ===================== */

export default function StartWorkoutScreen() {
  const route = useRoute();
  const navigation =
    useNavigation<NativeStackNavigationProp<MyWorkoutsStackParamList>>();
  const { workoutId } = route.params as RouteParams;
  const [workoutName, setWorkoutName] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>(
    []
  );
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [workoutRes, exercisesRes] = await Promise.all([
          api.get(`/api/workouts/${workoutId}`),
          api.get("/api/exercises"),
        ]);

        const workout = workoutRes.data;
        setWorkoutName(workout.name);

        // 🔑 SAME NORMALIZATION AS WORKOUT DETAIL SCREEN
        const exerciseMap: Record<
          string,
          { id: string; name: string; muscle: string }
        > = {};

        exercisesRes.data.forEach((ex: any) => {
          const key = ex.slug ?? ex._id;
          exerciseMap[key] = {
            id: key,
            name: ex.name,
            muscle: ex.muscle,
          };
        });

        const built: SessionExercise[] = workout.exercises
          .map((we: any) => {
            const meta = exerciseMap[we.id];
            if (!meta) return null;

            return {
              id: meta.id,
              name: meta.name,
              muscle: meta.muscle,
              sets: we.sets.map((s: any) => ({
                weight: s.weight ?? 0,
                reps: s.reps,
                done: false,
              })),
            };
          })
          .filter(Boolean);

        setSessionExercises(built);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [workoutId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* ===================== UPDATES ===================== */

  const updateSet = (
    exIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: string
  ) => {
    setSessionExercises((prev) =>
      prev.map((ex, i) =>
        i !== exIndex
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s, j) =>
                j !== setIndex ? s : { ...s, [field]: Number(value) || 0 }
              ),
            }
      )
    );
  };

  const toggleSetDone = (exIndex: number, setIndex: number) => {
    setSessionExercises((prev) =>
      prev.map((ex, i) =>
        i !== exIndex
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s, j) =>
                j !== setIndex ? s : { ...s, done: !s.done }
              ),
            }
      )
    );
  };

  /* ===================== FINISH ===================== */

  const finishWorkout = async () => {
    console.log("FINISH WORKOUT — workoutId =", workoutId);
    const completedSets = sessionExercises.reduce(
      (sum, ex) => sum + ex.sets.filter((s) => s.done).length,
      0
    );

    const totalVolume = sessionExercises.reduce(
      (sum, ex) =>
        sum +
        ex.sets.reduce(
          (inner, s) => (s.done ? inner + s.weight * s.reps : inner),
          0
        ),
      0
    );

    if (!workoutId) {
      throw new Error("workoutId missing in StartWorkoutScreen");
    }
    if (completedSets === 0) {
      Alert.alert("No sets completed", "Mark at least one set as done.");
      return;
    }

    const payload = {
      workoutId,
      name: workoutName,
      date: new Date().toISOString(),
      durationSeconds: seconds,
      totalVolume,
      completedSets,
      exercises: sessionExercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        muscle: ex.muscle,
        sets: ex.sets.map((s) => ({
          weight: s.weight,
          reps: s.reps,
          done: s.done,
          volume: s.weight * s.reps,
        })),
      })),
    };

    const res = await api.post("/api/workout-history", payload);

    navigation.navigate("WorkoutSummary", {
      sessionId: res.data.id,
    });
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
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>{workoutName}</Text>
      <Text style={{ opacity: 0.6 }}>
        Time: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
      </Text>

      {sessionExercises.map((ex, exIndex) => (
        <View
          key={ex.id}
          style={{ borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 }}
        >
          <Text style={{ fontWeight: "600" }}>{ex.name}</Text>

          {ex.sets.map((set, setIndex) => (
            <View
              key={setIndex}
              style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
            >
              <Text>Set {setIndex + 1}</Text>

              <TextInput
                style={{
                  borderWidth: 1,
                  padding: 6,
                  width: 60,
                  textAlign: "center",
                }}
                keyboardType="numeric"
                value={String(set.weight)}
                onChangeText={(v) => updateSet(exIndex, setIndex, "weight", v)}
              />

              <Text>kg</Text>

              <TextInput
                style={{
                  borderWidth: 1,
                  padding: 6,
                  width: 60,
                  textAlign: "center",
                }}
                keyboardType="numeric"
                value={String(set.reps)}
                onChangeText={(v) => updateSet(exIndex, setIndex, "reps", v)}
              />

              <Pressable
                onPress={() => toggleSetDone(exIndex, setIndex)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderRadius: 8,
                  backgroundColor: set.done ? "#cde" : "transparent",
                }}
              >
                <Text>{set.done ? "✓" : "Done"}</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ))}

      <Pressable
        onPress={finishWorkout}
        style={{
          marginTop: 20,
          padding: 14,
          borderWidth: 1,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "600" }}>Finish Workout</Text>
      </Pressable>
      <Pressable
        onPress={() => navigation.goBack()}
        style={{
          marginTop: 10,
          padding: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ opacity: 0.7 }}>← Back</Text>
      </Pressable>
    </View>
  );
}
