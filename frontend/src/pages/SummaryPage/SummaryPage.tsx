import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBackendReportData } from "../../hooks/useBackendReportData";
import { useParams, Link, useLocation } from "react-router-dom";
import { fetchWorkoutHistoryById } from "../../api/workoutHistoryClient";
import PRBadge from "../../components/PRBadge/PRBadge";
import "./SummaryPage.css";

type HistoryEntry = {
  id: string;
  workoutId: string;
  name: string;
  date: string;
  durationSeconds: number;
  totalVolume: number;
  completedSets: number;
  exercises: {
    id: string;
    name: string;
    muscle: string;
    sets: {
      weight: number;
      reps: number;
      volume: number;
    }[];
  }[];
};

const SummaryPage = () => {
  const { sessionId } = useParams();
  const location = useLocation();
  const from = location.state?.from;

  const [entry, setEntry] = useState<HistoryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const { sessionPRs } = useBackendReportData();

  const prMessages = sessionId ? (sessionPRs[sessionId] ?? []) : [];

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchWorkoutHistoryById(sessionId);
        if (mounted) setEntry(data);
      } catch {
        if (mounted) setEntry(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [sessionId]);

  if (loading) {
    return <div className="summary-container">Loading summary…</div>;
  }
  if (!entry) {
    return <div className="summary-container">Session not found.</div>;
  }

  /* -----------------------------
     MUSCLE DISTRIBUTION
  ----------------------------- */
  const muscleTotals: Record<string, number> = {};

  entry.exercises.forEach((ex) => {
    const vol = ex.sets.reduce(
      (sum, s) => sum + (s.volume ?? (s.weight ?? 0) * (s.reps ?? 0)),
      0
    );
    muscleTotals[ex.muscle] = (muscleTotals[ex.muscle] || 0) + vol;
  });

  const totalVolumeAll = Object.values(muscleTotals).reduce(
    (sum, v) => sum + v,
    0
  );

  const musclePercentages = Object.entries(muscleTotals).map(
    ([muscle, vol]) => ({
      muscle,
      percentage: totalVolumeAll
        ? ((vol / totalVolumeAll) * 100).toFixed(1)
        : "0",
    })
  );

  const formattedDuration = (entry.durationSeconds / 60).toFixed(1);

  return (
    <div className="summary-container">
      <h1 className="summary-title">{entry.name} — Summary</h1>

      <section className="summary-section">
        <div className="summary-stat">
          <span>Date</span>
          <strong>{new Date(entry.date).toLocaleString()}</strong>
        </div>
        <div className="summary-stat">
          <span>Duration</span>
          <strong>{formattedDuration} min</strong>
        </div>
        <div className="summary-stat">
          <span>Total Volume</span>
          <strong>{entry.totalVolume} kg</strong>
        </div>
        <div className="summary-stat">
          <span>Completed Sets</span>
          <strong>{entry.completedSets}</strong>
        </div>
      </section>

      <section className="summary-section">
        <h2>Muscle Group Distribution</h2>
        {musclePercentages.map((mp) => (
          <div key={mp.muscle} className="muscle-row">
            <span>{mp.muscle}</span>
            <span>{mp.percentage}%</span>
          </div>
        ))}
      </section>

      <section className="summary-section">
        <h2>Records</h2>
        {prMessages.length === 0 && <p>No new PRs this session.</p>}
        {prMessages.map((pr) => (
          <PRBadge
            key={pr.exerciseId}
            exercise={pr.exerciseName}
            weight={pr.weight}
            delta={pr.delta}
          />
        ))}
      </section>

      <button className="back-to-workout-btn" onClick={() => navigate(-1)}>
        ← Go back
      </button>
    </div>
  );
};

export default SummaryPage;
