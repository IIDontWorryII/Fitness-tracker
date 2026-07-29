import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface Props {
  data: { label: string; minutes: number }[];
}

export default function WeeklyTimeLineChart({ data }: Props) {
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>

          <CartesianGrid strokeDasharray="3 3" stroke="#8a8a8aff"  vertical={false}/>

          <XAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}m`}
          />

          <Tooltip
            formatter={(v) => `${Math.round(Number(v))} min`}
            contentStyle={{ borderRadius: 8, borderColor: "#ccc" }}
          />

          <Line
            type="linear"
            dataKey="minutes"
            stroke="#4a90e2"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={600}
          />

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
