import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import NavBar from "./components/NavBar/NavBar";

import WorkoutsPage from "./pages/WorkoutsPage/WorkoutsPage";
import NewWorkoutPage from "./pages/NewWorkoutPage/NewWorkoutPage";
import ExplorePage from "./pages/ExplorePage/ExplorePage";
import CommunityWorkoutsPage from "./pages/CommunityWorkoutsPage/CommunityWorkoutsPage";
import PublicWorkoutDetailPage from "./pages/PublicWorkoutDetailPage/PublicWorkoutdetailPage";
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
    <Router>
      <NavBar /> {/* Always visible */}
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <WorkoutsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/workout/:workoutId" element={<WorkoutDetailPage />} />
        <Route
          path="/workout/:workoutId/start"
          element={<StartWorkoutPage />}
        />
        <Route
          path="/workout/:workoutId/summary/:sessionId"
          element={<SummaryPage />}
        />
        <Route path="/new-workout" element={<NewWorkoutPage />} />

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

        <Route
          path="/explore/community/:workoutId"
          element={<PublicWorkoutDetailPage />}
        />
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

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
