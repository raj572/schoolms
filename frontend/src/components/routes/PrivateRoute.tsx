import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

interface PrivateRouteProps {
  allowedRoles?: string[]; // Restrict by role
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ allowedRoles }) => {
  const { authUser, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!authUser) {
    // Redirect to super admin login if trying to access super admin routes
    const isSuperAdminRoute = allowedRoles?.includes('super_admin');
    return <Navigate to={isSuperAdminRoute ? "/super-admin/login" : "/login"} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(authUser.role)) {
    // Redirect to appropriate login page based on the route
    const isSuperAdminRoute = allowedRoles?.includes('super_admin');
    return <Navigate to={isSuperAdminRoute ? "/super-admin/login" : "/login"} replace />;
  }

  return <Outlet />;
};
