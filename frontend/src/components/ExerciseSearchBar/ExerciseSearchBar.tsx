/*
  ExerciseSearchBar.tsx

  Component: Text input used to search/filter exercises.
  - Controlled input; parent supplies `value` and `onChange` handler.
*/

import "./ExerciseSearchBar.css";

export default function ExerciseSearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      placeholder="Search exercise..."
      className="search-bar"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
