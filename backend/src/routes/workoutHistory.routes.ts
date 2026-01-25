/*
  ============================================================
  Datei: workoutHistory.routes.ts

  Rolle im Projekt:
  Diese Datei implementiert die REST API fuer Trainingshistorie.
  Jeder Eintrag repraesentiert ein abgeschlossenes Training
  und ist ein zeitliches Event.

  Sicherheitskonzept:
  - Alle Endpunkte sind durch requireAuth geschuetzt
  - Historie ist strikt benutzerspezifisch
  - Kein Benutzer kann fremde Trainings sehen

  Architektur:
  - Historie ist eine eigene Ressource
  - Schreib- und Leseoperationen sind getrennt
  ============================================================
*/

import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  createWorkoutHistory,
  getWorkoutHistoryById,
  getWorkoutHistory,
} from "../data/workoutHistory.store";

const router = Router();

/*
  ============================================================
  POST /api/workout-history

  Zweck:
  Speichert ein abgeschlossenes Workout als Historieneintrag.

  REST Prinzip:
  - POST = neues Event
  - Historie ist append-only
  ============================================================
*/
router.post("/", requireAuth, async (req, res) => {
  // userId stammt ausschliesslich aus der Session
  const userId = (req.session as any).userId;

  /*
    Erstellung eines neuen Historieneintrags.

    Wichtiger Sicherheitsaspekt:
    - userId wird serverseitig gesetzt
    - Client kann keine fremde userId einschleusen
  */
  const entry = await createWorkoutHistory({
    userId,
    ...req.body,
  });

  /*
    Rueckgabe einer klar definierten Response-Struktur.
    Keine internen Daten oder Session-Infos.
  */
  res.status(201).json({
    id: entry._id.toString(),
    workoutId: entry.workoutId,
    name: entry.name,
    date: entry.date,
    durationSeconds: entry.durationSeconds,
    totalVolume: entry.totalVolume,
    completedSets: entry.completedSets,
    exercises: entry.exercises,
  });
});

/*
  ============================================================
  GET /api/workout-history

  Zweck:
  Liefert die komplette Trainingshistorie des Benutzers.

  REST Prinzip:
  - GET = lesen
  - Keine Seiteneffekte
  ============================================================
*/
router.get("/", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;

  const history = await getWorkoutHistory(userId);
  res.json(history);
});

/*
  ============================================================
  GET /api/workout-history/:id

  Zweck:
  Liefert einen einzelnen Historieneintrag.

  Sicherheitsaspekt:
  - Zugriff nur auf eigene Eintraege
  ============================================================
*/
router.get("/:id", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  const entry = await getWorkoutHistoryById(userId, req.params.id);

  if (!entry) {
    // Keine Information ueber Existenz fremder Eintraege
    return res.status(404).json({ message: "Session not found" });
  }

  res.json(entry);
});

export default router;
