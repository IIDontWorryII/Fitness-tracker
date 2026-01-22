import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import authRoutes from "./routes/auth.routes";
import workoutsRoutes from "./routes/workouts.routes";
import workoutHistoryRoutes from "./routes/workoutHistory.routes";
import exerciseRoutes from "./routes/exercises.routes";
import oidcRoutes from "./routes/oidc.routes";
import passkeysRoutes from "./routes/passkeys.routes";
import oauthRoutes from "./routes/oauth.routes";
import session from "express-session";
import path from "path";

const app = express();

// Middleware
const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (like curl/postman) with no origin
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    name: "fitnessapp.sid",
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // set true only with HTTPS
      sameSite: "lax",
    },
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutsRoutes);
app.use("/api/workout-history", workoutHistoryRoutes);
app.use("/api/auth/oidc", oidcRoutes);
app.use("/api/auth/passkeys", passkeysRoutes);
app.use("/api/auth/oauth", oauthRoutes);

app.use(
  "/images",
  express.static(path.join(__dirname, "..", "public", "images"))
);

// Health check (proves server runs)
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "fitness-backend" });
});

// Placeholder: workouts CRUD will be added next step
// app.get("/api/workouts", ...)

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fitness-app";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
