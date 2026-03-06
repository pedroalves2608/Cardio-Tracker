import { describe, it, expect } from "vitest";
import {
  paceSecondsPerKm,
  formatPace,
  formatDuration,
  loadKgKm,
  parseTimeToSeconds,
} from "../utils";

describe("utils", () => {
  describe("paceSecondsPerKm", () => {
    it("returns seconds per km", () => {
      expect(paceSecondsPerKm(600, 2)).toBe(300);
      expect(paceSecondsPerKm(900, 3)).toBe(300);
    });
    it("returns null for zero distance", () => {
      expect(paceSecondsPerKm(100, 0)).toBeNull();
    });
  });

  describe("formatPace", () => {
    it("formats as mm:ss", () => {
      expect(formatPace(300)).toBe("5:00");
      expect(formatPace(365)).toBe("6:05");
    });
    it("returns — for null", () => {
      expect(formatPace(null)).toBe("—");
    });
  });

  describe("formatDuration", () => {
    it("formats seconds only", () => {
      expect(formatDuration(45)).toBe("45s");
    });
    it("formats minutes only", () => {
      expect(formatDuration(300)).toBe("5 min");
    });
    it("formats minutes and seconds", () => {
      expect(formatDuration(375)).toBe("6m 15s");
    });
  });

  describe("loadKgKm", () => {
    it("returns distance * weight", () => {
      expect(loadKgKm(5, 2)).toBe(10);
      expect(loadKgKm(3.2, 1.5)).toBe(4.8);
    });
    it("returns null for null/zero weight", () => {
      expect(loadKgKm(5, null)).toBeNull();
      expect(loadKgKm(5, 0)).toBeNull();
      expect(loadKgKm(5, undefined)).toBeNull();
    });
  });

  describe("parseTimeToSeconds", () => {
    it("parses mm to seconds", () => {
      expect(parseTimeToSeconds("5")).toBe(300);
    });
    it("parses mm:ss to seconds", () => {
      expect(parseTimeToSeconds("5:30")).toBe(330);
      expect(parseTimeToSeconds("12:00")).toBe(720);
    });
    it("returns 0 for empty or invalid", () => {
      expect(parseTimeToSeconds("")).toBe(0);
      expect(parseTimeToSeconds("ab")).toBe(0);
    });
  });
});
