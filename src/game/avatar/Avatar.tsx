import {
  type AvatarConfig,
  SKIN, HAIR_COLORS, BACKGROUNDS,
  colorOf, DEFAULT_AVATAR,
} from "./config";

type Props = {
  config?: AvatarConfig | null;
  size?: number;            // pixel size of the rendered square
  rounded?: boolean;        // circle clip the background
  className?: string;
};

/**
 * Pure-SVG character avatar. All shapes are drawn in a 100x100 viewBox so the
 * component scales crisply to any size. Each "feature" (hair, eyes, mouth,
 * accessory) is a small subcomponent that switches on the config id.
 */
export function Avatar({ config, size = 96, rounded = true, className }: Props) {
  const c = config ?? DEFAULT_AVATAR;
  const skin = colorOf(SKIN, c.skin, "#F5C9A4");
  const hair = colorOf(HAIR_COLORS, c.hairColor, "#5A3A22");
  const bg = colorOf(BACKGROUNDS, c.background, "#7B2FBE");

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={{ display: "block" }}
      aria-hidden="true"
    >
      {/* Background */}
      {rounded ? (
        <circle cx="50" cy="50" r="50" fill={bg} />
      ) : (
        <rect x="0" y="0" width="100" height="100" rx="14" fill={bg} />
      )}

      {/* Neck/shoulders */}
      <rect x="32" y="74" width="36" height="20" rx="10" fill={skin} />
      <path d="M18 100 Q50 76 82 100 Z" fill="#FFFFFF" opacity="0.18" />

      {/* Head */}
      <ellipse cx="50" cy="50" rx="26" ry="29" fill={skin} />
      {/* Subtle cheek shadow */}
      <ellipse cx="50" cy="62" rx="16" ry="6" fill="#000" opacity="0.05" />

      {/* Ears */}
      <ellipse cx="24" cy="52" rx="4" ry="6" fill={skin} />
      <ellipse cx="76" cy="52" rx="4" ry="6" fill={skin} />

      {/* Hair (back layer for long styles + front fringe) */}
      <Hair style={c.hairStyle} color={hair} />

      {/* Eyes */}
      <Eyes style={c.eyes} />

      {/* Mouth */}
      <Mouth style={c.mouth} />

      {/* Accessory overlay */}
      <Accessory style={c.accessory} />
    </svg>
  );
}

function Hair({ style, color }: { style: string; color: string }) {
  switch (style) {
    case "bald":
      return null;
    case "short":
      return (
        <path
          d="M24 44 Q26 22 50 22 Q74 22 76 44 Q70 34 50 34 Q30 34 24 44 Z"
          fill={color}
        />
      );
    case "long":
      return (
        <g>
          {/* Back hair behind head */}
          <path d="M22 50 Q22 86 36 92 L36 60 Q28 56 22 50 Z" fill={color} />
          <path d="M78 50 Q78 86 64 92 L64 60 Q72 56 78 50 Z" fill={color} />
          {/* Top */}
          <path d="M22 46 Q24 20 50 20 Q76 20 78 46 Q70 32 50 32 Q30 32 22 46 Z" fill={color} />
        </g>
      );
    case "curly":
      return (
        <g fill={color}>
          <circle cx="30" cy="34" r="9" />
          <circle cx="42" cy="26" r="10" />
          <circle cx="56" cy="24" r="10" />
          <circle cx="70" cy="32" r="9" />
          <circle cx="74" cy="44" r="7" />
          <circle cx="26" cy="44" r="7" />
        </g>
      );
    case "buns":
      return (
        <g fill={color}>
          <circle cx="22" cy="28" r="9" />
          <circle cx="78" cy="28" r="9" />
          <path d="M28 38 Q30 24 50 24 Q70 24 72 38 Q66 32 50 32 Q34 32 28 38 Z" />
        </g>
      );
    case "mohawk":
      return (
        <g fill={color}>
          <path d="M40 16 L60 16 L58 42 L42 42 Z" />
          <path d="M30 42 Q34 36 40 36 L40 44 Q34 44 30 50 Z" />
          <path d="M70 42 Q66 36 60 36 L60 44 Q66 44 70 50 Z" />
        </g>
      );
    default:
      return null;
  }
}

