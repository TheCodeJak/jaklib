import Image from "next/image";
import type { AvatarProps } from "./Avatar.types";

export function Avatar({ name, color, src }: AvatarProps) {
  const size = 72;
  const initials = name[0];
  const r = size / 2;
  // const gradId = `grad-${uid}`;
  // const maskId = `mask-${uid}`;

  const completed = true;

  const badgeR = size * 0.21;
  const badgeX = size - badgeR * 0.72;
  const badgeY = size - badgeR * 0.72;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {src ? (
        <Image
          src={src}
          alt="Beschreibung"
          width={size}
          height={size}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ) : (
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          fill="none"
          overflow="visible"
        >
          {/* <defs>
          <radialGradient id={gradId} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor={highlightColor} />
            <stop offset="100%" stopColor={bgColor} />
          </radialGradient>
          {completed && (
            <mask id={maskId}>
              <circle cx={r} cy={r} r={r} fill="white" />
            </mask>
          )}
        </defs> */}

          <circle cx={r} cy={r} r={r} fill={color ?? "#0f0f0f"} />

          {completed && (
            <circle cx={r} cy={r} r={r} fill="black" fillOpacity={0.12} />
          )}

          <text
            x={r}
            y={r}
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize={size * 0.38}
            fontWeight="600"
            style={{ userSelect: "none" }}
          >
            {initials.toUpperCase()}
          </text>
        </svg>
      )}

      {completed && (
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          fill="none"
          overflow="visible"
          className="absolute top-0 left-0"
        >
          <g transform={`translate(${badgeX} ${badgeY})`}>
            <circle r={badgeR} fill="#22C55E" />
            <polyline
              points={`${-badgeR * 0.38},0 ${-badgeR * 0.08},${badgeR * 0.34} ${badgeR * 0.42},${-badgeR * 0.3}`}
              stroke="white"
              strokeWidth={badgeR * 0.3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      )}
    </div>
  );
}
