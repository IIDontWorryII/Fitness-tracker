/*
  ============================================================
  Datei: workouts.routes.ts

  Rolle im Projekt:
  Diese Datei implementiert die REST API fuer Workouts.
  Sie erlaubt es Benutzern, ihre eigenen Workouts zu:
  - erstellen
  - lesen
  - aktualisieren
  - loeschen

  Sicherheitskonzept:
  - Alle Endpunkte sind durch requireAuth geschuetzt
  - Jeder Zugriff ist strikt benutzerspezifisch
  - Kein Benutzer kann fremde Workouts sehen oder aendern

  Architektur:
  - HTTP Logik in der Route
  - Datenbankzugriff im data Layer (workouts.store)
  ============================================================
*/

import { Router } from "express";
import {
  getAllWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getPublicWorkouts, // NEW
  getPublicWorkoutById, // NEW
  cloneWorkout, // NEW
  updateWorkoutVisibility, // NEW
} from "../data/workouts.store";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

/* ============================================================
   PUBLIC (no auth)
============================================================ */

/** // NEW
 * GET /workouts/public
 * Returns all public workouts
 */
router.get("/public", async (_req, res) => {
  const workouts = await getPublicWorkouts();
  res.json(workouts);
});

/** // NEW
 * GET /workouts/public/:id
 * Returns a single public workout
 */
router.get("/public/:id", async (req, res) => {
  const { id } = req.params;

  const workout = await getPublicWorkoutById(id);

  if (!workout) {
    return res.status(404).json({ message: "Public workout not found" });
  }

  res.json(workout);
});

/* ============================================================
   PRIVATE COLLECTION
============================================================ */

/*
  ============================================================
  GET /workouts

  Zweck:
  Liefert alle Workouts des aktuell eingeloggten Benutzers.

  REST Prinzip:
  - GET = lesen
  - Keine Seiteneffekte
  ============================================================
*/
router.get("/", requireAuth, async (req, res) => {
  // userId stammt aus der serverseitigen Session
  const userId = req.session.userId!;

  const workouts = await getAllWorkouts(userId);
  res.json(workouts);
});

/*
  ============================================================
  POST /workouts

  Zweck:
  Erstellt ein neues Workout fuer den eingeloggten Benutzer.

  REST Prinzip:
  - POST = neue Ressource
  - Rueckgabe mit Status 201
  ============================================================
*/
router.post("/", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const { name, exercises } = req.body;

  /*
    Normalisierung der Exercises.

    Architekturentscheidung:
    - Es wird nur die Exercise ID (slug) gespeichert
    - Keine kompletten Exercise Objekte
  */
  const normalizedExercises = (exercises ?? []).map((ex: any) => ({
    id: String(ex.id), // slug der Exercise
    sets: ex.sets ?? [],
  }));

  const workout = await createWorkout({
    userId,
    name,
    exercises: normalizedExercises,
  });

  res.status(201).json(workout);
});

/*
  ============================================================
  GET /workouts/:id

  Zweck:
  Liefert ein einzelnes Workout.

  Sicherheitsaspekt:
  - Zugriff nur moeglich, wenn das Workout dem User gehoert
  ============================================================
*/
router.get("/:id", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const { id } = req.params;

  const workout = await getWorkoutById(userId, id);

  if (!workout) {
    // 404 statt 403, um keine Existenz fremder Daten preiszugeben
    return res.status(404).json({ message: "Workout not found" });
  }

  res.json(workout);
});

/*
  ============================================================
  PATCH /workouts/:id

  Zweck:
  Aktualisiert ein bestehendes Workout.

  REST Prinzip:
  - PATCH = partielle Aktualisierung
  - Nur uebergebene Felder werden geaendert
  ============================================================
*/
router.patch("/:id", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const { id } = req.params;
  const { name, exercises } = req.body;

  /*
    Dynamischer Update Payload.
    Nur Felder, die existieren, werden weitergegeben.
  */
  const updated = await updateWorkout(userId, id, {
    ...(name !== undefined && { name }),
    ...(exercises !== undefined && { exercises }),
  });

  if (!updated) {
    return res.status(404).json({ message: "Workout not found" });
  }

  res.json(updated);
});

/*
  ============================================================
  DELETE /workouts/:id

  Zweck:
  Loescht ein Workout des Benutzers.

  REST Prinzip:
  - DELETE = Ressource entfernen
  ============================================================
*/
router.delete("/:id", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const { id } = req.params;

  const success = await deleteWorkout(userId, id);

  if (!success) {
    return res.status(404).json({ message: "Workout not found" });
  }

  res.json({ success: true });
});

/** // NEW
 * POST /workouts/:id/clone
 * Clones a public workout into the users account
 */
router.post("/:id/clone", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const { id } = req.params;

  const cloned = await cloneWorkout({
    sourceWorkoutId: id,
    targetUserId: userId,
  });

  if (!cloned) {
    return res.status(404).json({ message: "Workout not clonable" });
  }

  res.status(201).json(cloned);
});

/**
 * PATCH /workouts/:id/visibility
 */
/**
 * PATCH /workouts/:id/visibility
 * Toggles public visibility of a workout (owner only)
 */
router.patch("/:id/visibility", requireAuth, async (req, res) => {
  const userId = req.session.userId!;
  const { id } = req.params;
  const { isPublic } = req.body;

  const updated = await updateWorkoutVisibility(userId, id, Boolean(isPublic));

  if (!updated) {
    return res.status(404).json({ message: "Workout not found" });
  }

  res.json(updated);
});

export default router;
