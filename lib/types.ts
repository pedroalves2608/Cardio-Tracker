export interface CardioSession {
  id: string;
  date: string;
  durationSeconds: number;
  distanceKm: number;
  ankleWeight: boolean;
  ankleWeightKg: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ChartRange = "7" | "30" | "90" | "all";
