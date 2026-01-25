import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { deleteMyAccount } from "../../api/authClient";
import ProfileHeader from "../../components/ProfileHeader/ProfileHeader";
// Reusable analytics sections
import RecentActivitySection from "../../components/ReportSections/RecentActivitySection";
import MuscleDistributionSection from "../../components/ReportSections/MuscleDistributionSection";
import PRPreviewSection from "../../components/ReportSections/PRPreviewSection";

import "./ProfilePage.css";
import { useBackendReportData } from "../../hooks/useBackendReportData";

import { updateMyName } from "../../api/authClient";
import { registerPasskey } from "../../api/passkeysClient";
import { disconnectGitHub } from "../../api/authClient";

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [showRenameModal, setShowRenameModal] = React.useState(false);
  const [renameValue, setRenameValue] = React.useState("");
  const [renameSaving, setRenameSaving] = React.useState(false);

  // Grab analytics data (same used in ReportPage)

  const {
    filteredMuscleDistribution,
    recentActivity,
    personalRecords,
    streak,
  } = useBackendReportData();

  // Passkeys are registered from the profile page because they are security
  // credentials tied to an existing account, not part of the signup flow.
  const [isRegisteringPasskey, setIsRegisteringPasskey] = React.useState(false);
  const [passkeyError, setPasskeyError] = React.useState<string | null>(null);

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (!user) return null; // ProtectedRoute handles redirect

  const handleToggleSettings = () => setIsSettingsOpen((prev) => !prev);

  const handleConfirmRename = async () => {
    const trimmed = renameValue.trim();
    if (!trimmed) return;

    setRenameSaving(true);
    try {
      await updateMyName(trimmed);
      await refreshUser(); // updates AuthContext user
      setShowRenameModal(false);
    } catch (e) {
      alert("Failed to update username");
    } finally {
      setRenameSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const ok = window.confirm(
      "This will permanently delete your account and all data. Continue?"
    );
    if (!ok) return;

    try {
      await deleteMyAccount();
      await logout(); // clean, no catch
      navigate("/login", { replace: true });
    } catch {
      alert("Failed to delete account");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const { refreshUser } = useAuth();

  const handleAddPasskey = async () => {
    setPasskeyError(null);
    setIsRegisteringPasskey(true);

    try {
      await registerPasskey();
      await refreshUser();
    } catch (err: any) {
      if (err.message?.includes("already registered")) {
        setPasskeyError("This device already has a passkey.");
      } else {
        setPasskeyError("Could not register passkey. Please try again.");
      }
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  const handleDisconnectGitHub = async () => {
    try {
      await disconnectGitHub();
      await refreshUser();
    } catch {
      alert("Failed to disconnect GitHub");
    }
  };

  return (
    <div className="profile-page">
      <ProfileHeader
        name="Profile"
        isMenuOpen={isSettingsOpen}
        onToggleMenu={handleToggleSettings}
        onCloseMenu={() => setIsSettingsOpen(false)}
        isRenameOpen={showRenameModal}
        renameValue={renameValue}
        renameSaving={renameSaving}
        onRenameChange={setRenameValue}
        onOpenRename={() => setShowRenameModal(true)}
        onCloseRename={() => setShowRenameModal(false)}
        onConfirmRename={handleConfirmRename}
        onDelete={handleDeleteAccount}
      />

      <div className="profile-section">
        <div className="profile-row">
          <span className="profile-label">Name:</span>
          <span className="profile-value">{user.name}</span>
        </div>

        <div className="profile-row">
          <span className="profile-label">Email:</span>
          <span className="profile-value">{user.email}</span>
        </div>

        <div className="profile-row">
          <span className="profile-label">Weekly Streak:</span>
          <span className="profile-value">{streak.currentStreak} weeks</span>
        </div>
      </div>

      <div className="profile-section security-section">
        <h3>Security</h3>

        <div className="profile-row">
          <span className="profile-label">Authentication methods:</span>
          <div className="profile-value security-badges">
            <span className="badge enabled">Password</span>

            <span
              className={`badge ${user.googleConnected ? "enabled" : "disabled"}`}
            >
              Google
            </span>

            <span
              className={`badge ${user.githubConnected ? "enabled" : "disabled"}`}
            >
              GitHub
            </span>
            {user.githubConnected && (
              <button
                className="security-link danger"
                onClick={handleDisconnectGitHub}
              >
                Disconnect GitHub
              </button>
            )}
            <span
              className={`badge ${user.passkeysCount > 0 ? "enabled" : "disabled"}`}
            >
              Passkey
            </span>
          </div>
        </div>

        <div className="passkey-description">
          Sign in without a password using your device
        </div>

        {passkeyError && <div className="error-text">{passkeyError}</div>}

        <button
          className="passkey-btn"
          onClick={handleAddPasskey}
          disabled={isRegisteringPasskey}
        >
          {isRegisteringPasskey ? "Adding passkey…" : "Add passkey"}
        </button>
      </div>

      <PRPreviewSection
        personalRecords={personalRecords}
        onViewAll={() => navigate("/report/pr-history")}
      />

      <RecentActivitySection
        recentActivity={recentActivity}
        onEntryClick={(id) => navigate(`/report/recent-activity`)}
        onViewAll={() => navigate("/report/recent-activity")}
      />

      <MuscleDistributionSection
        muscleDistribution={filteredMuscleDistribution}
      />

      <button className="logout-btn" onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
}
