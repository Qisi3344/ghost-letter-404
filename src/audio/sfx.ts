let ctx: AudioContext | undefined;
export function playSound(kind: "tick" | "chime" | "seal", muted: boolean) {
  if (muted) return;
  try {
    ctx ??= new AudioContext();
    void ctx.resume();
    const osc = ctx.createOscillator(),
      gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const t = ctx.currentTime;
    osc.type = kind === "tick" ? "triangle" : "sine";
    osc.frequency.setValueAtTime(
      kind === "tick" ? 420 : kind === "seal" ? 260 : 740,
      t,
    );
    osc.frequency.exponentialRampToValueAtTime(
      kind === "tick" ? 130 : 440,
      t + 0.12,
    );
    gain.gain.setValueAtTime(0.035, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.start(t);
    osc.stop(t + 0.18);
  } catch {
    /* Audio is optional. */
  }
}
