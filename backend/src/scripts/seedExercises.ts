import "dotenv/config";
import mongoose from "mongoose";
import Exercise from "../data/exercises.store";
import { allExercises } from "../data/exercises";

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  await mongoose.connect(process.env.MONGO_URI);

  await Exercise.deleteMany({ isGlobal: true });

  await Exercise.insertMany(
    allExercises.map((ex) => ({
      slug: ex.id,
      name: ex.name,
      muscle: ex.muscle,
      thumbnail: ex.thumbnail,
      description: ex.description,
      isGlobal: true,
    }))
  );

  console.log("Exercises seeded");
  await mongoose.disconnect();
}

seed();
