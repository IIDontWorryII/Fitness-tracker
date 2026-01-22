/*
  NavBar.tsx

  Top navigation bar for the app.
  - App title on the left
  - Primary navigation centered
  - User/profile actions on the right
*/

import { Link, NavLink } from "react-router-dom";
import "./NavBar.css";

export default function NavBar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* LEFT: Brand */}
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            Fitness Tracker
          </Link>
        </div>

        {/* CENTER: Main navigation */}
        <nav className="navbar-center">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            My Workouts
          </NavLink>

          <NavLink
            to="/explore"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Explore
          </NavLink>

          <NavLink
            to="/report"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Report
          </NavLink>
        </nav>

        {/* RIGHT: Profile */}
        <div className="navbar-right">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `nav-link profile-link ${isActive ? "active" : ""}`
            }
          >
            Profile
          </NavLink>
        </div>
      </div>
    </header>
  );
}
