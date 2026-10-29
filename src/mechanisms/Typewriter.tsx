import { Cylinder, Star } from "./Art";
export function Typewriter({
  printing,
  progress,
  visits,
  text,
  sealed,
}: {
  printing: boolean;
  progress: number;
  visits: number;
  text: string;
  sealed: boolean;
}) {
  const lines = text.split("\n").flatMap((line) =>
    line
      ? Array.from(
          { length: Math.ceil(Array.from(line).length / 19) },
          (_, i) =>
            Array.from(line)
              .slice(i * 19, i * 19 + 19)
              .join(""),
        )
      : [""],
  );
  return (
    <g className={`typewriter ${printing ? "printing" : ""}`}>
      <ellipse cx="500" cy="539" rx="146" ry="27" fill="#100c16" opacity=".6" />
      <path
        d="M363 425L590 425 634 505 410 519 363 474Z"
        fill="url(#metal)"
        stroke="#c7a167"
        strokeWidth="3"
      />
      <path
        d="M410 519L634 505V527L411 545 363 494V474Z"
        fill="url(#edge)"
        stroke="#b58a54"
      />
      <path
        d="M372 438L584 438 617 498 417 511Z"
        fill="#18151e"
        stroke="#b7915d"
      />
      <g
        className={sealed ? "paper-sheet paper-sealed" : "paper-sheet"}
        style={{ translate: `0 ${-progress * 65}px` }}
      >
        <path
          d="M410 429L403 304 569 295 580 420Z"
          fill="url(#paper)"
          stroke="#c3a47a"
        />
        <text x="424" y="323" fontSize="9" fill="#7d5b56" letterSpacing="3">
          GHOST POST · 404
        </text>
        <text
          x="418"
          y="338"
          fontSize="6.2"
          fill="#65505a"
          fontFamily="Microsoft YaHei, sans-serif"
        >
          {lines.slice(0, 18).map((line, i) => (
            <tspan key={i} x="418" dy={i ? 4.5 : 0}>
              {line || " "}
            </tspan>
          ))}
        </text>
      </g>
      <g className="roller">
        <path d="M388 420L594 407" stroke="#09080d" strokeWidth="23" />
        <path d="M388 412L594 399" stroke="#977650" strokeWidth="3" />
        <path d="M388 421L594 408" stroke="#4b3e46" strokeWidth="3" />
        {[383, 599].map((x) => (
          <g key={x}>
            <ellipse
              cx={x}
              cy={x === 383 ? 417 : 404}
              rx="9"
              ry="18"
              fill="url(#brass)"
            />
            <ellipse
              cx={x}
              cy={x === 383 ? 417 : 404}
              rx="5"
              ry="13"
              fill="#29232c"
            />
          </g>
        ))}
      </g>
      <path
        d="M383 431V399L370 393"
        fill="none"
        stroke="url(#brass)"
        strokeWidth="6"
      />
      {Array.from({ length: 28 }, (_, i) => {
        const row = Math.floor(i / 7),
          col = i % 7,
          x = 398 + col * 27 + row * 8,
          y = 448 + row * 15 - col * 1.6;
        return (
          <g
            key={i}
            className={`keycap key-${i % 4}`}
            transform={`translate(${x} ${y})`}
          >
            <ellipse cy="4" rx="8" ry="5" fill="#735033" />
            <ellipse
              rx="8"
              ry="5"
              fill="#24202a"
              stroke="#d1af79"
              strokeWidth="1.3"
            />
            <circle r="1.2" fill="#b5a393" />
          </g>
        );
      })}
      <path
        d="M456 512L565 505"
        stroke="#d4b279"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <Star x={498} y={436} r={10} />
      {visits > 1 && (
        <text x="479" y="533" fontSize="7" fill="#d0b48c">
          欢迎回来
        </text>
      )}
    </g>
  );
}
