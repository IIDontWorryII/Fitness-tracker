import React, { useState } from "react";
import "./ReportPage.css";
import { useNavigate } from "react-router-dom";

import {
  useBackendReportData,
  TimeRange,
} from "../../hooks/useBackendReportData";

import WeeklyTimeSection from "../../components/ReportSections/WeeklyTimeSection";
import TrainingOverviewSection from "../../components/ReportSections/TrainingOverviewSection";
import MuscleDistributionSection from "../../components/ReportSections/MuscleDistributionSection";
import PRPreviewSection from "../../components/ReportSections/PRPreviewSection";
import RecentActivitySection from "../../components/ReportSections/RecentActivitySection";
import ConsistencySection from "../../components/ReportSections/ConsistencySection";

export default function ReportPage() {
  const navigate = useNavigate();

  // ----------------------------
  // TIME RANGE STATE (default: month)
  // ----------------------------
  const [timeRange, setTimeRange] = useState<TimeRange>("month");

  // Fetch analytics for this time range
  const {
    filteredStats,
    filteredMuscleDistribution,
    weeklyTime,
    personalRecords,
    recentActivity,
    streak,
  } = useBackendReportData(timeRange);

  // ----------------------------
  // SUMMARY NAVIGATION
  // ----------------------------
  const handleEntryClick = (sessionId: string) => {
    const entry = recentActivity.find((a) => a.id === sessionId);
    if (!entry) return;

    navigate(`/workout/${entry.workoutId}/summary/${entry.id}`, {
      state: { from: "reports" },
    });
  };

  return (
    <div className="report-page">
      {/* WEEKLY TIME (GLOBAL) */}
      <WeeklyTimeSection weeklyTime={weeklyTime} />

      {/* CONSISTENCY (GLOBAL) */}
      <ConsistencySection streak={streak} />

      {/* ------------------------------------
            TIME FILTER BAR (GLOBAL)
         ------------------------------------ */}
      <h2>Training Overview</h2>

      <div className="time-filter-bar">
        <button
          className={timeRange === "overall" ? "active" : ""}
          onClick={() => setTimeRange("overall")}
        >
          Overall
        </button>

        <button
          className={timeRange === "year" ? "active" : ""}
          onClick={() => setTimeRange("year")}
        >
          Year
        </button>

        <button
          className={timeRange === "month" ? "active" : ""}
          onClick={() => setTimeRange("month")}
        >
          Month
        </button>

        <button
          className={timeRange === "week" ? "active" : ""}
          onClick={() => setTimeRange("week")}
        >
          Week
        </button>
      </div>

      {/* FILTERED SECTIONS */}
      <TrainingOverviewSection stats={filteredStats} />

      <MuscleDistributionSection
        muscleDistribution={filteredMuscleDistribution}
      />

      {/* GLOBAL SECTIONS */}
      <PRPreviewSection
        personalRecords={personalRecords}
        onViewAll={() => navigate("/report/pr-history")}
      />

      <RecentActivitySection
        recentActivity={recentActivity}
        onEntryClick={handleEntryClick}
        onViewAll={() => navigate("/report/recent-activity")}
      />
    </div>
  );
}
