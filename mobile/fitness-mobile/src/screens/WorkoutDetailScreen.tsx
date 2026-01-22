// src/screens/WorkoutDetailScreen.tsx

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  Image,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MyWorkoutsStackParamList } from "../navigation/MyWorkoutsStack";
import { api } from "../api/client";

/* ===================== TYPES ===================== */

type RouteParams = {
  workoutId: string;
};

type WorkoutSet = {
  weight: number | null;
  reps: number;
};

type WorkoutExercise = {
  id: string; // IMPORTANT: your workouts store exercise id as slug OR _id depending on your setup
  sets: WorkoutSet[];
};

type Workout = {
  _id?: string;
  id?: string;
  name: string;
  exercises: WorkoutExercise[];
};

type ExerciseMeta = {
  id: string; // normalized: slug ?? _id
  name: string;
  muscle: string;
  thumbnail?: string | null;
};

/* ===================== PURE HELPERS ===================== */

function cloneExercises(list: WorkoutExercise[]): WorkoutExercise[] {
  // safer than JSON stringify if you ever add methods/Date etc
  return list.map((ex) => ({
    id: ex.id,
    sets: (ex.sets ?? []).map((s) => ({
      weight: s.weight ?? null,
      reps: Number.isFinite(s.reps) ? s.reps : 0,
    })),
  }));
}

function updateWeightInWorkout(
  list: WorkoutExercise[],
  exerciseId: string,
  setIndex: number,
  weight: number | null
): WorkoutExercise[] {
  return list.map((ex) => {
    if (ex.id !== exerciseId) return ex;
    const sets = ex.sets.map((s, i) => (i === setIndex ? { ...s, weight } : s));
    return { ...ex, sets };
  });
}

function updateRepsInWorkout(
  list: WorkoutExercise[],
  exerciseId: string,
  setIndex: number,
  reps: number
): WorkoutExercise[] {
  return list.map((ex) => {
    if (ex.id !== exerciseId) return ex;
    const sets = ex.sets.map((s, i) => (i === setIndex ? { ...s, reps } : s));
    return { ...ex, sets };
  });
}

function addSetToWorkoutExercise(
  list: WorkoutExercise[],
  exerciseId: string
): WorkoutExercise[] {
  return list.map((ex) => {
    if (ex.id !== exerciseId) return ex;
    const last = ex.sets?.[ex.sets.length - 1];
    const nextSet: WorkoutSet = {
      weight: last?.weight ?? null,
      reps: last?.reps ?? 10,
    };
    return { ...ex, sets: [...(ex.sets ?? []), nextSet] };
  });
}

function removeSetFromWorkoutExercise(
  list: WorkoutExercise[],
  exerciseId: string,
  setIndex: number
): WorkoutExercise[] {
  return list.map((ex) => {
    if (ex.id !== exerciseId) return ex;
    const sets = (ex.sets ?? []).filter((_, i) => i !== setIndex);
    return { ...ex, sets };
  });
}

function removeExerciseFromWorkout(
  list: WorkoutExercise[],
  exerciseId: string
): WorkoutExercise[] {
  return list.filter((ex) => ex.id !== exerciseId);
}

/* ===================== COMPONENT ===================== */

