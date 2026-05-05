import {
  type AvatarConfig,
  SKIN, HAIR_COLORS,
  colorOf, DEFAULT_AVATAR, normalizeAvatar,
} from "./config";

type Props = {
  config?: AvatarConfig | null;
  size?: number;
  rounded?: boolean;
  className?: string;
  /** Hide background (useful when parent provides its own gradient). */
  noBackground?: boolean;
};

/**
 * Expressive 2D character avatar — large head, big bright eyes with light
 * reflections, rosy cheeks, small nose, warm default smile. Pure SVG so it
 * scales crisply.
 */
export function Avatar({ config, size = 96, rounded = true, className, noBackground }: Props) {
  const c = normalizeAvatar(config ?? DEFAULT_AVATAR);
  const skin = colorOf(SKIN, c.skin, "#F5C9A4");
  const skinShadow = shade(skin, -0.18);
  const hair = colorOf(HAIR_COLORS, c.hairColor, "#5A3A22");
  const hairShadow = shade(hair, -0.25);

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden="true"
    >
      {!noBackground && (
        rounded
          ? <circle cx="60" cy="60" r="60" fill="url(#bgGrad)" />
          : <rect x="0" y="0" width="120" height="120" rx="18" fill="url(#bgGrad)" />
      )}
      <defs>
        <radialGradient id="bgGrad" cx="0.4" cy="0.35" r="0.9">
          <stop offset="0%" stopColor="#C8A6F0" />
          <stop offset="100%" stopColor="#7B2FBE" />
        </radialGradient>
      </defs>

      {/* Back hair (renders behind head for long styles) */}
      <BackHair style={c.hairStyle} color={hair} shadow={hairShadow} />

      {/* Neck */}
      <path d="M48 92 Q60 100 72 92 L72 102 Q60 108 48 102 Z" fill={skin} />
      <path d="M48 92 Q60 96 72 92 L72 95 Q60 99 48 95 Z" fill={skinShadow} opacity="0.5" />

      {/* Head — slightly egg-shaped, large for character */}
      <ellipse cx="60" cy="58" rx="33" ry="36" fill={skin} />
      {/* Soft jaw shadow */}
      <ellipse cx="60" cy="76" rx="22" ry="9" fill={skinShadow} opacity="0.25" />

      {/* Ears */}
      <ellipse cx="27" cy="62" rx="5" ry="7.5" fill={skin} />
      <ellipse cx="93" cy="62" rx="5" ry="7.5" fill={skin} />
      <ellipse cx="27" cy="63" rx="2" ry="3.5" fill={skinShadow} opacity="0.4" />
      <ellipse cx="93" cy="63" rx="2" ry="3.5" fill={skinShadow} opacity="0.4" />

      {/* Front hair */}
      <FrontHair style={c.hairStyle} color={hair} shadow={hairShadow} />

      {/* Brows (driven by expression) */}
      <Brows expression={c.expression} />

      {/* Eyes */}
      <Eyes style={c.eyes} expression={c.expression} />

      {/* Cheeks — rosy default; intensifies for shy/excited */}
      <Cheeks expression={c.expression} skin={skin} />

      {/* Tiny nose */}
      <path
        d="M58 64 Q60 68 62 64"
        stroke={shade(skin, -0.35)}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />

      {/* Mouth (driven by expression) */}
      <Mouth expression={c.expression} />
    </svg>
  );
}

/* ---------- Hair ---------- */

function BackHair({ style, color, shadow }: { style: string; color: string; shadow: string }) {
  switch (style) {
    case "longStraight":
      return (
        <g>
          <path d="M24 56 Q22 96 38 108 L38 70 Q30 64 24 56 Z" fill={color} />
          <path d="M96 56 Q98 96 82 108 L82 70 Q90 64 96 56 Z" fill={color} />
          <path d="M30 90 Q60 100 90 90 L90 108 Q60 116 30 108 Z" fill={shadow} opacity="0.5" />
        </g>
      );
    case "ponytail":
      return (
        <g>
          <ellipse cx="96" cy="74" rx="9" ry="18" fill={color} transform="rotate(18 96 74)" />
          <ellipse cx="98" cy="80" rx="5" ry="10" fill={shadow} opacity="0.5" transform="rotate(18 98 80)" />
        </g>
      );
    case "braids":
      return (
        <g>
          <BraidStrand x={24} flip={false} color={color} shadow={shadow} />
          <BraidStrand x={96} flip={true} color={color} shadow={shadow} />
        </g>
      );
    default:
      return null;
  }
}

