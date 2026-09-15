import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Button } from "./ui/button";
import { LogOut, LayoutDashboard, CreditCard, School, MessageSquare, Users, Settings, UserCheck } from "lucide-react";

export default function SuperAdminLayout() {
  const { authUser, isCheckingAuth, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium">Checking authentication...</p>
      </div>
    );
  }

  if (!authUser || authUser.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-medium text-foreground">
          Not authenticated. Please login.
        </p>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/super-admin/login');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Fixed */}
      <aside className="w-64 bg-card shadow-lg border-r border-border flex flex-col h-screen fixed left-0 top-0">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">SA</span>
              </div>
              <div>
                <h2 className="font-bold text-lg text-foreground">Super Admin</h2>
                <p className="text-xs text-muted-foreground">Software Provider</p>
              </div>
            </div>

            <nav className="space-y-2">
              <Button
                variant={location.pathname.includes('dashboard') ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => navigate('/super-admin/dashboard')}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              
              <Button
                variant={location.pathname.includes('plans') ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => navigate('/super-admin/plans')}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Subscription Plans
              </Button>
              
              <Button
                variant={location.pathname.includes('enquiries') ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => navigate('/super-admin/enquiries')}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Enquiries
              </Button>
              <Button
                variant={location.pathname === '/super-admin/users' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => navigate('/super-admin/users')}
              >
                <Users className="mr-2 h-4 w-4" />
                All Users
              </Button>
              <Button
                variant={location.pathname.includes('schools') ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => navigate('/super-admin/schools')}
              >
                <School className="mr-2 h-4 w-4" />
                Schools
              </Button>

              <Button
                variant={location.pathname.includes('testing-users') ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => navigate('/super-admin/testing-users')}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Testing Users
              </Button>

              <Button
                variant={location.pathname.includes('settings') ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => navigate('/super-admin/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </nav>
          </div>

          <div className="p-6 border-t border-border bg-card mt-auto">
            <div className="mb-4">
              <p className="text-sm font-medium text-foreground">{authUser.full_name || authUser.username}</p>
              <p className="text-xs text-muted-foreground">{authUser.email}</p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content - Scrollable */}
      <main className="flex-1 ml-64 overflow-y-auto h-screen">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

