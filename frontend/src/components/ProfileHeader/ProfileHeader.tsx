import { useEffect, useRef } from "react";
import "../WorkoutDetailHeader/WorkoutDetailHeader.css";

interface Props {
  name: string;

  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;

  isRenameOpen: boolean;
  renameValue: string;
  renameSaving: boolean;
  onRenameChange: (value: string) => void;
  onOpenRename: () => void;
  onCloseRename: () => void;
  onConfirmRename: () => void;

  onDelete: () => void;
}

export default function ProfileHeader({
  name,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,

  isRenameOpen,
  renameValue,
  renameSaving,
  onRenameChange,
  onOpenRename,
  onCloseRename,
  onConfirmRename,

  onDelete,
}: Props) {
  const settingsRef = useRef<HTMLDivElement | null>(null);

  // click outside for settings menu
  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node)
      ) {
        onCloseMenu();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, onCloseMenu]);

  return (
    <>
      <div className="workout-detail-header">
        {/* LEFT */}
        <div className="header-left">
          <h2 className="workout-detail-title">{name}</h2>
        </div>

        {/* RIGHT */}
        <div className="header-right">
          <div className="workout-settings" ref={settingsRef}>
            <button className="workout-settings-button" onClick={onToggleMenu}>
              ⋮
            </button>

            {isMenuOpen && (
              <div className="workout-settings-menu">
                <button
                  className="workout-settings-item"
                  onClick={() => {
                    onCloseMenu();
                    onOpenRename();
                  }}
                >
                  Change username
                </button>

                <button
                  className="workout-settings-item workout-settings-delete"
                  onClick={onDelete}
                >
                  Delete account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RENAME MODAL */}
      {isRenameOpen && (
        <div className="overlay">
          <div className="rename-modal">
            <h3>Change username</h3>

            <input
              className="rename-input"
              type="text"
              value={renameValue}
              onChange={(e) => onRenameChange(e.target.value)}
              autoFocus
            />

            <div className="rename-actions">
              <button
                className="btn-cancel"
                onClick={onCloseRename}
                disabled={renameSaving}
              >
                Cancel
              </button>

              <button
                className="btn-save"
                onClick={onConfirmRename}
                disabled={renameSaving}
              >
                {renameSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