function BraidStrand({ x, flip, color, shadow }: { x: number; flip: boolean; color: string; shadow: string }) {
  const dir = flip ? -1 : 1;
  return (
    <g>
      <path d={`M${x} 60 Q${x - dir * 4} 84 ${x + dir * 2} 104 L${x + dir * 8} 104 Q${x + dir * 6} 84 ${x + dir * 6} 60 Z`} fill={color} />
      <circle cx={x + dir * 3} cy={72} r="4.5" fill={shadow} opacity="0.5" />
      <circle cx={x + dir * 4} cy={86} r="4.5" fill={shadow} opacity="0.5" />
      <circle cx={x + dir * 5} cy={100} r="4.5" fill={shadow} opacity="0.5" />
    </g>
  );
}

function FrontHair({ style, color, shadow }: { style: string; color: string; shadow: string }) {
  switch (style) {
    case "buzz":
      return (
        <path
          d="M30 50 Q32 30 60 28 Q88 30 90 50 Q84 44 60 44 Q36 44 30 50 Z"
          fill={color}
          opacity="0.92"
        />
      );
    case "shortCurly":
      return (
        <g fill={color}>
          <circle cx="34" cy="42" r="10" />
          <circle cx="46" cy="32" r="11" />
          <circle cx="60" cy="28" r="12" />
          <circle cx="74" cy="32" r="11" />
          <circle cx="86" cy="42" r="10" />
          <circle cx="89" cy="54" r="7" />
          <circle cx="31" cy="54" r="7" />
          <circle cx="48" cy="44" r="4" fill={shadow} opacity="0.5" />
          <circle cx="72" cy="44" r="4" fill={shadow} opacity="0.5" />
        </g>
      );
    case "longStraight":
      return (
        <g>
          <path d="M26 56 Q28 24 60 22 Q92 24 94 56 Q84 38 60 38 Q36 38 26 56 Z" fill={color} />
          <path d="M28 50 Q40 40 60 40 Q80 40 92 50 L92 56 Q80 46 60 46 Q40 46 28 56 Z" fill={shadow} opacity="0.4" />
        </g>
      );
    case "braids":
      return (
        <path d="M28 52 Q30 24 60 22 Q90 24 92 52 Q82 36 60 36 Q38 36 28 52 Z" fill={color} />
      );
    case "ponytail":
      return (
        <g>
          <path d="M28 52 Q32 22 60 22 Q88 22 92 52 Q82 36 60 36 Q38 36 28 52 Z" fill={color} />
          <path d="M62 24 Q78 28 88 44" stroke={shadow} strokeWidth="2" fill="none" opacity="0.5" />
        </g>
      );
    case "messy":
      return (
        <g fill={color}>
          <path d="M26 50 Q22 30 40 24 Q44 14 56 22 Q60 12 70 22 Q82 14 86 26 Q98 30 94 52 Q88 38 76 40 Q72 30 64 36 Q56 28 50 38 Q40 36 32 44 Q28 46 26 50 Z" />
          <path d="M40 30 Q44 26 50 30" stroke={shadow} strokeWidth="2" fill="none" opacity="0.5" />
        </g>
      );
    default:
      return null;
  }
}

/* ---------- Brows ---------- */

function Brows({ expression }: { expression: string }) {
  const stroke = "#1A1A2E";
  const w = 3;
  switch (expression) {
    case "determined":
      return (
        <g stroke={stroke} strokeWidth={w} strokeLinecap="round" fill="none">
          <path d="M38 46 L52 50" />
          <path d="M82 46 L68 50" />
        </g>
      );
    case "excited":
      return (
        <g stroke={stroke} strokeWidth={w} strokeLinecap="round" fill="none">
          <path d="M38 44 Q45 39 52 44" />
          <path d="M68 44 Q75 39 82 44" />
        </g>
      );
    case "calm":
      return (
        <g stroke={stroke} strokeWidth={w - 0.6} strokeLinecap="round" fill="none" opacity="0.85">
          <path d="M38 48 L50 48" />
          <path d="M70 48 L82 48" />
        </g>
      );
    case "shy":
      return (
        <g stroke={stroke} strokeWidth={w - 0.4} strokeLinecap="round" fill="none">
          <path d="M38 50 Q45 47 52 50" />
          <path d="M68 50 Q75 47 82 50" />
        </g>
      );
    case "happy":
    default:
      return (
        <g stroke={stroke} strokeWidth={w} strokeLinecap="round" fill="none">
          <path d="M38 48 Q45 44 52 48" />
          <path d="M68 48 Q75 44 82 48" />
        </g>
      );
  }
}

/* ---------- Eyes ---------- */

