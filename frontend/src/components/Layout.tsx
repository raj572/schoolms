import { Outlet } from "react-router-dom";
import { SchoolNavbar } from "./SchoolNavbar";
import { SchoolSidebar } from "./SchoolSidebar";
import { SidebarProvider } from "./ui/sidebar";
import { useAuthStore } from "../store/useAuthStore";

export default function Layout() {
  const { authUser, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium">Checking authentication...</p>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium text-foreground">
          Not authenticated. Please login.
        </p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen max-h-screen font-[JetBrains Mono] w-full overflow-hidden bg-background">
        <SchoolSidebar currentRole={authUser.role} />

        <div className="flex-1 flex flex-col min-w-0 w-full h-full overflow-hidden">
          <SchoolNavbar
            currentRole={authUser.role}
            onRoleChange={() => {}}
          />
          <main className="flex-1 w-full min-w-0 min-h-0 overflow-y-auto p-4 sm:p-6 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
