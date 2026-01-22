import React from "react";
import WeeklyTimeLineChart from "../charts/WeeklyTimeLineChart";
import "./ReportSections.css";

interface Props {
  weeklyTime: {
    label: string;
    minutes: number;
  }[];
}

export default function WeeklyTimeSection({ weeklyTime }: Props) {
  return (
    <section className="report-section">
      <h2>Weekly Training Time</h2>

      <div className="weekly-time-wrapper">
        <WeeklyTimeLineChart data={weeklyTime} />
      </div>
    </section>
  );
}
