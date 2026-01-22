/*
  WorkoutDetailHeader.tsx

  Component: Header area for the Workout Detail page.
  - Displays workout title, settings menu, rename/delete modals and edit controls.
  - Receives callbacks for rename/delete/edit actions from parent.
  - Pure presentational + small UI handlers only.
*/

import React from "react";
import "./WorkoutDetailHeader.css";

type WorkoutHeaderProps = {
  name: string;
  isEditMode: boolean;

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
};

const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({
  name,
  isEditMode,
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
}) => {
  return (
    <>
      <div className="workout-detail-header">
        <h2 className="workout-detail-title">{name}</h2>

        <div className="header-right">
          {/* Edit mode buttons */}
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

          {/* Settings menu */}
          <div className="workout-settings">
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
