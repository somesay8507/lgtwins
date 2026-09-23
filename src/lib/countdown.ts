export type CountdownState = {
  status: "upcoming" | "live" | "ended";
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/** 경기 시작 후 이 시간 동안은 "진행 중"으로 본다. */
const LIVE_WINDOW_MS = 3 * 60 * 60 * 1000;

export function getCountdown(target: Date, now: Date): CountdownState {
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      status: -diff < LIVE_WINDOW_MS ? "live" : "ended",
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const total = Math.floor(diff / 1000);
  return {
    status: "upcoming",
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}
