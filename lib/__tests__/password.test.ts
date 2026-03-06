import { describe, it, expect } from "vitest";
import { validatePasswordStrength, PASSWORD_RULES } from "../password";

describe("password", () => {
  describe("validatePasswordStrength", () => {
    it("accepts password with 6+ chars and a number", () => {
      expect(validatePasswordStrength("abc123").valid).toBe(true);
      expect(validatePasswordStrength("senha1").valid).toBe(true);
      expect(validatePasswordStrength("123456").valid).toBe(true);
    });

    it("rejects password shorter than 6 chars", () => {
      const r = validatePasswordStrength("ab12");
      expect(r.valid).toBe(false);
      expect(r.error).toContain("6");
    });

    it("rejects password without a number", () => {
      const r = validatePasswordStrength("abcdef");
      expect(r.valid).toBe(false);
      expect(r.error).toContain("número");
    });

    it("rejects empty password", () => {
      const r = validatePasswordStrength("");
      expect(r.valid).toBe(false);
    });
  });

  describe("PASSWORD_RULES", () => {
    it("is a non-empty string describing the rules", () => {
      expect(typeof PASSWORD_RULES).toBe("string");
      expect(PASSWORD_RULES.length).toBeGreaterThan(0);
      expect(PASSWORD_RULES).toContain("6");
    });
  });
});
