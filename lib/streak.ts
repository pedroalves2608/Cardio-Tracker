import { startOfDay, subDays, startOfWeek, isWithinInterval } from "date-fns";

/**
 * Returns unique dates (YYYY-MM-DD) that have at least one workout (cardio or strength).
 */
export function getWorkoutDates(
  cardioDates: Date[],
  strengthDates: Date[]
): Set<string> {
  const set = new Set<string>();
  for (const d of cardioDates) set.add(startOfDay(d).toISOString().slice(0, 10));
  for (const d of strengthDates) set.add(startOfDay(d).toISOString().slice(0, 10));
  return set;
}

/**
 * Current day streak: how many consecutive days up to and including today have at least one workout.
 * If today has no workout, returns 0.
 */
export function currentDayStreak(workoutDates: Set<string>, today: Date = new Date()): number {
  const todayStr = startOfDay(today).toISOString().slice(0, 10);
  if (!workoutDates.has(todayStr)) return 0;
  let count = 0;
  let d = today;
  const maxDays = 365;
  for (let i = 0; i < maxDays; i++) {
    const str = startOfDay(d).toISOString().slice(0, 10);
    if (!workoutDates.has(str)) break;
    count++;
    d = subDays(d, 1);
  }
  return count;
}

/**
 * Current week streak: how many consecutive weeks (Sun-Sat) up to current week have at least one workout.
 */
export function currentWeekStreak(
  cardioDates: Date[],
  strengthDates: Date[],
  today: Date = new Date()
): number {
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const allDates = [
    ...cardioDates.map((d) => startOfDay(d)),
    ...strengthDates.map((d) => startOfDay(d)),
  ];
  let count = 0;
  let currentWeekStart = new Date(weekStart);
  const maxWeeks = 52;
  for (let i = 0; i < maxWeeks; i++) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const hasWorkout = allDates.some((d) =>
      isWithinInterval(d, { start: currentWeekStart, end: weekEnd })
    );
    if (!hasWorkout) break;
    count++;
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  }
  return count;
}
