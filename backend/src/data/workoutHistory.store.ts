import mongoose, { Schema } from "mongoose";

/* =========================
   Mongo model
========================= */
export interface WorkoutHistoryDocument {
  userId: string;
  workoutId: string;
  name: string;
  date: string;
  durationSeconds: number;
  totalVolume: number;
  completedSets: number;
  exercises: any[];
}

const WorkoutHistorySchema = new Schema<WorkoutHistoryDocument>(
  {
    userId: { type: String, required: true, index: true },
    workoutId: { type: String, required: true },
    name: { type: String, required: true },
    date: { type: String, required: true },
    durationSeconds: { type: Number, required: true },
    totalVolume: { type: Number, required: true },
    completedSets: { type: Number, required: true },
    exercises: {
      type: Schema.Types.Mixed,
      default: [],
    },
  },
  { timestamps: true }
);

const WorkoutHistoryModel =
  mongoose.models.WorkoutHistory ||
  mongoose.model<WorkoutHistoryDocument>(
    "WorkoutHistory",
    WorkoutHistorySchema
  );

/* =========================
   USER-SCOPED OPERATIONS
========================= */

export async function createWorkoutHistory(data: WorkoutHistoryDocument) {
  const entry = new WorkoutHistoryModel(data);
  return entry.save();
}

export async function getWorkoutHistory(userId: string) {
  return WorkoutHistoryModel.find({ userId }).sort({ date: -1 }).lean();
}

export async function getWorkoutHistoryById(userId: string, entryId: string) {
  return WorkoutHistoryModel.findOne({
    _id: entryId,
    userId,
  }).lean();
}

export async function updateWorkoutHistory(
  userId: string,
  entryId: string,
  data: Partial<WorkoutHistoryDocument>
) {
  return WorkoutHistoryModel.findOneAndUpdate({ _id: entryId, userId }, data, {
    new: true,
  }).lean();
}

export async function deleteWorkoutHistory(userId: string, entryId: string) {
  const result = await WorkoutHistoryModel.findOneAndDelete({
    _id: entryId,
    userId,
  });
  return Boolean(result);
}
