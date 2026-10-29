import { describe, it, expect } from "vitest";
import {
  initialState,
  reducer,
  alignmentError,
  angles,
  distanceAngle,
} from "../src/core/state";
import { letter } from "../src/content/letters";
describe("deterministic mechanism", () => {
  it("requires 1.25 turns and ignores out-of-order actions", () => {
    let s = initialState();
    expect(reducer(s, { type: "light" })).toEqual(s);
    s = reducer(s, { type: "wind", delta: 449 });
    expect(s.act).toBe("winding");
    s = reducer(s, { type: "wind", delta: 1 });
    expect(s.act).toBe("aligning");
    expect(reducer(s, { type: "wind", delta: 90 })).toEqual(s);
  });
  it("uses both physical planet angles for alignment and snaps only within tolerance", () => {
    expect(angles(180)).toEqual({ outer: 180, middle: 120, inner: 75 });
    expect(alignmentError(0)).toBe(90);
    let s = reducer(initialState(), { type: "wind", delta: 450 });
    s = reducer(s, { type: "orbit", delta: 70 });
    expect(s.act).toBe("aligning");
    s = reducer(s, { type: "orbit", delta: 10 });
    expect(s.act).toBe("repairing");
    expect(s.outerAngle).toBe(180);
  });
  it("wraps angular distance across zero", () => {
    expect(distanceAngle(359, 1)).toBe(2);
    expect(distanceAngle(-1, 1)).toBe(2);
    expect(distanceAngle(0, 180)).toBe(180);
  });
  it("rebounds an incomplete repair and locks a completed repair", () => {
    let s = { ...initialState(), act: "repairing" as const };
    let next = reducer(reducer(s, { type: "repair", progress: 0.6 }), {
      type: "releaseRepair",
    });
    expect(next.act).toBe("repairing");
    expect(next.repairProgress).toBeCloseTo(0.18);
    next = reducer(reducer(next, { type: "repair", progress: 0.81 }), {
      type: "releaseRepair",
    });
    expect(next.act).toBe("coreReady");
    expect(next.repairProgress).toBe(1);
  });
  it("completes the entire sequence and resets without losing accessibility settings", () => {
    let s = initialState(true);
    const actions = [
      { type: "wind", delta: 450 },
      { type: "orbit", delta: 90 },
      { type: "assistRepair" },
      { type: "light" },
      { type: "enter" },
      { type: "field", field: "playerName", value: "银狼" },
      { type: "print" },
      { type: "skip", length: 130 },
      { type: "open" },
    ] as const;
    for (const action of actions) s = reducer(s, action);
    expect(s.act).toBe("ending");
    expect(s.playerName).toBe("银狼");
    s = reducer(s, { type: "restart" });
    expect(s.act).toBe("intro");
    expect(s.crankAngle).toBe(0);
    expect(s.visits).toBe(2);
    expect(s.reducedMotion).toBe(true);
  });
  it("has three distinct local letters and safely retains plain text", () => {
    const s = initialState();
    expect(letter(s)).toContain("致 你");
    expect(letter({ ...s, tone: "playful" })).toContain("南瓜");
    expect(letter({ ...s, tone: "quiet" })).toContain("等待");
    expect(letter({ ...s, playerName: "<img onerror=alert(1)>" })).toContain(
      "<img onerror=alert(1)>",
    );
  });
});
