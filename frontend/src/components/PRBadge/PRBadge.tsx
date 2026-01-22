import "./PRBadge.css";

interface Props {
  exercise: string;
  weight: number;
  delta: number;
}

export default function PRBadge({ exercise, weight, delta }: Props) {
  return (
    <div className="pr-badge">
      <span className="pr-icon">🏆</span>
      <div className="pr-text">
        <strong>New PR!</strong>
        <span>
          {exercise} — {weight} kg{" "}
          <span className="pr-delta">(+{delta} kg)</span>
        </span>
      </div>
    </div>
  );
}
