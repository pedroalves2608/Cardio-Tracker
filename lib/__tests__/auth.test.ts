import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../auth";

describe("auth", () => {
  it("hashPassword returns a string different from input", async () => {
    const hash = await hashPassword("secret123");
    expect(hash).not.toBe("secret123");
    expect(typeof hash).toBe("string");
    expect(hash.length).toBeGreaterThan(0);
  });

  it("verifyPassword returns true for correct password", async () => {
    const hash = await hashPassword("mypass");
    expect(await verifyPassword("mypass", hash)).toBe(true);
  });

  it("verifyPassword returns false for wrong password", async () => {
    const hash = await hashPassword("mypass");
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});
