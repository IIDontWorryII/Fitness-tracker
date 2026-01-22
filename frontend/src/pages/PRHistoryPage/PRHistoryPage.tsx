import { useNavigate } from "react-router-dom";
import { useBackendReportData } from "../../hooks/useBackendReportData";
import { useExercises } from "../../hooks/useExercises";
import PRCard from "../../components/PRCard/PRCard";
import "./PRHistoryPage.css";

export default function PRHistoryPage() {
  const { exercises } = useExercises();
  const navigate = useNavigate();
  const { personalRecords, loading } = useBackendReportData();

  if (loading) {
    return (
      <div className="all-pr-wrapper">
        <p>Loading personal records…</p>
      </div>
    );
  }

  // Only show PRs where weight > 0
  const filtered = personalRecords.filter((pr) => pr.weight > 0);

  return (
    <div className="all-pr-wrapper">
      <header className="all-pr-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1>All Personal Records</h1>
      </header>
      {filtered.length === 0 ? (
        <p className="empty-state">
          No personal records yet. Start lifting to set some PRs!
        </p>
      ) : (
        <div className="pr-list">
          {filtered.map((pr) => {
            const meta = exercises.find((e) => e.id === pr.id);

            return (
              <PRCard
                key={pr.id}
                name={pr.name}
                muscle={pr.muscle}
                weight={pr.weight}
                reps={pr.reps}
                date={pr.date}
                image={meta?.thumbnail}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
