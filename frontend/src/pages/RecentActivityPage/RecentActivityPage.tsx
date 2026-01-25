import React from "react";
import { useNavigate } from "react-router-dom";
import RecentActivity, {
  RecentEntry,
} from "../../components/RecentActivity/RecentActivity";
import "./RecentActivityPage.css";
import { useBackendReportData } from "../../hooks/useBackendReportData";
import { useAuth } from "../../context/AuthContext";

export default function RecentActivityPage() {
  const navigate = useNavigate();

  const { recentActivity, loading } = useBackendReportData();

  const entries: RecentEntry[] = recentActivity.map((entry) => ({
    id: entry.id,
    date: entry.date,
    name: entry.name,
    durationMinutes: entry.durationMinutes,
    totalVolume: entry.totalVolume,
    completedSets: entry.completedSets,
    exerciseCount: entry.exerciseCount,
  }));

  const handleEntryClick = (sessionId: string) => {
    const entry = recentActivity.find((e) => e.id === sessionId);
    if (!entry) return;

    navigate(`/workout/${entry.workoutId}/summary/${entry.id}`, {
      state: { from: "reports" },
    });
  };
  if (loading) {
    return <div className="all-activity-wrapper">Loading…</div>;
  }

  return (
    <div className="all-activity-wrapper">
      <header className="all-activity-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1>All Recent Activity</h1>
      </header>

      <RecentActivity entries={entries} onEntryClick={handleEntryClick} />
    </div>
  );
}
