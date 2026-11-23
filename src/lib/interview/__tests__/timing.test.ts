import {
  getRemainingMinutes,
  getRemainingSeconds,
  isInterviewTimeExpired,
} from "@/lib/interview/timing";

describe("interview timing", () => {
  const base = {
    duration: 15,
    status: "in_progress" as const,
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-06-01T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns full duration when not started", () => {
    expect(
      getRemainingSeconds({
        ...base,
        startedAt: null,
        status: "pending",
      }),
    ).toBe(900);
  });

  it("counts down from startedAt", () => {
    const startedAt = new Date("2025-06-01T12:00:00.000Z");
    jest.setSystemTime(new Date("2025-06-01T12:05:00.000Z"));
    expect(getRemainingSeconds({ ...base, startedAt })).toBe(600);
    expect(getRemainingMinutes({ ...base, startedAt })).toBe(10);
  });

  it("detects expiry at zero remaining seconds", () => {
    const startedAt = new Date("2025-06-01T11:45:00.000Z");
    expect(isInterviewTimeExpired({ ...base, startedAt })).toBe(true);
    expect(getRemainingSeconds({ ...base, startedAt })).toBe(0);
  });
});