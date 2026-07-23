import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * AuthInitializer - Handles automatic authentication on app load
 * Checks for token in localStorage and redirects to appropriate dashboard
 */
export const AuthInitializer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getUser, authUser, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      // If no token, just set checking to false
      if (!token) {
        useAuthStore.setState({ isCheckingAuth: false });
        return;
      }

      // If token exists, fetch user details
      await getUser();
    };

    initAuth();
  }, [getUser]);

  // Redirect to dashboard if user is authenticated and on public routes
  useEffect(() => {
    if (!isCheckingAuth && authUser) {
      const publicRoutes = ['/', '/login', '/signup', '/verify-otp', '/reset-password'];
      const currentPath = location.pathname;

      // If user is on a public route, redirect to their dashboard
      if (publicRoutes.includes(currentPath)) {
        const dashboardRoute = getDashboardRoute(authUser.role);
        navigate(dashboardRoute, { replace: true });
      }
    }
  }, [authUser, isCheckingAuth, location.pathname, navigate]);

  return null; // This component doesn't render anything
};

/**
 * Get dashboard route based on user role
 */
function getDashboardRoute(role: string): string {
  const dashboardRoutes: Record<string, string> = {
    'super_admin': '/super-admin/dashboard',
    'administrator': '/administrator/dashboard',
    'principal': '/principal/dashboard',
    'teacher': '/teacher/dashboard',
    'student': '/student/dashboard',
    'parent': '/parent/dashboard',
    'accountant': '/accountant/dashboard',
    'librarian': '/librarian/dashboard',
    'warden': '/warden/dashboard',
  };

  return dashboardRoutes[role] || '/login';
}

