import { NavLink } from "react-router-dom";
import "./ExploreTabs.css";

export default function ExploreTabs() {
  return (
    <div className="explore-tabs">
      <NavLink
        to="/explore"
        end
        className={({ isActive }) => `explore-tab ${isActive ? "active" : ""}`}
      >
        Exercises
      </NavLink>

      <NavLink
        to="/explore/community"
        className={({ isActive }) => `explore-tab ${isActive ? "active" : ""}`}
      >
        Community Workouts
      </NavLink>
    </div>
  );
}
