/*
  ============================================================
  Datei: main.tsx

  Rolle im Projekt:
  Diese Datei ist der Einstiegspunkt der React Web App.
  Sie verbindet React mit dem HTML DOM und initialisiert
  globale Kontexte wie Authentifizierung.

  Kontext:
  - Wird genau einmal beim Start der App ausgefuehrt
  - Erstellt den React Render-Baum
  - Umschliesst die gesamte App mit globalen Providern

  Architektur:
  - Klare Trennung zwischen Initialisierung (main.tsx)
    und Anwendungslogik (App.tsx)
  ============================================================
*/

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./styles/styles.css";

/*
  Erstellung der React Root.

  React 18 verwendet createRoot fuer:
  - bessere Performance
  - Concurrent Rendering
*/
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  /*
    React.StrictMode ist eine Entwicklungsfunktion.

    Zweck:
    - Deckt Side Effects auf
    - Warnt vor unsauberem Code
    - Wird nur im Development aktiv
  */
  <React.StrictMode>
    {/*
      AuthProvider stellt den globalen Authentifizierungs-
      Kontext zur Verfuegung.

      Alle Komponenten unterhalb koennen:
      - Auth Status lesen
      - Login / Logout ausfuehren
    */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
