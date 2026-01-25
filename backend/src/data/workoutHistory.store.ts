/*
  ============================================================
  Datei: WorkoutHistory Model + Datenbankzugriff

  Rolle im Projekt:
  Diese Datei speichert abgeschlossene Trainingseinheiten.
  Jeder Eintrag repraesentiert ein tatsaechlich durchgefuehrtes
  Workout inklusive Metriken wie Dauer, Volumen und Saetze.

  Kontext:
  WorkoutHistory wird verwendet fuer:
  - Trainingshistorie im Frontend
  - Statistiken und Reports
  - Progress-Analyse (Volumen, Hauefigkeit, Dauer)
  - Nachvollziehbarkeit vergangener Trainings

  Abhaengigkeiten:
  - MongoDB als Datenbank
  - Mongoose als ODM
  - Wird von History-API-Routen genutzt

  Architekturentscheidung:
  WorkoutHistory ist eine eigene Collection und kein Teil
  des Workout-Models, da sie zeitliche Events speichert
  und nicht ueberschrieben werden darf.
  ============================================================
*/

import mongoose, { Schema } from "mongoose";

/*
  Interface fuer einen WorkoutHistory Eintrag.

  Zweck:
  - TypeScript Typisierung fuer Historieneintraege
  - Klare Struktur fuer Metriken und gespeicherte Daten
*/
export interface WorkoutHistoryDocument {
  userId: string; // Besitzer des Eintrags
  workoutId: string; // Referenz auf das Workout (Plan)
  name: string; // Name des Workouts zum Zeitpunkt des Trainings
  date: string; // Trainingsdatum (bewusst als String)
  durationSeconds: number; // Dauer des Trainings in Sekunden
  totalVolume: number; // Gesamtvolumen (z.B. Gewicht * Wiederholungen)
  completedSets: number; // Anzahl der abgeschlossenen Saetze
  exercises: any[]; // Detaildaten der Exercises
}

/*
  Definition des WorkoutHistory Schemas.

  Jeder Eintrag ist:
  - benutzerspezifisch
  - zeitlich eindeutig
  - unveraenderlich im Kern (Event-Daten)
*/
const WorkoutHistorySchema = new Schema<WorkoutHistoryDocument>(
  {
    /*
      Referenz auf den User.
      Indexiert fuer schnelle Abfragen pro Benutzer.
    */
    userId: { type: String, required: true, index: true },

    /*
      Referenz auf das zugrunde liegende Workout.
      Wird als String gespeichert, nicht als ObjectId-Relation.
    */
    workoutId: { type: String, required: true },

    /*
      Name des Workouts zum Zeitpunkt der Durchfuehrung.
      Wichtig, falls der Workout-Name spaeter geaendert wird.
    */
    name: { type: String, required: true },

    /*
      Datum des Trainings.
      Bewusst als String gespeichert, z.B. ISO-Format.
    */
    date: { type: String, required: true },

    /*
      Dauer des Trainings in Sekunden.
      Wird fuer Auswertungen und Reports genutzt.
    */
    durationSeconds: { type: Number, required: true },

    /*
      Gesamtvolumen des Trainings.
      Wird im Backend oder Frontend berechnet.
    */
    totalVolume: { type: Number, required: true },

    /*
      Anzahl der tatsaechlich abgeschlossenen Saetze.
    */
    completedSets: { type: Number, required: true },

    /*
      Detaildaten der Exercises.
      Flexible Struktur wegen variabler Set-Anzahl.
    */
    exercises: {
      type: Schema.Types.Mixed,
      default: [],
    },
  },
  {
    // Automatische Zeitstempel fuer Debugging und Analyse
    timestamps: true,
  }
);

/*
  Erstellung oder Wiederverwendung des WorkoutHistory Models.
*/
export const WorkoutHistoryModel =
  mongoose.models.WorkoutHistory ||
  mongoose.model<WorkoutHistoryDocument>(
    "WorkoutHistory",
    WorkoutHistorySchema
  );

/*
  ============================================================
  USER-SCOPED CRUD OPERATIONEN
  Alle Operationen sind strikt auf userId begrenzt.
  ============================================================
*/

/*
  Erstellt einen neuen Historieneintrag nach Abschluss
  eines Trainings.
*/
export async function createWorkoutHistory(data: WorkoutHistoryDocument) {
  const entry = new WorkoutHistoryModel(data);
  return entry.save();
}

/*
  Liefert die gesamte Trainingshistorie eines Users.
  Sortiert nach Datum absteigend (neueste zuerst).
*/
export async function getWorkoutHistory(userId: string) {
  return WorkoutHistoryModel.find({ userId }).sort({ date: -1 }).lean();
}

/*
  Liefert einen einzelnen Historieneintrag.
  Zugriff nur moeglich fuer den Besitzer.
*/
export async function getWorkoutHistoryById(userId: string, entryId: string) {
  return WorkoutHistoryModel.findOne({
    _id: entryId,
    userId,
  }).lean();
}

/*
  Aktualisiert einen Historieneintrag.
  Wird z.B. fuer Korrekturen oder Notizen genutzt.
*/
export async function updateWorkoutHistory(
  userId: string,
  entryId: string,
  data: Partial<WorkoutHistoryDocument>
) {
  return WorkoutHistoryModel.findOneAndUpdate({ _id: entryId, userId }, data, {
    new: true,
  }).lean();
}

/*
  Loescht einen Historieneintrag.
  Rueckgabewert signalisiert Erfolg oder Misserfolg.
*/
export async function deleteWorkoutHistory(userId: string, entryId: string) {
  const result = await WorkoutHistoryModel.findOneAndDelete({
    _id: entryId,
    userId,
  });
  return Boolean(result);
}
