/*
  MuscleFilterBar.tsx

  Component: Small filter row rendering muscle chips.
  - Renders clickable chips and delegates state via `selected` + `toggle` props.
  - Lightweight presentational component used by Explore and modals.
*/

import "./MuscleFilterBar.css";
import { API_BASE } from "../../api/client";

const MUSCLES = [
  "chest",
  "back",
  "arms",
  "shoulders",
  "legs",
  "core",
  "glutes",
];

export default function MuscleFilterBar({
  selected,
  toggle,
}: {
  selected: Set<string>;
  toggle: (muscle: string) => void;
}) {
  return (
    <div className="muscle-filters">
      {MUSCLES.map((muscle) => {
        const isActive = selected.has(muscle);
        const icon = `${API_BASE}/images/muscles/${muscle}.png`;

        return (
          <div
            key={muscle}
            className={`muscle-circle ${isActive ? "active" : ""}`}
            onClick={() => toggle(muscle)}
          >
            <img src={icon} alt={muscle} />
          </div>
        );
      })}
    </div>
  );
}
