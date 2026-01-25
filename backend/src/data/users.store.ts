/*
  ============================================================
  Datei: User Model (Mongoose Schema)

  Rolle im Projekt:
  Diese Datei definiert das User-Datenmodell fuer die MongoDB.
  Sie beschreibt, wie ein Benutzer in der Datenbank gespeichert
  wird und welche Felder existieren.

  Kontext:
  Das Model wird im Backend verwendet, insbesondere in:
  - Authentifizierungs-Routen (Login, Register, OAuth, OIDC)
  - Session-Aufloesung (z.B. /me Endpoint)
  - Passkey / WebAuthn Logik
  - Benutzerbezogenen API-Endpunkten

  Abhaengigkeiten:
  - MongoDB als Datenbank
  - Mongoose als ODM (Object Document Mapper)
  - Wird von Auth-Routen und Middleware importiert

  Architekturentscheidung:
  Ein einzelnes User-Model unterstuetzt mehrere Authentifizierungs-
  Methoden (Passwort, OAuth, OIDC, Passkeys) parallel.
  Dadurch kann ein Benutzer flexibel verschiedene Login-Methoden
  verwenden, ohne mehrere User-Datensaetze zu erzeugen.
  ============================================================
*/

import mongoose, { Schema } from "mongoose";

import { WorkoutModel } from "./workouts.store";
import { WorkoutHistoryModel } from "./workoutHistory.store";
/*
  Interface fuer ein User-Dokument in TypeScript.

  Zweck:
  - Statische Typisierung im Code
  - Sicherheit bei Zugriff auf User-Felder
  - Erlaubt klare Vertrage zwischen Backend-Komponenten

  Wichtig:
  Dieses Interface existiert nur zur Entwicklungszeit.
  In der Datenbank selbst gibt es keine TypeScript-Typen.
*/
export interface UserDocument {
  email: string;
  name: string;

  // Optionales Passwort-Hash
  // Nicht jeder User hat ein Passwort, z.B. bei OIDC oder Passkeys
  passwordHash?: string;

  // OpenID Connect Daten (z.B. Google Login)
  oidc?: {
    google?: {
      sub: string; // eindeutige User-ID vom OIDC Provider
      emailVerified?: boolean;
    };
  };

  // Klassisches OAuth (z.B. GitHub Login)
  oauth?: {
    github?: {
      id: number; // GitHub User ID
    };
  };

  // Passkeys / WebAuthn Credentials
  passkeys?: Array<{
    credentialId: string; // eindeutige Credential-ID (base64url)
    publicKey: string; // oeffentlicher Schluessel
    counter: number; // Schutz gegen Replay-Angriffe
    transports?: string[]; // USB, NFC, internal etc.
    createdAt: Date;
    lastUsedAt?: Date;
  }>;
}

/*
  Definition des Mongoose Schemas.

  Zweck:
  - Beschreibt die Struktur der MongoDB-Dokumente
  - Definiert Validierung, Indizes und Defaults
*/
const UserSchema = new Schema<UserDocument>(
  {
    // Eindeutige Email-Adresse des Users
    email: { type: String, required: true, unique: true, index: true },

    // Anzeigename des Users
    name: { type: String },

    // Passwort-Hash (z.B. bcrypt)
    // Optional, da nicht jeder User ein Passwort hat
    passwordHash: { type: String, required: false },

    /*
      OIDC Datenstruktur.
      Wird nur gesetzt, wenn der User sich ueber OIDC anmeldet.
      default: undefined sorgt dafuer, dass das Feld nicht
      automatisch als leeres Objekt gespeichert wird.
    */
    oidc: {
      type: {
        google: {
          sub: { type: String, required: false, index: true },
          emailVerified: { type: Boolean, required: false },
        },
      },
      required: false,
      default: undefined,
    },

    /*
      OAuth Datenstruktur.
      Beispiel: GitHub Login.
      Auch hier: optional und nur vorhanden, wenn genutzt.
    */
    oauth: {
      type: {
        github: {
          id: { type: Number, required: false, index: true },
          login: { type: String, required: false },
        },
      },
      required: false,
      default: undefined,
    },

    /*
      Passkeys Array.
      Ein User kann mehrere Passkeys besitzen (z.B. Laptop + Handy).
    */
    passkeys: [
      {
        credentialId: { type: String, required: true },
        publicKey: { type: String, required: true },

        // Counter wird bei jedem Login inkrementiert
        counter: { type: Number, required: true, default: 0 },

        transports: [{ type: String }],

        // Zeitpunkt der Registrierung des Passkeys
        createdAt: { type: Date, required: true, default: () => new Date() },

        // Zeitpunkt der letzten Nutzung
        lastUsedAt: { type: Date, required: false },
      },
    ],
  },
  {
    // Fuegt automatisch createdAt und updatedAt hinzu
    timestamps: true,
  }
);

/*
  Export des Models.

  Wichtige Architekturentscheidung:
  mongoose.models.User || mongoose.model(...)
  verhindert, dass das Model bei Hot-Reloads
  oder in Tests mehrfach registriert wird.
*/
export const UserModel =
  mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);

export async function updateUserName(userId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;

  return UserModel.findByIdAndUpdate(
    userId,
    { name: trimmed },
    { new: true }
  ).lean();
}

export async function deleteUserAccount(userId: string) {
  await WorkoutModel.deleteMany({ userId });
  await WorkoutHistoryModel.deleteMany({ userId });
  await UserModel.deleteOne({ _id: userId });
}
