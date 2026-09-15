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
      <div className="flex min-h-screen font-[JetBrains Mono] w-full overflow-x-hidden">
        <SchoolSidebar currentRole={authUser.role} />

        <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
          <SchoolNavbar
            currentRole={authUser.role}
            onRoleChange={() => {}}
          />
          <main className="p-4 md:p-6 bg-background flex-1 w-full min-w-0 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
