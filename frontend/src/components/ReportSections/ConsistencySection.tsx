import React from "react";
import "./ReportSections.css";

interface StreakProps {
  currentStreak: number;
  longestStreak: number;
  activeWeeks: number | null;
}

interface Props {
  streak: StreakProps;
}

export default function ConsistencySection({ streak }: Props) {
  return (
    <section className="report-section">
      <h2>Consistency</h2>

      <div className="stats-card">
        <div className="stats-row">
          <span className="stats-label">Current Weekly Streak</span>
          <span className="stats-value">{streak.currentStreak} weeks</span>
        </div>

        <div className="stats-row">
          <span className="stats-label">Longest Weekly Streak</span>
          <span className="stats-value">{streak.longestStreak} weeks</span>
        </div>

        <div className="stats-row">
          <span className="stats-label">Active Weeks</span>
          <span className="stats-value">{streak.activeWeeks ?? 0} weeks</span>
        </div>
      </div>
    </section>
  );
}
