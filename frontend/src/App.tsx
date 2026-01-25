/*
  ============================================================
  Datei: App.tsx

  Rolle im Projekt:
  Diese Datei definiert die Struktur der Anwendung,
  das Routing und die Zugriffslogik auf Seiten.

  Kontext:
  - Zentrale Routing-Datei
  - Steuert Navigation und Seitenaufbau
  - Trennt geschuetzte und oeffentliche Routen

  Architektur:
  - React Router fuer Client-Side Routing
  - ProtectedRoute fuer Zugriffskontrolle
  - Klare Trennung zwischen Layout und Seiten
  ============================================================
*/

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import NavBar from "./components/NavBar/NavBar";

/*
  Seiten (Pages)
  Jede Page repraesentiert eine eigenstaendige Route.
*/
import WorkoutsPage from "./pages/WorkoutsPage/WorkoutsPage";
import NewWorkoutPage from "./pages/NewWorkoutPage/NewWorkoutPage";
import ExplorePage from "./pages/ExplorePage/ExplorePage";
import CommunityWorkoutsPage from "./pages/CommunityWorkoutsPage/CommunityWorkoutsPage";
import PublicWorkoutDetailPage from "./pages/PublicWorkoutDetailPage/PublicWorkoutDetailPage";
import WorkoutDetailPage from "./pages/WorkoutDetailPage/WorkoutDetailPage";
import StartWorkoutPage from "./pages/StartWorkoutPage/StartWorkoutPage";
import SummaryPage from "./pages/SummaryPage/SummaryPage";

import ReportPage from "./pages/ReportPage/ReportPage";
import RecentActivityPage from "./pages/RecentActivityPage/RecentActivityPage";
import PRHistoryPage from "./pages/PRHistoryPage/PRHistoryPage";

import ProfilePage from "./pages/ProfilePage/ProfilePage";
import SignupPage from "./pages/Auth/SignupPage";
import LoginPage from "./pages/Auth/LoginPage";

function App() {
  return (
    /*
      BrowserRouter ermoeglicht Client-Side Routing.

      Die URL aendert sich, ohne dass der Server
      eine neue HTML-Seite ausliefert.
    */
    <Router>
      {/*
        Die Navigation ist immer sichtbar,
        unabhaengig von der aktuellen Route.
      */}
      <NavBar />

      {/*
        Routes definiert die Zuordnung:
        URL -> React Komponente
      */}
      <Routes>
        {/*
          Startseite.
          Geschuetzt durch ProtectedRoute.
        */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <WorkoutsPage />
            </ProtectedRoute>
          }
        />

        {/* Detailansicht eines Workouts */}
        <Route path="/workout/:workoutId" element={<WorkoutDetailPage />} />

        {/* Start einer Workout Session */}
        <Route
          path="/workout/:workoutId/start"
          element={<StartWorkoutPage />}
        />

        {/* Zusammenfassung einer Session */}
        <Route
          path="/workout/:workoutId/summary/:sessionId"
          element={<SummaryPage />}
        />

        {/* Erstellung eines neuen Workouts */}
        <Route path="/new-workout" element={<NewWorkoutPage />} />

        {/*
          Explore Bereich.
          Nur fuer eingeloggte Benutzer.
        */}
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <ExplorePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/explore/community"
          element={
            <ProtectedRoute>
              <CommunityWorkoutsPage />
            </ProtectedRoute>
          }
        />

        {/* Oeffentliche Ansicht eines Community Workouts */}
        <Route
          path="/explore/community/:workoutId"
          element={<PublicWorkoutDetailPage />}
        />

        {/*
          Report Bereich.
          Teilweise geschuetzt.
        */}
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <ReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/recent-activity"
          element={<RecentActivityPage />}
        />
        <Route path="/report/pr-history" element={<PRHistoryPage />} />

        {/* Benutzerprofil */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Oeffentliche Auth-Seiten */}
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
