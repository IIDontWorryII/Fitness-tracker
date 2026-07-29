import React from "react";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  Tooltip,
} from "recharts";
interface MuscleData {
  muscle: string;
  sets: number;
  percentage: number;
}
interface Props {
  data: MuscleData[];
}
import { API_BASE } from "../../api/client";

export default function MuscleRadarChart({ data }: Props) {
  const Axis = PolarAngleAxis as unknown as React.FC<any>;
  return (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#ddd" />
          {/* Custom Tick renderer for muscle icons */}
          (
          <Axis
            dataKey="muscle"
            tick={(props: any) => {
              const { payload, x, y } = props;

              const muscle = payload?.value;

              if (!muscle) return null;

              const icon = `${API_BASE}/images/muscles/${muscle}.png`;

              // fallback if x/y are undefined
              const safeX = (x ?? 0) - 28;
              const safeY = (y ?? 0) - 28;

              return (
                <image
                  href={icon}
                  x={safeX}
                  y={safeY}
                  width={56}
                  height={56}
                  style={{ pointerEvents: "none" }}
                />
              );
            }}
          />
          )
          <Tooltip
            formatter={(_value, _name, entry: any) => [
              `${entry.payload.percentage}%`,
              "Training",
            ]}
            contentStyle={{
              borderRadius: 8,
              borderColor: "#ccc",
              fontSize: 14,
            }}
          />
          <Radar
            name="Muscle Focus"
            dataKey="sets"
            stroke="#4a90e2"
            fill="#4a90e2"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