function Eyes({ style, expression }: { style: string; expression: string }) {
  // Expression can subtly squish the eyes.
  const squish = expression === "determined" ? 0.7 : expression === "calm" ? 0.85 : expression === "shy" ? 0.8 : 1;
  const eyeY = 60;
  const left = { cx: 45, cy: eyeY };
  const right = { cx: 75, cy: eyeY };

  if (style === "starry") {
    return (
      <g fill="#1A1A2E">
        <SparkleEye {...left} />
        <SparkleEye {...right} />
      </g>
    );
  }
  if (style === "sleepy") {
    return (
      <g stroke="#1A1A2E" strokeWidth="3" strokeLinecap="round" fill="none">
        <path d={`M${left.cx - 6} ${eyeY + 1} Q${left.cx} ${eyeY + 5} ${left.cx + 6} ${eyeY + 1}`} />
        <path d={`M${right.cx - 6} ${eyeY + 1} Q${right.cx} ${eyeY + 5} ${right.cx + 6} ${eyeY + 1}`} />
      </g>
    );
  }
  // round / wide / fallback — circle eyes with shine. "wide" makes them larger.
  const r = (style === "wide" ? 7 : 5.6) * (expression === "excited" ? 1.05 : 1);
  return (
    <g>
      <BigEye cx={left.cx} cy={left.cy} r={r} squish={squish} />
      <BigEye cx={right.cx} cy={right.cy} r={r} squish={squish} />
    </g>
  );
}

function BigEye({ cx, cy, r, squish }: { cx: number; cy: number; r: number; squish: number }) {
  return (
    <g>
      {/* white sclera ring (very subtle) */}
      <ellipse cx={cx} cy={cy} rx={r + 0.6} ry={r * squish + 0.6} fill="#FFFFFF" />
      {/* iris/pupil */}
      <ellipse cx={cx} cy={cy} rx={r} ry={r * squish} fill="#1A1A2E" />
      {/* primary highlight */}
      <circle cx={cx + r * 0.35} cy={cy - r * 0.45} r={r * 0.32} fill="#FFFFFF" />
      {/* secondary tiny highlight */}
      <circle cx={cx - r * 0.35} cy={cy + r * 0.25} r={r * 0.16} fill="#FFFFFF" opacity="0.85" />
    </g>
  );
}

function SparkleEye({ cx, cy }: { cx: number; cy: number }) {
  const r = 5;
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r / 2.3;
    pts.push(`${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`);
  }
  return (
    <g>
      <polygon points={pts.join(" ")} fill="#1A1A2E" />
      <circle cx={cx + 1.4} cy={cy - 1.4} r="1.1" fill="#FFFFFF" />
    </g>
  );
}

/* ---------- Cheeks ---------- */

function Cheeks({ expression, skin }: { expression: string; skin: string }) {
  const intense = expression === "shy" ? 0.85 : expression === "excited" ? 0.7 : 0.5;
  const color = blend(skin, "#FF7AB6", expression === "shy" ? 0.65 : 0.45);
  return (
    <g fill={color} opacity={intense}>
      <ellipse cx="38" cy="72" rx="6" ry="3.5" />
      <ellipse cx="82" cy="72" rx="6" ry="3.5" />
    </g>
  );
}

/* ---------- Mouth ---------- */

function Mouth({ expression }: { expression: string }) {
  const stroke = "#1A1A2E";
  switch (expression) {
    case "excited":
      return (
        <g>
          <path d="M48 80 Q60 94 72 80 Z" fill="#1A1A2E" />
          <path d="M50 81 Q60 86 70 81 L70 82 Q60 88 50 82 Z" fill="#FFFFFF" />
          <path d="M52 86 Q60 92 68 86" stroke="#FF6B8A" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "calm":
      return (
        <path d="M50 82 Q60 86 70 82" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" fill="none" />
      );
    case "determined":
      return (
        <path d="M50 84 L70 84" stroke={stroke} strokeWidth="3" strokeLinecap="round" fill="none" />
      );
    case "shy":
      return (
        <path d="M52 84 Q60 88 68 84" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" fill="none" />
      );
    case "happy":
    default:
      return (
        <path d="M48 81 Q60 91 72 81" stroke={stroke} strokeWidth="3" strokeLinecap="round" fill="none" />
      );
  }
}

/* ---------- Color helpers ---------- */

function shade(hex: string, amt: number): string {
  const { r, g, b } = hexToRgb(hex);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + (amt < 0 ? v * amt : (255 - v) * amt))));
  return rgbToHex(f(r), f(g), f(b));
}

function blend(a: string, b: string, t: number): string {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(
    Math.round(A.r + (B.r - A.r) * t),
    Math.round(A.g + (B.g - A.g) * t),
    Math.round(A.b + (B.b - A.b) * t),
  );
}

function hexToRgb(hex: string) {
  const m = hex.replace("#", "");
  const n = parseInt(m, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}
