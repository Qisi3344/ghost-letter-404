import { describe, expect, it } from "vitest";
import { initialState, reducer, type Action } from "../src/core/state";
import { stageFrame } from "../src/stage/stageFrame";

describe("game state drives the WebGL assembly", () => {
  it("advances winding, calibrates the accepted pose, seats the cover, and lights the core", () => {
    let s = initialState();
    expect(stageFrame(s).effects.energy).toBe(0);
    const actions: Action[] = [
      { type: "wind", delta: 450 },
      { type: "orbit", delta: 90 },
      { type: "assistRepair" },
      { type: "light" },
    ];
    s = reducer(s, actions[0]);
    expect(stageFrame(s).dial).toBe(90);
    expect(stageFrame(s).effects.energy).toBe(1);
    s = reducer(s, actions[1]);
    expect(stageFrame(s).angles).toEqual([12, 54, 62]);
    expect(stageFrame(s).effects.repair).toBe(0);
    s = reducer(s, actions[2]);
    expect(stageFrame(s).effects.repair).toBe(1);
    s = reducer(s, actions[3]);
    expect(stageFrame(s, 1.2).effects).toMatchObject({
      corePower: 1,
      fold: 0.5,
    });
    expect(stageFrame(s, 10).effects.fold).toBe(1);
  });
  it("keeps reduced motion deterministic while preserving manual input and light effects preference", () => {
    let s = reducer(initialState(true), { type: "wind", delta: 60 });
    expect(stageFrame(s).dial).toBe(60);
    s = { ...s, act: "coreReady", lowEffects: true };
    expect(stageFrame(s, 1)).toEqual(stageFrame(s, 100));
    expect(stageFrame({ ...s, act: "folding" }).effects).toMatchObject({
      fold: 1,
      lowEffects: true,
    });
  });
});
