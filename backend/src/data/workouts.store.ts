import mongoose, { Schema, Document } from "mongoose";

/* =========================
   Mongo model
========================= */
export interface WorkoutDocument {
  userId: string;
  name: string;
  exercises: any[];
}

const WorkoutSchema = new Schema<WorkoutDocument>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    exercises: { type: Schema.Types.Mixed, default: [] },
  },
  { timestamps: true }
);

const WorkoutModel =
  mongoose.models.Workout ||
  mongoose.model<WorkoutDocument>("Workout", WorkoutSchema);

/* =========================
   CRUD OPERATIONS
========================= */

export async function getAllWorkouts(userId: string) {
  return WorkoutModel.find({ userId }).lean();
}

export async function getWorkoutById(userId: string, workoutId: string) {
  return WorkoutModel.findOne({ _id: workoutId, userId }).lean();
}

export async function createWorkout(data: {
  userId: string;
  name: string;
  exercises: any[];
}) {
  const workout = new WorkoutModel(data);
  return workout.save();
}

export async function updateWorkout(
  userId: string,
  workoutId: string,
  data: Partial<{ name: string; exercises: any[] }>
) {
  return WorkoutModel.findOneAndUpdate({ _id: workoutId, userId }, data, {
    new: true,
  }).lean();
}

export async function deleteWorkout(userId: string, workoutId: string) {
  const result = await WorkoutModel.findOneAndDelete({
    _id: workoutId,
    userId,
  });
  return Boolean(result);
}
