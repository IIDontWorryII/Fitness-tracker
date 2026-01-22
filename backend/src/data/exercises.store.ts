import { Schema, model } from "mongoose";

const ExerciseSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    muscle: { type: String, required: true },
    thumbnail: String,
    description: String,
    isGlobal: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model("Exercise", ExerciseSchema);
