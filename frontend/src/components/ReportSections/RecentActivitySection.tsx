import React from "react";
import RecentActivity from "../RecentActivity/RecentActivity";
import "./ReportSections.css";

interface Props {
  recentActivity: {
    id: string;
    date: string;
    name: string;
    durationMinutes: number;
    totalVolume: number;
    completedSets: number;
    exerciseCount: number;
  }[];
  onEntryClick: (id: string) => void;
  onViewAll: () => void;
}

export default function RecentActivitySection({
    recentActivity,
  onEntryClick,
  onViewAll,
}: Props) {
  const preview = recentActivity.slice(0, 3);

    return (
        
      <section className="report-section">
        <div className="report-section-header">
          <h2>Recent Activity</h2>
          {recentActivity.length > 3 && (
            <button
              className="view-all-btn"
              onClick={onViewAll}
            >
              View All
            </button>
          )}
        </div>

        <RecentActivity
          entries={preview}
          onEntryClick={onEntryClick} 
        />
      </section>
    );
}