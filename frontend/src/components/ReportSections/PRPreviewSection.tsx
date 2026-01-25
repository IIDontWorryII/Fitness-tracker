import React from "react";
import PRCard from "../PRCard/PRCard";
import { useExercises } from "../../hooks/useExercises";
import type { Exercise } from "../../types";

import "./ReportSections.css";

interface PRItem {
  id: string; // in deinem Projekt scheint das exerciseId zu sein (siehe PRHistoryPage)
  muscle: string;
  name: string;
  weight: number;
  reps: number;
  date: string;
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
  const { exercises, loading } = useExercises();

  const valid = personalRecords.filter((pr) => pr.weight > 0);
  const preview = valid.slice(0, 3);

  // Build lookup once for fast access
  const exerciseMap = React.useMemo(() => {
    return new Map<string, Exercise>(exercises.map((e) => [e.id, e]));
  }, [exercises]);

  // Optional fallback by name (in case PR id is NOT the exercise id in some entries)
  const exerciseByName = React.useMemo(() => {
    return new Map<string, Exercise>(
      exercises.map((e) => [e.name.toLowerCase(), e])
    );
  }, [exercises]);

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
          // Primary: match by exerciseId
          const meta =
            exerciseMap.get(pr.id) ??
            // Fallback: match by name (helps if PR.id is a PR-id in some dataset)
            exerciseByName.get(pr.name.toLowerCase());

          return (
            <PRCard
              key={pr.id}
              name={meta?.name ?? pr.name}
              muscle={meta?.muscle ?? pr.muscle}
              weight={pr.weight}
              reps={pr.reps}
              date={pr.date}
              image={meta?.thumbnail}
            />
          );
        })}
      </div>

      {/* Optional: prevent confusing empty preview when exercises are still loading */}
      {!loading && preview.length === 0 && (
        <p className="text-muted mt-3">No PRs yet.</p>
      )}
    </section>
  );
}
