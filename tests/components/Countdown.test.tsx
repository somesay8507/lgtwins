import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Countdown from "@/components/home/Countdown";

const STARTS_AT = "2026-09-21T09:30:00Z";

describe("Countdown", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("shows remaining time before the game", () => {
    vi.setSystemTime(new Date("2026-09-20T00:00:00Z"));
    render(<Countdown startsAt={STARTS_AT} />);
    expect(screen.getByRole("timer")).toHaveTextContent("01일09시간30분00초");
  });

  it("shows a live notice during the game", () => {
    vi.setSystemTime(new Date("2026-09-21T10:00:00Z"));
    render(<Countdown startsAt={STARTS_AT} />);
    expect(screen.getByText("경기 진행 중")).toBeInTheDocument();
  });

  it("shows an ended notice after the game", () => {
    vi.setSystemTime(new Date("2026-09-21T13:00:00Z"));
    render(<Countdown startsAt={STARTS_AT} />);
    expect(screen.getByText("경기 종료")).toBeInTheDocument();
  });
});
