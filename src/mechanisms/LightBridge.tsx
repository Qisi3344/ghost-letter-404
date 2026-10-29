import { polar, rad } from "../core/geometry";
function point(rx: number, ry: number, angle: number, tilt: number, y: number) {
  const [x, py] = polar(rx, angle, ry / rx);
  return [
    500 + x * Math.cos(rad(tilt)) - (py - 13) * Math.sin(rad(tilt)),
    y + x * Math.sin(rad(tilt)) + (py - 13) * Math.cos(rad(tilt)),
  ];
}
export function LightBridge() {
  const a = point(242, 81, 120, 18, 337),
    b = point(205, 68, 75, -9, 393);
  const d = `M${a[0]} ${a[1]}Q500 333 ${b[0]} ${b[1]}`;
  return (
    <g className="light-bridge" pointerEvents="none">
      <path
        d={d}
        fill="none"
        stroke="#c9a3ec"
        strokeWidth="8"
        opacity=".4"
        filter="url(#glow)"
      />
      <path d={d} fill="none" stroke="#e1c9f2" strokeWidth="1.5" />
    </g>
  );
}
