import React from "react";
import MuscleRadarChart from "../charts/MuscleRadarChart";
import "./ReportSections.css";

interface MuscleItem {
  muscle: string;
  percentage: number;
  sets: number;
}

interface Props {
  muscleDistribution: MuscleItem[];
}

export default function MuscleDistributionSection({
  muscleDistribution,
}: Props) {
  return (
    <section className="report-section">
      <h2>Muscle Group Distribution</h2>

      <div className="muscle-distribution-wrapper">
        {/* LEFT SIDE — Percentages + Sets */}
        <div className="muscle-distribution-list">
          {muscleDistribution.map((item) => (
            <div key={item.muscle} className="muscle-distribution-row">
              <span className="muscle-label">{item.muscle.toUpperCase()}</span>

              <span className="muscle-percent">
                {item.percentage.toFixed(1)}%
              </span>

              <span className="muscle-sets">{item.sets} sets</span>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE — Radar Chart */}
        <MuscleRadarChart data={muscleDistribution} />
      </div>
    </section>
  );
}
