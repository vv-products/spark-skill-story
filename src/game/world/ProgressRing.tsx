type Props = {
  pct: number;
  accent: string;
  size?: number;
  stroke?: number;
  label?: string;
  sub?: string;
};

export function ProgressRing({ pct, accent, size = 116, stroke = 10, label, sub }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const dash = (clamped / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${c - dash}`}
          style={{ transition: "stroke-dasharray 600ms ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-black tabular-nums" style={{ color: accent }}>
          {clamped}%
        </div>
        {label && <div className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary">{label}</div>}
        {sub && <div className="mt-0.5 text-[10px] font-bold text-text-secondary">{sub}</div>}
      </div>
    </div>
  );
}
