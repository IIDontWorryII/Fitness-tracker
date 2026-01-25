/*
  ============================================================
  Datei: exercises.routes.ts

  Rolle im Projekt:
  Diese Datei stellt eine oeffentliche REST API fuer
  globale Trainingsuebungen (Exercises) bereit.

  Kontext:
  - Exercises sind Stammdaten
  - Sie sind nicht benutzerspezifisch
  - Sie koennen von jedem Client gelesen werden

  Sicherheitskonzept:
  - Nur Lesezugriff
  - Keine Authentifizierung notwendig
  - Keine sensitiven Daten enthalten

  Architektur:
  - Klare Trennung zwischen oeffentlichen und geschuetzten APIs
  ============================================================
*/

import { Router } from "express";
import Exercise from "../data/exercises.store";

const router = Router();

/*
  ============================================================
  GET /api/exercises

  Zweck:
  Liefert eine Liste aller globalen Exercises.

  Eigenschaften:
  - Oeffentlich erreichbar
  - Nur Lesezugriff
  - Sortiert nach Namen
  ============================================================
*/
router.get("/", async (_req, res) => {
  /*
    Ermittlung der Base URL des Servers.

    Zweck:
    - Wird verwendet, um absolute URLs fuer Bilder zu erzeugen
    - Erlaubt Frontends, Bilder direkt zu laden
  */
  const baseUrl = `${_req.protocol}://${_req.get("host")}`;

  /*
    Abfrage der globalen Exercises.

    Architekturentscheidung:
    - Nur Exercises mit isGlobal = true
    - Keine benutzerspezifischen Uebungen
  */
  const exercises = await Exercise.find({ isGlobal: true })
    .sort({ name: 1 }) // alphabetische Sortierung
    .lean();

  /*
    Normalisierung der Daten.

    Zweck:
    - thumbnail wird zu einer absoluten URL
    - Frontend muss keine URL-Logik kennen
  */
  const normalized = exercises.map((ex) => ({
    ...ex,
    thumbnail: ex.thumbnail ? `${baseUrl}${ex.thumbnail}` : null,
  }));

  res.json(normalized);
});

export default router;
