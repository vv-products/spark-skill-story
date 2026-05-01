import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { StudioProvider, useStudio } from "@/studio/StudioContext";
import { DashboardScreen } from "@/studio/screens/Dashboard";
import { LibraryScreen } from "@/studio/screens/Library";
import { ModuleScreen } from "@/studio/screens/Module";
import { ClassEditorScreen } from "@/studio/screens/ClassEditor";
import { TaskTypesScreen } from "@/studio/screens/TaskTypesRef";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Sementa Studio — Content CMS" },
      { name: "description", content: "Internal CMS for managing Sementa courses, modules, classes, and interactive task layers." },
    ],
  }),
  component: StudioPage,
});

function Router() {
  const { view } = useStudio();
  switch (view.kind) {
    case "dashboard": return <DashboardScreen />;
    case "library": return <LibraryScreen />;
    case "module": return <ModuleScreen />;
    case "class": return <ClassEditorScreen />;
    case "task-types": return <TaskTypesScreen />;
  }
}

function StudioPage() {
  return (
    <StudioProvider>
      <Router />
      <Toaster position="bottom-right" richColors />
    </StudioProvider>
  );
}
