export interface CardioSession {
  id: string;
  date: string;
  durationSeconds: number;
  distanceKm: number;
  ankleWeight: boolean;
  ankleWeightKg: number | null;
  notes: string | null;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StrengthSet {
  id: string;
  sessionId: string;
  exerciseName: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  createdAt?: string;
}

export interface StrengthSession {
  id: string;
  date: string;
  notes: string | null;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
  sets: StrengthSet[];
}

export interface StrengthTemplateExercise {
  id: string;
  templateId: string;
  exerciseName: string;
  order: number;
  setsCount: number;
  defaultReps: number | null;
  defaultWeightKg: number | null;
}

export interface StrengthTemplate {
  id: string;
  name: string;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
  exercises: StrengthTemplateExercise[];
}

export type ChartRange = "7" | "30" | "90" | "all";

export interface WeekStats {
  weekStart: string;
  weekEnd: string;
  cardio: {
    sessions: number;
    totalKm: number;
    totalSeconds: number;
    avgPaceSecondsPerKm: number | null;
  };
  strength: { sessions: number; totalVolumeKg: number };
  goals: {
    cardioKmPerWeek?: number;
    cardioSessionsPerWeek?: number;
    strengthSessionsPerWeek?: number;
    workoutsPerWeek?: number;
  };
  progress: {
    cardioKm: { current: number; target: number; attained: boolean };
    cardioSessions: { current: number; target: number; attained: boolean };
    strengthSessions: { current: number; target: number; attained: boolean };
    workouts: { current: number; target: number; attained: boolean };
  };
  streak: { currentDayStreak: number; currentWeekStreak: number; lastWorkoutDate: string | null };
}
