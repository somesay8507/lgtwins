import { describe, expect, it, vi } from "vitest";
import { safe } from "@/lib/safe";

describe("safe", () => {
  it("returns the resolved value", async () => {
    await expect(safe(async () => 42)).resolves.toBe(42);
  });

  it("returns null and logs when the function throws", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(
      safe(async () => {
        throw new Error("boom");
      }),
    ).resolves.toBeNull();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
