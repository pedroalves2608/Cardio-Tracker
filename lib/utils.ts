/**
 * Converts total seconds to pace (seconds per km).
 * Returns null if distance is 0.
 */
export function paceSecondsPerKm(durationSeconds: number, distanceKm: number): number | null {
  if (distanceKm <= 0) return null;
  return Math.round(durationSeconds / distanceKm);
}

/**
 * Format pace as "mm:ss" per km.
 */
export function formatPace(secondsPerKm: number | null): string {
  if (secondsPerKm == null) return "—";
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.round(secondsPerKm % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Format duration (seconds) as "Xm Ys" or "X min".
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) return `${m} min`;
  return `${m}m ${s}s`;
}

/**
 * Carga ponderada: distância × peso (kg·km). Útil para comparar treinos com peso.
 * Retorna null quando não há peso no pé.
 */
export function loadKgKm(distanceKm: number, ankleWeightKg: number | null | undefined): number | null {
  if (ankleWeightKg == null || ankleWeightKg <= 0) return null;
  return Math.round(distanceKm * ankleWeightKg * 10) / 10;
}

/**
 * Parse "mm" or "mm:ss" or "m" to total seconds.
 */
export function parseTimeToSeconds(input: string): number {
  const trimmed = input.trim();
  if (!trimmed) return 0;
  const parts = trimmed.split(/[:\s]+/).map((p) => parseInt(p, 10));
  if (parts.some((n) => isNaN(n))) return 0;
  if (parts.length === 1) return parts[0] * 60;
  return parts[0] * 60 + (parts[1] ?? 0);
}
