import { angles, type State } from "../core/state";

/** Game angles are relative to the calibrated Stage A assembly, in degrees. */
export function stageFrame(s: State, elapsed = 0) {
  const a = angles(s.outerAngle);
  const fold =
    s.act === "folding"
      ? s.reducedMotion
        ? 1
        : Math.min(1, elapsed / 2.4)
      : 0;
  const ready = s.act === "coreReady";
  return {
    angles: [
      a.outer - 180 + 12 + fold * 65,
      a.middle - 120 + 54 - fold * 100,
      a.inner - 75 + 62 + fold * 85,
    ],
    dial:
      s.act === "intro" || s.act === "winding" ? s.crankAngle : s.outerAngle,
    effects: {
      energy: s.crankAngle / 450,
      corePower:
        s.act === "folding"
          ? 1
          : ready
            ? 0.5 + (s.reducedMotion ? 0 : Math.sin(elapsed * 2) * 0.07)
            : 0.08 + (s.crankAngle / 450) * 0.22,
      repair: s.repairProgress,
      fold,
      lowEffects: s.lowEffects,
    },
  };
}

export type StageFrame = ReturnType<typeof stageFrame>;
