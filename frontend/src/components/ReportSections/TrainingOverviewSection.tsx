import React from "react";
import "./ReportSections.css";

interface CounterBlock {
  workouts: number;
  sets: number;
  volume: number;
}

interface Props {
  stats: CounterBlock;
}

export default function TrainingOverviewSection({ stats }: Props) {
  return (
    <section className="report-section">
  <div className="stats-card">
    <div className="stats-row">
        <span className="stats-label">Workouts:</span>
        <span className="stats-value">{stats.workouts}</span>
    </div>
    <div className="stats-row">
        <span className="stats-label">Sets:</span>
        <span className="stats-value">{stats.sets}</span>
    </div>
    <div className="stats-row">
        <span className="stats-label">Volume:</span>
        <span className="stats-value">{stats.volume} kg</span>
    </div>
  </div>
</section>
  );
}
