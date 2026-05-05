import { useStudio } from "../StudioContext";
import { StudioLayout } from "../Layout";
import { Card, Btn } from "../ui";

export function DashboardScreen() {
  const { setView, pillars } = useStudio();

  // Compute stats from seed
  const allClasses = pillars.flatMap(p => p.topics.flatMap(t => t.modules.flatMap(m => m.classes)));
  const built = allClasses.filter(c => c.layers.length > 0);
  const stats = [
    { label: "Total Classes", value: built.length, color: "#7B2FBE", icon: "📚" },
    { label: "Published", value: built.filter(c => c.status === "Published").length, color: "#2E7D32", icon: "✓" },
    { label: "In Draft", value: built.filter(c => c.status === "Draft").length, color: "#666680", icon: "✎" },
    { label: "Pending Review", value: built.filter(c => c.status === "In Review").length, color: "#F5A623", icon: "⏱" },
  ];

  return (
    <StudioLayout
      title="Dashboard"
      actions={<Btn onClick={() => setView({ kind: "library" })}>+ New Class</Btn>}
    >
      <div className="px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map(s => (
            <Card key={s.label}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[12px] font-semibold uppercase tracking-wide text-[#666680]">{s.label}</div>
                  <div className="mt-2 text-[32px] font-bold leading-none text-[#1A1A2E]">{s.value}</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] text-lg" style={{ background: `${s.color}1A`, color: s.color }}>
                  {s.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick actions */}
        <h2 className="mt-8 mb-3 text-[13px] font-semibold uppercase tracking-wide text-[#666680]">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { title: "Create New Class", desc: "Start a new class from a fresh template.", icon: "✨", action: () => setView({ kind: "library" }) },
            { title: "Add Task to Existing Class", desc: "Open a class and add a new task layer.", icon: "➕", action: () => setView({ kind: "class", pillarId: "inner", topicId: "self-eq", moduleId: "meet-emotions", classId: "c2" }) },
            { title: "Preview Live Content", desc: "See what learners are seeing right now.", icon: "👁", action: () => window.open("/", "_blank") },
          ].map(q => (
            <button key={q.title} onClick={q.action} className="text-left">
              <Card className="h-full transition-shadow hover:shadow-[0_8px_24px_rgba(123,47,190,0.15)]">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#F0F0FA] text-lg">{q.icon}</div>
                <div className="text-[15px] font-bold text-[#1A1A2E]">{q.title}</div>
                <div className="mt-1 text-[13px] text-[#666680]">{q.desc}</div>
              </Card>
            </button>
          ))}
        </div>

        {/* Activity */}
        <h2 className="mt-8 mb-3 text-[13px] font-semibold uppercase tracking-wide text-[#666680]">Recent Activity</h2>
        <Card>
          <div className="py-6 text-center text-sm text-[#888]">No recent activity yet.</div>
        </Card>
      </div>
    </StudioLayout>
  );
}
