import { useMemo, useEffect, useState } from "react";
import { ALL_MUSCLES } from "../types";
import { fetchWorkoutHistory } from "../api/workoutHistoryClient";

/* =========================
   TYPES
========================= */

export type TimeRange = "overall" | "year" | "month" | "week";

type HistoryExerciseSet = {
  weight: number;
  reps: number;
  done: boolean;
};

type HistoryExercise = {
  id: string;
  name: string;
  muscle: string;
  sets: HistoryExerciseSet[];
};

type HistoryEntry = {
  id: string; // 🔧 normalized from _id
  workoutId: string;
  name: string;
  date: string;
  durationSeconds: number;
  exercises: HistoryExercise[];
};

type SessionPR = {
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  previousWeight: number | null;
  delta: number;
};

/* =========================
   DATE HELPERS (unchanged)
========================= */

function getIsoWeek(date: Date) {
  const tmp = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getWeekDateRange(year: number, week: number) {
  const firstDay = new Date(Date.UTC(year, 0, 1));
  const dayNum = firstDay.getUTCDay() || 7;
  const diff = week * 7 - (dayNum - 1);

  const startDate = new Date(Date.UTC(year, 0, diff));
  const endDate = new Date(Date.UTC(year, 0, diff + 6));

  return { startDate, endDate };
}

function formatWeekRange(start: Date, end: Date) {
  const startDay = start.getUTCDate();
  const endDay = end.getUTCDate();

  const shortMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const endMonth = shortMonths[end.getUTCMonth()];

  return `${startDay}-${endDay} ${endMonth}`;
}

function getLastNWeeks(n: number) {
  const now = new Date();
  const weeks: { year: number; week: number }[] = [];

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i * 7);

    weeks.push({
      year: d.getUTCFullYear(),
      week: getIsoWeek(d),
    });
  }

  return weeks;
}

function weekKey(date: Date) {
  const monday = startOfIsoWeek(date);
  return monday.toISOString().slice(0, 10); // YYYY-MM-DD (Monday)
}

function getIsoYear(date: Date) {
  const tmp = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
  return tmp.getUTCFullYear();
}

function startOfIsoWeek(date: Date) {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );

  const day = d.getUTCDay() || 7; // Sun = 7
  d.setUTCDate(d.getUTCDate() - day + 1); // Monday
  return d;
}

/* =========================
   MAIN HOOK
========================= */

