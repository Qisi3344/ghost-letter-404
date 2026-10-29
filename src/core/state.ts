export type Act =
  | "intro"
  | "winding"
  | "aligning"
  | "repairing"
  | "coreReady"
  | "folding"
  | "letterRoom"
  | "letterPrinting"
  | "sealed"
  | "ending";
export type Tone = "gentle" | "playful" | "quiet";
export interface State {
  act: Act;
  crankAngle: number;
  outerAngle: number;
  repairProgress: number;
  playerName: string;
  partnerName: string;
  tone: Tone;
  printed: number;
  muted: boolean;
  reducedMotion: boolean;
  lowEffects: boolean;
  visits: number;
}
export const initialState = (reducedMotion = false): State => ({
  act: "intro",
  crankAngle: 0,
  outerAngle: 0,
  repairProgress: 0,
  playerName: "",
  partnerName: "",
  tone: "gentle",
  printed: 0,
  muted: true,
  reducedMotion,
  lowEffects: false,
  visits: 1,
});
export const normalize = (a: number) => ((a % 360) + 360) % 360;
export const distanceAngle = (a: number, b: number) =>
  Math.abs(((((a - b + 540) % 360) + 360) % 360) - 180);
export const angles = (outer: number) => ({
  outer,
  middle: outer * 0.5 + 30,
  inner: -outer * 0.25 + 120,
});
export const alignmentError = (outer: number) => {
  const a = angles(outer);
  return Math.max(distanceAngle(a.middle, 120), distanceAngle(a.inner, 75));
};
export type Action =
  | { type: "wind"; delta: number }
  | { type: "orbit"; delta: number }
  | { type: "repair"; progress: number }
  | { type: "releaseRepair" }
  | { type: "assistRepair" }
  | { type: "light" }
  | { type: "enter" }
  | { type: "field"; field: "playerName" | "partnerName"; value: string }
  | { type: "tone"; value: Tone }
  | { type: "print" }
  | { type: "tick"; length: number }
  | { type: "skip"; length: number }
  | { type: "open" }
  | { type: "toggle"; field: "muted" | "reducedMotion" | "lowEffects" }
  | { type: "restart" };
export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "wind": {
      if (s.act !== "intro" && s.act !== "winding") return s;
      const crankAngle = Math.max(0, Math.min(450, s.crankAngle + a.delta));
      return {
        ...s,
        crankAngle,
        outerAngle: crankAngle * 0.2,
        act: crankAngle >= 450 ? "aligning" : "winding",
      };
    }
    case "orbit": {
      if (s.act !== "aligning") return s;
      const outerAngle = Math.max(0, Math.min(360, s.outerAngle + a.delta));
      return alignmentError(outerAngle) < 9
        ? { ...s, outerAngle: 180, act: "repairing" }
        : { ...s, outerAngle };
    }
    case "repair":
      return s.act === "repairing"
        ? { ...s, repairProgress: Math.max(0, Math.min(1, a.progress)) }
        : s;
    case "releaseRepair":
      return s.act === "repairing"
        ? s.repairProgress >= 0.8
          ? { ...s, repairProgress: 1, act: "coreReady" }
          : { ...s, repairProgress: s.repairProgress * 0.3 }
        : s;
    case "assistRepair":
      return s.act === "repairing"
        ? { ...s, repairProgress: 1, act: "coreReady" }
        : s;
    case "light":
      return s.act === "coreReady" ? { ...s, act: "folding" } : s;
    case "enter":
      return s.act === "folding" ? { ...s, act: "letterRoom" } : s;
    case "field":
      return s.act === "letterRoom"
        ? { ...s, [a.field]: a.value.slice(0, 24) }
        : s;
    case "tone":
      return s.act === "letterRoom" ? { ...s, tone: a.value } : s;
    case "print":
      return s.act === "letterRoom"
        ? { ...s, act: "letterPrinting", printed: 0 }
        : s;
    case "tick":
      return s.act === "letterPrinting"
        ? {
            ...s,
            printed: Math.min(s.printed + 1, a.length),
            act: s.printed + 1 >= a.length ? "sealed" : "letterPrinting",
          }
        : s;
    case "skip":
      return s.act === "letterPrinting"
        ? { ...s, printed: a.length, act: "sealed" }
        : s;
    case "open":
      return s.act === "sealed" ? { ...s, act: "ending" } : s;
    case "toggle":
      return { ...s, [a.field]: !s[a.field] };
    case "restart":
      return {
        ...initialState(s.reducedMotion),
        muted: s.muted,
        lowEffects: s.lowEffects,
        visits: s.visits + 1,
      };
  }
}
