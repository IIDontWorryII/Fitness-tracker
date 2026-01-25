/*
  ============================================================
  Datei: Workout Model + Datenbankzugriff

  Rolle im Projekt:
  Diese Datei definiert das Workout-Datenmodell und kapselt
  alle datenbankbezogenen Operationen fuer Workouts.

  Kontext:
  Workouts sind benutzerspezifische Trainingsplaene, die:
  - einem User gehoeren
  - einen Namen besitzen
  - eine Liste von Exercises mit Saetzen enthalten

  Abhaengigkeiten:
  - MongoDB als Datenbank
  - Mongoose als ODM
  - Wird von Workout-API-Routen verwendet

  Architekturentscheidung:
  CRUD-Operationen sind direkt beim Model definiert,
  um Routen schlank zu halten und Datenzugriff zu zentralisieren.
  ============================================================
*/

import mongoose, { Schema } from "mongoose";

/*
  Interface fuer ein Workout-Dokument.

  Zweck:
  - TypeScript Typisierung fuer Workouts
  - Sicherheit beim Zugriff auf Felder im Code


  Hinweis:
  exercises ist bewusst als any[] definiert,
  da die interne Struktur flexibel gehalten wird.
*/
export interface WorkoutDocument {
  userId: string;
  name: string;
  exercises: any[];
  isPublic: boolean; // NEW
  clonedFromWorkoutId?: string | null; // NEW
}

/*
  Definition des Workout Schemas.

  Ein Workout:
  - gehoert genau zu einem User (userId)
  - hat einen Anzeigenamen
  - enthaelt eine Liste von Exercises mit Details
*/
const WorkoutSchema = new Schema<WorkoutDocument>(
  {
    /*
      Referenz auf den Besitzer des Workouts.

      Wichtig:
      userId wird bewusst als String gespeichert
      und nicht als ObjectId-Referenz, da die User-ID
      aus dem Session-Kontext kommt.
    */
    userId: { type: String, required: true, index: true },

    /*
      Name des Workouts, z.B. "Push Day", "Leg Day"
    */
    name: { type: String, required: true },

    /*
      Liste der Exercises im Workout.

      Schema.Types.Mixed:
      - erlaubt flexible Strukturen
      - Sets, Reps, Gewicht etc. koennen variieren
      - bewusst keine strikte Validierung auf DB-Ebene
    */
    exercises: { type: Schema.Types.Mixed, default: [] },

    /*
      Sichtbarkeit des Workouts
    */
    isPublic: { type: Boolean, default: false }, // NEW
    /*
      Ursprung des Workouts bei geklonten Workouts.
    */
    clonedFromWorkoutId: { type: String, default: null }, // NEW
  },
  {
    // Automatische Zeitstempel fuer Analyse und Debugging
    timestamps: true,
  }
);

/*
  Erstellung oder Wiederverwendung des Workout Models.

  Schutz vor mehrfacher Registrierung bei Hot Reloads.
*/
export const WorkoutModel =
  mongoose.models.Workout ||
  mongoose.model<WorkoutDocument>("Workout", WorkoutSchema);

/*
  ============================================================
  CRUD OPERATIONEN
  Diese Funktionen kapseln alle Datenbankzugriffe.
  ============================================================
*/

/*
  Liefert alle Workouts eines bestimmten Users.

  Sicherheit:
  - Filtert strikt nach userId
  - Kein Zugriff auf fremde Workouts moeglich
*/
export async function getAllWorkouts(userId: string) {
  return WorkoutModel.find({ userId }).lean();
}

/*
  Liefert ein einzelnes Workout nach ID und User.

  Wichtig:
  - Kombination aus _id UND userId
  - Verhindert Zugriff auf fremde Daten
*/
export async function getWorkoutById(userId: string, workoutId: string) {
  return WorkoutModel.findOne({ _id: workoutId, userId }).lean();
}

/*
  Erstellt ein neues Workout.

  data enthaelt:
  - userId aus der Session
  - name des Workouts
  - initiale Exercise-Liste
*/
export async function createWorkout(data: {
  userId: string;
  name: string;
  exercises: any[];
}) {
  const workout = new WorkoutModel(data);
  return workout.save();
}

/*
  Aktualisiert ein bestehendes Workout.

  Sicherheit:
  - Update nur moeglich, wenn userId passt
  - Partial Update erlaubt gezielte Aenderungen
*/
export async function updateWorkout(
  userId: string,
  workoutId: string,
  data: Partial<{ name: string; exercises: any[] }>
) {
  return WorkoutModel.findOneAndUpdate({ _id: workoutId, userId }, data, {
    new: true, // gibt das aktualisierte Dokument zurueck
  }).lean();
}

/*
  Loescht ein Workout.

  Rueckgabewert:
  - true, wenn ein Workout geloescht wurde
  - false, wenn kein passendes Workout existierte
*/
export async function deleteWorkout(userId: string, workoutId: string) {
  const result = await WorkoutModel.findOneAndDelete({
    _id: workoutId,
    userId,
  });
  return Boolean(result);
}

// NEW
export async function getPublicWorkouts() {
  return WorkoutModel.find({ isPublic: true })
    .select("_id name exercises createdAt")
    .lean();
}
// NEW
export async function getPublicWorkoutById(workoutId: string) {
  return WorkoutModel.findOne({ _id: workoutId, isPublic: true })
    .select("_id name exercises createdAt")
    .lean();
}
// NEW
export async function cloneWorkout(params: {
  sourceWorkoutId: string;
  targetUserId: string;
}) {
  const source = await WorkoutModel.findOne({
    _id: params.sourceWorkoutId,
    isPublic: true,
  }).lean();

  if (!source) return null;

  const clonedWorkout = new WorkoutModel({
    userId: params.targetUserId,
    name: `${source.name} (clone)`,
    exercises: source.exercises,
    isPublic: false,
    clonedFromWorkoutId: source._id,
  });

  return clonedWorkout.save();
}
// NEW
export async function updateWorkoutVisibility(
  userId: string,
  workoutId: string,
  isPublic: boolean
) {
  return WorkoutModel.findOneAndUpdate(
    { _id: workoutId, userId },
    { isPublic },
    { new: true }
  ).lean();
}
