/*
  ============================================================
  Datei: Exercise Model (Mongoose Schema)

  Rolle im Projekt:
  Diese Datei definiert das Datenmodell fuer Trainingsuebungen
  (Exercises), die im Fitness Tracker verwendet werden.

  Kontext:
  Exercises werden im Projekt genutzt fuer:
  - Erstellung von Workouts
  - Auswahl von Uebungen im Frontend
  - Anzeige von Muskelgruppen
  - Referenzierung in Workout-Historie und Reports

  Abhaengigkeiten:
  - MongoDB als Datenbank
  - Mongoose als ODM
  - Wird von Workout- und Exercise-Routen verwendet

  Architekturentscheidung:
  Exercises sind eigenstaendige Entitaeten und nicht fest
  in Workouts eingebettet, um Wiederverwendung, Konsistenz
  und zentrale Pflege zu ermoeglichen.
  ============================================================
*/

import { Schema, model } from "mongoose";

/*
  Definition des Exercise Schemas.

  Zweck:
  - Beschreibt, wie eine Uebung in MongoDB gespeichert wird
  - Definiert Pflichtfelder und optionale Metadaten
*/
const ExerciseSchema = new Schema(
  {
    /*
      Eindeutiger technischer Bezeichner der Uebung.

      Zweck:
      - Wird in URLs verwendet
      - Wird im Frontend als stabiler Identifier genutzt
      - Unabhaengig von Sprache oder Anzeigenamen
    */
    slug: { type: String, required: true, unique: true },

    /*
      Anzeigename der Uebung.
      Beispiel: "Bench Press", "Squat"
    */
    name: { type: String, required: true },

    /*
      Muskelgruppe, die primaer trainiert wird.
      Wird fuer Filter, Auswertungen und Visualisierungen genutzt.
    */
    muscle: { type: String, required: true },

    /*
      Optionales Vorschaubild der Uebung.
      Enthaelt typischerweise einen Pfad oder eine URL.
    */
    thumbnail: String,

    /*
      Optionale textuelle Beschreibung der Uebungsausfuehrung.
    */
    description: String,

    /*
      Kennzeichnet, ob die Uebung global verfuegbar ist
      oder benutzerspezifisch (z.B. eigene Uebung).
    */
    isGlobal: { type: Boolean, default: true },
  },
  {
    // Fuegt automatisch createdAt und updatedAt hinzu
    timestamps: true,
  }
);

/*
  Export des Exercise Models.

  Dieses Model wird spaeter verwendet, um:
  - Uebungen anzulegen
  - Uebungen zu listen
  - Uebungen in Workouts zu referenzieren
*/
export default model("Exercise", ExerciseSchema);