export function useBackendReportData(timeRange: TimeRange = "month") {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD HISTORY (ONCE)
     FIX 1: normalize id
  ========================= */
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchWorkoutHistory();
        setHistory(data);
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    console.log("WORKOUT HISTORY DEBUG");
    console.table(
      history.map((h) => ({
        date: h.date,
        durationSeconds: h.durationSeconds,
        weekKey: weekKey(new Date(h.date)),
      }))
    );
  }, [history]);

  /* =========================
     TIME CONTEXT
  ========================= */
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentWeek = getIsoWeek(now);

  /* =========================
     FILTERED HISTORY
  ========================= */
  const filteredHistory = useMemo(() => {
    return history.filter((entry) => {
      const d = new Date(entry.date);
      const year = d.getFullYear();
      const month = d.getMonth();
      const week = getIsoWeek(d);

      switch (timeRange) {
        case "year":
          return year === currentYear;
        case "month":
          return year === currentYear && month === currentMonth;
        case "week":
          return year === currentYear && week === currentWeek;
        default:
          return true;
      }
    });
  }, [history, timeRange, currentYear, currentMonth, currentWeek]);

  /* =========================
     TRAINING OVERVIEW
     FIX 2: typed reduce()
  ========================= */
  const filteredStats = useMemo(() => {
    let workouts = filteredHistory.length;
    let sets = 0;
    let volume = 0;

    filteredHistory.forEach((w) => {
      sets += w.exercises.reduce(
        (acc, ex) => acc + ex.sets.filter((s) => s.done).length,
        0
      );

      volume += w.exercises.reduce(
        (sum, ex) =>
          sum +
          ex.sets
            .filter((s) => s.done)
            .reduce((s, set) => s + set.weight * set.reps, 0),
        0
      );
    });

    return { workouts, sets, volume };
  }, [filteredHistory]);

  /* =========================
     MUSCLE DISTRIBUTION
  ========================= */
  const filteredMuscleDistribution = useMemo(() => {
    const totals: Record<string, number> = {};

    filteredHistory.forEach((workout) => {
      workout.exercises.forEach((ex) => {
        if (!totals[ex.muscle]) totals[ex.muscle] = 0;
        totals[ex.muscle] += ex.sets.filter((s) => s.done).length;
      });
    });

    const totalSets = Object.values(totals).reduce((a, b) => a + b, 0);

    return ALL_MUSCLES.map((muscle) => {
      const sets = totals[muscle] ?? 0;
      const percentage = totalSets > 0 ? (sets / totalSets) * 100 : 0;

      return {
        muscle,
        sets,
        percentage,
      };
    });
  }, [filteredHistory]);

  /* =========================
     WEEKLY TIME
  ========================= */
  const weeklyTime = useMemo(() => {
    const byWeek: Record<string, number> = {};

    // 1️⃣ Aggregate history by ISO-week Monday
    history.forEach((w) => {
      const key = weekKey(new Date(w.date));
      byWeek[key] = (byWeek[key] ?? 0) + w.durationSeconds / 60;
    });

    // 2️⃣ Build last 12 ISO weeks (Mondays)
    const weeks: { label: string; minutes: number }[] = [];

    const currentMonday = startOfIsoWeek(new Date());

    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(currentMonday);
      weekStart.setUTCDate(weekStart.getUTCDate() - i * 7);

      const weekEnd = new Date(weekStart);
      weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

      const key = weekKey(weekStart);

      weeks.push({
        label: i === 0 ? "This Week" : formatWeekRange(weekStart, weekEnd),
        minutes: byWeek[key] ?? 0,
      });
    }

    return weeks;
  }, [history]);

  /* =========================
     RECENT ACTIVITY
  ========================= */
  const recentActivity = useMemo(() => {
    return history.map((w) => {
      const totalSets = w.exercises.reduce(
        (sum, ex) => sum + ex.sets.filter((s) => s.done).length,
        0
      );

      const totalVolume = w.exercises.reduce(
        (sum, ex) =>
          sum +
          ex.sets
            .filter((s) => s.done)
            .reduce((s, set) => s + set.weight * set.reps, 0),
        0
      );

      return {
        id: w.id,
        workoutId: w.workoutId,
        name: w.name,
        date: w.date,
        durationMinutes: Math.round(w.durationSeconds / 60),
        completedSets: totalSets,
        totalVolume,
        exerciseCount: w.exercises.length,
      };
    });
  }, [history]);

  /* =========================
     PERSONAL RECORDS
  ========================= */
  const personalRecords = useMemo(() => {
    const prs: Record<
      string,
      {
        id: string;
        name: string;
        muscle: string;
        weight: number;
        reps: number;
        date: string;
        thumbnail: string | undefined;
      }
    > = {};

    history.forEach((w) => {
      w.exercises.forEach((ex: any) => {
        ex.sets.forEach((s: any) => {
          const key = ex.id;
          if (!prs[key] || s.weight > prs[key].weight) {
            prs[key] = {
              id: key,
              name: ex.name,
              muscle: ex.muscle,
              weight: s.weight,
              reps: s.reps,
              date: w.date,
              thumbnail: ex.thumbnail,
            };
          }
        });
      });
    });

    return Object.values(prs);
  }, [history]);

  // =========================
  // SESSION PRs
  // =========================
  const sessionPRs = useMemo(() => {
    const prsSoFar: Record<string, number> = {};
    const result: Record<string, SessionPR[]> = {};

    const sorted = [...history].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sorted.forEach((session) => {
      const sessionResults: SessionPR[] = [];

      session.exercises.forEach((ex) => {
        const sessionMax = Math.max(...ex.sets.map((s) => s.weight));
        if (sessionMax <= 0) return;

        const prevBest = prsSoFar[ex.id];

        if (prevBest === undefined || sessionMax > prevBest) {
          const delta =
            prevBest === undefined ? sessionMax : sessionMax - prevBest;

          prsSoFar[ex.id] = sessionMax;

          sessionResults.push({
            sessionId: session.id,
            exerciseId: ex.id,
            exerciseName: ex.name,
            weight: sessionMax,
            previousWeight: prevBest,
            delta,
          });
        }
      });

      if (sessionResults.length > 0) {
        result[session.id] = sessionResults;
      }
    });

    return result;
  }, [history]);

  /* =========================
     STREAK
  ========================= */
  const streak = useMemo(() => {
    let activeWeeks = new Set<string>();

    history.forEach((w) => {
      const d = new Date(w.date);
      const week = getIsoWeek(d);
      activeWeeks.add(`${week}/${d.getFullYear()}`);
    });

    return {
      currentStreak: activeWeeks.size,
      longestStreak: activeWeeks.size,
      activeWeeks: activeWeeks.size,
    };
  }, [history]);

  /* =========================
     RETURN (NO EARLY RETURNS!)
    FIX 3: NEVER return early
  ========================= */
  return {
    filteredStats,
    filteredMuscleDistribution,
    weeklyTime,
    recentActivity,
    personalRecords,
    sessionPRs,
    streak,
    loading,
  };
}
