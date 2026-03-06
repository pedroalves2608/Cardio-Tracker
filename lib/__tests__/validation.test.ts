import { describe, it, expect } from "vitest";
import { createWorkoutSchema, updateWorkoutSchema } from "../validation";

describe("validation", () => {
  describe("createWorkoutSchema", () => {
    it("accepts valid input", () => {
      const result = createWorkoutSchema.safeParse({
        date: "2026-03-01T12:00:00.000Z",
        durationSeconds: 600,
        distanceKm: 2,
        ankleWeight: false,
        notes: null,
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid date", () => {
      const result = createWorkoutSchema.safeParse({
        date: "invalid",
        durationSeconds: 600,
        distanceKm: 2,
        ankleWeight: false,
      });
      expect(result.success).toBe(false);
    });

    it("rejects zero distance", () => {
      const result = createWorkoutSchema.safeParse({
        date: "2026-03-01T12:00:00.000Z",
        durationSeconds: 600,
        distanceKm: 0,
        ankleWeight: false,
      });
      expect(result.success).toBe(false);
    });

    it("coerces string numbers", () => {
      const result = createWorkoutSchema.safeParse({
        date: "2026-03-01T12:00:00.000Z",
        durationSeconds: "600",
        distanceKm: "2.5",
        ankleWeight: false,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.durationSeconds).toBe(600);
        expect(result.data.distanceKm).toBe(2.5);
      }
    });
  });

  describe("updateWorkoutSchema", () => {
    it("accepts partial update", () => {
      const result = updateWorkoutSchema.safeParse({
        distanceKm: 3,
      });
      expect(result.success).toBe(true);
    });

    it("accepts empty object", () => {
      const result = updateWorkoutSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});
