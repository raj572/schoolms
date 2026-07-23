import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

export const PublicRoute: React.FC = () => {
  const { authUser, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ✅ If already logged in → redirect based on role
  if (authUser) {
    switch (authUser.role) {
      case "principal":
        return <Navigate to="/principal/dashboard" replace />;
      case "teacher":
        return <Navigate to="/teacher/dashboard" replace />;
      case "student":
        return <Navigate to="/student/dashboard" replace />;
      case "parent":
        return <Navigate to="/parent/dashboard" replace />;
      case "accountant":
        return <Navigate to="/accountant/dashboard" replace />;
      case "librarian":
        return <Navigate to="/librarian/dashboard" replace />;
      case "warden":
        return <Navigate to="/warden/dashboard" replace />;
      case "administrator":
        return <Navigate to="/administrator/dashboard" replace />;
      case "super_admin":
        return <Navigate to="/super-admin/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // If not logged in → allow access (e.g. login)
  return <Outlet />;
};
