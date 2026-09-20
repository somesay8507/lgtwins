import { describe, expect, it } from "vitest";

describe("test env", () => {
  it("runs with jsdom", () => {
    expect(document.body).toBeDefined();
  });
});
