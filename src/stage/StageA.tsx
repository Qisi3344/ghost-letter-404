import {
  useEffect,
  useRef,
  type Dispatch,
  type PointerEvent,
  type CSSProperties,
} from "react";
import type { Action, State } from "../core/state";
import { useStageRenderer } from "./useStageRenderer";
import "./stage.css";

export function StageA({
  state: s,
  dispatch,
}: {
  state: State;
  dispatch: Dispatch<Action>;
}) {
  const { canvasRef, generation, anchors, status, error, retry } =
    useStageRenderer(s);
  const root = useRef<HTMLDivElement>(null);
  const focused = useRef(false);
  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    progress: number;
  } | null>(null);
  const winding = s.act === "intro" || s.act === "winding";
  const active = status === "ready";
  const point = (p: number[]): CSSProperties => ({
    left: `${p[0]}%`,
    top: `${p[1]}%`,
  });
  useEffect(() => {
    drag.current = null;
    if (focused.current)
      root.current
        ?.querySelector<HTMLElement>("[data-stage-control]")
        ?.focus({ preventScroll: true });
  }, [s.act, status]);
  const move = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    const width = root.current!.clientWidth;
    const dx = ((e.clientX - d.x) * 1000) / width,
      dy = ((e.clientY - d.y) * 1000) / width;
    if (s.act === "repairing") {
      dispatch({ type: "repair", progress: d.progress - dx / 180 });
    } else {
      dispatch(
        winding
          ? { type: "wind", delta: (dx - dy) * 0.9 }
          : { type: "orbit", delta: (dx - dy) * 0.65 },
      );
      d.x = e.clientX;
      d.y = e.clientY;
    }
  };
  const finish = (e: PointerEvent<HTMLElement>, cancelled = false) => {
    if (drag.current?.id !== e.pointerId) return;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
    if (s.act === "repairing")
      dispatch(
        cancelled ? { type: "repair", progress: 0 } : { type: "releaseRepair" },
      );
  };
  const pointer = {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.button !== 0 || drag.current) return;
      e.preventDefault();
      e.currentTarget.focus({ preventScroll: true });
      e.currentTarget.setPointerCapture(e.pointerId);
      drag.current = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        progress: s.repairProgress,
      };
    },
    onPointerMove: move,
    onPointerUp: (e: PointerEvent<HTMLElement>) => finish(e),
    onPointerCancel: (e: PointerEvent<HTMLElement>) => finish(e, true),
    onLostPointerCapture: (e: PointerEvent<HTMLElement>) => finish(e, true),
  };
  return (
    <div
      ref={root}
      className="webgl-stage"
      data-status={status}
      onFocusCapture={() => {
        focused.current = true;
      }}
      onBlurCapture={(e) => {
        if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget))
          focused.current = false;
      }}
    >
      <canvas
        key={generation}
        ref={canvasRef}
        className="stage-canvas"
        aria-label="实体金属星轨与玻璃星核，Clawd 和 GPT 在机械祭坛旁协作"
        hidden={status === "error"}
      />
      {status === "loading" && (
        <p className="stage-message" role="status">
          正在接通三维舞台…
        </p>
      )}
      {status === "error" && (
        <div className="stage-fallback" role="alert">
          <p>{error}</p>
          <p>
            三维画面暂不可用。你仍可用下方控制完成上弦、校准、修复和来信体验。
          </p>
          <button onClick={retry}>重新加载三维舞台</button>
        </div>
      )}
      {active && (winding || s.act === "aligning") && (
        <div
          data-stage-control
          data-testid="stage-dial"
          className="stage-hit stage-dial"
          style={point(anchors.dial)}
          role="slider"
          tabIndex={0}
          aria-label={winding ? "发条控制盘" : "星轨控制盘"}
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={winding ? 450 : 360}
          aria-valuenow={Math.round(winding ? s.crankAngle : s.outerAngle)}
          aria-valuetext={
            winding
              ? `储能 ${Math.round((s.crankAngle / 450) * 100)}%`
              : `外环 ${s.outerAngle.toFixed(0)}度`
          }
          {...pointer}
          onKeyDown={(e) => {
            const delta = (
              {
                ArrowRight: winding ? 30 : 10,
                ArrowUp: winding ? 30 : 10,
                ArrowLeft: winding ? -30 : -10,
                ArrowDown: winding ? -30 : -10,
                PageUp: 45,
                PageDown: -45,
              } as Record<string, number>
            )[e.key];
            if (delta !== undefined || e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              dispatch(
                winding
                  ? { type: "wind", delta: delta ?? 45 }
                  : { type: "orbit", delta: delta ?? 10 },
              );
            }
          }}
        />
      )}
      {active && s.act === "repairing" && (
        <div
          data-stage-control
          data-testid="stage-repair"
          className="stage-hit stage-repair"
          style={point(anchors.repair)}
          role="slider"
          tabIndex={0}
          aria-label="检修盖，向左拖动归位或按回车修复"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(s.repairProgress * 100)}
          {...pointer}
          onKeyDown={(e) => {
            if (["Enter", " "].includes(e.key)) {
              e.preventDefault();
              dispatch({ type: "assistRepair" });
            } else if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
              e.preventDefault();
              dispatch({
                type: "repair",
                progress:
                  s.repairProgress + (e.key === "ArrowLeft" ? 0.1 : -0.1),
              });
            }
          }}
        />
      )}
      {active && s.act === "coreReady" && (
        <button
          data-stage-control
          className="stage-hit stage-core"
          style={point(anchors.core)}
          aria-label="点亮星核，进入幽灵邮局"
          onClick={() => dispatch({ type: "light" })}
        />
      )}
    </div>
  );
}
