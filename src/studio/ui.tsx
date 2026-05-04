import type { ReactNode } from "react";
import { FAMILY_COLOR, type Family, type Status } from "./data";

export function Card({ children, className = "", padding = "p-5" }: { children: ReactNode; className?: string; padding?: string }) {
  return (
    <div className={`rounded-[12px] bg-white border border-[#EBEBF5] shadow-[0_2px_8px_rgba(0,0,0,0.06)] ${padding} ${className}`}>
      {children}
    </div>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Btn({ children, onClick, variant = "primary", disabled, size = "md", title, type = "button", loading = false }: {
  children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "outline" | "danger" | "success";
  disabled?: boolean; size?: "sm" | "md"; title?: string; type?: "button" | "submit"; loading?: boolean;
}) {
  const sizes = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm" };
  const variants = {
    primary: "bg-[#7B2FBE] text-white hover:bg-[#5A1F9A] disabled:bg-[#D8D8E8] disabled:text-[#999]",
    ghost: "text-[#1A1A2E] hover:bg-[#F0F0FA]",
    outline: "border border-[#EBEBF5] bg-white text-[#1A1A2E] hover:bg-[#F8F8FC]",
    danger: "bg-[#E5484D] text-white hover:bg-[#C03035]",
    success: "bg-[#2E7D32] text-white hover:bg-[#256528]",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} title={title}
      className={`inline-flex items-center justify-center gap-2 rounded-[8px] font-semibold transition-colors disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]}`}>
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function StatusPill({ status }: { status: Status }) {
  const styles = {
    "Draft": "bg-[#E8E8F0] text-[#666680]",
    "In Review": "bg-[#FFF3D9] text-[#A66D00]",
    "Published": "bg-[#DCEDC8] text-[#2E7D32]",
  };
  return <span className={`inline-flex items-center rounded-[6px] px-2 py-0.5 text-[11px] font-semibold ${styles[status]}`}>{status}</span>;
}

export function Tag({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span className="inline-flex items-center rounded-[6px] px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: color ? `${color}1A` : "#F0F0FA", color: color ?? "#7B2FBE" }}>
      {children}
    </span>
  );
}

export function FamilyBadge({ family }: { family: Family }) {
  const c = FAMILY_COLOR[family];
  return (
    <span className="inline-flex items-center rounded-[6px] px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: `${c}1A`, color: c }}>
      {family}
    </span>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#666680]">{label}</div>
      {children}
      {hint && <div className="mt-1 text-[11px] text-[#888]">{hint}</div>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`block w-full rounded-[8px] border border-[#EBEBF5] bg-white px-3 py-2 text-sm text-[#1A1A2E] outline-none focus:border-[#7B2FBE] focus:ring-2 focus:ring-[#7B2FBE]/20 ${props.className ?? ""}`} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`block w-full rounded-[8px] border border-[#EBEBF5] bg-white px-3 py-2 text-sm text-[#1A1A2E] outline-none focus:border-[#7B2FBE] focus:ring-2 focus:ring-[#7B2FBE]/20 ${props.className ?? ""}`} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`block w-full rounded-[8px] border border-[#EBEBF5] bg-white px-3 py-2 text-sm text-[#1A1A2E] outline-none focus:border-[#7B2FBE] focus:ring-2 focus:ring-[#7B2FBE]/20 ${props.className ?? ""}`} />;
}
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="inline-flex items-center gap-2">
      <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-[#7B2FBE]" : "bg-[#D8D8E8]"}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </span>
      {label && <span className="text-sm text-[#1A1A2E]">{label}</span>}
    </button>
  );
}
export function Chip({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors ${active ? "bg-[#7B2FBE] text-white" : "bg-[#F0F0FA] text-[#7B2FBE] hover:bg-[#E5E5F2]"}`}>
      {children}
    </button>
  );
}
