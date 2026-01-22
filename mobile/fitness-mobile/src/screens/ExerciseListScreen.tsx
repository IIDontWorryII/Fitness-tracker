import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Image,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import {
  useNavigation,
  useRoute,
  CommonActions,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MyWorkoutsStackParamList } from "../navigation/MyWorkoutsStack";
import { api } from "../api/client";

/* ===================== TYPES ===================== */

// what backend returns (likely)
type RawExercise = {
  _id: string;
  slug?: string;
  name: string;
  muscle: string;
  thumbnail?: string | null;
};

// what this screen uses internally
type Exercise = {
  id: string; // ✅ normalized id: slug ?? _id  (prefer slug like "ex-008")
  name: string;
  muscle: string;
  thumbnail?: string | null;
};

type RouteParams = {
  selected?: string[];
  returnTo: "NewWorkout" | "WorkoutDetail";
  returnParams?: { workoutId: string };
};

/* ===================== CONSTANTS ===================== */

const MUSCLES = [
  "chest",
  "back",
  "arms",
  "shoulders",
  "legs",
  "core",
  "glutes",
] as const;

/* ===================== COMPONENT ===================== */

export default function ExerciseListScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MyWorkoutsStackParamList>>();
  const route = useRoute();
  const params = route.params as RouteParams;
  const preselected = params?.selected ?? [];

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(preselected)
  );
  const [search, setSearch] = useState("");
  const [activeMuscles, setActiveMuscles] = useState<Set<string>>(
    () => new Set()
  );

  /* ===================== LOAD ===================== */

  useEffect(() => {
    let mounted = true;

    async function load() {
      const res = await api.get<RawExercise[]>("/api/exercises");

      // ✅ normalize like your web frontend: id = slug ?? _id
      const normalized: Exercise[] = res.data.map((ex) => ({
        id: ex.slug ?? ex._id,
        name: ex.name,
        muscle: ex.muscle,
        thumbnail: ex.thumbnail ?? null,
      }));

      if (mounted) setExercises(normalized);
    }

    load().catch(() => {
      if (mounted) setExercises([]);
    });

    return () => {
      mounted = false;
    };
  }, []);

  /* ===================== FILTER LOGIC ===================== */

  const filteredExercises = useMemo(() => {
    const q = search.trim().toLowerCase();

    return exercises.filter((ex) => {
      const matchesSearch =
        ex.name.toLowerCase().includes(q) ||
        ex.muscle.toLowerCase().includes(q);

      const matchesMuscle =
        activeMuscles.size === 0 || activeMuscles.has(ex.muscle);

      return matchesSearch && matchesMuscle;
    });
  }, [exercises, search, activeMuscles]);

  /* ===================== HANDLERS ===================== */

  const toggleExercise = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleMuscle = (muscle: string) => {
    setActiveMuscles((prev) => {
      const next = new Set(prev);
      next.has(muscle) ? next.delete(muscle) : next.add(muscle);
      return next;
    });
  };

  const done = () => {
    const picked = Array.from(selectedIds);

    navigation.goBack();

    navigation.navigate({
      name: params.returnTo,
      params: {
        ...(params.returnParams ?? {}),
        selectedExercises: picked,
      } as any,
      merge: true,
    });
  };

  /* ===================== RENDER ===================== */

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Select Exercises</Text>

      {/* SEARCH */}
      <TextInput
        placeholder="Search exercise…"
        value={search}
        onChangeText={setSearch}
        style={{
          borderWidth: 1,
          borderRadius: 8,
          padding: 12,
        }}
      />

      {/* MUSCLE FILTERS */}
      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        {MUSCLES.map((muscle) => {
          const active = activeMuscles.has(muscle);

          return (
            <Pressable
              key={muscle}
              onPress={() => toggleMuscle(muscle)}
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                borderWidth: 2,
                borderColor: active ? "#000" : "#ccc",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={{
                  uri: `${api.defaults.baseURL}/images/muscles/${muscle}.png`,
                }}
                style={{ width: 32, height: 32 }}
              />
            </Pressable>
          );
        })}
      </View>

      {/* LIST */}
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id} // ✅ use normalized id
        contentContainerStyle={{ paddingVertical: 8 }}
        renderItem={({ item }) => {
          const selected = selectedIds.has(item.id); // ✅ use normalized id

          return (
            <Pressable
              onPress={() => toggleExercise(item.id)} // ✅ use normalized id
              style={{
                flexDirection: "row",
                gap: 12,
                padding: 12,
                borderWidth: 2,
                borderRadius: 12,
                borderColor: selected ? "#000" : "#ddd",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              {item.thumbnail ? (
                <Image
                  source={{ uri: item.thumbnail }}
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
                <Text style={{ fontWeight: "600" }}>{item.name}</Text>
                <Text style={{ opacity: 0.6 }}>{item.muscle}</Text>
              </View>

              {selected && <Text style={{ fontSize: 18 }}>✓</Text>}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", opacity: 0.6 }}>
            No exercises found.
          </Text>
        }
      />

      {/* FOOTER */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{
            flex: 1,
            padding: 14,
            borderWidth: 1,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text>Cancel</Text>
        </Pressable>

        <Pressable
          onPress={done}
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 12,
            backgroundColor: "#000",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Done</Text>
        </Pressable>
      </View>
    </View>
  );
}
