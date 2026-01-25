/*
  ExerciseModal.tsx

  Component: Shows exercise details in a modal.
  - Displays thumbnail, name, target muscle and description.
  - Wrapped by reusable `Modal` component for consistent behavior.
*/

import type { Exercise } from "../../types";
import Modal from "../Modal/Modal";
import "./ExerciseModal.css";

type Props = {
  exercise: Exercise;
  onClose: () => void;
};

/**
 * Displays exercise details (thumbnail, name, muscle, description)
 * Now wrapped inside reusable <Modal> component.
 */
export default function ExerciseModal({ exercise, onClose }: Props) {
  return (
    <Modal isOpen={!!exercise} onClose={onClose}>
      <div className="ex-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ex-modal-header">
          <div className="ex-thumb">
            {exercise.thumbnail && (
              <img src={exercise.thumbnail} alt={exercise.name} />
            )}
          </div>

          <div className="ex-title">
            <h2>{exercise.name}</h2>
            <div className="ex-muscle">{exercise.muscle}</div>
          </div>

          <button
            className="ex-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="ex-modal-body">
          <div className="ex-description">
            <h4>Description</h4>
            <p>{exercise.description ?? "No description available."}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
