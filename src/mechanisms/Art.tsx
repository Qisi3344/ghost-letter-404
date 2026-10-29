import { memo } from "react";
export const ArtDefs = memo(function ArtDefs() {
  return (
    <defs>
      <linearGradient id="brass" x1="0" y1="0" x2="1" y2=".8">
        <stop stopColor="#efcf92" />
        <stop offset=".18" stopColor="#a27442" />
        <stop offset=".42" stopColor="#edd09b" />
        <stop offset=".64" stopColor="#79502e" />
        <stop offset="1" stopColor="#bd8a51" />
      </linearGradient>
      <linearGradient id="metal" x1="0" x2="1">
        <stop stopColor="#17151f" />
        <stop offset=".38" stopColor="#514352" />
        <stop offset=".6" stopColor="#292330" />
        <stop offset="1" stopColor="#100f18" />
      </linearGradient>
      <linearGradient id="edge" x1="0" x2="0" y2="1">
        <stop stopColor="#b78852" />
        <stop offset=".3" stopColor="#5d3c2a" />
        <stop offset="1" stopColor="#241b24" />
      </linearGradient>
      <radialGradient id="glass" cx=".36" cy=".28" r=".78">
        <stop stopColor="#c0a5e0" stopOpacity=".9" />
        <stop offset=".23" stopColor="#76528e" />
        <stop offset=".64" stopColor="#392443" />
        <stop offset=".9" stopColor="#21192e" />
        <stop offset="1" stopColor="#493254" />
      </radialGradient>
      <radialGradient id="core-glow">
        <stop stopColor="#b79ce6" stopOpacity=".35" />
        <stop offset="1" stopColor="#9a6ce8" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="cloth" x1=".1" y1="0" x2=".85" y2="1">
        <stop stopColor="#fff6e9" />
        <stop offset=".5" stopColor="#e9e0e8" />
        <stop offset="1" stopColor="#b4a0c8" />
      </linearGradient>
      <linearGradient id="hat" x1="0" x2="1" y2="1">
        <stop stopColor="#5a426c" />
        <stop offset=".5" stopColor="#30213f" />
        <stop offset="1" stopColor="#171322" />
      </linearGradient>
      <linearGradient id="peach" x1="0" x2="1">
        <stop stopColor="#efac78" />
        <stop offset="1" stopColor="#b86543" />
      </linearGradient>
      <linearGradient id="paper" x1="0" x2="1" y2="1">
        <stop stopColor="#fff4dc" />
        <stop offset="1" stopColor="#d5b98e" />
      </linearGradient>
      <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="4" />
      </filter>
      <filter id="shadow" x="-30%" y="-30%" width="160%" height="180%">
        <feDropShadow
          dx="0"
          dy="9"
          stdDeviation="8"
          floodColor="#090610"
          floodOpacity=".65"
        />
      </filter>
    </defs>
  );
});
export function Star({
  x = 0,
  y = 0,
  r = 16,
  fill = "#eac78e",
}: {
  x?: number;
  y?: number;
  r?: number;
  fill?: string;
}) {
  return (
    <path
      d={`M${x} ${y - r} L${x + r * 0.24} ${y - r * 0.24} L${x + r} ${y} L${x + r * 0.24} ${y + r * 0.24} L${x} ${y + r} L${x - r * 0.24} ${y + r * 0.24} L${x - r} ${y} L${x - r * 0.24} ${y - r * 0.24}Z`}
      fill={fill}
      stroke="#f5dbad"
      strokeWidth=".7"
    />
  );
}
export function Cylinder({
  x,
  y,
  rx,
  ry,
  h,
  fill = "url(#metal)",
}: {
  x: number;
  y: number;
  rx: number;
  ry: number;
  h: number;
  fill?: string;
}) {
  return (
    <g>
      <path
        d={`M${x - rx} ${y} v${h} a${rx} ${ry} 0 0 0 ${rx * 2} 0 v${-h}Z`}
        fill={fill}
        stroke="#9c7349"
        strokeWidth="1"
      />
      <ellipse cx={x} cy={y + h} rx={rx} ry={ry} fill="none" stroke="#6f4b35" />
      <ellipse
        cx={x}
        cy={y}
        rx={rx}
        ry={ry}
        fill="url(#metal)"
        stroke="url(#brass)"
        strokeWidth="2"
      />
    </g>
  );
}
export const Backdrop = memo(function Backdrop() {
  return (
    <g className="backdrop">
      <ellipse cx="500" cy="370" rx="365" ry="340" fill="url(#core-glow)" />
      {[380, 355, 338].map((r, i) => (
        <path
          key={r}
          d={`M${500 - r} 600 V350 A${r} ${r} 0 0 1 ${500 + r} 350 V600`}
          fill="none"
          stroke={i === 1 ? "#483340" : "#302633"}
          strokeWidth={i === 1 ? 11 : 2}
        />
      ))}
      {Array.from({ length: 55 }, (_, i) => (
        <circle
          key={i}
          cx={145 + ((i * 137.51) % 710)}
          cy={35 + ((i * 83.7) % 560)}
          r={i % 7 === 0 ? 1.7 : 0.8}
          fill="#c3abd5"
          opacity={0.15 + (i % 4) * 0.08}
        />
      ))}
      {[-1, 1].map((side) => (
        <g key={side} transform={`translate(${500 + side * 326} 125)`}>
          <path d="M0 0V240" stroke="#584033" />
          <path
            d="M-14 236 L0 224 14 236V279L0 290 -14 279Z"
            fill="#32232d"
            stroke="#9c764d"
          />
          <path d="M0 237V276" stroke="#d2a16c" strokeWidth="4" />
          <circle cy="258" r="27" fill="url(#core-glow)" />
        </g>
      ))}
    </g>
  );
});
