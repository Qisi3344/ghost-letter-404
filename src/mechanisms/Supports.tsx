import { Cylinder, Star } from "./Art";
/** Bearings sit at the ends of each orbit; posts return their loads to the base. */
export function Supports() {
  return (
    <g className="supports">
      <path
        d="M265 565V381Q265 355 283 348M735 565V380Q735 353 718 347"
        fill="none"
        stroke="#352631"
        strokeWidth="15"
      />
      <path
        d="M263 560V381Q263 355 283 348M733 560V380Q733 353 718 347"
        fill="none"
        stroke="url(#brass)"
        strokeWidth="6"
      />
      {[
        [282, 348],
        [718, 347],
        [276, 405],
        [725, 407],
      ].map(([x, y], i) => (
        <g key={i}>
          <ellipse
            cx={x}
            cy={y}
            rx="12"
            ry="17"
            fill="url(#metal)"
            stroke="url(#brass)"
            strokeWidth="4"
          />
          <circle cx={x} cy={y} r="4" fill="#dcc18d" />
        </g>
      ))}
      {[263, 733].map((x) => (
        <g key={x}>
          {[462, 527, 560].map((y) => (
            <Cylinder key={y} x={x} y={y} rx={13} ry={5} h={6} />
          ))}
        </g>
      ))}
      <path
        d="M500 488L339 522M500 488L661 522"
        stroke="#5b3d36"
        strokeWidth="10"
      />
      <path
        d="M500 485L339 519M500 485L661 519"
        stroke="#ad8454"
        strokeWidth="3"
      />
      <g transform="translate(500 500)">
        <rect
          x="-27"
          y="-15"
          width="54"
          height="26"
          rx="5"
          fill="#241c2c"
          stroke="#bf9660"
        />
        <Star r={9} fill="#9d7aba" />
      </g>
    </g>
  );
}
