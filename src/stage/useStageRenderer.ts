import { useEffect, useRef, useState } from "react";
import type { State } from "../core/state";
import { stageFrame } from "./stageFrame";
import { loadStageRuntime, type StageRenderer } from "./runtime";

export function useStageRenderer(state: State) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const current = useRef(state);
  current.current = state;
  const invalidate = useRef<() => void>(() => {});
  const [generation, setGeneration] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [error, setError] = useState("");
  const [anchors, setAnchors] = useState({
    dial: [25, 62],
    repair: [65, 65],
    core: [50, 31],
  });

  useEffect(() => {
    const canvas = canvasRef.current!;
    let disposed = false,
      failed = false,
      scene: StageRenderer | undefined;
    let frame = 0,
      last = 0,
      elapsed = 0,
      act = current.current.act,
      visible = true;
    let resize: ResizeObserver | undefined,
      intersection: IntersectionObserver | undefined;
    setStatus("loading");
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    };
    const fail = (message: string) => {
      if (disposed || failed) return;
      failed = true;
      stop();
      setError(message);
      setStatus("error");
    };
    const lost = (event: Event) => {
      event.preventDefault();
      fail("三维舞台的图形连接已中断。");
    };
    canvas.addEventListener("webglcontextlost", lost);
    const canAnimate = () =>
      !disposed &&
      !failed &&
      visible &&
      !document.hidden &&
      !current.current.reducedMotion &&
      ["coreReady", "folding"].includes(current.current.act);
    let update = () => {};
    const visibility = () => {
      stop();
      update();
    };
    document.addEventListener("visibilitychange", visibility);
    loadStageRuntime()
      .then((runtime) => {
        if (disposed) return;
        try {
          scene = runtime.start(canvas);
          const draw = () => {
            if (disposed || failed || !visible || document.hidden) return;
            if (act !== current.current.act) {
              act = current.current.act;
              elapsed = 0;
            }
            const f = stageFrame(current.current, elapsed);
            scene!.render(f.angles, false, f.dial, f.effects);
          };
          const position = () => {
            if (!canvas.clientHeight || !canvas.clientWidth || disposed) return;
            const viewWidth = (900 * canvas.clientWidth) / canvas.clientHeight;
            const point = (p: number[]) => {
              const q = runtime.project(p);
              return [
                ((q[0] - (1200 - viewWidth) / 2) / viewWidth) * 100,
                (q[1] / 900) * 100,
              ];
            };
            const mount = runtime.deviceMounts[1];
            const offset = (1 - current.current.repairProgress) * 22;
            setAnchors({
              dial: point(runtime.dialOrigin),
              repair: point([
                mount.position[0] + Math.cos(mount.angle) * offset,
                mount.position[1] + Math.sin(mount.angle) * offset,
                55 + (1 - current.current.repairProgress) * 6,
              ]),
              core: point([0, 0, 236]),
            });
          };
          const tick = (now: number) => {
            frame = 0;
            if (!canAnimate()) return;
            if (act !== current.current.act) {
              act = current.current.act;
              elapsed = 0;
            }
            elapsed += last ? Math.min(0.05, (now - last) / 1000) : 0;
            last = now;
            draw();
            if (canAnimate()) frame = requestAnimationFrame(tick);
          };
          update = () => {
            stop();
            draw();
            position();
            if (canAnimate()) frame = requestAnimationFrame(tick);
          };
          invalidate.current = update;
          resize = new ResizeObserver(update);
          resize.observe(canvas);
          intersection = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            update();
          });
          intersection.observe(canvas);
          update();
          setStatus("ready");
        } catch (e) {
          fail(e instanceof Error ? e.message : "三维舞台加载失败。");
        }
      })
      .catch(() => fail("舞台资源加载失败，请检查网络后重试。"));
    return () => {
      disposed = true;
      stop();
      invalidate.current = () => {};
      resize?.disconnect();
      intersection?.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("webglcontextlost", lost);
      scene?.dispose();
    };
  }, [generation]);

  useEffect(() => {
    invalidate.current();
  }, [state]);
  return {
    canvasRef,
    generation,
    anchors,
    status,
    error,
    retry: () => setGeneration((n) => n + 1),
  };
}