export default function WorkoutDetailScreen() {
  const route = useRoute();
  const navigation =
    useNavigation<NativeStackNavigationProp<MyWorkoutsStackParamList>>();
  const { workoutId, selectedExercises } = route.params as {
    workoutId: string;
    selectedExercises?: string[];
  };

  const [loading, setLoading] = useState(true);
  const [workout, setWorkout] = useState<Workout | null>(null);

  const [exerciseMap, setExerciseMap] = useState<Record<string, ExerciseMeta>>(
    {}
  );

  /* ========= Settings / Actions ========= */
  const [showActions, setShowActions] = useState(false);

  /* ========= Rename ========= */
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  /* ========= Edit Mode ========= */
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableExercises, setEditableExercises] = useState<WorkoutExercise[]>(
    []
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const workoutDocId = workout?._id ?? workout?.id ?? workoutId;

  /* ===================== LOAD ===================== */

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [workoutRes, exercisesRes] = await Promise.all([
          api.get(`/api/workouts/${workoutId}`),
          api.get("/api/exercises"),
        ]);

        const w: Workout = workoutRes.data;

        // normalize exercises meta: key = slug ?? _id
        const map: Record<string, ExerciseMeta> = {};
        (exercisesRes.data ?? []).forEach((ex: any) => {
          const key = ex.slug ?? ex._id;
          map[key] = {
            id: key,
            name: ex.name,
            muscle: ex.muscle,
            thumbnail: ex.thumbnail ?? null,
          };
        });

        if (!mounted) return;

        setExerciseMap(map);
        setWorkout({ ...w, exercises: w.exercises ?? [] });
        setRenameValue(w.name ?? "");

        // keep edit buffer in sync on load
        setEditableExercises(cloneExercises(w.exercises ?? []));
      } catch {
        if (mounted) setWorkout(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [workoutId]);

  useEffect(() => {
    if (!isEditMode) return;
    if (!selectedExercises || selectedExercises.length === 0) return;

    setEditableExercises((prev) => {
      const existing = new Set(prev.map((e) => e.id));

      const additions = selectedExercises
        .filter((id) => !existing.has(id))
        .map((id) => ({
          id,
          sets: [
            { weight: null, reps: 10 },
            { weight: null, reps: 10 },
            { weight: null, reps: 10 },
          ],
        }));

      return [...prev, ...additions];
    });

    // ✅ clear param to prevent re-merging on re-render / back nav
    navigation.setParams({ selectedExercises: undefined } as any);
  }, [isEditMode, selectedExercises, navigation]);

  /* ===================== ACTIONS: RENAME / DELETE ===================== */

  const openRename = () => {
    if (!workout) return;
    setShowActions(false);
    setIsEditMode(false);
    setExpandedId(null);
    setRenameValue(workout.name ?? "");
    setIsRenaming(true);
  };

  const confirmRename = async () => {
    if (!workout) return;

    const trimmed = renameValue.trim();
    if (!trimmed) {
      Alert.alert("Invalid name", "Please enter a workout name.");
      return;
    }

    try {
      const res = await api.patch(`/api/workouts/${workoutDocId}`, {
        name: trimmed,
      });

      const updated: Workout = res.data;

      setWorkout((prev) =>
        prev ? { ...prev, ...updated, name: trimmed } : prev
      );
      setIsRenaming(false);
    } catch (err: any) {
      Alert.alert("Rename failed", err?.message ?? "Could not rename workout.");
    }
  };

  const confirmDelete = () => {
    if (!workout) return;

    setShowActions(false);
    setIsRenaming(false);
    setIsEditMode(false);
    setExpandedId(null);

    Alert.alert("Delete workout", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/api/workouts/${workoutDocId}`);
            navigation.popToTop();
          } catch (err: any) {
            Alert.alert(
              "Delete failed",
              err?.message ?? "Could not delete workout."
            );
          }
        },
      },
    ]);
  };

  /* ===================== EDIT MODE HANDLERS ===================== */

  const enterEdit = () => {
    if (!workout) return;
    setShowActions(false);
    setIsRenaming(false);
    setIsEditMode(true);
    setExpandedId(null);
    setEditableExercises(cloneExercises(workout.exercises ?? []));
  };

  const cancelEdit = () => {
    if (!workout) return;
    setIsEditMode(false);
    setExpandedId(null);
    setEditableExercises(cloneExercises(workout.exercises ?? []));
  };

  const saveEdit = async () => {
    if (!workout) return;

    if (editableExercises.length === 0) {
      Alert.alert("Workout is empty", "Please keep at least one exercise.");
      return;
    }

    // basic sanity: each exercise has at least 1 set
    const invalid = editableExercises.some(
      (ex) => !ex.sets || ex.sets.length === 0
    );
    if (invalid) {
      Alert.alert(
        "Invalid workout",
        "Each exercise must have at least one set."
      );
      return;
    }

    try {
      const res = await api.patch(`/api/workouts/${workoutDocId}`, {
        exercises: editableExercises,
      });

      const updated: Workout = res.data;

      setWorkout((prev) =>
        prev
          ? {
              ...prev,
              ...updated,
              exercises: updated.exercises ?? editableExercises,
            }
          : prev
      );

      setIsEditMode(false);
      setExpandedId(null);
    } catch (err: any) {
      Alert.alert("Save failed", err?.message ?? "Could not save changes.");
    }
  };

  const openExercisePickerForEdit = () => {
    const selected = editableExercises.map((e) => e.id);

    navigation.navigate("ExerciseList", {
      selected,
      returnTo: "WorkoutDetail",
      returnParams: { workoutId },
    });
  };

  const onToggleExpand = (exerciseId: string) => {
    setExpandedId((prev) => (prev === exerciseId ? null : exerciseId));
  };

  const onUpdateWeight = (
    exerciseId: string,
    setIndex: number,
    text: string
  ) => {
    // allow empty -> null
    const trimmed = text.trim();
    const nextWeight = trimmed === "" ? null : Number(trimmed);
    setEditableExercises((prev) =>
      updateWeightInWorkout(
        prev,
        exerciseId,
        setIndex,
        Number.isFinite(nextWeight as any) ? nextWeight : null
      )
    );
  };

  const onUpdateReps = (exerciseId: string, setIndex: number, text: string) => {
    const n = Number(text);
    const reps = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
    setEditableExercises((prev) =>
      updateRepsInWorkout(prev, exerciseId, setIndex, reps)
    );
  };

  const onAddSet = (exerciseId: string) => {
    setEditableExercises((prev) => addSetToWorkoutExercise(prev, exerciseId));
  };

  const onRemoveSet = (exerciseId: string, setIndex: number) => {
    setEditableExercises((prev) =>
      removeSetFromWorkoutExercise(prev, exerciseId, setIndex)
    );
  };

  const onRemoveExercise = (exerciseId: string) => {
    setEditableExercises((prev) => removeExerciseFromWorkout(prev, exerciseId));
    setExpandedId((prev) => (prev === exerciseId ? null : prev));
  };

  /* ===================== VIEW HELPERS ===================== */

  const viewExercises = useMemo(() => {
    if (!workout) return [];
    return (workout.exercises ?? [])
      .map((we) => {
        const meta = exerciseMap[we.id];
        if (!meta) return null;
        const setsCount = we.sets?.length ?? 0;
        const reps = we.sets?.[0]?.reps ?? "-";
        return {
          id: we.id,
          name: meta.name,
          muscle: meta.muscle,
          thumbnail: meta.thumbnail ?? null,
          setsCount,
          reps,
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      name: string;
      muscle: string;
      thumbnail: string | null;
      setsCount: number;
      reps: number | string;
    }>;
  }, [workout, exerciseMap]);

  /* ===================== RENDER ===================== */

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!workout) {
    return (
      <View style={{ padding: 16 }}>
        <Text>Workout not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {/* Header row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "700", flex: 1 }}>
            {workout.name}
          </Text>

          <Pressable
            onPress={() => setShowActions((p) => !p)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderWidth: 1,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 18 }}>⋮</Text>
          </Pressable>
        </View>

        {/* Actions dropdown */}
        {showActions && (
          <View
            style={{
              alignSelf: "flex-end",
              backgroundColor: "#fff",
              borderWidth: 1,
              borderRadius: 10,
              paddingVertical: 6,
              width: 180,
            }}
          >
            <Pressable
              onPress={enterEdit}
              style={{ paddingVertical: 10, paddingHorizontal: 12 }}
            >
              <Text>Edit</Text>
            </Pressable>

            <Pressable
              onPress={openRename}
              style={{ paddingVertical: 10, paddingHorizontal: 12 }}
            >
              <Text>Rename</Text>
            </Pressable>

            <Pressable
              onPress={confirmDelete}
              style={{ paddingVertical: 10, paddingHorizontal: 12 }}
            >
              <Text style={{ color: "red" }}>Delete</Text>
            </Pressable>
          </View>
        )}

        {/* Rename panel */}
        {isRenaming && (
          <View
            style={{
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
              gap: 10,
            }}
          >
            <Text style={{ fontWeight: "600" }}>Rename workout</Text>

            <TextInput
              value={renameValue}
              onChangeText={setRenameValue}
              placeholder="Workout name"
              style={{
                borderWidth: 1,
                borderRadius: 8,
                padding: 10,
              }}
            />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => setIsRenaming(false)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={confirmRename}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 10,
                  backgroundColor: "#000",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Save</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ===================== EDIT MODE UI ===================== */}
        {isEditMode && (
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={cancelEdit}
                style={{
                  flex: 1,
                  padding: 12,
                  borderWidth: 1,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={saveEdit}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 10,
                  backgroundColor: "#000",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Save</Text>
              </Pressable>
              <Pressable
                onPress={openExercisePickerForEdit}
                style={{
                  padding: 14,
                  borderWidth: 1,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "600" }}>+ Add Exercise</Text>
              </Pressable>
            </View>

            {editableExercises.map((we) => {
              const meta = exerciseMap[we.id];
              const title = meta?.name ?? we.id;
              const subtitle = meta ? meta.muscle : "";

              const expanded = expandedId === we.id;

              return (
                <View
                  key={we.id}
                  style={{
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 12,
                    gap: 10,
                  }}
                >
                  <Pressable
                    onPress={() => onToggleExpand(we.id)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    {meta?.thumbnail ? (
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
                      <Text style={{ fontWeight: "700" }}>{title}</Text>
                      <Text style={{ opacity: 0.6 }}>
                        {we.sets.length} sets {subtitle ? `• ${subtitle}` : ""}
                      </Text>
                    </View>

                    <Text style={{ fontSize: 18 }}>{expanded ? "▴" : "▾"}</Text>
                  </Pressable>

                  {expanded && (
                    <View style={{ gap: 10 }}>
                      {/* Sets editor */}
                      {we.sets.map((s, idx) => (
                        <View
                          key={idx}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <Text style={{ width: 44 }}>Set {idx + 1}</Text>

                          <TextInput
                            value={s.weight === null ? "" : String(s.weight)}
                            onChangeText={(t) => onUpdateWeight(we.id, idx, t)}
                            placeholder="kg"
                            keyboardType="numeric"
                            style={{
                              flex: 1,
                              borderWidth: 1,
                              borderRadius: 8,
                              padding: 10,
                              textAlign: "center",
                            }}
                          />

                          <TextInput
                            value={String(s.reps)}
                            onChangeText={(t) => onUpdateReps(we.id, idx, t)}
                            placeholder="reps"
                            keyboardType="numeric"
                            style={{
                              flex: 1,
                              borderWidth: 1,
                              borderRadius: 8,
                              padding: 10,
                              textAlign: "center",
                            }}
                          />

                          <Pressable
                            onPress={() => onRemoveSet(we.id, idx)}
                            style={{
                              paddingHorizontal: 10,
                              paddingVertical: 8,
                              borderWidth: 1,
                              borderRadius: 8,
                            }}
                          >
                            <Text>✕</Text>
                          </Pressable>
                        </View>
                      ))}

                      {/* Edit actions */}
                      <View style={{ flexDirection: "row", gap: 10 }}>
                        <Pressable
                          onPress={() => onAddSet(we.id)}
                          style={{
                            flex: 1,
                            padding: 12,
                            borderWidth: 1,
                            borderRadius: 10,
                            alignItems: "center",
                          }}
                        >
                          <Text>+ Add set</Text>
                        </Pressable>

                        <Pressable
                          onPress={() => onRemoveExercise(we.id)}
                          style={{
                            flex: 1,
                            padding: 12,
                            borderWidth: 1,
                            borderRadius: 10,
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ color: "red" }}>Remove exercise</Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ===================== VIEW MODE UI ===================== */}
        {!isEditMode &&
          viewExercises.map((ex) => (
            <View
              key={ex.id}
              style={{
                flexDirection: "row",
                gap: 12,
                padding: 12,
                borderWidth: 1,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              {ex.thumbnail ? (
                <Image
                  source={{ uri: ex.thumbnail }}
                  style={{ width: 56, height: 56, borderRadius: 8 }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    backgroundColor: "#eee",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 10, opacity: 0.6 }}>IMG</Text>
                </View>
              )}

              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  {ex.name}
                </Text>
                <Text style={{ opacity: 0.7 }}>
                  {ex.setsCount} × {ex.reps} reps • {ex.muscle}
                </Text>
              </View>
            </View>
          ))}

        {/* Start workout only in view mode */}
        {!isEditMode && (
          <Pressable
            onPress={() => navigation.navigate("StartWorkout", { workoutId })}
            style={{
              marginTop: 12,
              padding: 14,
              borderWidth: 1,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <Text style={{ fontWeight: "600" }}>Start Workout</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
