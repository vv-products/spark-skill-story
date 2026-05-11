import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { StudioProvider, useStudio } from "@/studio/StudioContext";
import { StudioAuthProvider } from "@/studio/auth";
import { AuthGate } from "@/studio/AuthGate";
import { DashboardScreen } from "@/studio/screens/Dashboard";
import { LibraryScreen } from "@/studio/screens/Library";
import { ModuleScreen } from "@/studio/screens/Module";
import { ClassEditorScreen } from "@/studio/screens/ClassEditor";
import { TaskTypesScreen } from "@/studio/screens/TaskTypesRef";
import { WelcomeCardsScreen } from "@/studio/screens/WelcomeCards";
import { AvatarsScreen } from "@/studio/screens/Avatars";
import { MissionsScreen } from "@/studio/screens/Missions";

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
  const { view, loadingCatalog, pillars } = useStudio();
  if (loadingCatalog && pillars.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-studio-bg font-studio text-text-secondary">
        Loading…
      </div>
    );
  }
  switch (view.kind) {
    case "dashboard": return <DashboardScreen />;
    case "library": return <LibraryScreen />;
    case "module": return <ModuleScreen />;
    case "class": return <ClassEditorScreen />;
    case "task-types": return <TaskTypesScreen />;
    case "welcome-cards": return <WelcomeCardsScreen />;
    case "avatars": return <AvatarsScreen />;
    case "admin": return null;
  }
}

function StudioPage() {
  return (
    <StudioAuthProvider>
      <AuthGate>
        <StudioProvider>
          <Router />
          <Toaster position="bottom-right" richColors />
        </StudioProvider>
      </AuthGate>
    </StudioAuthProvider>
  );
}
