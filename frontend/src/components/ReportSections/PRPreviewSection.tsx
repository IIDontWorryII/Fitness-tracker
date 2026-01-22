import React from "react";
import PRCard from "../PRCard/PRCard";
import "./ReportSections.css";

interface PRItem {
  id: string;
  muscle: string;
  name: string;
  weight: number;
  reps: number;
  date: string;
  image?: string;
  workoutId?: string;
  sessionId?: string;
}

interface Props {
  personalRecords: PRItem[];
  onViewAll: () => void;
}

export default function PRPreviewSection({
  personalRecords,
  onViewAll,
}: Props) {
  const valid = personalRecords.filter((pr) => pr.weight > 0);
  const preview = valid.slice(0, 3);

  return (
    <section className="report-section">
      <div className="report-section-header">
        <h2>Personal Records</h2>

        {personalRecords.length > 3 && (
          <button className="view-all-btn" onClick={onViewAll}>
            View All
          </button>
        )}
      </div>

      <div className="pr-list">
        {preview.map((pr) => {
          return (
            <PRCard
              key={pr.id}
              name={pr.name}
              muscle={pr.muscle}
              weight={pr.weight}
              reps={pr.reps}
              date={pr.date}
              image={pr.image}
            />
          );
        })}
      </div>
    </section>
  );
}
