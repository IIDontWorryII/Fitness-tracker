import React from "react";
import "./RecentActivity.css";

export interface RecentEntry {
  id: string;
  date: string;
  name: string;
  durationMinutes: number;
  totalVolume: number;
  completedSets: number;
  exerciseCount: number;
}

interface Props {
  entries: RecentEntry[];
  onEntryClick?: (id: string) => void;
}

export default function RecentActivity({ entries, onEntryClick }: Props) {
  if (!entries.length) {
    return <p className="activity-empty">No recent workouts recorded.</p>;
  }

  return (
    <div className="activity-timeline">
      {entries.map((entry, idx) => (
        <div className="activity-item" key={entry.id}>
          {/* Card */}
          <div
            className={`activity-card ${onEntryClick ? "clickable" : ""}`}
            onClick={onEntryClick ? () => onEntryClick(entry.id) : undefined}
            role={onEntryClick ? "button" : undefined}
            tabIndex={onEntryClick ? 0 : undefined}
          >
            <div className="activity-header">
              <h3 className="activity-title">{entry.name}</h3>
              <span className="activity-date">
                {new Date(entry.date).toLocaleDateString()}
              </span>
            </div>

            <div className="activity-stats">
              <div className="stat" data-icon="⏱">
                <span className="label">Duration</span>
                <span>{entry.durationMinutes} min</span>
              </div>

              <div className="stat" data-icon="🏋️">
                <span className="label">Volume</span>
                <span>{entry.totalVolume} kg</span>
              </div>

              <div className="stat" data-icon="✔">
                <span className="label">Sets</span>
                <span>{entry.completedSets}</span>
              </div>

              <div className="stat" data-icon="💪">
                <span className="label">Exercises</span>
                <span>{entry.exerciseCount}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
