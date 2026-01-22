import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Image,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

/* ===================== TYPES ===================== */

type RawExercise = {
  _id: string;
  slug?: string;
  name: string;
  muscle: string;
  thumbnail?: string | null;
};

type Exercise = {
  id: string; // normalized: slug ?? _id
  name: string;
  muscle: string;
  thumbnail?: string | null;
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

/* ===================== SCREEN ===================== */

export default function ExercisesScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");
  const [activeMuscles, setActiveMuscles] = useState<Set<string>>(
    () => new Set()
  );
  const [loading, setLoading] = useState(true);

  /* ===================== LOAD ===================== */

  useEffect(() => {
    let mounted = true;

    async function load() {
      const res = await api.get<RawExercise[]>("/api/exercises");

      const normalized: Exercise[] = res.data.map((ex) => ({
        id: ex.slug ?? ex._id,
        name: ex.name,
        muscle: ex.muscle,
        thumbnail: ex.thumbnail ?? null,
      }));

      if (mounted) setExercises(normalized);
    }

    load()
      .catch(() => {
        if (mounted) setExercises([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  /* ===================== FILTER ===================== */

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

  const toggleMuscle = (muscle: string) => {
    setActiveMuscles((prev) => {
      const next = new Set(prev);
      next.has(muscle) ? next.delete(muscle) : next.add(muscle);
      return next;
    });
  };

  /* ===================== RENDER ===================== */

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Exercises</Text>

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
      {loading ? (
        <Text style={{ textAlign: "center", opacity: 0.6 }}>
          Loading exercises…
        </Text>
      ) : (
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                padding: 12,
                borderWidth: 1,
                borderRadius: 12,
                borderColor: "#ddd",
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
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", opacity: 0.6 }}>
              No exercises found.
            </Text>
          }
        />
      )}
    </View>
  );
}