function Eyes({ style }: { style: string }) {
  switch (style) {
    case "round":
      return (
        <g>
          <circle cx="40" cy="50" r="4" fill="#1A1A2E" />
          <circle cx="60" cy="50" r="4" fill="#1A1A2E" />
          <circle cx="41.5" cy="48.5" r="1.2" fill="#FFFFFF" />
          <circle cx="61.5" cy="48.5" r="1.2" fill="#FFFFFF" />
        </g>
      );
    case "wink":
      return (
        <g stroke="#1A1A2E" strokeWidth="2.4" strokeLinecap="round" fill="none">
          <circle cx="40" cy="50" r="3" fill="#1A1A2E" stroke="none" />
          <path d="M56 50 Q60 47 64 50" />
        </g>
      );
    case "stars":
      return (
        <g fill="#1A1A2E">
          <Star cx={40} cy={50} />
          <Star cx={60} cy={50} />
        </g>
      );
    case "sleepy":
      return (
        <g stroke="#1A1A2E" strokeWidth="2.4" strokeLinecap="round" fill="none">
          <path d="M36 51 Q40 54 44 51" />
          <path d="M56 51 Q60 54 64 51" />
        </g>
      );
    case "happy":
    default:
      return (
        <g stroke="#1A1A2E" strokeWidth="2.4" strokeLinecap="round" fill="none">
          <path d="M36 52 Q40 48 44 52" />
          <path d="M56 52 Q60 48 64 52" />
        </g>
      );
  }
}

function Star({ cx, cy }: { cx: number; cy: number }) {
  const r = 3.2;
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r / 2.4;
    pts.push(`${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`);
  }
  return <polygon points={pts.join(" ")} />;
}

function Mouth({ style }: { style: string }) {
  switch (style) {
    case "grin":
      return (
        <g>
          <path d="M40 64 Q50 74 60 64 Z" fill="#1A1A2E" />
          <path d="M42 65 Q50 68 58 65 L58 66 Q50 69 42 66 Z" fill="#FFFFFF" />
        </g>
      );
    case "smirk":
      return (
        <path d="M44 66 Q52 70 58 64" stroke="#1A1A2E" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      );
    case "open":
      return (
        <ellipse cx="50" cy="66" rx="5" ry="6" fill="#1A1A2E" />
      );
    case "tongue":
      return (
        <g>
          <path d="M42 64 Q50 72 58 64" stroke="#1A1A2E" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <ellipse cx="52" cy="69" rx="3.5" ry="2.5" fill="#FF6B8A" />
        </g>
      );
    case "smile":
    default:
      return (
        <path d="M42 64 Q50 70 58 64" stroke="#1A1A2E" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      );
  }
}

function Accessory({ style }: { style: string }) {
  switch (style) {
    case "glasses":
      return (
        <g stroke="#1A1A2E" strokeWidth="2" fill="none">
          <circle cx="40" cy="50" r="6" />
          <circle cx="60" cy="50" r="6" />
          <line x1="46" y1="50" x2="54" y2="50" />
        </g>
      );
    case "sunnies":
      return (
        <g>
          <rect x="32" y="46" width="16" height="8" rx="3" fill="#1A1A2E" />
          <rect x="52" y="46" width="16" height="8" rx="3" fill="#1A1A2E" />
          <line x1="48" y1="50" x2="52" y2="50" stroke="#1A1A2E" strokeWidth="2" />
        </g>
      );
    case "freckles":
      return (
        <g fill="#8C5A35" opacity="0.7">
          <circle cx="40" cy="58" r="0.9" />
          <circle cx="44" cy="60" r="0.9" />
          <circle cx="56" cy="60" r="0.9" />
          <circle cx="60" cy="58" r="0.9" />
          <circle cx="50" cy="61" r="0.8" />
        </g>
      );
    case "blush":
      return (
        <g fill="#FF7AB6" opacity="0.55">
          <ellipse cx="38" cy="60" rx="4" ry="2.5" />
          <ellipse cx="62" cy="60" rx="4" ry="2.5" />
        </g>
      );
    default:
      return null;
  }
}
