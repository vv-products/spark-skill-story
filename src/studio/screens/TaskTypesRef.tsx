import { StudioLayout } from "../Layout";
import { TASK_TYPES, FAMILY_COLOR, type AgeGroup } from "../data";

export function TaskTypesScreen() {
  return (
    <StudioLayout title="Task Types Reference">
      <div className="mx-auto max-w-[900px] px-8 py-6">
        <p className="mb-6 text-sm text-[#666680]">All 15 task types available in the Sementa platform. Use this as a quick reference while building classes.</p>
        <div className="flex flex-col gap-3">
          {TASK_TYPES.map(t => (
            <div key={t.code} className="rounded-[12px] border border-[#EBEBF5] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="h-1 w-full rounded-full mb-4" style={{ background: FAMILY_COLOR[t.family] }} />
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] bg-[#F8F8FC] text-3xl">{t.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#888]">{t.code}</span>
                    <span className="rounded-[6px] px-2 py-0.5 text-[11px] font-semibold" style={{ background: `${FAMILY_COLOR[t.family]}1A`, color: FAMILY_COLOR[t.family] }}>{t.family}</span>
                    <span className="rounded-[6px] bg-[#FFF8E8] px-2 py-0.5 text-[11px] font-bold text-[#A66D00]">+{t.xp} XP</span>
                  </div>
                  <h3 className="mt-1 text-lg font-bold text-[#1A1A2E]">{t.name}</h3>
                  <p className="mt-1 text-sm text-[#666680]">{t.description}</p>
                  <div className="mt-3 flex gap-1.5">
                    {(["Explorer","Builder","Leader"] as AgeGroup[]).map(a => (
                      <span key={a} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${t.ages.includes(a) ? "bg-[#F0F0FA] text-[#7B2FBE]" : "bg-[#F8F8FC] text-[#CCC]"}`}>{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StudioLayout>
  );
}
