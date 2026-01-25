/*
  WorkoutDetailHeader.tsx

  Component: Header area for the Workout Detail page.
  - Displays workout title, settings menu, rename/delete modals and edit controls.
  - Receives callbacks for rename/delete/edit actions from parent.
  - Pure presentational + small UI handlers only.
*/

import React, { useEffect, useRef } from "react";
import "./WorkoutDetailHeader.css";

type WorkoutHeaderProps = {
  name: string;
  isEditMode: boolean;

  /* VISIBILITY */
  isPublic: boolean;
  onTogglePublic: (nextValue: boolean) => void;

  isSettingsOpen: boolean;
  onToggleSettings: () => void;

  onEnterEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;

  // Rename
  isRenameOpen: boolean;
  renameValue: string;
  onRenameChange: (value: string) => void;
  onOpenRename: () => void;
  onCloseRename: () => void;
  onConfirmRename: () => void;

  // Delete
  isDeleteOpen: boolean;
  onOpenDelete: () => void;
  onCloseDelete: () => void;
  onConfirmDelete: () => void;

  onCloseSettings: () => void;
};

const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({
  name,
  isEditMode,
  isPublic,
  onTogglePublic,
  isSettingsOpen,
  onToggleSettings,
  onEnterEdit,
  onCancelEdit,
  onSaveEdit,
  isRenameOpen,
  renameValue,
  onRenameChange,
  onOpenRename,
  onCloseRename,
  onConfirmRename,
  isDeleteOpen,
  onOpenDelete,
  onCloseDelete,
  onConfirmDelete,
  onCloseSettings,
}) => {
  const settingsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isSettingsOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        onCloseSettings();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSettingsOpen, onCloseSettings]);

  return (
    <>
      <div className="workout-detail-header">
        {/* LEFT SIDE */}
        <div className="header-left">
          <h2 className="workout-detail-title">{name}</h2>

          <div className="workout-visibility-toggle">
            <span className="visibility-label">
              {isPublic ? "Public" : "Private"}
            </span>

            <label className="switch">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => onTogglePublic(e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="header-right">
          {isEditMode && (
            <div className="edit-header-buttons">
              <button className="btn-cancel" onClick={onCancelEdit}>
                Cancel
              </button>
              <button className="btn-save" onClick={onSaveEdit}>
                Save
              </button>
            </div>
          )}

          <div className="workout-settings" ref={settingsRef}>
            <button
              className="workout-settings-button"
              onClick={onToggleSettings}
            >
              ⋮
            </button>

            {isSettingsOpen && (
              <div className="workout-settings-menu">
                {!isEditMode && (
                  <button
                    className="workout-settings-item"
                    onClick={onEnterEdit}
                  >
                    Edit
                  </button>
                )}
                <button
                  className="workout-settings-item"
                  onClick={onOpenRename}
                >
                  Rename
                </button>
                <button
                  className="workout-settings-item workout-settings-delete"
                  onClick={onOpenDelete}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {isDeleteOpen && (
        <div className="overlay">
          <div className="delete-modal">
            <h3>Delete workout?</h3>
            <p>This action cannot be undone.</p>

            <div className="delete-modal-actions">
              <button className="btn-cancel" onClick={onCloseDelete}>
                Cancel
              </button>
              <button className="btn-delete" onClick={onConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME MODAL */}
      {isRenameOpen && (
        <div className="overlay">
          <div className="rename-modal">
            <h3>Rename workout</h3>

            <input
              className="rename-input"
              type="text"
              value={renameValue}
              onChange={(e) => onRenameChange(e.target.value)}
              autoFocus
            />

            <div className="rename-actions">
              <button className="btn-cancel" onClick={onCloseRename}>
                Cancel
              </button>
              <button className="btn-save" onClick={onConfirmRename}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkoutHeader;
