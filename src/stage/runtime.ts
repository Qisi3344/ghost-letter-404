import type { StageFrame } from "./stageFrame";

export interface StageRenderer {
  render(
    angles: number[],
    debug: boolean,
    dial: number,
    effects: StageFrame["effects"],
  ): void;
  dispose(): void;
  stats: { frames: number };
}
export interface StageRuntime {
  start(
    canvas: HTMLCanvasElement,
    options?: { pixelRatio?: number },
  ): StageRenderer;
  project(p: number[]): number[];
  dialOrigin: number[];
  deviceMounts: { position: number[]; angle: number }[];
}

let runtime: Promise<StageRuntime> | undefined;
export function loadStageRuntime() {
  // Keep a single source of geometry/materials shared with the independent review.
  return (runtime ??= import(
    /* @vite-ignore */ `${import.meta.env.BASE_URL}stage-a/scene.mjs`
  ).catch((error) => {
    runtime = undefined;
    throw error;
  }));
}
